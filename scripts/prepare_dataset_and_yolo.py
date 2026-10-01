import os
import sys
import shutil
import csv
from pathlib import Path
import cv2
import numpy as np
import yaml

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

CLASS_TO_ID = {name: i for i, name in enumerate(FOOD_CLASSES)}

def auto_detect_bbox_contour(img_path):
    """
    Academic OpenCV Foreground Extraction to generate bounding box:
    Uses Otsu thresholding, morphological closing, and largest contour bounding box.
    Returns YOLO format: (x_center, y_center, width, height) normalized in [0, 1].
    """
    img = cv2.imread(str(img_path))
    if img is None:
        return 0.5, 0.5, 0.8, 0.8
    
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Otsu thresholding
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Morphological closing to close holes
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Find contours
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Find largest contour by area
        c = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(c)
        if area > (w * h * 0.02): # At least 2% of image
            bx, by, bw, bh = cv2.boundingRect(c)
            # Add a small padding (5%)
            pad_x = int(bw * 0.05)
            pad_y = int(bh * 0.05)
            x1 = max(0, bx - pad_x)
            y1 = max(0, by - pad_y)
            x2 = min(w, bx + bw + pad_x)
            y2 = min(h, by + bh + pad_y)
            
            box_w = (x2 - x1) / w
            box_h = (y2 - y1) / h
            box_xc = (x1 + x2) / (2.0 * w)
            box_yc = (y1 + y2) / (2.0 * h)
            return box_xc, box_yc, box_w, box_h
            
    # Default centered bounding box if background is complex
    return 0.5, 0.5, 0.85, 0.85

def sync_and_prepare(src_dataset_path: str, project_root: str):
    src = Path(src_dataset_path)
    root = Path(project_root)
    
    classification_dir = root / "datasets" / "classification"
    detection_dir = root / "datasets" / "detection"
    
    print("=" * 60)
    print("NUTRIVISION AI — PHASE 1: DATASET SYNC & PREPARATION")
    print(f"Source: {src}")
    print(f"Target Classification: {classification_dir}")
    print(f"Target Detection: {detection_dir}")
    print("=" * 60)
    
    # Setup directories
    for split in ["train", "val", "test"]:
        (detection_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (detection_dir / "labels" / split).mkdir(parents=True, exist_ok=True)
        (classification_dir / split).mkdir(parents=True, exist_ok=True)
        
    copied_count = 0
    yolo_labels_count = 0
    
    for split in ["train", "val", "test"]:
        split_src = src / split
        if not split_src.exists():
            continue
            
        print(f"\nProcessing [{split.upper()}] split...")
        for class_dir in split_src.iterdir():
            if not class_dir.is_dir():
                continue
                
            cname = class_dir.name # e.g. apple_fresh, tomato_rotten
            # Determine base food name
            food_name = None
            for f in FOOD_CLASSES:
                if cname.startswith(f):
                    food_name = f
                    break
            
            if food_name is None:
                continue
                
            class_id = CLASS_TO_ID[food_name]
            
            # Destination for classification
            target_class_dir = classification_dir / split / cname
            target_class_dir.mkdir(parents=True, exist_ok=True)
            
            # Loop over images
            for img_file in class_dir.glob("*.*"):
                if img_file.suffix.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
                    continue
                    
                # 1. Copy to classification dataset
                target_cls_img = target_class_dir / img_file.name
                shutil.copy2(img_file, target_cls_img)
                
                # 2. Copy to detection dataset
                det_img_name = f"{cname}_{img_file.name}"
                target_det_img = detection_dir / "images" / split / det_img_name
                shutil.copy2(img_file, target_det_img)
                copied_count += 1
                
                # 3. Generate YOLO bounding box label
                xc, yc, bw, bh = auto_detect_bbox_contour(img_file)
                label_name = target_det_img.stem + ".txt"
                target_det_lbl = detection_dir / "labels" / split / label_name
                
                with open(target_det_lbl, "w") as lf:
                    lf.write(f"{class_id} {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}\n")
                yolo_labels_count += 1

    # Generate detection data.yaml
    data_yaml = {
        "path": str((root / "datasets" / "detection").resolve()).replace("\\", "/"),
        "train": "images/train",
        "val": "images/val",
        "test": "images/test",
        "nc": len(FOOD_CLASSES),
        "names": FOOD_CLASSES
    }
    
    yaml_path = detection_dir / "data.yaml"
    with open(yaml_path, "w") as yf:
        yaml.dump(data_yaml, yf, default_flow_style=False, sort_keys=False)
        
    # Also save central classes.yaml in backend/ml/config/
    cfg_dir = root / "backend" / "ml" / "config"
    cfg_dir.mkdir(parents=True, exist_ok=True)
    classes_cfg_path = cfg_dir / "classes.yaml"
    with open(classes_cfg_path, "w") as cf:
        yaml.dump({
            "food_classes": FOOD_CLASSES,
            "freshness_classes": ["fresh", "rotten"],
            "class_to_id": CLASS_TO_ID
        }, cf, default_flow_style=False, sort_keys=False)

    print("\n" + "=" * 60)
    print(f"SUCCESS: Prepared {copied_count} classification images and {yolo_labels_count} YOLO annotations!")
    print(f"Created detection config at: {yaml_path}")
    print(f"Created central classes config at: {classes_cfg_path}")
    print("=" * 60)

if __name__ == "__main__":
    src_path = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Mohamed Hannan\Downloads\NUTRIVISION AI PROJECT DATASET"
    project_root = str(Path(__file__).resolve().parent.parent)
    sync_and_prepare(src_path, project_root)
