# NutriVision AI Curated Dataset (5,000 Images)

## 1. Dataset Overview & Purpose
This dataset is an independently curated, deduplicated, quality-verified dataset of **5,000 unique images** specifically organized for the **NutriVision AI** project.
It supports two primary machine learning tasks:
1. **Object Detection & Quality Recognition (YOLO format)**
2. **Fruit & Vegetable Freshness Classification (Fresh / Semi-Fresh / Spoiled)**

---

## 2. Dataset Summary Metrics
- **Total Unique Selected Images**: 5,000
- **Total Bounding Box Annotated Detection Images**: 1,968
- **Total Freshness Classification Images**: 3,032
- **Total Duplicates Filtered & Logged**: 7,331
- **Corrupted / Unreadable Images Skipped**: 0
- **Exact Location**: `C:\Users\Mohamed Hannan\Downloads\NUTRIVISION-AI-DATASET-5000`

---

## 3. Source Datasets & Contributions
The images were selected from three raw source datasets located in the Downloads directory:
1. `archive` (**Fruit Freshness Dataset**): Contributed **218** verified classification images (Apple, Banana, Strawberry).
2. `archive (1)` (**Fruit Quality Classification**): Contributed **1968** YOLO-annotated detection images across 14 fruit quality categories.
3. `archive (2)` (**Fresh and Rotten Fruits & Vegetables Dataset**): Contributed **2814** verified classification images across 9 food categories.

---

## 4. Directory Structure
```
NUTRIVISION-AI-DATASET-5000/
│
├── detection/
│   ├── images/
│   │   ├── train/ (1377 images)
│   │   ├── val/   (295 images)
│   │   └── test/  (296 images)
│   │
│   ├── labels/
│   │   ├── train/ (1377 YOLO annotation .txt files)
│   │   ├── val/   (295 YOLO annotation .txt files)
│   │   └── test/  (296 YOLO annotation .txt files)
│   │
│   └── data.yaml
│
├── freshness/
│   ├── train/ (2114 images)
│   │   ├── Fresh/
│   │   ├── Semi-Fresh/ (Reserved schema partition)
│   │   └── Spoiled/
│   │
│   ├── val/   (442 images)
│   │   ├── Fresh/
│   │   ├── Semi-Fresh/
│   │   └── Spoiled/
│   │
│   └── test/  (476 images)
│       ├── Fresh/
│       ├── Semi-Fresh/
│       └── Spoiled/
│
├── metadata/
│   ├── dataset_manifest.csv
│   ├── class_distribution.csv
│   ├── source_distribution.csv
│   ├── duplicate_log.csv
│   └── excluded_items_report.csv
│
└── README.md
```

---

## 5. Splits & Leakage Prevention Methodology
All partitions strictly adhere to a **70% Train / 15% Validation / 15% Test** distribution using a fixed random seed (`seed=42`) for exact reproducibility:
- **Detection Partition**:
  - Images derived from augmented base groups (`.rf.` identifier) are grouped together before splitting. This guarantees zero data leakage across train, val, and test partitions.
  - Train: 1377 images (70.0%)
  - Validation: 295 images (15.0%)
  - Test: 296 images (15.0%)

- **Freshness Partition**:
  - Stratified sampling across 10 food categories and 2 quality classes.
  - Train: 2114 images (69.7%)
  - Validation: 442 images (14.6%)
  - Test: 476 images (15.7%)

- **Combined Overall Split**:
  - Train: 3491 images (69.8%)
  - Validation: 737 images (14.7%)
  - Test: 772 images (15.4%)

---

## 6. Class Distribution & Balance
### Freshness Classification (10 Supported Classes):
- **Fresh**: 1,518 images (50.1%)
- **Spoiled**: 1,514 images (49.9%)
- Balanced across: Apple, Banana, Bittergourd, Capsicum, Cucumber, Okra, Orange, Potato, Tomato, Strawberry.

### Detection & Quality Classes (14 YOLO Classes):
0. `Bad_Apple 0-1 day`
1. `Bad_Banana-0 day`
2. `Bad_Guava 0 day`
3. `Bad_Lime-0-1-day`
4. `Bad_Orange-0-1 day`
5. `Bad_Pomegranate-0-1-day`
6. `Good_Apple 10-21 days`
7. `Good_Banana-2-3 days`
8. `Good_Guava 5-7 days`
9. `Good_Lime-10-21 days`
10. `Good_Lime-10-21-days`
11. `Good_Orange-15-21 days`
12. `Good_Pomegranate 50-60-days`
13. `Good_Pomegranate-50-60-days`

---

## 7. Quality Assurance & Deduplication
- **Corrupted Images**: Every source image was verified via PIL `verify()` and `load()`. Unreadable files were rejected.
- **SHA-256 Deduplication**: Every candidate file hash was indexed. Exact duplicates within or between datasets were recorded in `metadata/duplicate_log.csv` and excluded.
- **Annotation Integrity**: Every detection image has a 1-to-1 matching bounding box label file in YOLO format.

---

## 8. Known Limitations
- The source datasets provide binary quality categories (`fresh` / `rotten`). A `Semi-Fresh` directory is preserved in the schema for future tri-state annotations.
- Bounding box annotations exist specifically for the 14 classes in `archive (1)`. Classification images in `archive` and `archive (2)` do not possess bounding box annotations and are preserved as image-level classification tasks.
