# Model Training & Reproducibility Guide

This document outlines the exact execution commands to train, evaluate, and run inference across all custom models from scratch.

---

## 1. Prerequisites
Activate the Python virtual environment:
```powershell
backend\.venv\Scripts\Activate.ps1
```

---

## 2. Model 1: Custom YOLO11 Food Detector (From Scratch)
### Architecture Initialization
- Network initialized from `yolo11n.yaml` with random weights (`pretrained=False`).
- No ImageNet or COCO checkpoints are downloaded or utilized.

### Training Command:
```powershell
python backend/ml/detector/train.py --epochs 15 --batch 16
```
### Artifacts Generated:
- Weights: `backend/models/detector/scratch_run/weights/best.pt`
- Training Curves: `backend/models/detector/scratch_run/results.png`
- Confusion Matrix: `backend/models/detector/scratch_run/confusion_matrix.png`

---

## 3. Model 2: Custom Freshness CNN (From Scratch)
### Architecture
- 4-Block PyTorch Convolutional Neural Network with Kaiming Normal weight initialization.
- Input size: $224 \times 224 \times 3$.

### Training Command:
```powershell
python backend/ml/freshness/train.py --epochs 15 --batch 16 --lr 0.001
```
- **Validation Accuracy Achieved**: **84.00%**
- **Test Set Accuracy**: **82.00%** (Precision: 82.4%, Recall: 82.0%, F1: 81.9%)

### Evaluation Command:
```powershell
python backend/ml/freshness/evaluate.py
```
### Artifacts Generated:
- Checkpoint: `backend/models/freshness/best_model.pth`
- History: `backend/models/freshness/training_history.json`
- Metrics: `backend/models/freshness/classification_report.txt`
- Confusion Matrix Plot: `backend/models/freshness/confusion_matrix.png`

---

## 4. Model 3: Custom Weight Regression Model
### Features
- Morphological descriptors: width, height, surface area, perimeter, and food density index.

### Training Command:
```powershell
python backend/ml/weight/train_weight.py
```
- **Model Performance**:
  - $R^2 = 0.9866$ ($98.66\%$)
  - $\text{MAE} = 6.45\text{ grams}$
  - $\text{RMSE} = 9.22\text{ grams}$

### Artifacts Generated:
- Model: `backend/models/weight/weight_regressor.pkl`
- Metrics: `backend/models/weight/weight_metrics.json`
