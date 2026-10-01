from typing import Dict, Any

# Documented shelf-life guidelines under room temperature (20°C) vs refrigeration (4°C)
SHELF_LIFE_RULES = {
    "apple": {"fresh_days_pantry": 7, "fresh_days_fridge": 28, "storage_tip": "Keep away from bananas to prevent fast ripening."},
    "banana": {"fresh_days_pantry": 5, "fresh_days_fridge": 9, "storage_tip": "Wrap stems in cling film to prolong freshness."},
    "orange": {"fresh_days_pantry": 10, "fresh_days_fridge": 21, "storage_tip": "Store in a breathable mesh bag in the crisper drawer."},
    "strawberry": {"fresh_days_pantry": 2, "fresh_days_fridge": 7, "storage_tip": "Do not wash until immediately before eating."},
    "bitter_gourd": {"fresh_days_pantry": 3, "fresh_days_fridge": 6, "storage_tip": "Wrap in paper towel and place inside a vegetable container."},
    "capsicum": {"fresh_days_pantry": 4, "fresh_days_fridge": 12, "storage_tip": "Keep dry; moisture accelerates mold formation."},
    "cucumber": {"fresh_days_pantry": 4, "fresh_days_fridge": 9, "storage_tip": "Store in the warmer front section of the refrigerator."},
    "okra": {"fresh_days_pantry": 2, "fresh_days_fridge": 4, "storage_tip": "Store completely dry in a paper bag."},
    "potato": {"fresh_days_pantry": 21, "fresh_days_fridge": 30, "storage_tip": "Store in a cool, dark, well-ventilated dry place (avoid direct sunlight)."},
    "tomato": {"fresh_days_pantry": 5, "fresh_days_fridge": 10, "storage_tip": "Store stem-side down at room temperature for optimal flavor retention."}
}

class ShelfLifeEstimator:
    """
    Academic Shelf-Life Estimation Module.
    Combines identified food type, CNN freshness classification, and OpenCV spoilage percentage.
    """

    def estimate_shelf_life(
        self,
        food_name: str,
        freshness: str,
        spoiled_percentage: float = 0.0
    ) -> Dict[str, Any]:
        clean_key = food_name.lower().strip().replace(" ", "_")
        
        matched_key = None
        for key in SHELF_LIFE_RULES.keys():
            if key in clean_key or clean_key in key:
                matched_key = key
                break

        if not matched_key:
            return {
                "estimated_remaining_days": "1 - 3 days",
                "condition": freshness,
                "storage_tip": "Store in refrigerator and consume promptly."
            }

        rule = SHELF_LIFE_RULES[matched_key]
        fresh_days = rule["fresh_days_fridge"]

        if freshness == "Spoiled" or spoiled_percentage > 25.0:
            remaining_days = 0
            condition_desc = "Expired / Spoiled — Not recommended for consumption"
        elif freshness == "Semi-Fresh" or (5.0 <= spoiled_percentage <= 25.0):
            remaining_days = max(1, int(fresh_days * 0.35))
            condition_desc = f"Consume within {remaining_days} days (Refrigerated)"
        else:
            remaining_days = fresh_days
            condition_desc = f"~{remaining_days} days (Refrigerated) | ~{rule['fresh_days_pantry']} days (Room Temp)"

        return {
            "estimated_remaining_days": f"{remaining_days} days" if remaining_days > 0 else "0 days (Spoiled)",
            "days_numerical": remaining_days,
            "condition": condition_desc,
            "pantry_days": rule["fresh_days_pantry"],
            "fridge_days": rule["fresh_days_fridge"],
            "storage_tip": rule["storage_tip"]
        }

shelf_life_estimator = ShelfLifeEstimator()
