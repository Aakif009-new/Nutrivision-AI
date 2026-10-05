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
    Extracts 122 academic OpenCV Image Processing & Computer Vision descriptors:
    - Multi-Space Histograms (HSV 16-8-8, LAB 8-8-8, RGB 8-8-8)
    - Statistical Moments across HSV, LAB, YCrCb, RGB
    - Spatial 2x2 Grid Moments for local chromatic distribution
    - Longitudinal Slice Tapering Ratio & Ridge Density
    - True Un-distorted Physical Aspect Ratio & Hu Invariant Shape Moments
    - Morphology & Geometry (Circularity, solidity, extent, convexity)
    - Texture Descriptors (Laplacian Var, Sobel Gradient Mag, Ridge Frequency)
    """
    if img_bgr is None or img_bgr.size == 0:
        return np.zeros(122, dtype=np.float32)

    orig_h, orig_w = img_bgr.shape[:2]
    orig_aspect = float(orig_w) / max(1, orig_h)
    inv_aspect = float(orig_h) / max(1, orig_w)

    img_res = cv2.resize(img_bgr, (224, 224))
    gray = cv2.cvtColor(img_res, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img_res, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(img_res, cv2.COLOR_BGR2LAB)
    ycrcb = cv2.cvtColor(img_res, cv2.COLOR_BGR2YCrCb)
    rgb = cv2.cvtColor(img_res, cv2.COLOR_BGR2RGB)

    # 1. Foreground Segmentation
    border_lab = np.concatenate([lab[0:6, :], lab[-6:, :], lab[:, 0:6], lab[:, -6:]], axis=None).reshape(-1, 3)
    bg_col = np.median(border_lab, axis=0)
    color_dist = np.linalg.norm(lab.astype(np.float32) - bg_col.astype(np.float32), axis=2)
    dist_mask = (color_dist > 18.0).astype(np.uint8) * 255
    if cv2.countNonZero(dist_mask) > (224 * 224 * 0.04) and cv2.countNonZero(dist_mask) < (224 * 224 * 0.96):
        mask = dist_mask
    else:
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        mask = otsu if (cv2.countNonZero(otsu) > 224*224*0.04 and cv2.countNonZero(otsu) < 224*224*0.96) else np.ones_like(gray)*255

    # 2. Color Histograms (HSV 16-8-8, LAB 8-8, RGB 8-8-8)
    hist_h = cv2.calcHist([hsv], [0], mask, [16], [0, 180]).flatten()
    hist_s = cv2.calcHist([hsv], [1], mask, [8], [0, 256]).flatten()
    hist_v = cv2.calcHist([hsv], [2], mask, [8], [0, 256]).flatten()
    hist_la = cv2.calcHist([lab], [1], mask, [8], [0, 256]).flatten()
    hist_lb = cv2.calcHist([lab], [2], mask, [8], [0, 256]).flatten()
    hist_r = cv2.calcHist([rgb], [0], mask, [8], [0, 256]).flatten()
    hist_g = cv2.calcHist([rgb], [1], mask, [8], [0, 256]).flatten()
    hist_b = cv2.calcHist([rgb], [2], mask, [8], [0, 256]).flatten()

    for h_arr in [hist_h, hist_s, hist_v, hist_la, hist_lb, hist_r, hist_g, hist_b]:
        s = np.sum(h_arr)
        if s > 0: h_arr /= s

    # 3. Statistical Moments
    fg_hsv = hsv[mask > 0] if np.any(mask > 0) else hsv.reshape(-1, 3)
    fg_lab = lab[mask > 0] if np.any(mask > 0) else lab.reshape(-1, 3)
    fg_ycc = ycrcb[mask > 0] if np.any(mask > 0) else ycrcb.reshape(-1, 3)
    fg_rgb = rgb[mask > 0] if np.any(mask > 0) else rgb.reshape(-1, 3)

    hsv_mean, hsv_std = np.mean(fg_hsv, axis=0), np.std(fg_hsv, axis=0)
    lab_mean, lab_std = np.mean(fg_lab, axis=0), np.std(fg_lab, axis=0)
    ycc_mean, ycc_std = np.mean(fg_ycc, axis=0), np.std(fg_ycc, axis=0)
    rgb_mean = np.mean(fg_rgb, axis=0)
    rgb_ratio = rgb_mean / max(1.0, np.sum(rgb_mean))

    # 4. Spatial 2x2 Grid Moments (HSV + LAB)
    grid_feats = []
    gh, gw = 112, 112
    for r in range(2):
        for c in range(2):
            cell_hsv = hsv[r*gh:(r+1)*gh, c*gw:(c+1)*gw]
            cell_lab = lab[r*gh:(r+1)*gh, c*gw:(c+1)*gw]
            grid_feats.extend([np.mean(cell_hsv[:,:,0]), np.mean(cell_hsv[:,:,1]), np.mean(cell_lab[:,:,1]), np.mean(cell_lab[:,:,2])])

    # 5. Longitudinal Tapering Analysis
    top_half_w = np.sum(mask[:112, :] > 0) / 112.0
    bot_half_w = np.sum(mask[112:, :] > 0) / 112.0
    taper_ratio = float(top_half_w) / max(1.0, float(bot_half_w))

    # 6. Hu Invariant Moments
    moments = cv2.moments(mask)
    hu = cv2.HuMoments(moments).flatten()
    hu_feats = -1 * np.sign(hu) * np.log10(np.abs(hu) + 1e-10)

    # 7. Geometric & Contour Morphology
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    circularity, solidity, extent, convexity = 0.5, 0.8, 0.6, 0.9
    if contours:
        cnt = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(cnt)
        peri = cv2.arcLength(cnt, True)
        if peri > 0: circularity = (4 * np.pi * area) / (peri ** 2)
        bx, by, bw, bh = cv2.boundingRect(cnt)
        extent = float(area) / max(1, bw * bh)
        hull = cv2.convexHull(cnt)
        ha, hp = cv2.contourArea(hull), cv2.arcLength(hull, True)
        if ha > 0: solidity = float(area) / ha
        if peri > 0 and hp > 0: convexity = float(hp) / peri

    # 8. Texture & Ridge Descriptors
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.mean(np.sqrt(sobelx**2 + sobely**2))
    ridge_freq = np.mean(np.abs(sobelx)) / max(1.0, np.mean(np.abs(sobely)))

    feature_vec = np.hstack([
        hist_h, hist_s, hist_v, hist_la, hist_lb, hist_r, hist_g, hist_b, # 72
        hsv_mean, hsv_std, lab_mean, lab_std, ycc_mean, ycc_std, rgb_ratio, # 21
        np.array(grid_feats, dtype=np.float32), # 16
        hu_feats, # 7
        [orig_aspect, inv_aspect, circularity, solidity, extent, convexity, taper_ratio], # 7
        [lap_var, grad_mag, ridge_freq] # 3
    ])
    return feature_vec.astype(np.float32)

def augment_image(img: np.ndarray):
    """Generates realistic photometric and geometric augmentations."""
    augmented = [img, cv2.flip(img, 1), cv2.flip(img, 0)]
    h, w = img.shape[:2]
    for angle in [12, -12, 24, -24]:
        M = cv2.getRotationMatrix2D((w//2, h//2), angle, 1.0)
        augmented.append(cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv1 = hsv.copy(); hsv1[:,:,2] = np.clip(hsv1[:,:,2]*1.15, 0, 255)
    augmented.append(cv2.cvtColor(hsv1.astype(np.uint8), cv2.COLOR_HSV2BGR))
    hsv2 = hsv.copy(); hsv2[:,:,2] = np.clip(hsv2[:,:,2]*0.85, 0, 255)
    augmented.append(cv2.cvtColor(hsv2.astype(np.uint8), cv2.COLOR_HSV2BGR))
    return augmented

def train_super_classifier():
    print("=" * 60)
    print("TRAINING MULTI-MODEL SUPER ENSEMBLE (ACADEMIC ACCURACY UPGRADE)")
    print("=" * 60)

    dataset_dir = Path("datasets/NUTRIVISION-AI-DATASET-5000/freshness")
    X_train, y_train = [], []
    X_val, y_val = [], []
    X_test, y_test = [], []

    for split, (X_list, y_list) in [("train", (X_train, y_train)), ("val", (X_val, y_val)), ("test", (X_test, y_test))]:
        split_dir = dataset_dir / split
        for img_p in split_dir.rglob("*.*"):
            if img_p.suffix.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
                continue
            
            fname = img_p.stem.lower().replace("bittergourd", "bitter_gourd")
            matched_cls = None
            for f in FOOD_CLASSES:
                if f in fname:
                    matched_cls = f
                    break
            
            if matched_cls is None:
                continue

            cls_id = CLASS_MAP[matched_cls]
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

    hgb = HistGradientBoostingClassifier(max_iter=160, max_leaf_nodes=35, l2_regularization=0.4, random_state=42)
    rf = RandomForestClassifier(n_estimators=80, max_depth=16, random_state=42, n_jobs=1)
    et = ExtraTreesClassifier(n_estimators=80, max_depth=16, random_state=42, n_jobs=1)
    mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=450, alpha=1e-3, random_state=42)

    ensemble = VotingClassifier(
        estimators=[('hgb', hgb), ('rf', rf), ('et', et), ('mlp', mlp)],
        voting='soft',
        weights=[2, 2, 2, 1]
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
