"""
NutriVision AI — Unified PyTorch Dataset Loader
Supports Produce Classification (10 food items) and Freshness Classification (Fresh / Spoiled)
using verified deterministic manifests to guarantee zero data leakage.
"""

import os
import json
from pathlib import Path
from typing import Tuple, List, Optional, Callable, Dict, Any
from PIL import Image
import torch
from torch.utils.data import Dataset
import numpy as np

FOOD_CLASSES = [
    "apple",
    "banana",
    "bitter_gourd",
    "capsicum",
    "cucumber",
    "okra",
    "orange",
    "potato",
    "strawberry",
    "tomato"
]

FRESHNESS_CLASSES = ["Fresh", "Spoiled"]


class NutriVisionClassificationDataset(Dataset):
    """
    Unified Dataset for Produce Classification and Freshness Classification.
    Reads from deterministic split manifests in dataset_manifests/ to guarantee exact splits.
    """

    def __init__(
        self,
        task: str = "produce",  # "produce" or "freshness"
        split: str = "train",    # "train", "val", or "test"
        transform: Optional[Callable] = None,
        project_root: Optional[Path] = None
    ):
        self.task = task.lower().strip()
        self.split = split.lower().strip()
        self.transform = transform

        if self.task not in ["produce", "freshness"]:
            raise ValueError(f"Task must be 'produce' or 'freshness', got: {self.task}")

        if project_root is None:
            self.project_root = Path(__file__).resolve().parent.parent.parent
        else:
            self.project_root = Path(project_root)

        manifest_file = self.project_root / "dataset_manifests" / f"{self.task}_{self.split}.json"

        # If manifest doesn't exist yet, generate it on the fly
        if not manifest_file.exists():
            from ml.dataset_manifests import generate_manifests
            generate_manifests()

        with open(manifest_file, "r", encoding="utf-8") as f:
            self.entries: List[Dict[str, Any]] = json.load(f)

        self.class_names = FOOD_CLASSES if self.task == "produce" else FRESHNESS_CLASSES
        self.num_classes = len(self.class_names)

    def __len__(self) -> int:
        return len(self.entries)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        entry = self.entries[idx]
        img_path = self.project_root / entry["rel_path"]
        target_id = int(entry["target_id"])

        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)

        return image, target_id

    def get_class_counts(self) -> Dict[str, int]:
        counts = {c: 0 for c in self.class_names}
        for entry in self.entries:
            c = entry["target_label"]
            counts[c] = counts.get(c, 0) + 1
        return counts

    def get_class_weights(self) -> torch.Tensor:
        """
        Calculates balanced class weights: total_samples / (num_classes * class_count)
        """
        counts = self.get_class_counts()
        total = len(self.entries)
        weights = []
        for c in self.class_names:
            cnt = max(1, counts[c])
            weights.append(total / (self.num_classes * cnt))
        return torch.tensor(weights, dtype=torch.float32)
