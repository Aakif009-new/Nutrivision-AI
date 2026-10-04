import io
import base64
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel
import cv2
import numpy as np
from PIL import Image

from app.services.image_processing import image_processing_pipeline, encode_img_to_base64
from app.services.spoilage import spoilage_analyzer
from app.services.measurement import physical_size_estimator
from app.services.weight_estimation import weight_estimation_engine
from app.services.nutrition import nutrition_service
from app.services.shelf_life import shelf_life_estimator
from app.core.database import db_manager
from ml.freshness.inference import FreshnessInferenceEngine
from ml.detector.inference import FoodDetectorEngine
from ml.food_classifier.hybrid_classifier import hybrid_food_classifier

router = APIRouter(prefix="/analyze", tags=["Food Analysis"])

# Initialize ML engines (auto-discovers scratch trained weights)
freshness_engine = FreshnessInferenceEngine()
detector_engine = FoodDetectorEngine()

class FrameAnalysisRequest(BaseModel):
    image_base64: str
    reference_scale: Optional[float] = None

def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not decode image file. Please provide a valid JPEG or PNG image."
        )
    return img_bgr

def calculate_iou(box1: List[int], box2: List[int]) -> float:
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    inter_area = max(0, x2 - x1) * max(0, y2 - y1)
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union_area = box1_area + box2_area - inter_area
    return float(inter_area) / max(1.0, float(union_area))

def apply_nms(boxes: List[List[int]], iou_threshold: float = 0.35) -> List[List[int]]:
    if not boxes:
        return []
    # Sort boxes by area descending
    sorted_boxes = sorted(boxes, key=lambda b: (b[2] - b[0]) * (b[3] - b[1]), reverse=True)
    selected = []
    for b in sorted_boxes:
        if not any(calculate_iou(b, s) > iou_threshold for s in selected):
            selected.append(b)
    return selected

def detect_human_skin_fraction(img_bgr: np.ndarray) -> float:
    """
    Academic Skin Chromaticity Filter:
    Distinguishes human skin (organic melanin: S in [18, 128], Cr in [133, 173], Cb in [77, 127])
    from background surfaces and food items.
    """
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
    
    hsv_skin = cv2.inRange(hsv, np.array([0, 18, 40]), np.array([25, 128, 245]))
    ycc_skin = cv2.inRange(ycrcb, np.array([40, 133, 77]), np.array([245, 173, 127]))
    skin_mask = cv2.bitwise_and(hsv_skin, ycc_skin)
    
    return float(cv2.countNonZero(skin_mask)) / float(img_bgr.shape[0] * img_bgr.shape[1])

def extract_candidate_regions(processed_bgr: np.ndarray, foreground_mask: np.ndarray) -> List[List[int]]:
    """
    OpenCV Bounding Box Proposal Generator:
    Extracts physical object contours using LAB background color distance + saturation binarization.
    """
    h, w = processed_bgr.shape[:2]
    
    # 1. Background color estimation from image borders
    lab = cv2.cvtColor(processed_bgr, cv2.COLOR_BGR2LAB)
    border_lab = np.concatenate([lab[0:6, :], lab[-6:, :], lab[:, 0:6], lab[:, -6:]], axis=None).reshape(-1, 3)
    bg_color = np.median(border_lab, axis=0)
    
    # Color distance from background (works on white, pink, blue, wooden backgrounds)
    color_dist = np.linalg.norm(lab.astype(np.float32) - bg_color.astype(np.float32), axis=2)
    dist_mask = (color_dist > 22.0).astype(np.uint8) * 255
    
    # If dist_mask found valid foreground, use it; otherwise fallback to foreground_mask
    if cv2.countNonZero(dist_mask) < (w * h * 0.01) or cv2.countNonZero(dist_mask) > (w * h * 0.92):
        active_mask = foreground_mask
    else:
        active_mask = dist_mask
    
    # Morphology cleaning
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    cleaned = cv2.morphologyEx(active_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel, iterations=1)
    
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    
    valid_contours = [c for c in contours if cv2.contourArea(c) > (w * h * 0.015)]
    if valid_contours:
        max_area = max(cv2.contourArea(c) for c in valid_contours)
        valid_contours = [c for c in valid_contours if cv2.contourArea(c) >= max(max_area * 0.25, w * h * 0.02)]
        valid_contours = sorted(valid_contours, key=cv2.contourArea, reverse=True)[:3]
    
    for c in valid_contours:
        bx, by, bw, bh = cv2.boundingRect(c)
        pad_x = int(bw * 0.04)
        pad_y = int(bh * 0.04)
        x1 = max(0, bx - pad_x)
        y1 = max(0, by - pad_y)
        x2 = min(w, bx + bw + pad_x)
        y2 = min(h, by + bh + pad_y)
        
        box_area_ratio = ((x2 - x1) * (y2 - y1)) / float(w * h)
        if box_area_ratio < 0.96 and (x2 - x1) > 25 and (y2 - y1) > 25:
            boxes.append([x1, y1, x2, y2])
            
    boxes = apply_nms(boxes, iou_threshold=0.25)
    
    if not boxes:
        boxes.append([int(w * 0.08), int(h * 0.08), int(w * 0.92), int(h * 0.92)])
        
    return boxes

def run_full_pipeline(img_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Executes the comprehensive Academic Computer Vision & Image Processing Pipeline:
    1. Human / Non-Food Rejection Filter
    2. Image Processing Core (OpenCV filters, conversions, contours, visual steps)
    3. Multi-Stage Food Recognition (Proposals + NMS + Super Ensemble + Residual CNN)
    4. Freshness Classification
    5. Spoilage Localization
    6. Physical Size & Weight Estimation
    7. Nutrition & Shelf-life Analysis
    """
    h_orig, w_orig = img_bgr.shape[:2]
    
    # 0. Strict Human Detection & Non-Food Scene Filter
    skin_ratio = detect_human_skin_fraction(img_bgr)
    if skin_ratio > 0.22:
        ip_result = image_processing_pipeline.process(img_bgr)
        cv_overlay = img_bgr.copy()
        cv2.putText(cv_overlay, "Undefined (0%) - Human Detected", (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        overall_summary = {
            "total_objects_detected": 1,
            "supported_foods_count": 0,
            "undefined_objects_count": 1,
            "total_calories_kcal": 0.0,
            "overall_health_score": 0,
            "primary_food": "None"
        }
        return {
            "status": "success",
            "scan_id": "human_rejected",
            "image_info": ip_result["dimensions"],
            "processing": {
                "techniques_applied": ip_result["techniques_applied"],
                "contour_stats": ip_result["contour_analysis"]
            },
            "visual_steps": ip_result["visual_steps"],
            "cv_analysis_overlay": encode_img_to_base64(cv_overlay),
            "detections": [{
                "id": 1,
                "food": "Undefined",
                "is_supported": False,
                "confidence": 0.0,
                "reason": "Non-food visual profile: Human face / skin detected in camera view. Please place a fruit or vegetable in front of the camera.",
                "bbox": [0, 0, w_orig, h_orig]
            }],
            "overall_summary": overall_summary,
            "warnings": ["Human / non-food visual profile detected."]
        }

    # 1. Classical OpenCV Image Processing Pipeline
    ip_result = image_processing_pipeline.process(img_bgr)
    processed_bgr = ip_result["processed_bgr"]
    foreground_mask = ip_result["foreground_mask"]
    
    # 2. Candidate boxes: OpenCV contour proposals + YOLO boxes
    candidate_boxes = extract_candidate_regions(processed_bgr, foreground_mask)
    
    yolo_dets = detector_engine.detect(processed_bgr)
    yolo_boxes = [d["bbox"] for d in yolo_dets if d.get("is_supported", False) and d.get("confidence", 0) > 0.45]
    
    if yolo_boxes:
        candidate_boxes = apply_nms(yolo_boxes + candidate_boxes, iou_threshold=0.30)

    analyzed_detections = []
    warnings = []
    total_calories = 0.0
    fresh_count = 0
    cv_overlay = processed_bgr.copy()

    for idx, bbox in enumerate(candidate_boxes):
        x1, y1, x2, y2 = bbox
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(processed_bgr.shape[1], x2), min(processed_bgr.shape[0], y2)
        
        if (x2 <= x1) or (y2 <= y1):
            continue
            
        crop = processed_bgr[y1:y2, x1:x2]
        if crop.size == 0:
            continue

        # 3. Academic Hybrid Vision Classifier (Super Ensemble + CNN)
        food_res = hybrid_food_classifier.classify_crop(crop)
        is_supported = food_res.get("is_supported", False)
        food_label = food_res.get("food", "Undefined")
        det_conf = food_res.get("confidence", 0.0)

        if not is_supported or food_label == "Undefined" or det_conf < 0.25:
            # Rejection rule
            cv2.rectangle(cv_overlay, (x1, y1), (x2, y2), (0, 165, 255), 2)
            cv2.putText(cv_overlay, f"Undefined ({det_conf:.0%})", (x1, max(20, y1 - 8)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 165, 255), 2)
            
            analyzed_detections.append({
                "id": idx + 1,
                "food": "Undefined",
                "is_supported": False,
                "confidence": det_conf,
                "reason": food_res.get("reason", "Object features do not match any supported food category."),
                "bbox": [x1, y1, x2, y2]
            })
            continue

        # 4. Custom Freshness CNN Classification
        freshness_res = freshness_engine.predict(crop)
        freshness_label = freshness_res.get("freshness", "Fresh")
        freshness_conf = freshness_res.get("confidence", 0.90)
        if freshness_label == "Fresh":
            fresh_count += 1
            
        # 5. Spoilage Region Localization
        spoilage_res = spoilage_analyzer.analyze_spoilage(crop, food_label)
        spoiled_pct = spoilage_res.get("spoiled_area_percentage", 0.0)
        
        # 6. Size Estimation (cm)
        size_res = physical_size_estimator.estimate_size([x1, y1, x2, y2], processed_bgr)
        width_cm = size_res.get("width_cm", 7.5)
        height_cm = size_res.get("height_cm", 8.0)
        
        # 7. Weight Regression Model
        weight_res = weight_estimation_engine.estimate(food_label, width_cm, height_cm)
        est_weight_g = weight_res.get("estimated_weight_grams", 150.0)
        
        # 8. Nutrition & Shelf Life Lookup
        nutrition_info = nutrition_service.get_nutrition(food_label, est_weight_g)
        shelf_life_info = shelf_life_estimator.estimate_shelf_life(food_label, freshness_label, spoiled_pct)
        total_calories += nutrition_info.get("calories", 0.0)
        
        # Draw on CV overlay
        box_color = (0, 200, 0) if freshness_label == "Fresh" else ((0, 140, 255) if freshness_label == "Semi-Fresh" else (0, 0, 255))
        cv2.rectangle(cv_overlay, (x1, y1), (x2, y2), box_color, 2)
        cv2.putText(cv_overlay, f"{food_label} ({det_conf:.0%}) | {freshness_label}",
                    (x1, max(20, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, box_color, 2)
        
        analyzed_detections.append({
            "id": idx + 1,
            "food": food_label,
            "is_supported": True,
            "confidence": det_conf,
            "bbox": [x1, y1, x2, y2],
            "freshness": freshness_label,
            "freshness_confidence": freshness_conf,
            "freshness_probabilities": freshness_res.get("probabilities", {}),
            "spoilage": {
                "spoiled_area_percentage": spoiled_pct,
                "status": spoilage_res.get("status", "Clean"),
                "overlay_base64": spoilage_res.get("spoilage_overlay_base64", "")
            },
            "size": size_res,
            "weight": weight_res,
            "nutrition": nutrition_info,
            "shelf_life": shelf_life_info
        })

    # If no detections passed, provide explicit rejected item
    if not analyzed_detections:
        analyzed_detections.append({
            "id": 1,
            "food": "Undefined",
            "is_supported": False,
            "confidence": 0.0,
            "reason": "No supported food items recognized in camera view.",
            "bbox": [0, 0, processed_bgr.shape[1], processed_bgr.shape[0]]
        })

    valid_items = [d for d in analyzed_detections if d.get("is_supported", False)]
    health_score = int((fresh_count / max(1, len(valid_items))) * 100) if valid_items else 0
    
    overall_summary = {
        "total_objects_detected": len(analyzed_detections),
        "supported_foods_count": len(valid_items),
        "undefined_objects_count": len(analyzed_detections) - len(valid_items),
        "total_calories_kcal": round(total_calories, 1),
        "overall_health_score": health_score,
        "primary_food": valid_items[0]["food"] if valid_items else "None"
    }

    if not valid_items:
        warnings.append("No supported food items recognized with sufficient confidence.")

    # Record in database
    analysis_record = {
        "overall_summary": overall_summary,
        "detections": analyzed_detections,
        "image_dimensions": ip_result["dimensions"]
    }
    scan_id = db_manager.save_analysis(analysis_record)

    import gc
    gc.collect()

    return {
        "status": "success",
        "scan_id": scan_id,
        "image_info": ip_result["dimensions"],
        "processing": {
            "techniques_applied": ip_result["techniques_applied"],
            "contour_stats": ip_result["contour_analysis"]
        },
        "visual_steps": ip_result["visual_steps"],
        "cv_analysis_overlay": encode_img_to_base64(cv_overlay),
        "detections": analyzed_detections,
        "overall_summary": overall_summary,
        "warnings": warnings
    }

@router.post("")
async def analyze_food_image(file: UploadFile = File(...)):
    """Upload image analysis endpoint."""
    contents = await file.read()
    img_bgr = decode_image_bytes(contents)
    result = run_full_pipeline(img_bgr)
    return result

@router.post("/frame")
async def analyze_webcam_frame(payload: FrameAnalysisRequest):
    """Webcam frame analysis endpoint."""
    raw_b64 = payload.image_base64
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",")[1]
    img_bytes = base64.b64decode(raw_b64)
    img_bgr = decode_image_bytes(img_bytes)
    result = run_full_pipeline(img_bgr)
    return result

@router.get("/history")
async def get_scan_history(limit: int = 10):
    """Retrieve recent scan history."""
    scans = db_manager.get_recent_scans(limit=limit)
    return {"status": "success", "history": scans}
