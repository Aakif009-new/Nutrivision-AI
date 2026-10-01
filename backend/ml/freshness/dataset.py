import os
from pathlib import Path
from typing import Tuple, List, Callable, Optional
from PIL import Image
import torch
from torch.utils.data import Dataset
import torchvision.transforms as T

class FreshnessDataset(Dataset):
    """
    Academic Dataset Loader for Food Freshness.
    Loads images from train/val/test directories and maps subfolder names into:
      0: Fresh
      1: Rotten
    """

    def __init__(self, root_dir: str, split: str = "train", transform: Optional[Callable] = None):
        self.split_dir = Path(root_dir) / split
        self.transform = transform
        self.samples: List[Tuple[Path, int]] = []
        
        # Binary freshness classes: 0 -> fresh, 1 -> rotten
        self.classes = ["fresh", "rotten"]
        
        if not self.split_dir.exists():
            raise FileNotFoundError(f"Dataset directory not found: {self.split_dir}")

        for folder in self.split_dir.iterdir():
            if not folder.is_dir():
                continue
            
            # folder name is e.g. apple_fresh or tomato_rotten
            fname = folder.name.lower()
            if "rotten" in fname:
                label = 1
            elif "fresh" in fname:
                label = 0
            else:
                continue

            for img_file in folder.glob("*.*"):
                if img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                    self.samples.append((img_file, label))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        
        if self.transform:
            image = self.transform(image)
            
        return image, label

def get_freshness_transforms() -> Tuple[T.Compose, T.Compose]:
    """
    Academic data augmentation pipeline:
    Includes realistic rotations, horizontal flips, brightness/contrast adjustments.
    """
    train_transform = T.Compose([
        T.Resize((224, 224)),
        T.RandomHorizontalFlip(p=0.5),
        T.RandomRotation(degrees=15),
        T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = T.Compose([
        T.Resize((224, 224)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform
