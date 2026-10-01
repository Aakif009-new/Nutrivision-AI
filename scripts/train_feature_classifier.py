import os
import sys
import pickle
from pathlib import Path
import cv2
import numpy as np
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier, HistGradientBoostingClassifier, VotingClassifier
from sklearn.metrics import classification_report, accuracy_score

FOOD_CLASSES = [
    "apple",
    "banana",
    "orange",
    "strawberry",
    "bitter_gourd",
    "capsicum",
    "cucumber",
    "okra",
    "potato",
    "tomato"
]
CLASS_MAP = {name: i for i, name in enumerate(FOOD_CLASSES)}

def extract_rich_features(img_bgr: np.ndarray) -> np.ndarray:
    """
    Extracts 54 classical Image Processing & Computer Vision descriptors:
    1. HSV Color Histograms (16 bins H, 8 bins S, 8 bins V) -> 32
    2. LAB Mean, Std, Median (9 features)
    3. YCrCb Stats (6 features)
    4. Hu Invariant Moments (7 features)
    5. Aspect Ratio, Circularity, Convexity, Extent (4 features)
    6. Texture Laplacian Variance & Sobel Energy (2 features)
    """
    if img_bgr is None or img_bgr.size == 0:
        return np.zeros(60, dtype=np.float32)

    img_res = cv2.resize(img_bgr, (224, 224))
    gray = cv2.cvtColor(img_res, cv2.COLOR_BGR2GRAY)
    
    # Adaptive Foreground Masking (handles white, gray, and natural backgrounds)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    # Check borders to find background intensity
    border_pixels = np.concatenate([blurred[0, :], blurred[-1, :], blurred[:, 0], blurred[:, -1]])
    bg_val = np.median(border_pixels)
    
    if bg_val > 180: # Light background
        _, mask = cv2.threshold(blurred, int(bg_val - 25), 255, cv2.THRESH_BINARY_INV)
    elif bg_val < 70: # Dark background
        _, mask = cv2.threshold(blurred, int(bg_val + 25), 255, cv2.THRESH_BINARY)
    else: # Natural mid-tone
        mask = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 21, 4)
        
    if cv2.countNonZero(mask) < (224 * 224 * 0.08):
        mask = np.ones_like(gray) * 255

    # 1. HSV Histogram
    hsv = cv2.cvtColor(img_res, cv2.COLOR_BGR2HSV)
    hist_h = cv2.calcHist([hsv], [0], mask, [16], [0, 180]).flatten()
    hist_s = cv2.calcHist([hsv], [1], mask, [8], [0, 256]).flatten()
    hist_v = cv2.calcHist([hsv], [2], mask, [8], [0, 256]).flatten()
    if np.sum(hist_h) > 0: hist_h /= np.sum(hist_h)
    if np.sum(hist_s) > 0: hist_s /= np.sum(hist_s)
    if np.sum(hist_v) > 0: hist_v /= np.sum(hist_v)

    # 2. LAB Color Moments
    lab = cv2.cvtColor(img_res, cv2.COLOR_BGR2LAB)
    l_fg = lab[:, :, 0][mask > 0]
    a_fg = lab[:, :, 1][mask > 0]
    b_fg = lab[:, :, 2][mask > 0]
    if len(l_fg) == 0:
        l_fg = lab[:, :, 0].flatten()
        a_fg = lab[:, :, 1].flatten()
        b_fg = lab[:, :, 2].flatten()
        
    lab_stats = np.array([
        np.mean(l_fg), np.std(l_fg), np.median(l_fg),
        np.mean(a_fg), np.std(a_fg), np.median(a_fg),
        np.mean(b_fg), np.std(b_fg), np.median(b_fg)
    ])

    # 3. YCrCb Stats
    ycrcb = cv2.cvtColor(img_res, cv2.COLOR_BGR2YCrCb)
    cr_fg = ycrcb[:, :, 1][mask > 0]
    cb_fg = ycrcb[:, :, 2][mask > 0]
    if len(cr_fg) == 0:
        cr_fg = ycrcb[:, :, 1].flatten()
        cb_fg = ycrcb[:, :, 2].flatten()
    ycrcb_stats = np.array([
        np.mean(cr_fg), np.std(cr_fg), np.median(cr_fg),
        np.mean(cb_fg), np.std(cb_fg), np.median(cb_fg)
    ])

    # 4. Hu Moments
    moments = cv2.moments(mask)
    hu = cv2.HuMoments(moments).flatten()
    hu_feats = -1 * np.sign(hu) * np.log10(np.abs(hu) + 1e-10)

    # 5. Morphology (Aspect ratio, circularity, convexity, solidity)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    aspect_ratio = 1.0
    circularity = 0.5
    solidity = 0.8
    extent = 0.6
    if contours:
        c = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(c)
        perimeter = cv2.arcLength(c, True)
        if perimeter > 0:
            circularity = (4 * np.pi * area) / (perimeter ** 2)
        bx, by, bw, bh = cv2.boundingRect(c)
        aspect_ratio = float(bw) / max(1, bh)
        extent = float(area) / max(1, (bw * bh))
        hull = cv2.convexHull(c)
        hull_area = cv2.contourArea(hull)
        if hull_area > 0:
            solidity = float(area) / hull_area

    # 6. Texture
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.mean(np.sqrt(sobelx**2 + sobely**2))

    feature_vec = np.hstack([
        hist_h,          # 16
        hist_s,          # 8
        hist_v,          # 8
        lab_stats,       # 9
        ycrcb_stats,     # 6
        hu_feats,        # 7
        [aspect_ratio, circularity, solidity, extent], # 4
        [lap_var, grad_mag] # 2
    ])
    return feature_vec.astype(np.float32)

def train_feature_classifier():
    print("=" * 60)
    print("TRAINING ENHANCED MULTI-FEATURE ENSEMBLE CLASSIFIER")
    print("=" * 60)

    dataset_dir = Path("datasets/classification")
    X_train, y_train = [], []
    X_val, y_val = [], []
    X_test, y_test = [], []

    for split, (X_list, y_list) in [("train", (X_train, y_train)), ("val", (X_val, y_val)), ("test", (X_test, y_test))]:
        split_dir = dataset_dir / split
        for cdir in split_dir.iterdir():
            if not cdir.is_dir():
                continue
            cname = cdir.name.lower()
            matched_cls = None
            for f in FOOD_CLASSES:
                if cname.startswith(f):
                    matched_cls = f
                    break
            if matched_cls is None:
                continue

            cls_id = CLASS_MAP[matched_cls]
            for img_p in cdir.glob("*.*"):
                if img_p.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                    img = cv2.imread(str(img_p))
                    if img is not None:
                        feat = extract_rich_features(img)
                        X_list.append(feat)
                        y_list.append(cls_id)
                        
                        # Add simple horizontal flip augmentation for training
                        if split == "train":
                            flip_img = cv2.flip(img, 1)
                            X_list.append(extract_rich_features(flip_img))
                            y_list.append(cls_id)

    X_train = np.array(X_train)
    y_train = np.array(y_train)
    X_test = np.array(X_test)
    y_test = np.array(y_test)

    print(f"Extracted features: Train={X_train.shape}, Test={X_test.shape}")

    et = ExtraTreesClassifier(n_estimators=300, max_depth=18, random_state=42)
    rf = RandomForestClassifier(n_estimators=300, max_depth=18, random_state=42)
    hgb = HistGradientBoostingClassifier(max_iter=200, random_state=42)

    ensemble = VotingClassifier(
        estimators=[('et', et), ('rf', rf), ('hgb', hgb)],
        voting='soft'
    )
    ensemble.fit(X_train, y_train)

    preds = ensemble.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"\n---> TEST ACCURACY: {acc * 100:.2f}% <---")
    print("\nClassification Report:")
    print(classification_report(y_test, preds, target_names=FOOD_CLASSES, digits=3))

    out_dir = Path("backend/models/food_classifier")
    out_dir.mkdir(parents=True, exist_ok=True)
    save_path = out_dir / "feature_classifier.pkl"
    with open(save_path, "wb") as f:
        pickle.dump({
            "model": ensemble,
            "classes": FOOD_CLASSES,
            "class_map": CLASS_MAP
        }, f)

    print(f"Saved enhanced feature classifier to: {save_path}")

if __name__ == "__main__":
    train_feature_classifier()
