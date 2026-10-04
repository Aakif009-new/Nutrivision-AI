import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import cv2
import numpy as np
from ultralytics import YOLO
import yaml

class FoodDetectorEngine:
    """
    Academic Multi-Object Food Detection & Unknown Object Rejection Engine.
    Powered by Custom YOLO11 trained from scratch without pretrained weights.
    Enforces strict confidence thresholding to reject non-food / unknown objects as 'Undefined'.
    """

    def __init__(
        self,
        weights_path: Optional[str] = None,
        confidence_threshold: float = 0.20,
        iou_threshold: float = 0.40,
        classes_config_path: Optional[str] = None
    ):
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.classes = []
        self.model = None

        # Resolve paths relative to this file
        ml_dir = Path(__file__).resolve().parent.parent # backend/ml
        backend_dir = ml_dir.parent # backend
        project_root = backend_dir.parent # project root

        # Load classes config
        if not classes_config_path:
            cfg_file = ml_dir / "config" / "classes.yaml"
        else:
            cfg_file = Path(classes_config_path)

        if cfg_file.exists():
            with open(cfg_file, "r") as f:
                cfg = yaml.safe_load(f)
                self.classes = cfg.get("food_classes", [])
        else:
            self.classes = [
                "apple", "banana", "orange", "strawberry", "bitter_gourd",
                "capsicum", "cucumber", "okra", "potato", "tomato"
            ]

        self.weights_path = weights_path
        self._classes_config_path = classes_config_path

    def _ensure_loaded(self):
        if self.model is not None:
            return

        # Resolve paths relative to this file
        ml_dir = Path(__file__).resolve().parent.parent # backend/ml
        backend_dir = ml_dir.parent # backend
        project_root = backend_dir.parent # project root

        candidate_paths = [
            Path(self.weights_path) if self.weights_path else None,
            backend_dir / "models" / "detector" / "scratch_run" / "weights" / "best.pt",
            project_root / "backend" / "models" / "detector" / "scratch_run" / "weights" / "best.pt",
            backend_dir / "models" / "detector" / "best.pt",
        ]

        for p in candidate_paths:
            if p and p.exists():
                self.load_model(str(p))
                print(f"[FoodDetector] Successfully loaded custom YOLO11 detector from: {p}")
                break

        if self.model is None:
            print("[FoodDetector] Warning: Trained weights not found. Strict Undefined rejection active.")

    def load_model(self, weights_path: str):
        self.model = YOLO(weights_path)

    def detect(self, image_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Runs multi-object food detection.
        Rejects low-confidence or non-food objects.
        """
        self._ensure_loaded()
        h, w = image_bgr.shape[:2]

        if self.model is None:
            return [{
                "food": "Undefined",
                "food_id": -1,
                "confidence": 0.0,
                "bbox": [0, 0, w, h],
                "is_supported": False,
                "reason": "Detection model weights not loaded. Object rejected."
            }]

        results = self.model.predict(
            source=image_bgr,
            conf=self.confidence_threshold,
            iou=self.iou_threshold,
            verbose=False
        )

        detections = []
        if results and len(results) > 0:
            boxes = results[0].boxes
            for box in boxes:
                conf = float(box.conf[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                xyxy = box.xyxy[0].cpu().numpy().astype(int).tolist() # [x1, y1, x2, y2]
                
                # Check box size: ignore full-image boxes that cover >95% or <1% of frame
                box_w = xyxy[2] - xyxy[0]
                box_h = xyxy[3] - xyxy[1]
                box_area_ratio = (box_w * box_h) / float(w * h)
                
                if box_area_ratio > 0.96 or box_area_ratio < 0.015:
                    continue

                if 0 <= cls_id < len(self.classes) and conf >= self.confidence_threshold:
                    food_name = self.classes[cls_id]
                    detections.append({
                        "food": food_name.replace("_", " ").title(),
                        "food_id": cls_id,
                        "confidence": round(conf, 3),
                        "bbox": xyxy,
                        "is_supported": True
                    })
                else:
                    detections.append({
                        "food": "Undefined",
                        "food_id": -1,
                        "confidence": round(conf, 3),
                        "bbox": xyxy,
                        "is_supported": False,
                        "reason": f"Confidence ({conf:.1%}) below threshold or unrecognized category"
                    })

        # Strict Rejection: If no valid bounding box passed thresholds, return explicit rejection
        if len(detections) == 0:
            return [{
                "food": "Undefined",
                "food_id": -1,
                "confidence": 0.0,
                "bbox": [0, 0, w, h],
                "is_supported": False,
                "reason": "No supported food items detected with sufficient confidence."
            }]

        return detections
