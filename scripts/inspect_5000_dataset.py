import os
import csv
from pathlib import Path
from PIL import Image
import yaml

src = Path(r"C:\Users\Mohamed Hannan\Downloads\NUTRIVISION-AI-DATASET-5000")

print("=" * 60)
print("INSPECTING NUTRIVISION-AI-DATASET-5000")
print("=" * 60)

# 1. Detection
print("\n[DETECTION DATASET]")
data_yaml_path = src / "detection" / "data.yaml"
if data_yaml_path.exists():
    with open(data_yaml_path, "r") as f:
        data_yaml = yaml.safe_load(f)
    print(f"data.yaml classes ({data_yaml.get('nc')}): {data_yaml.get('names')}")

total_det_images = 0
total_det_labels = 0
total_annotations = 0
det_class_counts = {}

for split in ["train", "val", "test"]:
    img_dir = src / "detection" / "images" / split
    lbl_dir = src / "detection" / "labels" / split
    imgs = list(img_dir.glob("*.*"))
    lbls = list(lbl_dir.glob("*.txt"))
    total_det_images += len(imgs)
    total_det_labels += len(lbls)
    
    split_ann_count = 0
    corrupted_images = 0
    
    for img_p in imgs:
        try:
            with Image.open(img_p) as im:
                im.verify()
        except Exception as e:
            corrupted_images += 1
            print(f"Corrupted image found: {img_p}")
            
    for lbl_p in lbls:
        with open(lbl_p, "r") as f:
            lines = f.readlines()
            for l in lines:
                parts = l.strip().split()
                if len(parts) >= 5:
                    cls_id = int(parts[0])
                    det_class_counts[cls_id] = det_class_counts.get(cls_id, 0) + 1
                    split_ann_count += 1
                    total_annotations += 1
                    
    print(f"  Split '{split}': {len(imgs)} images, {len(lbls)} label files, {split_ann_count} bbox annotations (Corrupted: {corrupted_images})")

print(f"Total Detection Images: {total_det_images}")
print(f"Total Detection Labels: {total_det_labels}")
print(f"Total BBox Annotations: {total_annotations}")
print(f"Detection Class BBox Counts: {det_class_counts}")

# 2. Freshness
print("\n[FRESHNESS DATASET]")
total_freshness_images = 0
freshness_counts = {}
for split in ["train", "val", "test"]:
    split_dir = src / "freshness" / split
    classes = sorted([d.name for d in split_dir.iterdir() if d.is_dir()])
    print(f"  Split '{split}':")
    for c in classes:
        c_imgs = list((split_dir / c).glob("*.*"))
        print(f"    - {c}: {len(c_imgs)} images")
        freshness_counts[c] = freshness_counts.get(c, 0) + len(c_imgs)
        total_freshness_images += len(c_imgs)

print(f"Total Freshness Images: {total_freshness_images}")
print(f"Freshness Breakdown: {freshness_counts}")

# 3. Metadata directory
print("\n[METADATA FILES]")
meta_dir = src / "metadata"
if meta_dir.exists():
    for f in meta_dir.iterdir():
        print(f"  - {f.name} ({f.stat().st_size} bytes)")
