import os
from pathlib import Path
from typing import Tuple, List, Callable, Optional
from PIL import Image
import torch
from torch.utils.data import Dataset
import torchvision.transforms as T

FOOD_CLASSES = [
    "apple",
    "banana",
    "orange",
    "strawberry",
    "bitter_gourd",
    "capsicum",
    "cucumber",
    "okra",
    "potato",
    "tomato"
]

CLASS_TO_ID = {name: i for i, name in enumerate(FOOD_CLASSES)}

class FoodClassificationDataset(Dataset):
    """
    Academic Dataset Loader for 10 Food Classes.
    Loads images from train/val/test folders and maps them into 10 food class IDs.
    """

    def __init__(self, root_dir: str, split: str = "train", transform: Optional[Callable] = None):
        self.split_dir = Path(root_dir) / split
        self.transform = transform
        self.samples: List[Tuple[Path, int]] = []
        self.classes = FOOD_CLASSES

        if not self.split_dir.exists():
            raise FileNotFoundError(f"Dataset directory not found: {self.split_dir}")

        for folder in self.split_dir.iterdir():
            if not folder.is_dir():
                continue

            fname = folder.name.lower()
            # Find matching food class
            matched_class = None
            for f in FOOD_CLASSES:
                if fname.startswith(f):
                    matched_class = f
                    break

            if matched_class is None:
                continue

            class_id = CLASS_TO_ID[matched_class]

            for img_file in folder.glob("*.*"):
                if img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                    self.samples.append((img_file, class_id))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label

def get_food_transforms() -> Tuple[T.Compose, T.Compose]:
    """
    Data augmentation for high classification accuracy (>95%).
    """
    train_transform = T.Compose([
        T.Resize((224, 224)),
        T.RandomHorizontalFlip(p=0.5),
        T.RandomVerticalFlip(p=0.2),
        T.RandomRotation(degrees=20),
        T.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
        T.RandomAffine(degrees=0, translate=(0.08, 0.08), scale=(0.92, 1.08)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = T.Compose([
        T.Resize((224, 224)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform
