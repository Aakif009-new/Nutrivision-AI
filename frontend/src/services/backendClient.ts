const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

export interface AnalysisResponse {
  status: string;
  scan_id?: string;
  image_info: {
    original_width: number;
    original_height: number;
    processed_width: number;
    processed_height: number;
  };
  processing: {
    techniques_applied: string[];
    contour_stats: Array<{
      id: number;
      area_pixels: number;
      perimeter_pixels: number;
      circularity: number;
      aspect_ratio: number;
      bounding_box: number[];
    }>;
  };
  visual_steps: {
    step_1_original?: string;
    step_2_resized?: string;
    step_3_denoised_gaussian?: string;
    step_4_denoised_median?: string;
    step_5_hsv_colorspace?: string;
    step_6_clahe_contrast?: string;
    step_7_otsu_threshold?: string;
    step_8_morphology_clean?: string;
    step_9_canny_edges?: string;
    step_10_contours?: string;
    step_11_segmented_foreground?: string;
  };
  cv_analysis_overlay?: string;
  detections: Array<{
    id: number;
    food: string;
    is_supported: boolean;
    confidence: number;
    bbox: number[];
    reason?: string;
    freshness?: string;
    freshness_confidence?: number;
    freshness_probabilities?: Record<string, number>;
    spoilage?: {
      spoiled_area_percentage: number;
      status: string;
      overlay_base64?: string;
    };
    size?: {
      reference_detected: boolean;
      width_cm: number;
      height_cm: number;
      text: string;
      note?: string;
    };
    weight?: {
      estimated_weight_grams: number;
      unit: string;
    };
    nutrition?: {
      food: string;
      category: string;
      serving_weight_g: number;
      calories: number;
      protein_g: number;
      carbohydrates_g: number;
      fat_g: number;
      fiber_g: number;
      vitamin_c_mg: number;
      potassium_mg: number;
      glycemic_index: string;
    };
    shelf_life?: {
      estimated_remaining_days: string;
      days_numerical: number;
      condition: string;
      storage_tip: string;
    };
  }>;
  overall_summary: {
    total_objects_detected: number;
    supported_foods_count: number;
    undefined_objects_count: number;
    total_calories_kcal: number;
    overall_health_score: number;
    primary_food: string;
  };
  warnings: string[];
}

export async function analyzeFoodImage(imageFile: File): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const res = await fetch(`${BACKEND_API_URL}/api/v1/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errorData.detail || 'Failed to analyze food image');
  }

  return res.json();
}

export async function analyzeWebcamFrame(base64Image: string): Promise<AnalysisResponse> {
  const res = await fetch(`${BACKEND_API_URL}/api/v1/analyze/frame`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_base64: base64Image,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Frame analysis failed' }));
    throw new Error(errorData.detail || 'Failed to analyze webcam frame');
  }

  return res.json();
}

export async function fetchScanHistory(): Promise<any[]> {
  const res = await fetch(`${BACKEND_API_URL}/api/v1/analyze/history`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.history || [];
}
