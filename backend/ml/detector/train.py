"""
NutriVision AI — Official Pretrained YOLO11n Transfer Learning & Fine-Tuning Pipeline
Starts from official pretrained Ultralytics weights (yolo11n.pt),
fine-tunes on the verified 12-class bounding-box dataset (detection_processed),
evaluates on the reserved test set, and deploys the best checkpoint.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from ultralytics import YOLO

# Add backend directory to sys.path
backend_root = Path(__file__).resolve().parent.parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))


def train_pretrained_yolo(
    data_yaml: str = "datasets/NUTRIVISION-AI-DATASET-5000/detection_processed/data.yaml",
    base_checkpoint: str = "yolo11n.pt",
    output_dir: str = "backend/models/detector",
    run_name: str = "pretrained_run",
    epochs: int = 8,
    img_size: int = 416,
    batch_size: int = 16,
    patience: int = 10,
    lr0: float = 0.005,
    cls_weight: float = 0.5,
    close_mosaic: int = 3,
    warmup_epochs: float = 1.0,
    cos_lr: bool = True,
    degrees: float = 10.0,
    deploy: bool = True,
    seed: int = 42
):
    print("=" * 65)
    print("NUTRIVISION AI — PRETRAINED YOLO11n TRANSFER LEARNING & FINE-TUNING")
    print(f"Base Checkpoint:   {base_checkpoint} (Official Ultralytics Pretrained)")
    print(f"Dataset YAML:      {data_yaml}")
    print(f"Run Name:          {run_name}")
    print(f"Epochs:            {epochs} (Early Stopping Patience: {patience})")
    print(f"Image Size:        {img_size}x{img_size} | Batch Size: {batch_size}")
    print(f"Classification Wt: {cls_weight} | Close Mosaic: {close_mosaic} epochs")
    print("=" * 65)

    project_root = Path(__file__).resolve().parent.parent.parent.parent
    data_path = (project_root / data_yaml).resolve()

    if not data_path.exists():
        data_path = Path(data_yaml).resolve()

    if not data_path.exists():
        raise FileNotFoundError(f"data.yaml not found at: {data_path}")

    print(f"\n[Step 1] Loading official pretrained YOLO detector: {base_checkpoint}...")
    model = YOLO(base_checkpoint)
    print(f"Successfully loaded {base_checkpoint}. Total parameters: {sum(p.numel() for p in model.model.parameters()):,}")

    out_path = (project_root / output_dir).resolve()
    out_path.mkdir(parents=True, exist_ok=True)

    print(f"\n[Step 2] Fine-tuning pretrained YOLO on processed dataset...")
    results = model.train(
        data=str(data_path),
        epochs=epochs,
        patience=patience,
        imgsz=img_size,
        batch=batch_size,
        project=str(out_path),
        name=run_name,
        exist_ok=True,
        pretrained=True,  # OFFICIAL TRANSFER LEARNING ENABLED
        optimizer="AdamW",
        lr0=lr0,
        lrf=0.01,
        cls=cls_weight,
        close_mosaic=close_mosaic,
        warmup_epochs=warmup_epochs,
        cos_lr=cos_lr,
        degrees=degrees,
        fliplr=0.5,
        flipud=0.5,
        seed=seed,
        save=True,
        plots=True,
        verbose=True
    )

    # Step 3: Evaluate Best Model on Reserved TEST SET
    print("\n[Step 3] Evaluating Best Fine-Tuned Checkpoint on Reserved Test Set...")
    best_weights = out_path / run_name / "weights" / "best.pt"
    if not best_weights.exists():
        best_weights = out_path / run_name / "weights" / "last.pt"

    if best_weights.exists():
        best_model = YOLO(str(best_weights))
        test_res = best_model.val(data=str(data_path), split="test", imgsz=img_size)

        metrics_file = out_path / run_name / "test_metrics.json"
        try:
            metrics_data = {
                "base_checkpoint": base_checkpoint,
                "precision": float(test_res.box.mp),
                "recall": float(test_res.box.mr),
                "map50": float(test_res.box.map50),
                "map50_95": float(test_res.box.map),
                "per_class_map50": [float(x) for x in test_res.box.maps],
                "class_names": [best_model.names[i] for i in sorted(best_model.names.keys())]
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

        # Optionally deploy best weights to production detector path
        if deploy:
            prod_det_path = out_path / "best.pt"
            import shutil
            shutil.copy2(best_weights, prod_det_path)
            print(f"Deployed best detector checkpoint to: {prod_det_path}")

    print("\n" + "=" * 65)
    print("PRETRAINED YOLO11n FINE-TUNING COMPLETED SUCCESSFULLY!")
    print("=" * 65)
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pretrained YOLO Food Detector Transfer Learning")
    parser.add_argument("--data", type=str, default="datasets/NUTRIVISION-AI-DATASET-5000/detection_processed/data.yaml")
    parser.add_argument("--base", type=str, default="yolo11n.pt")
    parser.add_argument("--run-name", type=str, default="pretrained_run")
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--imgsz", type=int, default=416)
    parser.add_argument("--patience", type=int, default=10)
    parser.add_argument("--lr0", type=float, default=0.005)
    parser.add_argument("--cls", type=float, default=0.5)
    parser.add_argument("--close-mosaic", type=int, default=3)
    parser.add_argument("--no-deploy", action="store_true", help="Do not overwrite production best.pt")
    args = parser.parse_args()

    train_pretrained_yolo(
        data_yaml=args.data,
        base_checkpoint=args.base,
        run_name=args.run_name,
        epochs=args.epochs,
        batch_size=args.batch,
        img_size=args.imgsz,
        patience=args.patience,
        lr0=args.lr0,
        cls_weight=args.cls,
        close_mosaic=args.close_mosaic,
        deploy=not args.no_deploy
    )
