import os
import sys
import argparse
from pathlib import Path
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import numpy as np

backend_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_root))

from ml.freshness.model import FreshnessCNN
from ml.freshness.dataset import FreshnessDataset, get_freshness_transforms

def evaluate_freshness(
    model_path: str = "backend/models/freshness/best_model.pth",
    dataset_dir: str = "datasets/classification",
    output_dir: str = "backend/models/freshness"
):
    print("=" * 60)
    print("NUTRIVISION AI — FRESHNESS CNN EVALUATION ON TEST SET")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _, val_tf = get_freshness_transforms()
    test_dataset = FreshnessDataset(dataset_dir, split="test", transform=val_tf)
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)

    print(f"Loaded {len(test_dataset)} test samples.")

    # Load model weights
    checkpoint = torch.load(model_path, map_location=device)
    model = FreshnessCNN(num_classes=2).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    y_true = []
    y_pred = []
    y_probs = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)

            y_true.extend(labels.cpu().numpy())
            y_pred.extend(preds.cpu().numpy())
            y_probs.extend(probs.cpu().numpy())

    class_names = ["Fresh", "Spoiled"]
    report = classification_report(y_true, y_pred, target_names=class_names, digits=4)
    cm = confusion_matrix(y_true, y_pred)

    print("\n--- TEST CLASSIFICATION REPORT ---")
    print(report)
    print("\n--- CONFUSION MATRIX ---")
    print(cm)

    out_p = Path(output_dir)
    out_p.mkdir(parents=True, exist_ok=True)

    # Save report text
    with open(out_p / "classification_report.txt", "w") as f:
        f.write("NUTRIVISION AI FRESHNESS CNN TEST REPORT\n")
        f.write("=" * 50 + "\n\n")
        f.write(report)
        f.write("\n\nConfusion Matrix:\n")
        f.write(str(cm))

    # Plot & save confusion matrix
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    ax.figure.colorbar(im, ax=ax)
    ax.set(xticks=np.arange(cm.shape[1]),
           yticks=np.arange(cm.shape[0]),
           xticklabels=class_names, yticklabels=class_names,
           title='Freshness CNN Confusion Matrix',
           ylabel='True Label',
           xlabel='Predicted Label')

    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, format(cm[i, j], 'd'),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black")
    fig.tight_layout()
    plt.savefig(out_p / "confusion_matrix.png", dpi=150)
    plt.close()

    print(f"\nSaved evaluation metrics & plots to: {out_p}")

if __name__ == "__main__":
    project_dir = Path(__file__).resolve().parent.parent.parent.parent
    m_path = str(project_dir / "backend" / "models" / "freshness" / "best_model.pth")
    d_path = str(project_dir / "datasets" / "NUTRIVISION-AI-DATASET-5000" / "freshness")
    o_path = str(project_dir / "backend" / "models" / "freshness")

    evaluate_freshness(model_path=m_path, dataset_dir=d_path, output_dir=o_path)
