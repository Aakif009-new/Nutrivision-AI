import cv2
import numpy as np
from typing import Dict, Any, Tuple, Optional, List, Union

List_or_Tuple = Union[List[int], Tuple[int, ...], List[float]]

class PhysicalSizeEstimator:
    """
    Academic Physical Size Estimation using OpenCV Reference Marker Calibration.
    Detects ArUco marker (or calibrated standard reference) to obtain pixels_per_cm ratio.
    """

    def __init__(self, default_marker_length_cm: float = 5.0):
        self.default_marker_length_cm = default_marker_length_cm
        
        # Check OpenCV aruco availability
        self.has_aruco = hasattr(cv2, 'aruco')
        if self.has_aruco:
            try:
                # Try modern OpenCV 4.7+ API first
                self.aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
                self.aruco_params = cv2.aruco.DetectorParameters()
                self.detector = cv2.aruco.ArucoDetector(self.aruco_dict, self.aruco_params)
            except Exception:
                try:
                    # Fallback to older cv2.aruco API
                    self.aruco_dict = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_50)
                    self.aruco_params = cv2.aruco.DetectorParameters_create()
                    self.detector = None
                except Exception:
                    self.has_aruco = False

    def detect_reference_scale(self, image_bgr: np.ndarray) -> Optional[float]:
        """
        Scans image for ArUco calibration marker.
        Returns pixels_per_cm scale if found, else None.
        """
        if not self.has_aruco or image_bgr is None:
            return None

        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        
        try:
            if hasattr(self, 'detector') and self.detector is not None:
                corners, ids, _ = self.detector.detectMarkers(gray)
            else:
                corners, ids, _ = cv2.aruco.detectMarkers(gray, self.aruco_dict, parameters=self.aruco_params)
                
            if ids is not None and len(corners) > 0:
                # Use first detected marker
                pts = corners[0][0] # 4 corner points
                # Calculate side lengths in pixels
                side1 = np.linalg.norm(pts[0] - pts[1])
                side2 = np.linalg.norm(pts[1] - pts[2])
                avg_pixel_length = (side1 + side2) / 2.0
                pixels_per_cm = avg_pixel_length / self.default_marker_length_cm
                return float(pixels_per_cm)
        except Exception:
            return None
            
        return None

    def estimate_size(self, bbox_xyxy: List_or_Tuple, image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Computes physical size in cm for bounding box [x1, y1, x2, y2].
        Returns exact dimensions if marker is detected, else clear academic status.
        """
        x1, y1, x2, y2 = bbox_xyxy
        box_w_px = max(1, x2 - x1)
        box_h_px = max(1, y2 - y1)
        
        pixels_per_cm = self.detect_reference_scale(image_bgr)
        
        if pixels_per_cm and pixels_per_cm > 0:
            width_cm = round(float(box_w_px / pixels_per_cm), 2)
            height_cm = round(float(box_h_px / pixels_per_cm), 2)
            return {
                "reference_detected": True,
                "width_cm": width_cm,
                "height_cm": height_cm,
                "pixels_per_cm": round(float(pixels_per_cm), 2),
                "text": f"{width_cm} × {height_cm} cm",
                "note": "Calibrated physical dimension measured via ArUco reference marker."
            }
        else:
            return {
                "reference_detected": False,
                "width_cm": None,
                "height_cm": None,
                "pixels_per_cm": None,
                "text": "Size estimation unavailable",
                "note": "No ArUco calibration marker detected in camera view. Real-world metric size estimation requires a physical reference marker."
            }

physical_size_estimator = PhysicalSizeEstimator()
