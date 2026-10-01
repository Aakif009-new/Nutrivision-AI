from fastapi import APIRouter
from app.api.v1 import food_analysis, auth, reports

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Profile"])
api_router.include_router(food_analysis.router, prefix="", tags=["Food Vision & Nutrition Analysis"])
api_router.include_router(food_analysis.router, prefix="/food", tags=["Food Vision & Nutrition Analysis"])
api_router.include_router(reports.router, prefix="/reports", tags=["PDF Reports"])
