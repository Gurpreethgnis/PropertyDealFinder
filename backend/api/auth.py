"""
Authentication API endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from auth import authenticate_user, create_access_token, get_current_approved_user, User, Token
import datetime

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/login", response_model=Token)
async def login(user: User):
    """Authenticate user and return JWT token."""
    authenticated_user = authenticate_user(user.email, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = datetime.timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": authenticated_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_current_user_info(current_user = Depends(get_current_approved_user)):
    """Get current user information."""
    return {
        "email": current_user.email,
        "is_active": current_user.is_active,
        "is_approved": current_user.is_approved
    }
