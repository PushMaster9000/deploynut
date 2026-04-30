"""
Recipe service for fetching and filtering recipes from MongoDB.
Handles recipe recommendations based on appliances and health constraints.
"""

from typing import List, Dict, Any, Optional
from app.database import get_db


class RecipeService:
    """Service to fetch and filter recipes based on user preferences."""
    
    @staticmethod
    def get_recipes_for_food(food_name: str) -> List[Dict[str, Any]]:
        """
        Get all recipes for a specific food.
        
        Args:
            food_name: Name of the food item
        
        Returns:
            List of recipes for the food
        """
        db = get_db()
        recipes = list(db["recipes"].find(
            {"food": food_name.lower()},
            {"_id": 0}
        ))
        return recipes
    
    @staticmethod
    def filter_recipes_by_appliances(
        recipes: List[Dict[str, Any]],
        available_appliances: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Filter recipes based on available kitchen appliances.
        Only returns recipes where ALL required appliances are available.
        
        Args:
            recipes: List of recipes to filter
            available_appliances: List of available appliances
        
        Returns:
            List of recipes that can be made with available appliances
        """
        if not available_appliances:
            # If no appliances specified, return all recipes
            return recipes
        
        available_set = set(app.lower() for app in available_appliances)
        filtered = []
        
        for recipe in recipes:
            required_appliances = set(app.lower() for app in recipe.get("appliances", []))
            # Check if all required appliances are available
            if required_appliances.issubset(available_set):
                filtered.append(recipe)
        
        return filtered
    
    @staticmethod
    def filter_recipes_by_health_tags(
        recipes: List[Dict[str, Any]],
        health_constraints: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Filter recipes based on health constraints.
        Only returns recipes that include the specified health tags.
        
        Args:
            recipes: List of recipes to filter
            health_constraints: List of health tags to match
        
        Returns:
            List of recipes matching health constraints
        """
        if not health_constraints:
            # If no constraints specified, return all recipes
            return recipes
        
        constraint_set = set(tag.lower() for tag in health_constraints)
        filtered = []
        
        for recipe in recipes:
            recipe_tags = set(tag.lower() for tag in recipe.get("health_tags", []))
            # Check if recipe has at least one matching health tag
            if constraint_set & recipe_tags:  # Intersection check
                filtered.append(recipe)
        
        return filtered
    
    @staticmethod
    def get_filtered_recipes(
        food_name: str,
        available_appliances: List[str] = None,
        health_constraints: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get filtered recipes for a food based on appliances and health constraints.
        Filters are optional - recipes will be returned even if no filters are provided.
        
        Args:
            food_name: Name of the food (required - always match by ingredient)
            available_appliances: List of available kitchen appliances (optional)
            health_constraints: List of health constraints/tags (optional)
        
        Returns:
            List of filtered recipes
        """
        db = get_db()
        
        # Build MongoDB query - always match by food first
        query = {"food": food_name.lower()}
        
        # Only add appliances filter if provided and non-empty
        if available_appliances:
            query["appliances"] = {"$in": [app.lower() for app in available_appliances]}
        
        # Only add health_tags filter if provided and non-empty
        if health_constraints:
            query["health_tags"] = {"$in": [tag.lower() for tag in health_constraints]}
        
        # Execute query with optional filters
        recipes = list(db["recipes"].find(query, {"_id": 0}))
        return recipes
    
    @staticmethod
    def get_all_recipes() -> List[Dict[str, Any]]:
        """
        Get all recipes from database.
        
        Returns:
            List of all recipes
        """
        db = get_db()
        recipes = list(db["recipes"].find({}, {"_id": 0}))
        return recipes
    
    @staticmethod
    def get_recipes_by_appliance(appliance: str) -> List[Dict[str, Any]]:
        """
        Get all recipes that can be made with a specific appliance.
        
        Args:
            appliance: Kitchen appliance name
        
        Returns:
            List of recipes requiring the appliance
        """
        db = get_db()
        recipes = list(db["recipes"].find(
            {"appliances": {"$in": [appliance.lower()]}},
            {"_id": 0}
        ))
        return recipes
    
    @staticmethod
    def get_recipes_by_health_tag(health_tag: str) -> List[Dict[str, Any]]:
        """
        Get all recipes marked with a specific health tag.
        
        Args:
            health_tag: Health tag to filter by
        
        Returns:
            List of recipes with the health tag
        """
        db = get_db()
        recipes = list(db["recipes"].find(
            {"health_tags": {"$in": [health_tag.lower()]}},
            {"_id": 0}
        ))
        return recipes
    
    @staticmethod
    def get_quick_recipes(food_name: str = None) -> List[Dict[str, Any]]:
        """
        Get quick and easy recipes (marked with 'quick' health tag).
        
        Args:
            food_name: Optional food name to filter by
        
        Returns:
            List of quick recipes
        """
        db = get_db()
        query = {"health_tags": {"$in": ["quick"]}}
        
        if food_name:
            query["food"] = food_name.lower()
        
        recipes = list(db["recipes"].find(query, {"_id": 0}))
        return recipes
