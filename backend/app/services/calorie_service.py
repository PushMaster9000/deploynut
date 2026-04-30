"""
Calorie service for fetching food information from MongoDB.
Handles all food-related database queries.
"""

from typing import Optional, Dict, Any
from app.database import get_db
from pymongo import ASCENDING


class CalorieService:
    """Service to fetch and manage food calorie information."""
    
    @staticmethod
    def get_food_by_name(food_name: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve food information by name.
        
        Args:
            food_name: Name of the food item
        
        Returns:
            Dictionary with food info or None if not found
        """
        db = get_db()
        food = db["foods"].find_one({"name": food_name.lower()})
        
        if food:
            # Remove MongoDB's internal _id field for cleaner response
            food.pop("_id", None)
        
        return food
    
    @staticmethod
    def get_all_foods() -> list:
        """
        Retrieve all foods from database.
        
        Returns:
            List of all food documents
        """
        db = get_db()
        foods = list(db["foods"].find({}, {"_id": 0}))
        return foods
    
    @staticmethod
    def get_foods_by_type(food_type: str) -> list:
        """
        Retrieve foods filtered by type (fruit/vegetable).
        
        Args:
            food_type: Type of food ('fruit' or 'vegetable')
        
        Returns:
            List of foods matching the type
        """
        db = get_db()
        foods = list(db["foods"].find(
            {"type": food_type.lower()},
            {"_id": 0}
        ))
        return foods
    
    @staticmethod
    def get_foods_by_health_tags(health_tags: list) -> list:
        """
        Retrieve foods that match given health tags.
        
        Args:
            health_tags: List of health tags to filter by
        
        Returns:
            List of foods containing any of the specified tags
        """
        db = get_db()
        foods = list(db["foods"].find(
            {"health_tags": {"$in": health_tags}},
            {"_id": 0}
        ))
        return foods
    
    @staticmethod
    def get_low_calorie_foods(max_calories: float = 50) -> list:
        """
        Retrieve low-calorie foods.
        
        Args:
            max_calories: Maximum calories per 100g
        
        Returns:
            List of foods with calories <= max_calories
        """
        db = get_db()
        foods = list(db["foods"].find(
            {"calories_per_100g": {"$lte": max_calories}},
            {"_id": 0}
        ))
        return foods
    
    @staticmethod
    def get_low_sugar_foods() -> list:
        """
        Retrieve foods marked as low-sugar.
        
        Returns:
            List of low-sugar foods
        """
        db = get_db()
        foods = list(db["foods"].find(
            {"sugar_level": "low"},
            {"_id": 0}
        ))
        return foods
    
    @staticmethod
    def search_foods(query: str) -> list:
        """
        Search foods by name using partial matching.
        
        Args:
            query: Search query string
        
        Returns:
            List of matching foods
        """
        db = get_db()
        foods = list(db["foods"].find(
            {"name": {"$regex": query.lower(), "$options": "i"}},
            {"_id": 0}
        ))
        return foods
