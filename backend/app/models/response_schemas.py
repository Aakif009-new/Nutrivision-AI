from typing import List, Optional
from pydantic import BaseModel
from app.models.request_schemas import BoundingBox


class DetectionItemResponse(BaseModel):
    label: str
    confidence: float
    quantity_g: float
    calories: float
    protein: float
    carbs: float
    fat: float
    freshness_status: str  # 'fresh' | 'moderate' | 'spoiled'
    estimated_shelf_life_days: int
    bounding_box: BoundingBox


class AnalyzeFoodResponse(BaseModel):
    image_url: str
    detections: List[DetectionItemResponse]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float


class FoodScanResponse(BaseModel):
    id: str
    profile_id: str
    image_url: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    created_at: str
    items: Optional[List[DetectionItemResponse]] = []


class UserProfileResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: str
    updated_at: str


class HealthCheckResponse(BaseModel):
    status: str
    version: str
    environment: str
    models_loaded: bool


class AIRecommendationResponse(BaseModel):
    recipe_suggestions: List[str]
    freshness_advice: List[str]
    nutritional_insight: str
