"""
NutriVision AI — Configuration-Driven Pretrained Model Registry
Provides unified loading, head-replacement, freezing/unfreezing, and checkpointing
for modern computer vision backbones (MobileNetV3, EfficientNet, ResNet, ViT).
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, List, Optional
import torch
import torch.nn as nn
import torchvision.transforms as T
import torchvision.models as models

logger = logging.getLogger(__name__)

# Standard ImageNet normalization used by official torchvision pretrained checkpoints
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

SUPPORTED_ARCHITECTURES = {
    "mobilenet_v3_small": {
        "constructor": models.mobilenet_v3_small,
        "weights": models.MobileNet_V3_Small_Weights.DEFAULT,
        "family": "mobilenet",
        "description": "Ultra-lightweight mobile classification network (<10MB, ultra-low latency)"
    },
    "mobilenet_v3_large": {
        "constructor": models.mobilenet_v3_large,
        "weights": models.MobileNet_V3_Large_Weights.DEFAULT,
        "family": "mobilenet",
        "description": "High-accuracy mobile classification network"
    },
    "efficientnet_b0": {
        "constructor": models.efficientnet_b0,
        "weights": models.EfficientNet_B0_Weights.DEFAULT,
        "family": "efficientnet",
        "description": "Compound-scaled EfficientNet baseline with high parameter efficiency"
    },
    "resnet50": {
        "constructor": models.resnet50,
        "weights": models.ResNet50_Weights.DEFAULT,
        "family": "resnet",
        "description": "50-layer deep residual baseline network for robust representation learning"
    },
    "resnet18": {
        "constructor": models.resnet18,
        "weights": models.ResNet18_Weights.DEFAULT,
        "family": "resnet",
        "description": "Lightweight 18-layer residual network"
    },
    "vit_b_16": {
        "constructor": models.vit_b_16,
        "weights": models.ViT_B_16_Weights.DEFAULT,
        "family": "vit",
        "description": "Vision Transformer (ViT-B/16) self-attention classification benchmark"
    }
}


def get_transforms(img_size: int = 224) -> Tuple[T.Compose, T.Compose]:
    """
    Returns augmentation transforms for training and deterministic transforms for validation/testing.
    """
    train_transform = T.Compose([
        T.Resize((img_size, img_size)),
        T.RandomHorizontalFlip(p=0.5),
        T.RandomVerticalFlip(p=0.2),
        T.RandomRotation(degrees=15),
        T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.03),
        T.ToTensor(),
        T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])

    eval_transform = T.Compose([
        T.Resize((img_size, img_size)),
        T.ToTensor(),
        T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])

    return train_transform, eval_transform


def build_classifier(
    model_name: str,
    num_classes: int,
    freeze_backbone: bool = True,
    dropout: float = 0.3
) -> nn.Module:
    """
    Instantiates an official pretrained model, replaces the classification head
    to match `num_classes`, and optionally freezes the backbone for transfer learning.
    """
    model_name = model_name.lower().strip()
    if model_name not in SUPPORTED_ARCHITECTURES:
        supported = list(SUPPORTED_ARCHITECTURES.keys())
        raise ValueError(f"Unsupported model architecture: '{model_name}'. Choose from: {supported}")

    arch_info = SUPPORTED_ARCHITECTURES[model_name]
    constructor = arch_info["constructor"]
    weights = arch_info["weights"]

    try:
        model = constructor(weights=weights)
    except Exception as e:
        logger.warning(f"Failed to load weights online for {model_name} ({e}), attempting without weights...")
        model = constructor(weights=None)

    family = arch_info["family"]

    # 1. Freeze backbone if requested
    if freeze_backbone:
        for param in model.parameters():
            param.requires_grad = False

    # 2. Replace classification head
    if family == "mobilenet":
        in_features = model.classifier[0].in_features
        model.classifier = nn.Sequential(
            nn.Linear(in_features, 1024),
            nn.Hardswish(),
            nn.Dropout(p=dropout),
            nn.Linear(1024, num_classes)
        )
        for param in model.classifier.parameters():
            param.requires_grad = True

    elif family == "efficientnet":
        in_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=dropout, inplace=True),
            nn.Linear(in_features, num_classes)
        )
        for param in model.classifier.parameters():
            param.requires_grad = True

    elif family == "resnet":
        in_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(in_features, num_classes)
        )
        for param in model.fc.parameters():
            param.requires_grad = True

    elif family == "vit":
        in_features = model.heads.head.in_features
        model.heads.head = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(in_features, num_classes)
        )
        for param in model.heads.head.parameters():
            param.requires_grad = True

    return model


def unfreeze_backbone(model: nn.Module, model_name: str, top_layers_only: bool = False):
    """
    Unfreezes backbone parameters for Phase-2 fine-tuning.
    """
    arch_info = SUPPORTED_ARCHITECTURES.get(model_name.lower().strip(), {})
    family = arch_info.get("family", "")

    if not top_layers_only:
        # Unfreeze entire network
        for param in model.parameters():
            param.requires_grad = True
        return

    # Selective top-layer unfreezing
    if family == "resnet":
        # Unfreeze layer4 and fc
        for name, child in model.named_children():
            if name in ["layer4", "fc"]:
                for p in child.parameters():
                    p.requires_grad = True
    elif family == "efficientnet":
        # Unfreeze top feature stages and classifier
        for name, child in model.named_children():
            if name == "classifier":
                for p in child.parameters():
                    p.requires_grad = True
            elif name == "features":
                # Unfreeze last 2 blocks
                for idx, block in enumerate(child):
                    if idx >= len(child) - 3:
                        for p in block.parameters():
                            p.requires_grad = True
    elif family == "mobilenet":
        for name, child in model.named_children():
            if name == "classifier":
                for p in child.parameters():
                    p.requires_grad = True
            elif name == "features":
                for idx, block in enumerate(child):
                    if idx >= len(child) - 4:
                        for p in block.parameters():
                            p.requires_grad = True
    else:
        for param in model.parameters():
            param.requires_grad = True


def save_checkpoint(
    filepath: Path,
    model: nn.Module,
    model_name: str,
    task: str,
    class_names: List[str],
    img_size: int = 224,
    metrics: Optional[Dict[str, Any]] = None,
    extra: Optional[Dict[str, Any]] = None
):
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    metadata = {
        "model_name": model_name,
        "task": task,
        "num_classes": len(class_names),
        "class_names": class_names,
        "img_size": img_size,
        "metrics": metrics or {},
        "extra": extra or {}
    }

    checkpoint = {
        "model_state_dict": model.state_dict(),
        "metadata": metadata
    }

    torch.save(checkpoint, filepath)
    logger.info(f"Saved model checkpoint with metadata to: {filepath}")


def load_checkpoint(filepath: Path, device: Optional[torch.device] = None) -> Tuple[nn.Module, Dict[str, Any]]:
    filepath = Path(filepath)
    if not filepath.exists():
        raise FileNotFoundError(f"Checkpoint not found at: {filepath}")

    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    checkpoint = torch.load(filepath, map_location=device)
    metadata = checkpoint.get("metadata", {})
    model_name = metadata.get("model_name", "mobilenet_v3_small")
    num_classes = metadata.get("num_classes", len(metadata.get("class_names", [1, 2])))

    model = build_classifier(model_name, num_classes=num_classes, freeze_backbone=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()

    return model, metadata
