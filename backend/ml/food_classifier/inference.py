import torch
import torchvision.transforms as T
from PIL import Image
import numpy as np
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import cv2

from ml.food_classifier.model import FoodClassifierCNN
from ml.food_classifier.dataset import FOOD_CLASSES

class FoodClassifierInferenceEngine:
    """
    Academic 10-Class Food Recognition Inference Engine.
    Evaluates cropped food candidate regions and determines exact produce category.
    Enforces strict out-of-distribution / non-food rejection thresholds.
    """

    def __init__(self, model_path: Optional[str] = None, confidence_threshold: float = 0.35):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.confidence_threshold = confidence_threshold
        self.classes = FOOD_CLASSES
        self.model = None

        # Resolve model path
        ml_dir = Path(__file__).resolve().parent.parent # backend/ml
        backend_dir = ml_dir.parent # backend
        project_root = backend_dir.parent # root

        candidate_paths = [
            Path(model_path) if model_path else None,
            backend_dir / "models" / "food_classifier" / "best_food_classifier.pth",
            project_root / "backend" / "models" / "food_classifier" / "best_food_classifier.pth",
            Path("backend/models/food_classifier/best_food_classifier.pth"),
            Path("models/food_classifier/best_food_classifier.pth")
        ]

        for p in candidate_paths:
            if p and p.exists():
                self.load_model(str(p))
                print(f"[FoodClassifierCNN] Loaded custom 10-class CNN from: {p}")
                break

        self.transform = T.Compose([
            T.Resize((224, 224)),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def load_model(self, model_path: str):
        checkpoint = torch.load(model_path, map_location=self.device)
        self.model = FoodClassifierCNN(num_classes=10).to(self.device)
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.eval()

    def predict(self, image_input: Any) -> Dict[str, Any]:
        """
        Takes crop or image (BGR numpy array or PIL Image).
        Returns recognized food item, confidence, and rejection status.
        """
        if self.model is None:
            # Check default path again dynamically
            default_p = Path("backend/models/food_classifier/best_food_classifier.pth")
            if default_p.exists():
                self.load_model(str(default_p))

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
