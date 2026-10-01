# Project Dataset Documentation

## 1. Dataset Overview
The NutriVision AI dataset contains **1,000 verified images** across **10 produce items** in both **Fresh** and **Rotten** conditions.

| Property | Value |
| :--- | :--- |
| **Total Images** | 1,000 |
| **Training Split (Train)** | 700 images (70.0%) |
| **Validation Split (Val)** | 150 images (15.0%) |
| **Testing Split (Test)** | 150 images (15.0%) |
| **Average Resolution** | $445 \times 388$ pixels |
| **Supported Classes** | 10 Food Types / 20 Condition Sub-Classes |

---

## 2. Supported Produce Taxonomy
1. **Apple** (`apple_fresh`, `apple_rotten`)
2. **Banana** (`banana_fresh`, `banana_rotten`)
3. **Orange** (`orange_fresh`, `orange_rotten`)
4. **Strawberry** (`strawberry_fresh`, `strawberry_rotten`)
5. **Bitter Gourd** (`bitter_gourd_fresh`, `bitter_gourd_rotten`)
6. **Capsicum / Bell Pepper** (`capsicum_fresh`, `capsicum_rotten`)
7. **Cucumber** (`cucumber_fresh`, `cucumber_rotten`)
8. **Okra / Lady Finger** (`okra_fresh`, `okra_rotten`)
9. **Potato** (`potato_fresh`, `potato_rotten`)
10. **Tomato** (`tomato_fresh`, `tomato_rotten`)

---

## 3. Directory Hierarchy
```
datasets/
├── classification/
│   ├── train/ (20 class folders, 700 images)
│   ├── val/   (20 class folders, 150 images)
│   └── test/  (20 class folders, 150 images)
└── detection/
    ├── images/ (train, val, test)
    ├── labels/ (YOLO bounding box .txt annotations)
    └── data.yaml
```
