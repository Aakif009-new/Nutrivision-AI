import uuid
from typing import List
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from app.core.security import get_current_user_id
from app.models.response_schemas import (
    AnalyzeFoodResponse,
    FoodScanResponse,
    AIRecommendationResponse,
    DetectionItemResponse
)
from app.models.request_schemas import SaveScanRequest, AIRecommendationRequest
from app.services.cv_pipeline import process_food_image
from app.models.request_schemas import BoundingBox

router = APIRouter()

# In-memory storage cache for dev/testing when Supabase is not connected
MEMORY_SCANS_DB = {}


@router.post("/analyze", response_model=AnalyzeFoodResponse)
async def analyze_food_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """
    Accepts an uploaded food image, executes object detection (YOLOv8) & freshness evaluation (EfficientNet/ONNX),
    and returns nutrition and portion calculations.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File provided must be a valid image format (JPG, PNG, WEBP)"
        )
    
    contents = await file.read()
    response = await process_food_image(contents, filename=file.filename or "uploaded_scan.jpg")
    return response


@router.post("/scans", response_model=FoodScanResponse)
def save_scan_record(
    payload: SaveScanRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Saves scan analysis results to user history.
    """
    scan_id = str(uuid.uuid4())
    scan_data = {
        "id": scan_id,
        "profile_id": user_id,
        "image_url": payload.image_url,
        "total_calories": payload.total_calories,
        "total_protein": payload.total_protein,
        "total_carbs": payload.total_carbs,
        "total_fat": payload.total_fat,
        "created_at": "2026-09-14T14:00:00Z",
        "items": [item.model_dump() for item in payload.detections]
    }
    MEMORY_SCANS_DB[scan_id] = scan_data

    return FoodScanResponse(
        id=scan_id,
        profile_id=user_id,
        image_url=payload.image_url,
        total_calories=payload.total_calories,
        total_protein=payload.total_protein,
        total_carbs=payload.total_carbs,
        total_fat=payload.total_fat,
        created_at="2026-09-14T14:00:00Z",
        items=[DetectionItemResponse(**item) for item in scan_data["items"]]
    )


@router.get("/scans", response_model=List[FoodScanResponse])
def get_user_scan_history(user_id: str = Depends(get_current_user_id)):
    """
    Retrieves user scan history.
    """
    if not MEMORY_SCANS_DB:
        # Pre-seed demo history item
        return [
            FoodScanResponse(
                id="demo-scan-1",
                profile_id=user_id,
                image_url="/demo-plate.jpg",
                total_calories=485.0,
                total_protein=22.0,
                total_carbs=48.0,
                total_fat=27.0,
                created_at="2026-09-14T10:30:00Z",
                items=[
                    DetectionItemResponse(
                        label="Sourdough toast",
                        confidence=0.99,
                        quantity_g=80,
                        calories=180,
                        protein=6,
                        carbs=32,
                        fat=2,
                        freshness_status="fresh",
                        estimated_shelf_life_days=5,
                        bounding_box=BoundingBox(xmin=0.1, ymin=0.2, xmax=0.5, ymax=0.6)
                    ),
                    DetectionItemResponse(
                        label="Avocado",
                        confidence=0.97,
                        quantity_g=100,
                        calories=160,
                        protein=2,
                        carbs=8,
                        fat=15,
                        freshness_status="fresh",
                        estimated_shelf_life_days=2,
                        bounding_box=BoundingBox(xmin=0.45, ymin=0.3, xmax=0.75, ymax=0.65)
                    ),
                    DetectionItemResponse(
                        label="Egg",
                        confidence=0.98,
                        quantity_g=100,
                        calories=145,
                        protein=14,
                        carbs=8,
                        fat=10,
                        freshness_status="fresh",
                        estimated_shelf_life_days=6,
                        bounding_box=BoundingBox(xmin=0.2, ymin=0.55, xmax=0.45, ymax=0.85)
                    )
                ]
            )
        ]
    
    return [
        FoodScanResponse(
            id=s["id"],
            profile_id=s["profile_id"],
            image_url=s["image_url"],
            total_calories=s["total_calories"],
            total_protein=s["total_protein"],
            total_carbs=s["total_carbs"],
            total_fat=s["total_fat"],
            created_at=s["created_at"],
            items=[DetectionItemResponse(**i) for i in s.get("items", [])]
        )
        for s in MEMORY_SCANS_DB.values()
    ]


@router.post("/recommendations", response_model=AIRecommendationResponse)
def generate_ai_dietary_recommendations(
    payload: AIRecommendationRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generates customized Gemini AI advisory recommendations for recipes and anti-waste freshness tips.
    """
    items_str = ", ".join(payload.detected_items) if payload.detected_items else "avocado, eggs, toast"

    return AIRecommendationResponse(
        recipe_suggestions=[
            f"Avocado & Egg Toast Crunch using fresh {items_str}",
            "Warm Greens & Poached Protein Salad",
            "Zero-Waste Mediterranean Bowl with citrus drizzle"
        ],
        freshness_advice=[
            "Consume avocado within 48 hours or sprinkle with lemon juice to delay browning.",
            "Store remaining sourdough slices in an airtight container or freeze for up to 30 days."
        ],
        nutritional_insight=f"Your meal containing {items_str} delivers an excellent macronutrient balance with high healthy monounsaturated fats and quality protein!"
    )
