import cv2
import numpy as np
import base64
from typing import Dict, Any, Tuple, Optional, List

def encode_img_to_base64(img_bgr: np.ndarray, ext: str = ".jpg") -> str:
    """Helper to convert BGR OpenCV image into base64 data URL string."""
    if img_bgr is None:
        return ""
    success, buffer = cv2.imencode(ext, img_bgr)
    if not success:
        return ""
    b64_str = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"

class ImageProcessingPipeline:
    """
    Academic Pure OpenCV Image Processing Pipeline.
    Strictly executes classical deterministic algorithms (no deep learning).
    Captures all intermediate stages for faculty demonstration.
    """

    def __init__(self, target_size: Tuple[int, int] = (640, 640)):
        self.target_size = target_size

    def process(self, original_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Executes complete multi-stage OpenCV processing pipeline.
        Returns dictionary containing numerical analysis and base64 encoded intermediate visual stages.
        """
        if original_bgr is None:
            raise ValueError("Invalid input image passed to ImageProcessingPipeline.")

        h_orig, w_orig = original_bgr.shape[:2]
        
        # 1. Resize
        resized_bgr = cv2.resize(original_bgr, self.target_size, interpolation=cv2.INTER_AREA)
        
        # 2. Noise Reduction: Gaussian Blur & Median Filter
        gaussian_blur = cv2.GaussianBlur(resized_bgr, (5, 5), sigmaX=1.2)
        median_blur = cv2.medianBlur(gaussian_blur, 5)
        
        # 3. Color Space Conversions: Grayscale, HSV, LAB
        gray = cv2.cvtColor(median_blur, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(median_blur, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(median_blur, cv2.COLOR_BGR2LAB)
        
        # 4. Contrast Enhancement: CLAHE (Contrast Limited Adaptive Histogram Equalization) on L-channel
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        lab_planes = list(cv2.split(lab))
        lab_planes[0] = clahe.apply(lab_planes[0])
        enhanced_lab = cv2.merge(lab_planes)
        enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
        
        # 5. Thresholding: Adaptive Otsu Binarization (handles light & dark backgrounds)
        border_pixels = np.concatenate([gray[0, :], gray[-1, :], gray[:, 0], gray[:, -1]])
        if np.median(border_pixels) > 128:
            _, otsu_thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        else:
            _, otsu_thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # 6. Morphological Operations: Opening (remove noise) followed by Closing (fill holes)
        morph_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        opened = cv2.morphologyEx(otsu_thresh, cv2.MORPH_OPEN, morph_kernel, iterations=1)
        closed_mask = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, morph_kernel, iterations=2)
        
        # 7. Edge Detection: Canny
        canny_edges = cv2.Canny(gray, threshold1=50, threshold2=150)
        
        # 8. Contour Detection & Shape Analysis
        contours, hierarchy = cv2.findContours(closed_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contour_overlay = resized_bgr.copy()
        
        valid_contours = []
        contour_stats = []
        for i, c in enumerate(contours):
            area = cv2.contourArea(c)
            # Filter out tiny noise contours (< 1% total image area)
            if area > (self.target_size[0] * self.target_size[1] * 0.01):
                valid_contours.append(c)
                perimeter = cv2.arcLength(c, True)
                circularity = (4 * np.pi * area) / (perimeter ** 2) if perimeter > 0 else 0
                x, y, w, h = cv2.boundingRect(c)
                aspect_ratio = float(w) / h if h > 0 else 0
                
                contour_stats.append({
                    "id": i + 1,
                    "area_pixels": float(area),
                    "perimeter_pixels": round(float(perimeter), 2),
                    "circularity": round(float(circularity), 3),
                    "aspect_ratio": round(float(aspect_ratio), 3),
                    "bounding_box": [x, y, w, h]
                })
                
                # Draw contour on overlay
                cv2.drawContours(contour_overlay, [c], -1, (0, 255, 0), 2)
                cv2.rectangle(contour_overlay, (x, y), (x + w, y + h), (255, 0, 0), 2)
                cv2.putText(contour_overlay, f"#{i+1}", (x, max(20, y - 5)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        # 9. Segmented Foreground Extraction
        segmented_foreground = cv2.bitwise_and(resized_bgr, resized_bgr, mask=closed_mask)
        
        # Generate base64 visual steps for faculty demonstration
        visual_steps = {
            "step_1_original": encode_img_to_base64(original_bgr),
            "step_2_resized": encode_img_to_base64(resized_bgr),
            "step_3_denoised_gaussian": encode_img_to_base64(gaussian_blur),
            "step_4_denoised_median": encode_img_to_base64(median_blur),
            "step_5_hsv_colorspace": encode_img_to_base64(hsv),
            "step_6_clahe_contrast": encode_img_to_base64(enhanced_bgr),
            "step_7_otsu_threshold": encode_img_to_base64(otsu_thresh),
            "step_8_morphology_clean": encode_img_to_base64(closed_mask),
            "step_9_canny_edges": encode_img_to_base64(canny_edges),
            "step_10_contours": encode_img_to_base64(contour_overlay),
            "step_11_segmented_foreground": encode_img_to_base64(segmented_foreground)
        }

        return {
            "dimensions": {
                "original_width": w_orig,
                "original_height": h_orig,
                "processed_width": self.target_size[0],
                "processed_height": self.target_size[1]
            },
            "techniques_applied": [
                "Bilinear Resizing",
                "Gaussian Denoising (sigma=1.2)",
                "Median Filtering (k=5)",
                "RGB to HSV Color Space Transformation",
                "RGB to LAB Color Space Transformation",
                "CLAHE (Contrast Limited Adaptive Histogram Equalization)",
                "Otsu Automated Global Binarization",
                "Morphological Opening & Closing Filtering",
                "Canny Edge Detection (50/150 threshold)",
                "Topological Contour Extraction & Shape Metrics",
                "Binary Masked Foreground Segmentation"
            ],
            "contour_analysis": contour_stats,
            "visual_steps": visual_steps,
            "processed_bgr": resized_bgr,
            "foreground_mask": closed_mask
        }

# Global singleton
image_processing_pipeline = ImageProcessingPipeline()
