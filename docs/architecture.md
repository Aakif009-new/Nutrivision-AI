# NutriVision AI — Academic System Architecture & Pipeline

## 1. Project Overview & Faculty Objectives
NutriVision AI is an academic AI platform evaluated by two distinct academic faculties:
1. **Computer Vision Faculty**: Evaluates multi-object food detection from scratch, scratch CNN freshness classification, weight regression, and unknown-object rejection.
2. **Image Processing Faculty**: Evaluates classical deterministic OpenCV transformations (Gaussian/Median spatial filtering, HSV/LAB color-space mapping, CLAHE contrast enhancement, Otsu binarization, mathematical morphology, Canny gradient edge operators, contour topological analysis, and ArUco marker calibration).

---

## 2. Core Academic Rule & Constraint
> **"All trainable models are independently initialized and trained using project-specific datasets without pretrained model weights or transfer learning."**

* **No Pretrained YOLO Checkpoints** (no `yolov8n.pt`, `yolo11n.pt`, or ImageNet weights).
* **No Pretrained CNNs** (no torchvision EfficientNet, ResNet, MobileNet).
* **No External Vision AI APIs** (Google Vision, Cloud AI, SAM).

---

## 3. High-Level Processing Flow
```
                           INPUT (File Upload or Live Webcam)
                                           │
                                           ▼
         ┌──────────────────────────────────────────────────────────────────┐
         │             IMAGE PROCESSING STAGE (Pure OpenCV)                 │
         │  1. Spatial Resizing (Bilinear 640x640)                          │
         │  2. Low-Pass Gaussian Filtering (sigma=1.2)                      │
         │  3. Non-Linear Median Denoising (k=5)                            │
         │  4. Color Decoupling: RGB -> HSV & CIE-LAB                       │
         │  5. CLAHE (Contrast-Limited Adaptive Histogram Equalization)     │
         │  6. Otsu Automated Global Binarization                           │
         │  7. Morphological Opening (Erosion+Dilation) & Closing           │
         │  8. Multi-Stage Canny Edge Detection                             │
         │  9. Topological Contour Extraction & Shape Metrics               │
         │ 10. Binary Foreground Mask Conjunction                           │
         └─────────────────────────────────┬────────────────────────────────┘
                                           │
                                           ▼
         ┌──────────────────────────────────────────────────────────────────┐
         │             COMPUTER VISION & AI (Scratch-Trained)               │
         │  1. Custom YOLO11 Multi-Object Detector (Trained from Scratch)   │
         │  2. Unknown / Undefined Confidence Filter (Rejection Threshold)  │
         │  3. Custom 4-Block PyTorch CNN Freshness Classifier              │
         │  4. Spoilage Localization Mask (HSV Chromatic Anomaly)           │
         │  5. Physical Size Calibration (ArUco Reference in cm)            │
         │  6. Custom Gradient Boosting Weight Regressor (R²=98.6%)         │
         └─────────────────────────────────┬────────────────────────────────┘
                                           │
                                           ▼
         ┌──────────────────────────────────────────────────────────────────┐
         │             NUTRITION & SHELF-LIFE AGGREGATION                   │
         │  - USDA Nutritional Scaling by Calculated Weight                 │
         │  - Environmental & Condition Shelf-Life Guidance                 │
         │  - MongoDB History Persistence                                   │
         └─────────────────────────────────┬────────────────────────────────┘
                                           │
                                           ▼
                     NEXT.JS DASHBOARD & INTERACTIVE VISUALIZER
```
