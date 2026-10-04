import os
import sys
import pickle
from pathlib import Path
import cv2
import numpy as np
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier, HistGradientBoostingClassifier, VotingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
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

def extract_advanced_features(img_bgr: np.ndarray) -> np.ndarray:
    """
    Extracts 78 academic OpenCV Image Processing & Computer Vision descriptors:
    - Multi-Space Histograms (HSV 16-8-8, LAB 8-8-8)
    - Statistical Moments (Mean, Std, Skew in HSV, LAB, YCrCb, RGB)
    - True Un-distorted Physical Aspect Ratio & Hu Invariant Shape Moments
    - Morphology & Geometry (Circularity, solidity, extent, convexity)
    - Texture Descriptors (Laplacian Var, Sobel Gradient Mag, Local Standard Dev)
    """
    if img_bgr is None or img_bgr.size == 0:
        return np.zeros(78, dtype=np.float32)

    orig_h, orig_w = img_bgr.shape[:2]
    orig_aspect_ratio = float(orig_w) / max(1, orig_h)
    inv_aspect_ratio = float(orig_h) / max(1, orig_w)

    img_res = cv2.resize(img_bgr, (224, 224))
    gray = cv2.cvtColor(img_res, cv2.COLOR_BGR2GRAY)
    
    # 1. Color Space Conversions
    hsv = cv2.cvtColor(img_res, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(img_res, cv2.COLOR_BGR2LAB)
    ycrcb = cv2.cvtColor(img_res, cv2.COLOR_BGR2YCrCb)
    rgb = cv2.cvtColor(img_res, cv2.COLOR_BGR2RGB)

    # 2. Foreground Mask using Color Distance from Crop Corners
    border_lab = np.concatenate([lab[0:6, :], lab[-6:, :], lab[:, 0:6], lab[:, -6:]], axis=None).reshape(-1, 3)
    bg_col = np.median(border_lab, axis=0)
    color_dist = np.linalg.norm(lab.astype(np.float32) - bg_col.astype(np.float32), axis=2)
    dist_mask = (color_dist > 18.0).astype(np.uint8) * 255
    
    if cv2.countNonZero(dist_mask) > (224 * 224 * 0.04) and cv2.countNonZero(dist_mask) < (224 * 224 * 0.96):
        mask = dist_mask
    else:
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, otsu_inv = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        mask = otsu_inv
        if cv2.countNonZero(mask) < (224 * 224 * 0.04) or cv2.countNonZero(mask) > (224 * 224 * 0.96):
            mask = np.ones_like(gray) * 255

    # 3. HSV Histograms (16 H, 8 S, 8 V)
    hist_h = cv2.calcHist([hsv], [0], mask, [16], [0, 180]).flatten()
    hist_s = cv2.calcHist([hsv], [1], mask, [8], [0, 256]).flatten()
    hist_v = cv2.calcHist([hsv], [2], mask, [8], [0, 256]).flatten()
    if np.sum(hist_h) > 0: hist_h /= np.sum(hist_h)
    if np.sum(hist_s) > 0: hist_s /= np.sum(hist_s)
    if np.sum(hist_v) > 0: hist_v /= np.sum(hist_v)

    # 4. LAB Histograms (8 L, 8 a, 8 b)
    hist_la = cv2.calcHist([lab], [1], mask, [8], [0, 256]).flatten()
    hist_lb = cv2.calcHist([lab], [2], mask, [8], [0, 256]).flatten()
    if np.sum(hist_la) > 0: hist_la /= np.sum(hist_la)
    if np.sum(hist_lb) > 0: hist_lb /= np.sum(hist_lb)

    # 5. Color Moments across Channels
    fg_pixels_hsv = hsv[mask > 0]
    fg_pixels_lab = lab[mask > 0]
    fg_pixels_ycc = ycrcb[mask > 0]
    fg_pixels_rgb = rgb[mask > 0]
    
    if len(fg_pixels_hsv) == 0:
        fg_pixels_hsv = hsv.reshape(-1, 3)
        fg_pixels_lab = lab.reshape(-1, 3)
        fg_pixels_ycc = ycrcb.reshape(-1, 3)
        fg_pixels_rgb = rgb.reshape(-1, 3)

    hsv_means = np.mean(fg_pixels_hsv, axis=0) # H, S, V
    hsv_stds = np.std(fg_pixels_hsv, axis=0)
    lab_means = np.mean(fg_pixels_lab, axis=0) # L, a, b
    lab_stds = np.std(fg_pixels_lab, axis=0)
    ycc_means = np.mean(fg_pixels_ycc, axis=0) # Y, Cr, Cb
    ycc_stds = np.std(fg_pixels_ycc, axis=0)
    
    # RGB Ratios
    r_m, g_m, b_m = np.mean(fg_pixels_rgb, axis=0)
    rgb_sum = max(1.0, r_m + g_m + b_m)
    rgb_ratios = np.array([r_m / rgb_sum, g_m / rgb_sum, b_m / rgb_sum])

    # 6. Hu Invariant Moments
    moments = cv2.moments(mask)
    hu = cv2.HuMoments(moments).flatten()
    hu_feats = -1 * np.sign(hu) * np.log10(np.abs(hu) + 1e-10)

    # 7. Geometric & Shape Descriptors
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    circularity = 0.5
    solidity = 0.8
    extent = 0.6
    convexity = 0.9
    if contours:
        c = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(c)
        perimeter = cv2.arcLength(c, True)
        if perimeter > 0:
            circularity = (4 * np.pi * area) / (perimeter ** 2)
        bx, by, bw, bh = cv2.boundingRect(c)
        extent = float(area) / max(1, (bw * bh))
        hull = cv2.convexHull(c)
        hull_area = cv2.contourArea(hull)
        hull_perimeter = cv2.arcLength(hull, True)
        if hull_area > 0:
            solidity = float(area) / hull_area
        if perimeter > 0 and hull_perimeter > 0:
            convexity = float(hull_perimeter) / perimeter

    # 8. Texture Descriptors
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.mean(np.sqrt(sobelx**2 + sobely**2))

    feature_vec = np.hstack([
        hist_h,          # 16
        hist_s,          # 8
        hist_v,          # 8
        hist_la,         # 8
        hist_lb,         # 8
        hsv_means,       # 3
        hsv_stds,        # 3
        lab_means,       # 3
        lab_stds,        # 3
        ycc_means,       # 3
        ycc_stds,        # 3
        rgb_ratios,      # 3
        hu_feats,        # 7
        [orig_aspect_ratio, inv_aspect_ratio, circularity, solidity, extent, convexity], # 6
        [lap_var, grad_mag] # 2
    ])
    # 16+8+8+8+8+3+3+3+3+3+3+3+7+6+2 = 78
    return feature_vec.astype(np.float32)

def augment_image(img: np.ndarray):
    """Generates realistic photometric and geometric augmentations."""
    augmented = [img]
    # Horizontal flip
    augmented.append(cv2.flip(img, 1))
    # Vertical flip
    augmented.append(cv2.flip(img, 0))
    # Brightness variations
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * 1.15, 0, 255)
    augmented.append(cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR))
    
    hsv2 = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv2[:, :, 2] = np.clip(hsv2[:, :, 2] * 0.85, 0, 255)
    augmented.append(cv2.cvtColor(hsv2.astype(np.uint8), cv2.COLOR_HSV2BGR))
    
    # Slight rotation (+15 deg)
    h, w = img.shape[:2]
    M1 = cv2.getRotationMatrix2D((w//2, h//2), 15, 1.0)
    augmented.append(cv2.warpAffine(img, M1, (w, h), borderMode=cv2.BORDER_REFLECT))
    
    return augmented

def train_super_classifier():
    print("=" * 60)
    print("TRAINING MULTI-MODEL SUPER ENSEMBLE (ACADEMIC ACCURACY UPGRADE)")
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
                        if split == "train":
                            for aug_img in augment_image(img):
                                X_list.append(extract_advanced_features(aug_img))
                                y_list.append(cls_id)
                        else:
                            X_list.append(extract_advanced_features(img))
                            y_list.append(cls_id)

    X_train = np.array(X_train)
    y_train = np.array(y_train)
    X_val = np.array(X_val)
    y_val = np.array(y_val)
    X_test = np.array(X_test)
    y_test = np.array(y_test)

    print(f"Extracted features: Train={X_train.shape}, Val={X_val.shape}, Test={X_test.shape}")

    # Combine Train + Val
    X_full_train = np.vstack([X_train, X_val])
    y_full_train = np.concatenate([y_train, y_val])

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_full_train)
    X_test_scaled = scaler.transform(X_test)

    hgb = HistGradientBoostingClassifier(max_iter=100, max_leaf_nodes=31, random_state=42)
    rf = RandomForestClassifier(n_estimators=30, max_depth=10, random_state=42, n_jobs=1)
    mlp = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=300, random_state=42)

    ensemble = VotingClassifier(
        estimators=[('hgb', hgb), ('rf', rf), ('mlp', mlp)],
        voting='soft',
        weights=[2, 1, 1]
    )
    ensemble.fit(X_train_scaled, y_full_train)

    preds = ensemble.predict(X_test_scaled)
    acc = accuracy_score(y_test, preds)
    print(f"\n============================================================")
    print(f"   SUPER ENSEMBLE TEST ACCURACY: {acc * 100:.2f}%")
    print(f"============================================================")
    print("\nClassification Report:")
    print(classification_report(y_test, preds, target_names=FOOD_CLASSES, digits=3))

    out_dir = Path("backend/models/food_classifier")
    out_dir.mkdir(parents=True, exist_ok=True)
    save_path = out_dir / "feature_classifier.pkl"
    import joblib
    joblib.dump({
        "model": ensemble,
        "scaler": scaler,
        "classes": FOOD_CLASSES,
        "class_map": CLASS_MAP
    }, save_path, compress=6)

    print(f"Saved calibrated super ensemble classifier to: {save_path}")

if __name__ == "__main__":
    train_super_classifier()
