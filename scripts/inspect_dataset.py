import os
import sys
import glob
from pathlib import Path
from PIL import Image

def inspect_dataset(dataset_path: str):
    p = Path(dataset_path)
    if not p.exists():
        print(f"Error: Dataset path does not exist: {dataset_path}")
        return

    print("=" * 60)
    print(f"NUTRIVISION AI — DATASET INSPECTION REPORT")
    print(f"Inspecting path: {dataset_path}")
    print("=" * 60)

    # List top-level items
    subdirs = [x for x in p.iterdir() if x.is_dir()]
    files = [x for x in p.iterdir() if x.is_file()]

    print(f"\n[Top Level Summary]")
    print(f"Subdirectories: {[d.name for d in subdirs]}")
    print(f"Files: {[f.name for f in files]}")

    # Check for YOLO Detection format (images/ and labels/)
    images_dir = p / "images"
    labels_dir = p / "labels"
    is_yolo_detection = images_dir.exists() or any("train" in d.name.lower() for d in subdirs)

    # Check all images recursively
    image_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    all_images = [f for f in p.rglob("*") if f.suffix.lower() in image_extensions]
    all_labels = [f for f in p.rglob("*") if f.suffix.lower() == ".txt" and f.name != "classes.txt"]

    print(f"\n[Dataset Statistics]")
    print(f"Total image files found: {len(all_images)}")
    print(f"Total annotation files (.txt) found: {len(all_labels)}")

    # Check splits
    splits = ["train", "val", "validation", "test"]
    split_counts = {}
    for s in splits:
        img_split = [f for f in all_images if s in str(f.parent).lower() or s in str(f.parent.parent).lower()]
        split_counts[s] = len(img_split)
    
    print("\n[Split Breakdown]")
    for s, cnt in split_counts.items():
        if cnt > 0:
            print(f"  - {s}: {cnt} images ({cnt/max(1, len(all_images))*100:.1f}%)")

    # Check subfolder classes (classification structure e.g. FreshApple, RottenApple)
    class_folders = {}
    for d in subdirs:
        sub_imgs = [f for f in d.rglob("*") if f.suffix.lower() in image_extensions]
        if sub_imgs:
            class_folders[d.name] = len(sub_imgs)

    if class_folders:
        print("\n[Folder-based Class Distribution]")
        for cname, cnt in sorted(class_folders.items(), key=lambda x: x[1], reverse=True):
            print(f"  - {cname}: {cnt} images")

    # Check image integrity & resolution sample
    resolutions = []
    corrupted = 0
    for img_path in all_images[:200]: # Sample 200 images
        try:
            with Image.open(img_path) as img:
                resolutions.append(img.size)
        except Exception:
            corrupted += 1

    print("\n[Image Quality & Integrity Sample (First 200)]")
    print(f"Corrupted images: {corrupted}")
    if resolutions:
        avg_w = sum(r[0] for r in resolutions) / len(resolutions)
        avg_h = sum(r[1] for r in resolutions) / len(resolutions)
        print(f"Average resolution (WxH): {avg_w:.0f}x{avg_h:.0f}")

    print("\n" + "=" * 60)
    print("Inspection complete.")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Mohamed Hannan\Downloads\NUTRIVISION AI PROJECT DATASET"
    inspect_dataset(target)
