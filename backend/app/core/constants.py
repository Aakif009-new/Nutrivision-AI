# NutriVision AI System Constants

# Supported food detection classes & baseline nutritional info per 100 grams
DEFAULT_FOOD_DATABASE = {
    "apple": {"calories": 52, "protein": 0.3, "carbs": 13.8, "fat": 0.2, "avg_density_g_cm3": 0.8},
    "banana": {"calories": 89, "protein": 1.1, "carbs": 22.8, "fat": 0.3, "avg_density_g_cm3": 0.9},
    "orange": {"calories": 47, "protein": 0.9, "carbs": 11.8, "fat": 0.1, "avg_density_g_cm3": 0.85},
    "strawberry": {"calories": 32, "protein": 0.7, "carbs": 7.7, "fat": 0.3, "avg_density_g_cm3": 0.75},
    "bitter_gourd": {"calories": 17, "protein": 1.0, "carbs": 3.7, "fat": 0.2, "avg_density_g_cm3": 0.7},
    "capsicum": {"calories": 31, "protein": 1.0, "carbs": 6.0, "fat": 0.3, "avg_density_g_cm3": 0.65},
    "cucumber": {"calories": 15, "protein": 0.7, "carbs": 3.6, "fat": 0.1, "avg_density_g_cm3": 0.96},
    "okra": {"calories": 33, "protein": 1.9, "carbs": 7.5, "fat": 0.2, "avg_density_g_cm3": 0.6},
    "potato": {"calories": 77, "protein": 2.0, "carbs": 17.5, "fat": 0.1, "avg_density_g_cm3": 1.05},
    "tomato": {"calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2, "avg_density_g_cm3": 0.95},
    "bread": {"calories": 265, "protein": 9.0, "carbs": 49.0, "fat": 3.2, "avg_density_g_cm3": 0.4},
    "egg": {"calories": 145, "protein": 12.5, "carbs": 0.8, "fat": 9.5, "avg_density_g_cm3": 1.0},
    "avocado": {"calories": 160, "protein": 2.0, "carbs": 8.5, "fat": 14.7, "avg_density_g_cm3": 0.95},
    "chicken": {"calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6, "avg_density_g_cm3": 1.05},
    "rice": {"calories": 130, "protein": 2.7, "carbs": 28.0, "fat": 0.3, "avg_density_g_cm3": 0.8},
    "salad": {"calories": 33, "protein": 1.5, "carbs": 6.0, "fat": 0.4, "avg_density_g_cm3": 0.3},
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
    "strawberry": 4,
    "bitter_gourd": 6,
    "capsicum": 8,
    "cucumber": 7,
    "okra": 5,
    "potato": 28,
    "tomato": 7,
    "bread": 7,
    "egg": 21,
    "avocado": 4,
    "chicken": 2,
    "rice": 3,
    "salad": 3,
}
