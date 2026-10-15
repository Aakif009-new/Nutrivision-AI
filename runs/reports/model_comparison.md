# NutriVision AI — Comprehensive Model Comparison Report

## 1. Classification Benchmarks (Evaluated on Reserved Test Set)

| Task | Architecture | Test Acc (%) | Macro F1 | Weighted F1 | Latency (ms) | Params (M) | Size (MB) | Status |
|------|-------------|--------------|----------|-------------|--------------|------------|-----------|--------|
| Freshness | `mobilenet_v3_small` | **92.44%** | 0.9244 | 0.9244 | 4.33 | 1.52M | 5.93 MB | Verified Pretrained |
| Freshness | `efficientnet_b0` | **85.08%** | 0.8508 | 0.8508 | 28.42 | 4.01M | 15.58 MB | Verified Pretrained |
| Produce | `mobilenet_v3_small` | **96.01%** | 0.9599 | 0.9591 | 3.86 | 1.53M | 5.96 MB | Verified Pretrained |

## 2. Object Detection & Localization (YOLO Benchmark)

| Framework | Dataset Classes | Precision | Recall | mAP@0.5 | mAP@0.5:0.95 | Test Split |
|-----------|-----------------|-----------|--------|---------|--------------|------------|
| YOLO11n | 14 Quality Classes | 0.186 | 0.359 | **0.309** | 0.219 | 296 Images |

## 3. Best Model Selection Summary

- **Produce Classification**: `mobilenet_v3_small` selected for prime balance of high accuracy (>95%), ultra-low latency, and low memory footprint (~9MB).
- **Freshness Classification**: `mobilenet_v3_small` selected for robust binary and calibrated multi-state freshness discrimination.
- **Object Detection**: `YOLO11n` for real-time bounding box localization on 14 produce quality categories.

*Report generated at: 2026-10-16 00:19:34*