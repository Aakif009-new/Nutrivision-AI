import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "NutriVision AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    
    # CORS Origins (includes Vercel deployed frontend & local dev)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://nutrivision-ai.vercel.app",
        "*"
    ]

    # JWT Authentication (Supabase JWT Secret)
    JWT_SECRET: str = "default-development-jwt-secret-change-in-prod"
    JWT_ALGORITHM: str = "HS256"

    # Supabase Integration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_STORAGE_BUCKET: str = "food-scan-images"

    # External APIs
    USDA_API_KEY: Optional[str] = "DEMO_KEY"
    GEMINI_API_KEY: Optional[str] = None

    # Model file paths
    YOLO_MODEL_PATH: str = os.path.join("ml", "models", "yolov8_food.pt")
    FRESHNESS_MODEL_PATH: str = os.path.join("ml", "models", "freshness_cnn.onnx")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
