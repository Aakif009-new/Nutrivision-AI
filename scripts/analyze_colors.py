import os
from pathlib import Path
import cv2
import numpy as np

def analyze_dataset_colors():
    project_root = Path(__file__).resolve().parent.parent
    dataset_dir = project_root / "datasets" / "classification" / "train"
    print("=" * 60)
    print("ANALYZING DATASET GROUND TRUTH CHROMATIC DISTRIBUTIONS")
    print("=" * 60)

    for class_folder in sorted(dataset_dir.iterdir()):
        if not class_folder.is_dir():
            continue

        h_vals, s_vals, v_vals = [], [], []
        images = list(class_folder.glob("*.jpg")) + list(class_folder.glob("*.png"))
        
        for img_p in images:
            img = cv2.imread(str(img_p))
            if img is None:
                continue
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
            if cv2.countNonZero(mask) == 0:
                mask = np.ones_like(gray) * 255

            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            h_vals.append(np.mean(hsv[:, :, 0][mask > 0]))
            s_vals.append(np.mean(hsv[:, :, 1][mask > 0]))
            v_vals.append(np.mean(hsv[:, :, 2][mask > 0]))

        if h_vals:
            print(f"Class: {class_folder.name:<22} | Mean Hue: {np.mean(h_vals):.1f} | Mean Sat: {np.mean(s_vals):.1f} | Mean Val: {np.mean(v_vals):.1f}")

if __name__ == "__main__":
    analyze_dataset_colors()
