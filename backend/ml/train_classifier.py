"""
NutriVision AI — Pretrained Transfer Learning & Fine-Tuning Pipeline
Implements rigorous 2-phase transfer learning (head warmup + full backbone fine-tuning),
validation-guided checkpointing, early stopping, and unbiased evaluation on the reserved test set.
"""

import os
import sys
import time
import json
import argparse
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support, accuracy_score

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from ml.registry import (
    build_classifier,
    unfreeze_backbone,
    get_transforms,
    save_checkpoint,
    SUPPORTED_ARCHITECTURES
)
from ml.dataset import NutriVisionClassificationDataset, FOOD_CLASSES, FRESHNESS_CLASSES


def set_seed(seed: int = 42):
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def plot_metrics(history: Dict[str, List[float]], output_path: Path):
    epochs = range(1, len(history["train_loss"]) + 1)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Loss plot
    ax1.plot(epochs, history["train_loss"], "b-o", label="Train Loss", markersize=4)
    ax1.plot(epochs, history["val_loss"], "r-o", label="Val Loss", markersize=4)
    ax1.set_title("Training & Validation Loss")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Cross Entropy Loss")
    ax1.grid(True, linestyle="--", alpha=0.6)
    ax1.legend()

    # Accuracy plot
    ax2.plot(epochs, history["train_acc"], "b-o", label="Train Acc (%)", markersize=4)
    ax2.plot(epochs, history["val_acc"], "r-o", label="Val Acc (%)", markersize=4)
    ax2.set_title("Training & Validation Accuracy")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy (%)")
    ax2.grid(True, linestyle="--", alpha=0.6)
    ax2.legend()

    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close()


def plot_confusion_matrix(cm: np.ndarray, class_names: List[str], output_path: Path, title: str):
    fig, ax = plt.subplots(figsize=(8, 7))
    im = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    ax.figure.colorbar(im, ax=ax)
    ax.set(
        xticks=np.arange(cm.shape[1]),
        yticks=np.arange(cm.shape[0]),
        xticklabels=class_names,
        yticklabels=class_names,
        title=title,
        ylabel="True Label",
        xlabel="Predicted Label"
    )
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")

    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(
                j, i, format(cm[i, j], "d"),
                ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black"
            )

    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close()


def train_classifier(
    task: str = "produce",
    model_name: str = "mobilenet_v3_small",
    total_epochs: int = 25,
    head_epochs: int = 5,
    patience: int = 7,
    batch_size: int = 32,
    lr_head: float = 1e-3,
    lr_fine: float = 1e-4,
    img_size: int = 224,
    seed: int = 42,
    device_name: Optional[str] = None
) -> Dict[str, Any]:
    set_seed(seed)

    if device_name:
        device = torch.device(device_name)
    else:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    if device.type == "cpu":
        torch.set_num_threads(min(8, os.cpu_count() or 4))

    class_names = FOOD_CLASSES if task == "produce" else FRESHNESS_CLASSES
    num_classes = len(class_names)

    print("=" * 65)
    print(f"NUTRIVISION AI — PRETRAINED TRANSFER LEARNING & FINE-TUNING")
    print(f"Task:            {task.upper()} ({num_classes} classes)")
    print(f"Model Backbone:  {model_name}")
    print(f"Device:          {device} (Threads: {torch.get_num_threads() if device.type == 'cpu' else 'CUDA'})")
    print(f"Total Epochs:    {total_epochs} (Head Warmup: {head_epochs}, Early Stopping Patience: {patience})")
    print(f"Batch Size:      {batch_size} | Image Resolution: {img_size}x{img_size}")
    print("=" * 65)

    # 1. Transforms & DataLoaders
    train_tf, eval_tf = get_transforms(img_size=img_size)
    train_ds = NutriVisionClassificationDataset(task=task, split="train", transform=train_tf)
    val_ds = NutriVisionClassificationDataset(task=task, split="val", transform=eval_tf)
    test_ds = NutriVisionClassificationDataset(task=task, split="test", transform=eval_tf)

    print(f"Dataset Partitions:")
    print(f"  Train:      {len(train_ds)} images")
    print(f"  Validation: {len(val_ds)} images")
    print(f"  Test:       {len(test_ds)} images (reserved for final evaluation)")

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    # 2. Setup Output Run Directory
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    run_dir = Path("runs") / "classification" / f"{task}_{model_name}_{timestamp}"
    run_dir.mkdir(parents=True, exist_ok=True)

    # 3. Build Pretrained Model with Head Replacement
    print(f"\n[Step 1] Loading pretrained backbone and replacing classification head...")
    model = build_classifier(model_name, num_classes=num_classes, freeze_backbone=True, dropout=0.3)
    model.to(device)

    # Loss function with balanced class weights
    class_weights = train_ds.get_class_weights().to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.05)

    # Phase 1: Optimizer for head only
    head_params = [p for p in model.parameters() if p.requires_grad]
    optimizer = optim.AdamW(head_params, lr=lr_head, weight_decay=1e-3)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    history = {
        "train_loss": [], "train_acc": [],
        "val_loss": [], "val_acc": [],
        "lr": []
    }

    best_val_loss = float("inf")
    best_val_acc = 0.0
    best_epoch = 0
    patience_counter = 0
    best_model_state = None
    start_time = time.time()
    current_phase = "Phase 1: Head Warmup (Frozen Backbone)"

    print(f"\n[Step 2] Beginning Training Loop across {total_epochs} epochs...")
    print(f"---> {current_phase} for {head_epochs} epochs (LR: {lr_head})")

    for epoch in range(1, total_epochs + 1):
        epoch_start = time.time()

        # Switch to Phase 2: Unfreeze backbone
        if epoch == head_epochs + 1:
            current_phase = "Phase 2: Full Backbone Fine-Tuning"
            print(f"\n---> Switching to {current_phase} (LR: {lr_fine})...")
            unfreeze_backbone(model, model_name=model_name, top_layers_only=False)
            optimizer = optim.AdamW(model.parameters(), lr=lr_fine, weight_decay=1e-4)
            scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

        # --- TRAINING PASS ---
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0

        for images, targets in train_loader:
            images, targets = images.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            preds = torch.argmax(outputs, dim=1)
            train_correct += (preds == targets).sum().item()
            total_train += images.size(0)

        ep_train_loss = train_loss / total_train
        ep_train_acc = (train_correct / total_train) * 100.0

        # --- VALIDATION PASS ---
        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for images, targets in val_loader:
                images, targets = images.to(device), targets.to(device)
                outputs = model(images)
                loss = criterion(outputs, targets)

                val_loss += loss.item() * images.size(0)
                preds = torch.argmax(outputs, dim=1)
                val_correct += (preds == targets).sum().item()
                total_val += images.size(0)

        ep_val_loss = val_loss / total_val
        ep_val_acc = (val_correct / total_val) * 100.0
        current_lr = optimizer.param_groups[0]["lr"]

        history["train_loss"].append(round(ep_train_loss, 4))
        history["train_acc"].append(round(ep_train_acc, 2))
        history["val_loss"].append(round(ep_val_loss, 4))
        history["val_acc"].append(round(ep_val_acc, 2))
        history["lr"].append(current_lr)

        scheduler.step(ep_val_loss)
        duration = time.time() - epoch_start

        # Check if best validation checkpoint
        is_best = ep_val_loss < best_val_loss
        if is_best:
            best_val_loss = ep_val_loss
            best_val_acc = ep_val_acc
            best_epoch = epoch
            patience_counter = 0
            best_model_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
        else:
            patience_counter += 1

        mark = " [*BEST*]" if is_best else ""
        print(
            f"Epoch [{epoch:02d}/{total_epochs:02d}] "
            f"Train Loss: {ep_train_loss:.4f} | Train Acc: {ep_train_acc:5.2f}% | "
            f"Val Loss: {ep_val_loss:.4f} | Val Acc: {ep_val_acc:5.2f}% | "
            f"LR: {current_lr:.1e} | Time: {duration:4.1f}s{mark}"
        )

        # Early Stopping Trigger
        if epoch > head_epochs and patience_counter >= patience:
            print(f"\n[Early Stopping Triggered] Validation loss did not improve for {patience} consecutive epochs. Stopping at epoch {epoch}.")
            break

    total_duration = time.time() - start_time
    print(f"\nTraining completed in {total_duration/60:.2f} minutes.")
    print(f"Best Validation Epoch: {best_epoch} with Val Loss: {best_val_loss:.4f}, Val Acc: {best_val_acc:.2f}%")

    # Load best model weights for final evaluation
    if best_model_state is not None:
        model.load_state_dict({k: v.to(device) for k, v in best_model_state.items()})

    # Plot & Save curves
    curves_path = run_dir / "training_curves.png"
    plot_metrics(history, curves_path)

    # 4. Final Evaluation on Reserved TEST SET
    print(f"\n[Step 3] Evaluating Best Model Checkpoint on Reserved Test Set...")
    model.eval()
    test_preds = []
    test_targets = []
    latencies = []

    with torch.no_grad():
        for images, targets in test_loader:
            images = images.to(device)
            t0 = time.time()
            outputs = model(images)
            latencies.append((time.time() - t0) / images.size(0))

            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            test_preds.extend(preds)
            test_targets.extend(targets.numpy())

    test_preds = np.array(test_preds)
    test_targets = np.array(test_targets)
    avg_latency_ms = float(np.mean(latencies) * 1000.0)

    # Compute comprehensive evaluation metrics
    test_acc = float(accuracy_score(test_targets, test_preds) * 100.0)
    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(test_targets, test_preds, average="macro", zero_division=0)
    prec_weighted, rec_weighted, f1_weighted, _ = precision_recall_fscore_support(test_targets, test_preds, average="weighted", zero_division=0)

    cm = confusion_matrix(test_targets, test_preds)
    cm_path = run_dir / "confusion_matrix.png"
    plot_confusion_matrix(cm, class_names=class_names, output_path=cm_path, title=f"{task.title()} Test Confusion Matrix ({model_name})")

    report_str = classification_report(test_targets, test_preds, target_names=class_names, digits=4, zero_division=0)
    report_path = run_dir / "classification_report.txt"
    with open(report_path, "w", encoding="utf-8") as rf:
        rf.write(report_str)

    print("\n" + "=" * 65)
    print(f"FINAL UNBIASED TEST EVALUATION REPORT ({task.upper()} - {model_name})")
    print("=" * 65)
    print(report_str)
    print(f"Overall Test Accuracy:    {test_acc:.2f}%")
    print(f"Macro F1-Score:           {f1_macro:.4f}")
    print(f"Weighted F1-Score:        {f1_weighted:.4f}")
    print(f"Average Inference Latency:{avg_latency_ms:.2f} ms / image")
    print("=" * 65)

    test_metrics = {
        "task": task,
        "model_name": model_name,
        "test_accuracy": round(test_acc, 2),
        "precision_macro": round(float(prec_macro), 4),
        "recall_macro": round(float(rec_macro), 4),
        "f1_macro": round(float(f1_macro), 4),
        "precision_weighted": round(float(prec_weighted), 4),
        "recall_weighted": round(float(rec_weighted), 4),
        "f1_weighted": round(float(f1_weighted), 4),
        "avg_latency_ms": round(avg_latency_ms, 2),
        "best_epoch": best_epoch,
        "best_val_loss": round(float(best_val_loss), 4),
        "best_val_acc": round(float(best_val_acc), 2),
        "training_duration_seconds": round(total_duration, 1),
        "device": str(device),
        "total_test_samples": len(test_ds)
    }

    with open(run_dir / "test_metrics.json", "w", encoding="utf-8") as mf:
        json.dump(test_metrics, mf, indent=2)

    # 5. Save Model Checkpoint
    checkpoint_file = run_dir / "best_model.pth"
    save_checkpoint(
        filepath=checkpoint_file,
        model=model,
        model_name=model_name,
        task=task,
        class_names=class_names,
        img_size=img_size,
        metrics=test_metrics,
        extra={"history": history}
    )

    # Deploy best model to production location
    if task == "produce":
        prod_path = Path("backend/models/food_classifier/best_food_classifier.pth")
    else:
        prod_path = Path("backend/models/freshness/best_model.pth")

    save_checkpoint(
        filepath=prod_path,
        model=model,
        model_name=model_name,
        task=task,
        class_names=class_names,
        img_size=img_size,
        metrics=test_metrics
    )

    models_best_dir = Path("models/best")
    models_best_dir.mkdir(parents=True, exist_ok=True)
    save_checkpoint(
        filepath=models_best_dir / f"{task}_{model_name}.pth",
        model=model,
        model_name=model_name,
        task=task,
        class_names=class_names,
        img_size=img_size,
        metrics=test_metrics
    )

    print(f"\nArtifacts and Checkpoints saved to: {run_dir}")
    print(f"Production Deployment Checkpoint updated at: {prod_path}")
    return test_metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NutriVision AI Pretrained Model Fine-Tuning")
    parser.add_argument("--task", type=str, default="produce", choices=["produce", "freshness"], help="Task name")
    parser.add_argument("--model", type=str, default="mobilenet_v3_small", choices=list(SUPPORTED_ARCHITECTURES.keys()), help="Model architecture")
    parser.add_argument("--epochs", type=int, default=20, help="Maximum epochs")
    parser.add_argument("--head_epochs", type=int, default=5, help="Head warmup epochs")
    parser.add_argument("--patience", type=int, default=6, help="Early stopping patience")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr_head", type=float, default=1e-3, help="Learning rate for head")
    parser.add_argument("--lr_fine", type=float, default=1e-4, help="Learning rate for fine-tuning")
    parser.add_argument("--img_size", type=int, default=224, help="Image resolution")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--device", type=str, default=None, help="Device (cuda/cpu)")

    args = parser.parse_args()
    train_classifier(
        task=args.task,
        model_name=args.model,
        total_epochs=args.epochs,
        head_epochs=args.head_epochs,
        patience=args.patience,
        batch_size=args.batch_size,
        lr_head=args.lr_head,
        lr_fine=args.lr_fine,
        img_size=args.img_size,
        seed=args.seed,
        device_name=args.device
    )
