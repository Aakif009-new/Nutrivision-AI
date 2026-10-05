import os
import sys
import json
import argparse
from pathlib import Path
from ultralytics import YOLO

def train_custom_yolo11(
    data_yaml: str = "datasets/NUTRIVISION-AI-DATASET-5000/detection/data.yaml",
    output_dir: str = "backend/models/detector",
    epochs: int = 15,
    img_size: int = 384,
    batch_size: int = 16,
    patience: int = 10
):
    """
    Academic Custom YOLO11 Food Detector Training From Scratch.
    Strictly adheres to: ZERO PRETRAINED WEIGHTS / NO TRANSFER LEARNING.
    Initializes network structure from YAML configuration without downloading or loading pretrained weights.
    """
    print("=" * 60)
    print("NUTRIVISION AI — CUSTOM YOLO11 FOOD DETECTOR")
    print("TRAINING FROM SCRATCH (Zero Pretrained Weights / No Transfer Learning)")
    print("=" * 60)

    project_root = Path(__file__).resolve().parent.parent.parent.parent
    data_path = (project_root / data_yaml).resolve()
    
    if not data_path.exists():
        raise FileNotFoundError(f"data.yaml not found at: {data_path}")

    # Initialize model from scratch using YAML architecture specification
    print("\n[Step 1] Initializing random YOLO11 architecture weights from scratch...")
    model = YOLO("yolo11n.yaml")
    
    out_path = project_root / output_dir
    out_path.mkdir(parents=True, exist_ok=True)

    print(f"\n[Step 2] Training YOLO11 on dataset for up to {epochs} epochs (Batch: {batch_size}, ImgSize: {img_size}, Patience: {patience})...")
    results = model.train(
        data=str(data_path),
        epochs=epochs,
        patience=patience,
        imgsz=img_size,
        batch=batch_size,
        project=str(out_path),
        name="scratch_run",
        exist_ok=True,
        pretrained=False, # STRICT ACADEMIC CONSTRAINT: NO PRETRAINED WEIGHTS
        optimizer="AdamW",
        lr0=0.002,
        seed=42,
        save=True,
        plots=True,
        verbose=True
    )

    # Step 3: Validate on the Test Set
    print("\n[Step 3] Evaluating Best Detector Checkpoint on Test Set...")
    best_weights = out_path / "scratch_run" / "weights" / "best.pt"
    if best_weights.exists():
        best_model = YOLO(str(best_weights))
        test_res = best_model.val(data=str(data_path), split="test", imgsz=img_size)
        
        # Save test metrics JSON
        metrics_file = out_path / "scratch_run" / "test_metrics.json"
        try:
            metrics_data = {
                "precision": float(test_res.box.mp),
                "recall": float(test_res.box.mr),
                "map50": float(test_res.box.map50),
                "map50_95": float(test_res.box.map),
                "per_class_map50": [float(x) for x in test_res.box.maps]
            }
            with open(metrics_file, "w") as mf:
                json.dump(metrics_data, mf, indent=2)
            print(f"Saved test evaluation metrics to: {metrics_file}")
        except Exception as e:
            print(f"Note on saving test metrics: {e}")

    print("\n" + "=" * 60)
    print("DETECTOR TRAINING COMPLETED SUCCESSFULLY!")
    print(f"Artifacts, Weights, Confusion Matrices, and Curves saved to: {out_path / 'scratch_run'}")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Custom YOLO11 Food Detector from Scratch")
    parser.add_argument("--epochs", type=int, default=15, help="Training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=384, help="Image size")
    parser.add_argument("--patience", type=int, default=10, help="Early stopping patience")
    args = parser.parse_args()

    train_custom_yolo11(epochs=args.epochs, batch_size=args.batch, img_size=args.imgsz, patience=args.patience)
