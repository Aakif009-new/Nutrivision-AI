"""
NutriVision AI — Modernized Food Classification Inference Engine
Loads pretrained models (MobileNetV3 / EfficientNet / ResNet) via the Model Registry
with robust confidence thresholding and out-of-distribution rejection.
"""

import logging
from pathlib import Path
from typing import Dict, Any, Optional
import numpy as np
import cv2
from PIL import Image
import torch

from ml.registry import load_checkpoint, get_transforms, SUPPORTED_ARCHITECTURES
from ml.dataset import FOOD_CLASSES

logger = logging.getLogger(__name__)


class FoodClassifierInferenceEngine:
    """
    10-Class Food Recognition Engine using Pretrained Transfer Learning Backbones.
    Evaluates cropped food candidate regions and determines exact produce category.
    Enforces strict out-of-distribution / non-food rejection thresholds.
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        confidence_threshold: float = 0.30
    ):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.confidence_threshold = confidence_threshold
        self.classes = FOOD_CLASSES
        self.model = None
        self.metadata = {}
        self.model_path = model_path
        self._ensure_loaded()

    def _ensure_loaded(self):
        if self.model is not None:
            return

        ml_dir = Path(__file__).resolve().parent.parent # backend/ml
        backend_dir = ml_dir.parent # backend
        project_root = backend_dir.parent # root

        candidate_paths = [
            Path(self.model_path) if self.model_path else None,
            backend_dir / "models" / "food_classifier" / "best_food_classifier.pth",
            project_root / "backend" / "models" / "food_classifier" / "best_food_classifier.pth",
            project_root / "models" / "best" / "produce_mobilenet_v3_small.pth",
            Path("backend/models/food_classifier/best_food_classifier.pth")
        ]

        for p in candidate_paths:
            if p and p.exists():
                try:
                    self.load_model(str(p))
                    print(f"[FoodClassifier] Loaded pretrained produce model from: {p}")
                    break
                except Exception as e:
                    logger.warning(f"Could not load checkpoint {p}: {e}")

        # Fallback eval transforms
        img_size = self.metadata.get("img_size", 224)
        _, self.transform = get_transforms(img_size=img_size)

    def load_model(self, model_path: str):
        self.model, self.metadata = load_checkpoint(Path(model_path), device=self.device)
        self.classes = self.metadata.get("class_names", FOOD_CLASSES)
        img_size = self.metadata.get("img_size", 224)
        _, self.transform = get_transforms(img_size=img_size)

    def predict(self, image_input: Any) -> Dict[str, Any]:
        """
        Takes crop or image (BGR numpy array or PIL Image).
        Returns recognized food item, confidence, and rejection status.
        """
        self._ensure_loaded()
        if self.model is None:
            return {
                "food": "Undefined",
                "confidence": 0.0,
                "is_supported": False,
                "reason": "Classifier weights not yet loaded."
            }

        if isinstance(image_input, np.ndarray):
            rgb = cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb)
        else:
            pil_img = image_input

        tensor = self.transform(pil_img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
            pred_idx = int(np.argmax(probs))
            confidence = float(probs[pred_idx])

        # Strict Out-Of-Distribution Rejection
        if confidence < self.confidence_threshold:
            return {
                "food": "Undefined",
                "food_id": -1,
                "confidence": round(confidence, 3),
                "is_supported": False,
                "reason": f"Classification confidence ({confidence:.1%}) below threshold ({self.confidence_threshold:.1%})"
            }

        food_name = self.classes[pred_idx]
        formatted_name = food_name.replace("_", " ").title()

        return {
            "food": formatted_name,
            "food_id": pred_idx,
            "raw_class": food_name,
            "confidence": round(confidence, 3),
            "is_supported": True,
            "class_probabilities": {
                c: round(float(probs[i]), 3) for i, c in enumerate(self.classes)
            }
        }
