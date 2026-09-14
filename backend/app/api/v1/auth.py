from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user_id
from app.models.response_schemas import UserProfileResponse
from app.models.request_schemas import UserGoalUpdateRequest

router = APIRouter()


@router.get("/me", response_model=UserProfileResponse)
def get_current_profile(user_id: str = Depends(get_current_user_id)):
    """
    Returns authenticated profile information.
    """
    return UserProfileResponse(
        id=user_id,
        username="NutriUser",
        email="user@nutrivision.ai",
        created_at="2026-01-01T00:00:00Z",
        updated_at="2026-09-14T00:00:00Z"
    )


@router.put("/goals")
def update_user_goals(payload: UserGoalUpdateRequest, user_id: str = Depends(get_current_user_id)):
    """
    Updates user daily calorie and macronutrient targets.
    """
    return {
        "status": "success",
        "user_id": user_id,
        "goals": payload.model_dump()
    }
