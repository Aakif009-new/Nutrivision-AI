export interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface FoodScan {
  id: string;
  profile_id: string;
  image_url: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  created_at: string;
}

export interface ScanItem {
  id: string;
  scan_id: string;
  confidence_score: number;
  quantity_g: number;
  freshness_status: 'fresh' | 'moderate' | 'spoiled';
  estimated_shelf_life_days: number;
  bounding_box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
  created_at: string;
}

export interface DetectionItemResponse {
  label: string;
  confidence: number;
  quantity_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  freshness_status: 'fresh' | 'moderate' | 'spoiled';
  estimated_shelf_life_days: number;
  bounding_box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

export interface AnalyzeFoodResponse {
  image_url: string;
  detections: DetectionItemResponse[];
}

export interface UserGoal {
  id: string;
  profile_id: string;
  daily_calorie_target: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  set_date: string;
}
