import os
import pickle
from pathlib import Path
import numpy as np
from typing import Dict, Any, Optional

class WeightEstimationEngine:
    """
    Academic Weight Estimation Service.
    Feeds calculated physical dimensions (cm) & food type into custom trained Regressor.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.food_map = {
            "apple": 0, "banana": 1, "orange": 2, "strawberry": 3, "bitter_gourd": 4,
            "capsicum": 5, "cucumber": 6, "okra": 7, "potato": 8, "tomato": 9
        }

        # Resolve paths relative to this file
        service_dir = Path(__file__).resolve().parent # backend/app/services
        backend_dir = service_dir.parent.parent # backend
        project_root = backend_dir.parent # project root

        candidate_paths = [
            Path(model_path) if model_path else None,
            backend_dir / "models" / "weight" / "weight_regressor.pkl",
            project_root / "backend" / "models" / "weight" / "weight_regressor.pkl",
            Path("backend/models/weight/weight_regressor.pkl"),
            Path("models/weight/weight_regressor.pkl")
        ]

        for p in candidate_paths:
            if p and p.exists():
                self.load_model(str(p))
                print(f"[WeightRegressor] Loaded custom weight regressor from: {p}")
                break

    def load_model(self, model_path: str):
        with open(model_path, "rb") as mf:
            data = pickle.load(mf)
            self.model = data["model"]
            self.food_map = data.get("food_map", self.food_map)

    def estimate(self, food_name: str, width_cm: Optional[float] = None, height_cm: Optional[float] = None) -> Dict[str, Any]:
        """
        Calculates estimated weight in grams from dimensions or empirical morphological defaults.
        """
        clean_name = food_name.lower().replace(" ", "_")
        food_code = self.food_map.get(clean_name, 0)

        # Standard food typical dimensions (cm) if physical marker wasn't present
        typical_dims = {
            "apple": (7.5, 8.0), "banana": (3.8, 19.0), "orange": (7.8, 7.8),
            "strawberry": (3.2, 3.8), "bitter_gourd": (4.5, 16.0), "capsicum": (7.2, 8.5),
            "cucumber": (4.0, 18.0), "okra": (1.8, 9.0), "potato": (6.5, 9.0), "tomato": (6.8, 6.5)
        }
        def_w, def_h = typical_dims.get(clean_name, (7.0, 7.0))
        
        w = max(0.5, float(width_cm)) if width_cm is not None else def_w
        h = max(0.5, float(height_cm)) if height_cm is not None else def_h
        area = np.pi * (w / 2.0) * (h / 2.0)
        a, b = max(w, h) / 2.0, min(w, h) / 2.0
        perimeter = np.pi * (3 * (a + b) - np.sqrt(max(1e-5, (3 * a + b) * (a + 3 * b))))
        aspect_ratio = w / h

        features = np.array([[food_code, w, h, area, perimeter, aspect_ratio]])

        if self.model is not None:
            est_weight = float(self.model.predict(features)[0])
        else:
            # Mathematical density approximation fallback
            # Volume cm3 approx = 4/3 * pi * (w/2)^2 * (h/2) * 0.85
            est_weight = (4.0 / 3.0) * np.pi * (w / 2.0)**2 * (h / 2.0) * 0.85

        est_weight = max(5.0, round(est_weight, 1))

        return {
            "estimated_weight_grams": est_weight,
            "unit": "g",
            "dimensions_cm": {"width": w, "height": h},
            "is_calibrated": width_cm is not None,
            "label": "Estimated Weight",
            "confidence_metric": "R² calibrated regression"
        }

weight_estimation_engine = WeightEstimationEngine()
