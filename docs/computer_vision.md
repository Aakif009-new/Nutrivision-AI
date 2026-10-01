# Computer Vision & Machine Learning Module — Academic Documentation

This document explains the architecture, training procedure, and evaluation metrics of all trainable models built for NutriVision AI.

---

## 1. Custom YOLO11 Multi-Object Detector
- **Architecture**: YOLO11 nano (`yolo11n.yaml`) backbone and PAN-FPN neck.
- **Academic Rule**: Initialized with random weights (`pretrained=False`).
- **Input Resolution**: $640 \times 640 \times 3$.
- **Trained Classes (10)**:
  1. `apple`
  2. `banana`
  3. `orange`
  4. `strawberry`
  5. `bitter_gourd`
  6. `capsicum`
  7. `cucumber`
  8. `okra`
  9. `potato`
  10. `tomato`
- **Rejection Mechanism**: Detection confidence threshold $\tau_{\text{det}} = 0.40$. Any detection below this threshold is returned as `"Undefined"`.

---

## 2. Custom Freshness CNN (PyTorch)
- **Architecture**: 4-Block Convolutional Neural Network built from scratch.
  - Conv Block 1: `Conv2d(3, 32, 3)` + `BatchNorm2d` + `ReLU` + `MaxPool2d(2)`
  - Conv Block 2: `Conv2d(32, 64, 3)` + `BatchNorm2d` + `ReLU` + `MaxPool2d(2)`
  - Conv Block 3: `Conv2d(64, 128, 3)` + `BatchNorm2d` + `ReLU` + `MaxPool2d(2)`
  - Conv Block 4: `Conv2d(128, 256, 3)` + `BatchNorm2d` + `ReLU` + `AdaptiveAvgPool2d(1, 1)`
  - Fully Connected Head: `Linear(256, 128)` + `ReLU` + `Dropout(0.4)` + `Linear(128, 2)`
- **Initialization**: Kaiming (He) Normal initialization.
- **Classes**: `Fresh` (0), `Rotten` (1).
- **Nuance Rule**: Samples with prediction confidence between $0.55 - 0.75$ are designated as `Semi-Fresh`.

---

## 3. Custom Weight Regressor (Gradient Boosting)
- **Input Features**:
  1. `food_code` (Categorical index 0 to 9)
  2. `width_cm` (Real physical width)
  3. `height_cm` (Real physical height)
  4. `area_cm2` (Projected contour area)
  5. `perimeter_cm` (Ramanujan elliptical perimeter approximation)
  6. `aspect_ratio` ($W / H$)
- **Target**: `actual_weight_grams`
- **Algorithm**: `GradientBoostingRegressor(n_estimators=150, learning_rate=0.08, max_depth=4)`
- **Evaluation Metrics**:
  - $R^2 = 0.9866$ ($98.66\%$)
  - $\text{MAE} = 6.45\text{ grams}$
  - $\text{RMSE} = 9.22\text{ grams}$
