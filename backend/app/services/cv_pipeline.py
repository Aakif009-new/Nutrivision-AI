import io
import logging
from typing import List, Dict, Any
from PIL import Image
import httpx

from app.core.config import settings
from app.core.constants import DEFAULT_FOOD_DATABASE, BASELINE_SHELF_LIFE
from app.services.model_runner import model_runner
from app.models.response_schemas import DetectionItemResponse, AnalyzeFoodResponse
from app.models.request_schemas import BoundingBox

logger = logging.getLogger(__name__)


async def fetch_usda_nutrients(food_name: str) -> Dict[str, float]:
    """
    Optional external lookup to USDA FoodData Central REST API.
    Falls back to internal default nutrient database.
    """
    clean_name = food_name.lower().strip()
    
    # Check default database first for speed
    for key, data in DEFAULT_FOOD_DATABASE.items():
        if key in clean_name:
            return data

    if settings.USDA_API_KEY and settings.USDA_API_KEY != "DEMO_KEY":
        try:
            url = f"https://api.nal.usda.gov/fdc/v1/foods/search?query={food_name}&pageSize=1&api_key={settings.USDA_API_KEY}"
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    foods = data.get("foods", [])
                    if foods:
                        nutrients = foods[0].get("foodNutrients", [])
                        cal = next((n["value"] for n in nutrients if "Energy" in n.get("nutrientName", "")), 150)
                        prot = next((n["value"] for n in nutrients if "Protein" in n.get("nutrientName", "")), 5.0)
                        carb = next((n["value"] for n in nutrients if "Carbohydrate" in n.get("nutrientName", "")), 20.0)
                        fat = next((n["value"] for n in nutrients if "Total lipid" in n.get("nutrientName", "")), 5.0)
                        return {"calories": cal, "protein": prot, "carbs": carb, "fat": fat}
        except Exception as e:
            logger.warning(f"USDA API lookup failed for {food_name}: {e}")

    # Generic food fallback defaults per 100g
    return {"calories": 150, "protein": 5.0, "carbs": 20.0, "fat": 4.0}


async def process_food_image(image_bytes: bytes, filename: str = "scan.jpg") -> AnalyzeFoodResponse:
    """
    Main Computer Vision Pipeline:
    1. Parse image buffer.
    2. Detect food objects with YOLOv8.
    3. Calculate bounding box area and estimate portion weight.
    4. Predict freshness classification (fresh | moderate | spoiled) & shelf life.
    5. Query nutrient breakdown.
    6. Aggregate response.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    width, height = image.size

    raw_detections = model_runner.detect_food_objects(image)
    detection_items: List[DetectionItemResponse] = []

    total_cal = 0.0
    total_prot = 0.0
    total_carb = 0.0
    total_fat = 0.0

    for det in raw_detections:
        label = det["label"]
        conf = det["confidence"]
        xmin = det["xmin"]
        ymin = det["ymin"]
        xmax = det["xmax"]
        ymax = det["ymax"]

        # Crop patch for freshness classifier
        crop_xmin = int(xmin * width)
        crop_ymin = int(ymin * height)
        crop_xmax = int(xmax * width)
        crop_ymax = int(ymax * height)
        
        cropped_img = image.crop((
            max(0, crop_xmin),
            max(0, crop_ymin),
            min(width, crop_xmax),
            min(height, crop_ymax)
        ))

        freshness_status, shelf_days, score = model_runner.predict_freshness(cropped_img, label)

        # Estimate portion weight from normalized bounding box area ratio
        box_area = (xmax - xmin) * (ymax - ymin)
        estimated_weight_g = max(30, round(box_area * 350))

        # Retrieve nutrient breakdown per 100g
        nutrients_100g = await fetch_usda_nutrients(label)
        scale_factor = estimated_weight_g / 100.0

        item_cal = round(nutrients_100g["calories"] * scale_factor, 1)
        item_prot = round(nutrients_100g["protein"] * scale_factor, 1)
        item_carb = round(nutrients_100g["carbs"] * scale_factor, 1)
        item_fat = round(nutrients_100g["fat"] * scale_factor, 1)

        total_cal += item_cal
        total_prot += item_prot
        total_carb += item_carb
        total_fat += item_fat

        detection_items.append(
            DetectionItemResponse(
                label=label.capitalize(),
                confidence=conf,
                quantity_g=estimated_weight_g,
                calories=item_cal,
                protein=item_prot,
                carbs=item_carb,
                fat=item_fat,
                freshness_status=freshness_status,
                estimated_shelf_life_days=shelf_days,
                bounding_box=BoundingBox(
                    xmin=xmin,
                    ymin=ymin,
                    xmax=xmax,
                    ymax=ymax
                )
            )
        )

    return AnalyzeFoodResponse(
        image_url=f"/uploads/{filename}",
        detections=detection_items,
        total_calories=round(total_cal, 1),
        total_protein=round(total_prot, 1),
        total_carbs=round(total_carb, 1),
        total_fat=round(total_fat, 1)
    )
