from typing import List, Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    xmin: float
    ymin: float
    xmax: float
    ymax: float


class DetectionItemInput(BaseModel):
    label: str
    confidence: float
    quantity_g: float
    calories: float
    protein: float
    carbs: float
    fat: float
    freshness_status: str
    estimated_shelf_life_days: int
    bounding_box: BoundingBox


class SaveScanRequest(BaseModel):
    image_url: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    detections: List[DetectionItemInput] = []


class UserGoalUpdateRequest(BaseModel):
    daily_calorie_target: int = 2000
    target_protein_g: int = 150
    target_carbs_g: int = 250
    target_fat_g: int = 70


class AIRecommendationRequest(BaseModel):
    detected_items: List[str]
    freshness_statuses: List[str]
    user_goal_summary: Optional[str] = None
