import os
from typing import Dict, Any, Optional

# Verified USDA FoodData Central nutritional values per 100g serving
VERIFIED_NUTRITION_DATABASE = {
    "apple": {
        "food": "Apple",
        "category": "Fruit",
        "serving_size_g": 100,
        "calories": 52,
        "protein_g": 0.3,
        "carbohydrates_g": 13.8,
        "fat_g": 0.2,
        "fiber_g": 2.4,
        "sugar_g": 10.4,
        "vitamin_c_mg": 4.6,
        "potassium_mg": 107,
        "glycemic_index": "Low (36)"
    },
    "banana": {
        "food": "Banana",
        "category": "Fruit",
        "serving_size_g": 100,
        "calories": 89,
        "protein_g": 1.1,
        "carbohydrates_g": 22.8,
        "fat_g": 0.3,
        "fiber_g": 2.6,
        "sugar_g": 12.2,
        "vitamin_c_mg": 8.7,
        "potassium_mg": 358,
        "glycemic_index": "Medium (51)"
    },
    "orange": {
        "food": "Orange",
        "category": "Fruit",
        "serving_size_g": 100,
        "calories": 47,
        "protein_g": 0.9,
        "carbohydrates_g": 11.8,
        "fat_g": 0.1,
        "fiber_g": 2.4,
        "sugar_g": 9.4,
        "vitamin_c_mg": 53.2,
        "potassium_mg": 181,
        "glycemic_index": "Low (43)"
    },
    "strawberry": {
        "food": "Strawberry",
        "category": "Fruit",
        "serving_size_g": 100,
        "calories": 32,
        "protein_g": 0.7,
        "carbohydrates_g": 7.7,
        "fat_g": 0.3,
        "fiber_g": 2.0,
        "sugar_g": 4.9,
        "vitamin_c_mg": 58.8,
        "potassium_mg": 153,
        "glycemic_index": "Low (41)"
    },
    "bitter_gourd": {
        "food": "Bitter Gourd",
        "category": "Vegetable",
        "serving_size_g": 100,
        "calories": 17,
        "protein_g": 1.0,
        "carbohydrates_g": 3.7,
        "fat_g": 0.2,
        "fiber_g": 2.8,
        "sugar_g": 0.6,
        "vitamin_c_mg": 84.0,
        "potassium_mg": 296,
        "glycemic_index": "Very Low (15)"
    },
    "capsicum": {
        "food": "Capsicum (Bell Pepper)",
        "category": "Vegetable",
        "serving_size_g": 100,
        "calories": 20,
        "protein_g": 0.9,
        "carbohydrates_g": 4.6,
        "fat_g": 0.2,
        "fiber_g": 1.7,
        "sugar_g": 2.4,
        "vitamin_c_mg": 80.4,
        "potassium_mg": 175,
        "glycemic_index": "Very Low (15)"
    },
    "cucumber": {
        "food": "Cucumber",
        "category": "Vegetable",
        "serving_size_g": 100,
        "calories": 15,
        "protein_g": 0.7,
        "carbohydrates_g": 3.6,
        "fat_g": 0.1,
        "fiber_g": 0.5,
        "sugar_g": 1.7,
        "vitamin_c_mg": 2.8,
        "potassium_mg": 147,
        "glycemic_index": "Very Low (15)"
    },
    "okra": {
        "food": "Okra (Lady Finger)",
        "category": "Vegetable",
        "serving_size_g": 100,
        "calories": 33,
        "protein_g": 1.9,
        "carbohydrates_g": 7.5,
        "fat_g": 0.2,
        "fiber_g": 3.2,
        "sugar_g": 1.5,
        "vitamin_c_mg": 23.0,
        "potassium_mg": 299,
        "glycemic_index": "Very Low (20)"
    },
    "potato": {
        "food": "Potato",
        "category": "Vegetable",
        "serving_size_g": 100,
        "calories": 77,
        "protein_g": 2.0,
        "carbohydrates_g": 17.5,
        "fat_g": 0.1,
        "fiber_g": 2.2,
        "sugar_g": 0.8,
        "vitamin_c_mg": 19.7,
        "potassium_mg": 421,
        "glycemic_index": "High (78)"
    },
    "tomato": {
        "food": "Tomato",
        "category": "Fruit/Vegetable",
        "serving_size_g": 100,
        "calories": 18,
        "protein_g": 0.9,
        "carbohydrates_g": 3.9,
        "fat_g": 0.2,
        "fiber_g": 1.2,
        "sugar_g": 2.6,
        "vitamin_c_mg": 13.7,
        "potassium_mg": 237,
        "glycemic_index": "Low (30)"
    }
}

class NutritionService:
    """
    Academic Nutrition Information Lookup.
    Separates factual nutritional lookup from neural-network predictions.
    Scales nutrition according to estimated physical weight in grams.
    """

    def get_nutrition(self, food_name: str, weight_grams: float = 100.0) -> Dict[str, Any]:
        clean_key = food_name.lower().strip().replace(" ", "_")
        
        # Match against database keys
        matched_key = None
        for key in VERIFIED_NUTRITION_DATABASE.keys():
            if key in clean_key or clean_key in key:
                matched_key = key
                break
                
        if not matched_key:
            return {
                "food": food_name,
                "status": "Nutrition record not found in database",
                "serving_size_g": weight_grams,
                "calories": 0,
                "protein_g": 0,
                "carbohydrates_g": 0,
                "fat_g": 0,
                "fiber_g": 0
            }

        base = VERIFIED_NUTRITION_DATABASE[matched_key]
        ratio = float(weight_grams) / 100.0

        return {
            "food": base["food"],
            "category": base["category"],
            "serving_weight_g": round(float(weight_grams), 1),
            "calories": round(base["calories"] * ratio, 1),
            "protein_g": round(base["protein_g"] * ratio, 2),
            "carbohydrates_g": round(base["carbohydrates_g"] * ratio, 2),
            "fat_g": round(base["fat_g"] * ratio, 2),
            "fiber_g": round(base["fiber_g"] * ratio, 2),
            "sugar_g": round(base["sugar_g"] * ratio, 2),
            "vitamin_c_mg": round(base["vitamin_c_mg"] * ratio, 2),
            "potassium_mg": round(base["potassium_mg"] * ratio, 1),
            "glycemic_index": base["glycemic_index"],
            "per_100g_reference": base
        }

nutrition_service = NutritionService()
