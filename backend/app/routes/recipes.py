from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.ai_service import generate_recipes
from app.utils.jwt_utils import get_current_user
from app.database import get_db


router = APIRouter(prefix="/api/v1", tags=["Recipes"])

# ================= MODELS ================= #

class GenerateRecipesRequest(BaseModel):
    ingredients: List[str] = Field(..., description="List of selected ingredients")
    user_preferences: str = Field(default="", description="Chat input containing diet, health, or appliances")

class RecipeResponse(BaseModel):
    title: str
    ingredients: List[str]
    calories: int
    instructions: List[str]
    health_tags: List[str] = []

class GenerateRecipesResponse(BaseModel):
    recipes: List[RecipeResponse]

class SaveRecipeRequest(BaseModel):
    title: str
    ingredients: List[str]
    calories: int
    instructions: List[str]
    health_tags: List[str] = []

# ================= ROUTES ================= #

@router.post("/generate-recipes", response_model=GenerateRecipesResponse)
async def generate_recipes_endpoint(
    request: GenerateRecipesRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> GenerateRecipesResponse:
    try:
        if not request.ingredients or len(request.ingredients) == 0:
            raise HTTPException(status_code=400, detail="At least one ingredient is required")
        
        # 1. Generate the recipe via AI
        recipes_data = generate_recipes(
            ingredients=request.ingredients,
            user_preferences=request.user_preferences
        )
        
       # 2. AUTO-SAVE TO HISTORY (Safety Net)
        db = get_db()
        history_collection = db["scan_history"]
        
        for recipe in recipes_data:
            history_collection.insert_one({
                "user_email": current_user["email"],
                "action_type": "generated_recipe",
                "title": recipe["title"],
                "calories": recipe["calories"],
                "ingredients": recipe["ingredients"],
                "instructions": recipe["instructions"],
                "health_tags": recipe.get("health_tags", []), 
                "timestamp": datetime.now(timezone.utc)
            })
        
        # 3. Return to frontend
        return GenerateRecipesResponse(
            recipes=[
                RecipeResponse(
                    title=recipe["title"],
                    ingredients=recipe["ingredients"],
                    calories=recipe["calories"],
                    instructions=recipe["instructions"],
                    health_tags=recipe.get("health_tags", [])
                )
                for recipe in recipes_data
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recipes: {str(e)}")


@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_recipe(
    recipe: SaveRecipeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Save a generated recipe to the user's permanent cookbook"""
    db = get_db()
    saved_recipes_collection = db["saved_recipes"]
    
    # 1. NEW DUPLICATE CHECK: Does this user already have this recipe?
    existing_recipe = saved_recipes_collection.find_one({
        "user_email": current_user["email"],
        "title": recipe.title
    })
    
    if existing_recipe:
        raise HTTPException(status_code=400, detail="This recipe is already in your cookbook!")
    
    # 2. If it's new, proceed with saving
    recipe_doc = recipe.model_dump() if hasattr(recipe, "model_dump") else recipe.dict()
    recipe_doc["user_email"] = current_user["email"]
    recipe_doc["saved_at"] = datetime.now(timezone.utc)
    
    try:
        saved_recipes_collection.insert_one(recipe_doc)
        return {"message": "Recipe saved successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save recipe: {str(e)}")

@router.get("/saved")
async def get_saved_recipes(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Fetch all saved recipes for the logged-in user"""
    db = get_db()
    saved_recipes_collection = db["saved_recipes"]
    
    try:
        recipes = list(saved_recipes_collection.find(
            {"user_email": current_user["email"]}
        ).sort("saved_at", -1))
        
        for recipe in recipes:
            recipe["_id"] = str(recipe["_id"])
            
        return {"recipes": recipes}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch saved recipes: {str(e)}")

@router.delete("/delete/{title}", status_code=status.HTTP_200_OK)
async def delete_saved_recipe(
    title: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a specific saved recipe from the user's profile"""
    db = get_db()
    saved_recipes_collection = db["saved_recipes"]
    
    # Safely find and delete, verifying both title and user email
    try:
        result = saved_recipes_collection.find_one_and_delete(
            {"user_email": current_user["email"], "title": title}
        )
        if not result:
             raise HTTPException(status_code=404, detail="Recipe not found in your cookbook")
        return {"message": f"Successfully deleted '{title}' from your cookbook!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete recipe: {str(e)}")
    
# --- NEW: HISTORY ROUTE ---
@router.get("/history")
async def get_activity_history(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Fetch the user's scan and generation history"""
    db = get_db()
    history_collection = db["scan_history"]
    
    try:
        # Fetch history sorted by newest first
        history_items = list(history_collection.find(
            {"user_email": current_user["email"]}
        ).sort("timestamp", -1))
        
        for item in history_items:
            item["_id"] = str(item["_id"])
            
        return {"history": history_items}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")