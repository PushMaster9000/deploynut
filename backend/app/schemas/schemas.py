"""
Pydantic schemas for request/response validation.
Defines all data models used in API endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class RecipeStep(BaseModel):
    """Individual step in a recipe"""
    step: str = Field(..., description="Description of recipe step")


class RecipeSchema(BaseModel):
    """Recipe response model"""
    food: str = Field(..., description="Food item the recipe is for")
    recipe_name: str = Field(..., description="Name of the recipe")
    appliances: List[str] = Field(default=[], description="Appliances required")
    health_tags: List[str] = Field(default=[], description="Health-related tags")
    steps: List[str] = Field(default=[], description="Recipe steps")
    
    class Config:
        json_schema_extra = {
            "example": {
                "food": "apple",
                "recipe_name": "Fresh Apple Salad",
                "appliances": ["knife", "cutting-board"],
                "health_tags": ["healthy", "low-calorie"],
                "steps": ["Dice apples", "Mix with greens", "Serve"]
            }
        }


class FoodCalorieSchema(BaseModel):
    """Food calorie information"""
    name: str = Field(..., description="Name of the food")
    type: str = Field(..., description="Type (fruit/vegetable)")
    calories_per_100g: float = Field(..., description="Calories per 100g")
    sugar_level: str = Field(..., description="Sugar level (low/medium/high)")
    health_tags: List[str] = Field(default=[], description="Health-related tags")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "apple",
                "type": "fruit",
                "calories_per_100g": 52,
                "sugar_level": "medium",
                "health_tags": ["high-fiber", "antioxidants"]
            }
        }


class PredictionRequestSchema(BaseModel):
    """Request model for prediction endpoint"""
    image_base64: Optional[str] = Field(
        None, 
        description="Base64 encoded image string (optional for testing)"
    )
    food_name: Optional[str] = Field(
        None,
        description="Optional food name for deterministic testing (skips ML prediction if provided)"
    )
    health_constraints: List[str] = Field(
        default=[],
        description="Health constraints e.g., ['low-sugar', 'diabetic-friendly']"
    )
    available_appliances: List[str] = Field(
        default=[],
        description="Available kitchen appliances e.g., ['blender', 'oven']"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "image_base64": None,
                "food_name": None,
                "health_constraints": ["low-sugar"],
                "available_appliances": ["blender", "knife"]
            }
        }


class PredictionResponseSchema(BaseModel):
    """Response model for prediction endpoint"""
    detected_food: str = Field(..., description="Detected food name")
    confidence: float = Field(..., description="Prediction confidence (0-1)")
    food_info: FoodCalorieSchema = Field(..., description="Food nutritional info")
    matching_recipes: List[RecipeSchema] = Field(
        default=[],
        description="Recipes matching appliances and health constraints"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "detected_food": "apple",
                "confidence": 0.95,
                "food_info": {
                    "name": "apple",
                    "type": "fruit",
                    "calories_per_100g": 52,
                    "sugar_level": "medium",
                    "health_tags": ["high-fiber"]
                },
                "matching_recipes": []
            }
        }


class HealthCheckSchema(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Status of the service")
    database: str = Field(..., description="Database connection status")
    version: str = Field(default="1.0.0", description="API version")
