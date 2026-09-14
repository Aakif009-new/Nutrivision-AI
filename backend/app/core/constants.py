# NutriVision AI System Constants

# Supported food detection classes & baseline nutritional info per 100 grams
DEFAULT_FOOD_DATABASE = {
    "apple": {"calories": 52, "protein": 0.3, "carbs": 13.8, "fat": 0.2, "avg_density_g_cm3": 0.8},
    "banana": {"calories": 89, "protein": 1.1, "carbs": 22.8, "fat": 0.3, "avg_density_g_cm3": 0.9},
    "orange": {"calories": 47, "protein": 0.9, "carbs": 11.8, "fat": 0.1, "avg_density_g_cm3": 0.85},
    "bread": {"calories": 265, "protein": 9.0, "carbs": 49.0, "fat": 3.2, "avg_density_g_cm3": 0.4},
    "egg": {"calories": 145, "protein": 12.5, "carbs": 0.8, "fat": 9.5, "avg_density_g_cm3": 1.0},
    "avocado": {"calories": 160, "protein": 2.0, "carbs": 8.5, "fat": 14.7, "avg_density_g_cm3": 0.95},
    "chicken": {"calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6, "avg_density_g_cm3": 1.05},
    "rice": {"calories": 130, "protein": 2.7, "carbs": 28.0, "fat": 0.3, "avg_density_g_cm3": 0.8},
    "salad": {"calories": 33, "protein": 1.5, "carbs": 6.0, "fat": 0.4, "avg_density_g_cm3": 0.3},
    "tomato": {"calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2, "avg_density_g_cm3": 0.95},
}

# Freshness classification thresholds
FRESHNESS_STATUS = {
    "FRESH": "fresh",
    "MODERATE": "moderate",
    "SPOILED": "spoiled",
}

# Estimated baseline shelf lives (in days) per category
BASELINE_SHELF_LIFE = {
    "apple": 14,
    "banana": 5,
    "orange": 10,
    "bread": 7,
    "egg": 21,
    "avocado": 4,
    "chicken": 2,
    "rice": 3,
    "salad": 3,
    "tomato": 7,
}
