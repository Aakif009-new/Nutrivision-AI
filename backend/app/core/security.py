from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

security_scheme = HTTPBearer(auto_error=False)


def get_current_user_id(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> str:
    """
    Extracts and validates Supabase JWT token from HTTP Authorization header.
    Returns user ID or a fallback demo user ID for testing.
    """
    if not credentials:
        # Development fallback ID if no token provided
        return "demo-user-12345"

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False}
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token: missing subject payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        # Fallback to token payload or demo in dev mode
        if settings.ENVIRONMENT == "development":
            return "demo-user-12345"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
