"""
Authentication API routes.
Provides signup, login, token refresh, and profile management endpoints.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.schemas.auth_schemas import UserCreate, UserLogin, Token, TokenRefresh, UserDB, VerifyEmailRequest
from app.services.auth_service import AuthService
from app.utils.jwt_utils import create_access_token, create_refresh_token, verify_token, get_current_user
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# ==========================================
# REQUEST MODELS FOR PROFILE UPDATES
# ==========================================
class UpdateProfileRequest(BaseModel):
    name: str
    bio: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class RecipeSaveRequest(BaseModel):
    id: Optional[int] = None
    name: str
    time: str
    calories: str
    health_tags: List[str]
    image: str
    ingredients: List[str]
    instructions: List[str]
# ==========================================
# CORE AUTH ROUTES
# ==========================================
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    try:
        # Now user_data.name physically exists!
        user = AuthService.create_user(
            username=user_data.name, 
            email=user_data.email,
            password=user_data.password
        )
        
        return {"message": "Verification code sent to email", "email": user_data.email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )
    
    
@router.post("/verify", response_model=Token)
async def verify_email(verify_data: VerifyEmailRequest) -> Token:
    user = AuthService.verify_user_email(verify_data.email, verify_data.code)
    
    token_data = {
        "sub": user["email"],
        "username": user["username"],
        "role": user["role"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=1800,
        user=UserDB(**user)
    )

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin) -> Token:
    user = AuthService.authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
    
    token_data = {
        "sub": user["email"],
        "username": user["username"],
        "role": user["role"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=1800,
        user=UserDB(**user)
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(request: TokenRefresh) -> Token:
    try:
        payload = verify_token(request.refresh_token, token_type="refresh")
        email = payload.get("sub")
        user = AuthService.get_user_by_email(email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        token_data = {
            "sub": user["email"],
            "username": user["username"],
            "role": user["role"]
        }
        
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)
        
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=30 * 60,
            user=UserDB(**user)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.get("/me", response_model=UserDB)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    return UserDB(**current_user)


# ==========================================
# PROFILE & SECURITY ROUTES
# ==========================================

@router.put("/update-profile")
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    success = AuthService.update_user_profile(
        email=current_user["email"], 
        name=request.name, 
        bio=request.bio
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    return {"message": "Profile updated successfully"}

@router.put("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    success = AuthService.update_password(
        email=current_user["email"],
        old_password=request.old_password,
        new_password=request.new_password
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update password")
    return {"message": "Password updated successfully"}

@router.delete("/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    success = AuthService.delete_account(email=current_user["email"])
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete account")
    return {"message": "Account deleted successfully"}
# ==========================================
# SAVED RECIPES ROUTES
# ==========================================
@router.post("/toggle-save")
async def toggle_recipe(recipe: RecipeSaveRequest, current_user: dict = Depends(get_current_user)):
    """Receives the full recipe object from React and saves it to MongoDB"""
    # Pass the recipe dict to the service
    result = AuthService.toggle_save_recipe(current_user["email"], recipe.model_dump())
    return result

@router.get("/saved-recipe-ids")
async def get_saved_titles(current_user: dict = Depends(get_current_user)):
    """Fetches the list of saved recipe TITLES from MongoDB"""
    titles = AuthService.get_saved_recipe_titles(current_user["email"])
    return titles