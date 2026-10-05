import os
import sys
import json
import argparse
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

# Add project root to path
backend_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_root))

from ml.freshness.model import FreshnessCNN
from ml.freshness.dataset import FreshnessDataset, get_freshness_transforms

def train_freshness_model(
    dataset_dir: str = "datasets/classification",
    output_dir: str = "backend/models/freshness",
    epochs: int = 25,
    batch_size: int = 16,
    lr: float = 0.001
):
    print("=" * 60)
    print("NUTRIVISION AI — CUSTOM FRESHNESS CNN TRAINING FROM SCRATCH")
    print("Zero Pretrained Weights | No Transfer Learning")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    # Transforms & Datasets
    train_tf, val_tf = get_freshness_transforms()
    train_dataset = FreshnessDataset(dataset_dir, split="train", transform=train_tf)
    val_dataset = FreshnessDataset(dataset_dir, split="val", transform=val_tf)

    print(f"Loaded {len(train_dataset)} training samples, {len(val_dataset)} validation samples.")

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # Initialize model from scratch
    model = FreshnessCNN(num_classes=2).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=3)

    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    best_val_acc = 0.0
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}

    for epoch in range(1, epochs + 1):
        # --- TRAIN STEP ---
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            train_correct += (preds == labels).sum().item()
            total_train += images.size(0)

        epoch_train_loss = train_loss / total_train
        epoch_train_acc = (train_correct / total_train) * 100.0

        # --- VAL STEP ---
        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                total_val += images.size(0)

        epoch_val_loss = val_loss / total_val
        epoch_val_acc = (val_correct / total_val) * 100.0
        scheduler.step(epoch_val_acc)

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 2))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 2))

        print(f"Epoch [{epoch:02d}/{epochs:02d}] "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}%")

        # Save Best Model Checkpoint
        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            best_model_path = out_path / "best_model.pth"
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_acc": best_val_acc,
                "classes": ["fresh", "rotten"]
            }, best_model_path)
            print(f"  --> Saved new best checkpoint to {best_model_path} (Val Acc: {best_val_acc:.2f}%)")

    # Save training history JSON
    hist_path = out_path / "training_history.json"
    with open(hist_path, "w") as jf:
        json.dump(history, jf, indent=2)

    print("\n" + "=" * 60)
    print(f"TRAINING COMPLETE! Best Validation Accuracy: {best_val_acc:.2f}%")
    print(f"Model saved to: {out_path / 'best_model.pth'}")
    print(f"History saved to: {hist_path}")
    print("=" * 60)

    # --- TEST SET EVALUATION ---
    print("\n[Step 3] Evaluating Best Model Checkpoint on Test Set...")
    try:
        from ml.freshness.evaluate import evaluate_freshness
        evaluate_freshness(
            model_path=str(out_path / "best_model.pth"),
            dataset_dir=dataset_dir,
            output_dir=output_dir
        )
    except Exception as e:
        print(f"Evaluation note: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Custom Freshness CNN from Scratch")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    args = parser.parse_args()

    project_dir = Path(__file__).resolve().parent.parent.parent.parent
    dataset_dir = str(project_dir / "datasets" / "NUTRIVISION-AI-DATASET-5000" / "freshness")
    output_dir = str(project_dir / "backend" / "models" / "freshness")

    train_freshness_model(
        dataset_dir=dataset_dir,
        output_dir=output_dir,
        epochs=args.epochs,
        batch_size=args.batch,
        lr=args.lr
    )
