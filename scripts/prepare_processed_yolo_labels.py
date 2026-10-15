"""
NutriVision AI — Detection Label Reprocessing & Canonical Consolidation
1. Converts polygon segmentation coordinates to strict axis-aligned bounding boxes.
2. Preserves existing 5-value bounding box coordinates.
3. Consolidates duplicate typographical classes (Good Lime and Good Pomegranate).
4. Saves output to a separate directory (datasets/NUTRIVISION-AI-DATASET-5000/detection_processed).
   Leaves original annotations completely untouched.
"""

import os
import yaml
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_ROOT = PROJECT_ROOT / "datasets" / "NUTRIVISION-AI-DATASET-5000" / "detection"
PROC_ROOT = PROJECT_ROOT / "datasets" / "NUTRIVISION-AI-DATASET-5000" / "detection_processed"

OLD_TO_NEW_CLASS_MAP = {
    0: 0,   # Bad_Apple 0-1 day
    1: 1,   # Bad_Banana-0 day
    2: 2,   # Bad_Guava 0 day
    3: 3,   # Bad_Lime-0-1-day
    4: 4,   # Bad_Orange-0-1 day
    5: 5,   # Bad_Pomegranate-0-1-day
    6: 6,   # Good_Apple 10-21 days
    7: 7,   # Good_Banana-2-3 days
    8: 8,   # Good_Guava 5-7 days
    9: 9,   # Good_Lime-10-21 days -> Good_Lime 10-21 days
    10: 9,  # Good_Lime-10-21-days -> Good_Lime 10-21 days
    11: 10, # Good_Orange-15-21 days -> Good_Orange 15-21 days
    12: 11, # Good_Pomegranate 50-60-days -> Good_Pomegranate 50-60 days
    13: 11  # Good_Pomegranate-50-60-days -> Good_Pomegranate 50-60 days
}

NEW_CLASS_NAMES = [
    "Bad_Apple 0-1 day",
    "Bad_Banana-0 day",
    "Bad_Guava 0 day",
    "Bad_Lime-0-1-day",
    "Bad_Orange-0-1 day",
    "Bad_Pomegranate-0-1-day",
    "Good_Apple 10-21 days",
    "Good_Banana-2-3 days",
    "Good_Guava 5-7 days",
    "Good_Lime 10-21 days",
    "Good_Orange 15-21 days",
    "Good_Pomegranate 50-60 days"
]


def convert_and_consolidate_detection_dataset():
    print("=" * 65)
    print("NUTRIVISION AI — DETECT LABEL REPROCESSING & CANONICAL MAPPING")
    print(f"Source Directory: {RAW_ROOT.resolve()}")
    print(f"Target Directory: {PROC_ROOT.resolve()}")
    print(f"Consolidated Class Count: {len(NEW_CLASS_NAMES)}")
    print("=" * 65)

    splits = ["train", "val", "test"]
    stats = {
        "total_images": 0,
        "total_labels_written": 0,
        "boxes_converted_from_polygon": 0,
        "boxes_preserved_from_bbox": 0,
        "background_images_count": 0,
        "class_counts": {i: 0 for i in range(len(NEW_CLASS_NAMES))}
    }

    # Ensure directories
    for s in splits:
        (PROC_ROOT / "labels" / s).mkdir(parents=True, exist_ok=True)
        # Create symlink or relative image link
        (PROC_ROOT / "images" / s).mkdir(parents=True, exist_ok=True)

    for s in splits:
        raw_img_dir = RAW_ROOT / "images" / s
        raw_lbl_dir = RAW_ROOT / "labels" / s
        proc_lbl_dir = PROC_ROOT / "labels" / s
        proc_img_dir = PROC_ROOT / "images" / s

        img_files = sorted(list(raw_img_dir.glob("*.*")))
        print(f"\nProcessing split: {s} ({len(img_files)} images)...")

        for img_path in img_files:
            stats["total_images"] += 1
            stem = img_path.stem
            raw_lbl_file = raw_lbl_dir / (stem + ".txt")
            proc_lbl_file = proc_lbl_dir / (stem + ".txt")

            # Create symlink / copy reference for image
            proc_img_file = proc_img_dir / img_path.name
            if not proc_img_file.exists():
                try:
                    os.link(str(img_path), str(proc_img_file))
                except Exception:
                    # Windows fallback if hardlink fails
                    import shutil
                    shutil.copy2(img_path, proc_img_file)

            if not raw_lbl_file.exists():
                # Background image with no objects
                stats["background_images_count"] += 1
                proc_lbl_file.write_text("")
                continue

            converted_lines = []
            with open(raw_lbl_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    parts = line.split()
                    old_cid = int(parts[0])
                    if old_cid not in OLD_TO_NEW_CLASS_MAP:
                        print(f"Warning: unknown class {old_cid} in {raw_lbl_file.name}")
                        continue

                    new_cid = OLD_TO_NEW_CLASS_MAP[old_cid]

                    if len(parts) == 5:
                        # Standard BBox: xc, yc, w, h
                        xc, yc, w, h = map(float, parts[1:])
                        stats["boxes_preserved_from_bbox"] += 1
                    else:
                        # Polygon coordinates: x1, y1, x2, y2, ...
                        coords = [float(x) for x in parts[1:]]
                        xs = coords[0::2]
                        ys = coords[1::2]
                        xmin, xmax = min(xs), max(xs)
                        ymin, ymax = min(ys), max(ys)
                        xmin = max(0.0, min(1.0, xmin))
                        xmax = max(0.0, min(1.0, xmax))
                        ymin = max(0.0, min(1.0, ymin))
                        ymax = max(0.0, min(1.0, ymax))
                        w = xmax - xmin
                        h = ymax - ymin
                        xc = xmin + w / 2.0
                        yc = ymin + h / 2.0
                        stats["boxes_converted_from_polygon"] += 1

                    # Normalize & bound check
                    xc = max(0.001, min(0.999, xc))
                    yc = max(0.001, min(0.999, yc))
                    w = max(0.001, min(1.0, w))
                    h = max(0.001, min(1.0, h))

                    stats["class_counts"][new_cid] += 1
                    converted_lines.append(f"{new_cid} {xc:.6f} {yc:.6f} {w:.6f} {h:.6f}")

            if converted_lines:
                proc_lbl_file.write_text("\n".join(converted_lines) + "\n", encoding="utf-8")
                stats["total_labels_written"] += 1
            else:
                proc_lbl_file.write_text("", encoding="utf-8")
                stats["background_images_count"] += 1

    # Write absolute path in data.yaml for reliable Ultralytics resolution
    data_yaml_content = {
        "path": str(PROC_ROOT.resolve()).replace("\\", "/"),
        "train": "images/train",
        "val": "images/val",
        "test": "images/test",
        "nc": len(NEW_CLASS_NAMES),
        "names": NEW_CLASS_NAMES
    }

    yaml_file = PROC_ROOT / "data.yaml"
    with open(yaml_file, "w", encoding="utf-8") as f:
        yaml.dump(data_yaml_content, f, sort_keys=False)

    print(f"\nWrote processed data.yaml to: {yaml_file}")
    print("Conversion Statistics:")
    print(f"  Total images processed: {stats['total_images']}")
    print(f"  Polygon annotations converted to BBox: {stats['boxes_converted_from_polygon']}")
    print(f"  Existing BBoxes preserved: {stats['boxes_preserved_from_bbox']}")
    print(f"  Background images with empty label: {stats['background_images_count']}")
    print("\nClass Distribution after consolidation (12 Canonical Classes):")
    for i, name in enumerate(NEW_CLASS_NAMES):
        print(f"  Class {i:02d} ({name}): {stats['class_counts'][i]} instances")

    return stats


if __name__ == "__main__":
    convert_and_consolidate_detection_dataset()
