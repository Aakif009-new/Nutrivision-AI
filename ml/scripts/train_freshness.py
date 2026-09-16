import os
import glob
import json
import numpy as np
import cv2
from PIL import Image
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType


def extract_features_from_image(img_path_or_pil):
    """
    Extracts high-dimensional visual descriptors:
    - 32-bin HSV color histograms
    - 16-bin RGB color histograms
    - Spatial 3x3 grid color moments (mean, std dev)
    - Texture / edge density (Sobel gradient magnitude)
    Total feature vector length: 168 dimensions.
    """
    if isinstance(img_path_or_pil, str):
        img_bgr = cv2.imread(img_path_or_pil)
        if img_bgr is None:
            # Fallback using PIL
            pil_img = Image.open(img_path_or_pil).convert("RGB")
            img_rgb = np.array(pil_img)
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    else:
        # PIL Image input
        img_rgb = np.array(img_path_or_pil.convert("RGB"))
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)

    img_bgr = cv2.resize(img_bgr, (128, 128))
    img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. HSV Histograms
    h_hist = cv2.calcHist([img_hsv], [0], None, [32], [0, 180])
    s_hist = cv2.calcHist([img_hsv], [1], None, [32], [0, 256])
    v_hist = cv2.calcHist([img_hsv], [2], None, [32], [0, 256])
    cv2.normalize(h_hist, h_hist)
    cv2.normalize(s_hist, s_hist)
    cv2.normalize(v_hist, v_hist)

    # 2. RGB Histograms
    r_hist = cv2.calcHist([img_rgb], [0], None, [16], [0, 256])
    g_hist = cv2.calcHist([img_rgb], [1], None, [16], [0, 256])
    b_hist = cv2.calcHist([img_rgb], [2], None, [16], [0, 256])
    cv2.normalize(r_hist, r_hist)
    cv2.normalize(g_hist, g_hist)
    cv2.normalize(b_hist, b_hist)

    # 3. Spatial 3x3 Grid Color Moments
    grid_feats = []
    h, w, _ = img_rgb.shape
    gh, gw = h // 3, w // 3
    for i in range(3):
        for j in range(3):
            cell = img_rgb[i*gh:(i+1)*gh, j*gw:(j+1)*gw]
            for c in range(3):
                grid_feats.append(np.mean(cell[:, :, c]) / 255.0)
                grid_feats.append(np.std(cell[:, :, c]) / 255.0)

    # 4. Texture / Gradient features
    sobelx = cv2.Sobel(img_gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(img_gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(sobelx**2 + sobely**2)
    edge_mean = np.mean(grad_mag) / 255.0
    edge_std = np.std(grad_mag) / 255.0
    edge_energy = np.mean(grad_mag**2) / (255.0**2)

    # Concatenate into 1D feature vector
    feat_vec = np.concatenate([
        h_hist.flatten(),
        s_hist.flatten(),
        v_hist.flatten(),
        r_hist.flatten(),
        g_hist.flatten(),
        b_hist.flatten(),
        np.array(grid_feats, dtype=np.float32),
        np.array([edge_mean, edge_std, edge_energy], dtype=np.float32)
    ]).astype(np.float32)

    return feat_vec


def load_split_dataset(split_dir, class_names):
    X = []
    y = []
    class_to_idx = {name: idx for idx, name in enumerate(class_names)}

    for class_name in class_names:
        class_folder = os.path.join(split_dir, class_name)
        if not os.path.exists(class_folder):
            continue
        
        img_files = glob.glob(os.path.join(class_folder, "*.jpg")) + \
                    glob.glob(os.path.join(class_folder, "*.jpeg")) + \
                    glob.glob(os.path.join(class_folder, "*.png"))

        for img_path in img_files:
            try:
                feats = extract_features_from_image(img_path)
                X.append(feats)
                y.append(class_to_idx[class_name])
            except Exception as e:
                print(f"Skipping {img_path}: {e}")

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int64)


def train_and_export_freshness_pipeline(
    dataset_root: str = "ml/dataset/NUTRIVISION AI PROJECT DATASET",
    output_onnx_path: str = "ml/models/freshness_cnn.onnx",
    output_classes_path: str = "ml/models/freshness_classes.json"
):
    print("=======================================================")
    print("  NutriVision AI: Freshness & Food Classifier Trainer  ")
    print("=======================================================")

    train_dir = os.path.join(dataset_root, "train")
    val_dir = os.path.join(dataset_root, "val")
    test_dir = os.path.join(dataset_root, "test")

    class_names = sorted([d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d))])
    num_classes = len(class_names)
    print(f"Found {num_classes} Produce Freshness Classes:")
    for idx, c in enumerate(class_names):
        print(f"  [{idx:02d}] {c}")

    print("\n[1/4] Extracting multi-modal visual descriptors from Train set...")
    X_train, y_train = load_split_dataset(train_dir, class_names)
    print(f"Train samples: {len(X_train)} (feature dimension: {X_train.shape[1]})")

    print("[2/4] Extracting features from Val & Test sets...")
    X_val, y_val = load_split_dataset(val_dir, class_names)
    X_test, y_test = load_split_dataset(test_dir, class_names)
    print(f"Val samples: {len(X_val)} | Test samples: {len(X_test)}")

    # Combine Train + Val for final model fitting
    X_full_train = np.vstack([X_train, X_val])
    y_full_train = np.concatenate([y_train, y_val])

    print("\n[3/4] Training Ensemble Classifier (RandomForest with 250 estimators)...")
    clf = RandomForestClassifier(
        n_estimators=250,
        max_depth=20,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_full_train, y_full_train)

    test_preds = clf.predict(X_test)
    test_acc = accuracy_score(y_test, test_preds) * 100.0
    print(f"\n=======================================================")
    print(f"  Test Accuracy on Unseen Dataset: {test_acc:.2f}%")
    print(f"=======================================================")

    print("\n[4/4] Exporting model to ONNX runtime format...")
    os.makedirs(os.path.dirname(output_onnx_path), exist_ok=True)
    initial_type = [('float_input', FloatTensorType([None, X_train.shape[1]]))]
    onnx_model = convert_sklearn(
        clf,
        initial_types=initial_type,
        options={id(clf): {'zipmap': False}}
    )

    with open(output_onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"Model successfully saved to: {output_onnx_path}")

    # Build detailed class metadata mapping
    class_metadata = {
        "classes": class_names,
        "num_classes": num_classes,
        "feature_dim": int(X_train.shape[1]),
        "test_accuracy": round(test_acc, 2),
        "mapping": {}
    }
    for idx, cname in enumerate(class_names):
        parts = cname.split("_")
        status = "rotten" if "rotten" in cname else "fresh"
        food_item = "_".join([p for p in parts if p not in ("fresh", "rotten")])
        class_metadata["mapping"][str(idx)] = {
            "class_name": cname,
            "food_item": food_item,
            "freshness": status
        }

    with open(output_classes_path, "w", encoding="utf-8") as f:
        json.dump(class_metadata, f, indent=2)
    print(f"Class mapping metadata saved to: {output_classes_path}")


if __name__ == "__main__":
    train_and_export_freshness_pipeline()
