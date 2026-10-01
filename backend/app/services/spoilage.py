import cv2
import numpy as np
import base64
from typing import Dict, Any, Tuple, Optional
from app.services.image_processing import encode_img_to_base64

class SpoilageAnalyzer:
    """
    Academic OpenCV Spoilage Region Localization.
    Uses Color Abnormality in HSV/LAB color spaces and Morphological Connected Components
    to highlight rotten/decayed/brown patches on the food surface.
    """

    def analyze_spoilage(self, cropped_food_bgr: np.ndarray, food_name: str) -> Dict[str, Any]:
        if cropped_food_bgr is None or cropped_food_bgr.size == 0:
            return {
                "spoiled_area_percentage": 0.0,
                "status": "Undefined / Insufficient evidence",
                "spoilage_mask_base64": ""
            }

        h, w = cropped_food_bgr.shape[:2]
        
        # 1. Convert to HSV and LAB color spaces
        hsv = cv2.cvtColor(cropped_food_bgr, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(cropped_food_bgr, cv2.COLOR_BGR2LAB)
        
        # 2. Extract food foreground mask (ignore white/black background)
        gray = cv2.cvtColor(cropped_food_bgr, cv2.COLOR_BGR2GRAY)
        _, food_mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        total_food_pixels = max(1, cv2.countNonZero(food_mask))
        
        # 3. Detect discolored/decayed brown/dark-rot regions
        # Dark necrotic spots: low Value in HSV and specific hue range (brown/dark rot: 0 <= H <= 30, S > 40, V < 110)
        lower_brown = np.array([0, 30, 10])
        upper_brown = np.array([35, 255, 120])
        spoilage_hsv = cv2.inRange(hsv, lower_brown, upper_brown)
        
        # Also check LAB L-channel for deep localized dark blemishes
        l_channel = lab[:, :, 0]
        _, dark_blemishes = cv2.threshold(l_channel, 70, 255, cv2.THRESH_BINARY_INV)
        
        # Combine candidate spoiled areas
        combined_spoilage = cv2.bitwise_or(spoilage_hsv, dark_blemishes)
        combined_spoilage = cv2.bitwise_and(combined_spoilage, food_mask)
        
        # 4. Morphological Cleanup (remove tiny specular noise, connect necrotic clusters)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        cleaned_spoilage = cv2.morphologyEx(combined_spoilage, cv2.MORPH_OPEN, kernel, iterations=1)
        cleaned_spoilage = cv2.morphologyEx(cleaned_spoilage, cv2.MORPH_CLOSE, kernel, iterations=1)
        
        # 5. Connected Component Analysis to isolate significant decay spots
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(cleaned_spoilage)
        final_mask = np.zeros_like(cleaned_spoilage)
        
        min_spot_area = max(10, int(total_food_pixels * 0.005)) # At least 0.5% of the food
        for i in range(1, num_labels):
            if stats[i, cv2.CC_STAT_AREA] >= min_spot_area:
                final_mask[labels == i] = 255
                
        spoiled_pixels = cv2.countNonZero(final_mask)
        spoiled_percentage = round((spoiled_pixels / float(total_food_pixels)) * 100.0, 1)
        
        # Cap realistically
        spoiled_percentage = min(100.0, max(0.0, spoiled_percentage))
        
        # Create visualization overlay (Red overlay on spoiled regions)
        overlay = cropped_food_bgr.copy()
        overlay[final_mask == 255] = [0, 0, 255] # Red highlight
        blended = cv2.addWeighted(cropped_food_bgr, 0.7, overlay, 0.3, 0)
        
        # Draw contour boundaries around spots
        contours, _ = cv2.findContours(final_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(blended, contours, -1, (0, 0, 255), 2)
        
        status_text = "Clean" if spoiled_percentage < 3.0 else ("Mild Discoloration" if spoiled_percentage < 15.0 else "Significant Spoilage")
        
        return {
            "spoiled_area_percentage": spoiled_percentage,
            "status": status_text,
            "spoiled_pixels": int(spoiled_pixels),
            "total_food_pixels": int(total_food_pixels),
            "spoilage_overlay_base64": encode_img_to_base64(blended)
        }

spoilage_analyzer = SpoilageAnalyzer()
