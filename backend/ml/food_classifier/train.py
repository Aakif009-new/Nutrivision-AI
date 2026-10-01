import os
import sys
import json
import argparse
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

# Add project root to path
backend_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_root))

from ml.food_classifier.model import FoodClassifierCNN
from ml.food_classifier.dataset import FoodClassificationDataset, get_food_transforms, FOOD_CLASSES

def mixup_data(x, y, alpha=0.2):
    if alpha > 0:
        lam = np.random.beta(alpha, alpha)
    else:
        lam = 1.0
    batch_size = x.size(0)
    index = torch.randperm(batch_size).to(x.device)
    mixed_x = lam * x + (1 - lam) * x[index, :]
    y_a, y_b = y, y[index]
    return mixed_x, y_a, y_b, lam

def mixup_criterion(criterion, pred, y_a, y_b, lam):
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)

def train_food_classifier(
    dataset_dir: str = "datasets/classification",
    output_dir: str = "backend/models/food_classifier",
    epochs: int = 35,
    batch_size: int = 16,
    lr: float = 0.0008
):
    print("=" * 60)
    print("NUTRIVISION AI — CUSTOM RESIDUAL FOOD CLASSIFIER CNN")
    print("Training from Scratch | Zero Pretrained Weights")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    # Transforms & Datasets
    train_tf, val_tf = get_food_transforms()
    train_dataset = FoodClassificationDataset(dataset_dir, split="train", transform=train_tf)
    val_dataset = FoodClassificationDataset(dataset_dir, split="val", transform=val_tf)

    print(f"Loaded {len(train_dataset)} training samples, {len(val_dataset)} validation samples across 10 classes.")

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # Initialize model from scratch
    model = FoodClassifierCNN(num_classes=10).to(device)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.08)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-3)
    scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(optimizer, T_0=10, T_mult=2, eta_min=1e-5)

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

            if np.random.rand() > 0.5:
                inputs, targets_a, targets_b, lam = mixup_data(images, labels, alpha=0.2)
                outputs = model(inputs)
                loss = mixup_criterion(criterion, outputs, targets_a, targets_b, lam)
            else:
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
        scheduler.step()

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 2))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 2))

        print(f"Epoch [{epoch:02d}/{epochs:02d}] "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}%")

        # Save Best Model Checkpoint
        if epoch_val_acc >= best_val_acc:
            best_val_acc = epoch_val_acc
            best_model_path = out_path / "best_food_classifier.pth"
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_acc": best_val_acc,
                "classes": FOOD_CLASSES
            }, best_model_path)
            print(f"  --> Saved new best food classifier checkpoint (Val Acc: {best_val_acc:.2f}%)")

    # Save history
    with open(out_path / "food_classifier_history.json", "w") as jf:
        json.dump(history, jf, indent=2)

    print("\n" + "=" * 60)
    print(f"FOOD CLASSIFIER TRAINING COMPLETE! Best Val Accuracy: {best_val_acc:.2f}%")
    print(f"Saved model to: {out_path / 'best_food_classifier.pth'}")
    print("=" * 60)

if __name__ == "__main__":
    project_dir = Path(__file__).resolve().parent.parent.parent.parent
    d_dir = str(project_dir / "datasets" / "classification")
    o_dir = str(project_dir / "backend" / "models" / "food_classifier")
    train_food_classifier(dataset_dir=d_dir, output_dir=o_dir, epochs=35, batch_size=16)
