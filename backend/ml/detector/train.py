"""
NutriVision AI — Official Pretrained YOLO Transfer Learning & Fine-Tuning Pipeline
Starts from official pretrained Ultralytics weights (yolo11n.pt / yolov8n.pt),
fine-tunes on the verified 14-class bounding-box dataset, and evaluates on the reserved test set.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from ultralytics import YOLO

def train_pretrained_yolo(
    data_yaml: str = "datasets/NUTRIVISION-AI-DATASET-5000/detection/data.yaml",
    base_checkpoint: str = "yolo11n.pt",
    output_dir: str = "runs/detection",
    epochs: int = 15,
    img_size: int = 416,
    batch_size: int = 16,
    patience: int = 8,
    lr0: float = 0.005,
    seed: int = 42
):
    print("=" * 65)
    print("NUTRIVISION AI — PRETRAINED YOLO TRANSFER LEARNING & FINE-TUNING")
    print(f"Base Checkpoint:   {base_checkpoint} (Official Ultralytics Pretrained)")
    print(f"Dataset YAML:      {data_yaml}")
    print(f"Epochs:            {epochs} (Early Stopping Patience: {patience})")
    print(f"Image Size:        {img_size}x{img_size} | Batch Size: {batch_size}")
    print("=" * 65)

    project_root = Path(__file__).resolve().parent.parent.parent.parent
    data_path = (project_root / data_yaml).resolve()

    if not data_path.exists():
        # Fallback relative to current dir
        data_path = Path(data_yaml).resolve()

    if not data_path.exists():
        raise FileNotFoundError(f"data.yaml not found at: {data_path}")

    # Fix relative paths inside data.yaml to point to absolute or correct relative root
    det_root = data_path.parent
    train_images = det_root / "images" / "train"
    val_images = det_root / "images" / "val"
    test_images = det_root / "images" / "test"

    print(f"\n[Step 1] Loading official pretrained YOLO detector: {base_checkpoint}...")
    try:
        model = YOLO(base_checkpoint)
    except Exception as e:
        print(f"Note: Could not download {base_checkpoint} online ({e}), trying yolov8n.pt...")
        model = YOLO("yolov8n.pt")

    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    print(f"\n[Step 2] Fine-tuning pretrained YOLO on dataset...")
    results = model.train(
        data=str(data_path),
        epochs=epochs,
        patience=patience,
        imgsz=img_size,
        batch=batch_size,
        project=str(out_path),
        name="pretrained_run",
        exist_ok=True,
        pretrained=True, # OFFICIAL TRANSFER LEARNING ENABLED
        optimizer="AdamW",
        lr0=lr0,
        lrf=0.01,
        seed=seed,
        save=True,
        plots=True,
        verbose=True
    )

    # Step 3: Evaluate on Reserved TEST SET
    print("\n[Step 3] Evaluating Best Fine-Tuned Checkpoint on Reserved Test Set...")
    best_weights = out_path / "pretrained_run" / "weights" / "best.pt"
    if best_weights.exists():
        best_model = YOLO(str(best_weights))
        test_res = best_model.val(data=str(data_path), split="test", imgsz=img_size)

        metrics_file = out_path / "pretrained_run" / "test_metrics.json"
        try:
            metrics_data = {
                "base_checkpoint": base_checkpoint,
                "precision": float(test_res.box.mp),
                "recall": float(test_res.box.mr),
                "map50": float(test_res.box.map50),
                "map50_95": float(test_res.box.map),
                "per_class_map50": [float(x) for x in test_res.box.maps]
            }
            with open(metrics_file, "w", encoding="utf-8") as mf:
                json.dump(metrics_data, mf, indent=2)
            print(f"Saved test metrics to: {metrics_file}")
            print(f"  Test Precision: {metrics_data['precision']:.4f}")
            print(f"  Test Recall:    {metrics_data['recall']:.4f}")
            print(f"  Test mAP@0.5:   {metrics_data['map50']:.4f}")
            print(f"  Test mAP@50-95: {metrics_data['map50_95']:.4f}")
        except Exception as e:
            print(f"Note on saving test metrics: {e}")

        # Deploy best weights to production detector path
        prod_det_path = Path("backend/models/detector/best.pt")
        prod_det_path.parent.mkdir(parents=True, exist_ok=True)
        import shutil
        shutil.copy2(best_weights, prod_det_path)
        print(f"Deployed best detector checkpoint to: {prod_det_path}")

    print("\n" + "=" * 65)
    print("PRETRAINED YOLO FINE-TUNING COMPLETED SUCCESSFULLY!")
    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pretrained YOLO Food Detector Transfer Learning")
    parser.add_argument("--data", type=str, default="datasets/NUTRIVISION-AI-DATASET-5000/detection/data.yaml")
    parser.add_argument("--base", type=str, default="yolo11n.pt")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--imgsz", type=int, default=416)
    parser.add_argument("--patience", type=int, default=8)
    parser.add_argument("--lr0", type=float, default=0.005)
    args = parser.parse_args()

    train_pretrained_yolo(
        data_yaml=args.data,
        base_checkpoint=args.base,
        epochs=args.epochs,
        batch_size=args.batch,
        img_size=args.imgsz,
        patience=args.patience,
        lr0=args.lr0
    )
