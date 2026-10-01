import os
import sys
import argparse
from pathlib import Path
from ultralytics import YOLO

def train_custom_yolo11(
    data_yaml: str = "datasets/detection/data.yaml",
    output_dir: str = "backend/models/detector",
    epochs: int = 20,
    img_size: int = 640,
    batch_size: int = 16
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
    # Using 'yolo11n.yaml' initializes the random weights without loading any .pt file
    print("\n[Step 1] Initializing random YOLO11 architecture weights from scratch...")
    model = YOLO("yolo11n.yaml")
    
    out_path = project_root / output_dir
    out_path.mkdir(parents=True, exist_ok=True)

    print(f"\n[Step 2] Training YOLO11 on dataset for {epochs} epochs (Batch: {batch_size}, ImgSize: {img_size})...")
    results = model.train(
        data=str(data_path),
        epochs=epochs,
        imgsz=img_size,
        batch=batch_size,
        project=str(out_path),
        name="scratch_run",
        exist_ok=True,
        pretrained=False, # STRICT ACADEMIC CONSTRAINT: NO PRETRAINED WEIGHTS
        optimizer="AdamW",
        lr0=0.002,
        save=True,
        plots=True,
        verbose=True
    )

    print("\n" + "=" * 60)
    print("DETECTOR TRAINING COMPLETED SUCCESSFULLY!")
    print(f"Artifacts, Weights, Confusion Matrices, and Curves saved to: {out_path / 'scratch_run'}")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Custom YOLO11 Food Detector from Scratch")
    parser.add_argument("--epochs", type=int, default=20, help="Training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    args = parser.parse_args()

    train_custom_yolo11(epochs=args.epochs, batch_size=args.batch, img_size=args.imgsz)
