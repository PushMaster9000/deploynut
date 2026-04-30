"""
Data loading script for populating MongoDB with sample foods and recipes.
Run this script ONCE to initialize the database with sample data.
This is safe to run multiple times - it only inserts data if collections are empty.

Usage:
    python load_data.py

Requirements:
    - MongoDB running and accessible via MONGO_URI from .env or environment variables
    - .env file configured with MONGO_URI and MONGO_DB_NAME (see .env.example)
"""

import sys
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from app.config import MONGODB_CONFIG
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError


def load_sample_data():
    """Load sample fruits, vegetables, and recipes into MongoDB."""
    
    # Connection details from config (loaded from environment variables)
    mongo_uri = MONGODB_CONFIG["uri"]
    db_name = MONGODB_CONFIG["database_name"]
    
    print(f"Connecting to MongoDB database: {db_name}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        db = client[db_name]
        print(f"✓ Connected to database: {db_name}")
        
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        print("Make sure MongoDB is running and .env is properly configured. You can:")
        print("  1. Start MongoDB service (Windows): net start MongoDB")
        print("  2. Or start mongod.exe manually")
        print("  3. Check your .env file has MONGO_URI set correctly")
        print("  4. See .env.example for configuration template")
        return False
    
    # Sample foods data
    foods_data = [
        {
            "name": "apple",
            "type": "fruit",
            "calories_per_100g": 52,
            "sugar_level": "medium",
            "health_tags": ["high-fiber", "antioxidants", "low-calorie"]
        },
        {
            "name": "banana",
            "type": "fruit",
            "calories_per_100g": 89,
            "sugar_level": "high",
            "health_tags": ["potassium-rich", "energy-boost"]
        },
        {
            "name": "orange",
            "type": "fruit",
            "calories_per_100g": 47,
            "sugar_level": "medium",
            "health_tags": ["vitamin-c", "immune-boost", "low-calorie"]
        },
        {
            "name": "carrot",
            "type": "vegetable",
            "calories_per_100g": 41,
            "sugar_level": "low",
            "health_tags": ["beta-carotene", "low-sugar", "diabetic-friendly"]
        },
        {
            "name": "broccoli",
            "type": "vegetable",
            "calories_per_100g": 34,
            "sugar_level": "low",
            "health_tags": ["high-protein", "calcium-rich", "low-sugar", "diabetic-friendly"]
        },
        {
            "name": "strawberry",
            "type": "fruit",
            "calories_per_100g": 32,
            "sugar_level": "medium",
            "health_tags": ["vitamin-c", "antioxidants", "low-calorie"]
        },
        {
            "name": "spinach",
            "type": "vegetable",
            "calories_per_100g": 23,
            "sugar_level": "low",
            "health_tags": ["iron-rich", "low-calorie", "diabetic-friendly"]
        },
        {
            "name": "tomato",
            "type": "vegetable",
            "calories_per_100g": 18,
            "sugar_level": "low",
            "health_tags": ["vitamin-c", "lycopene", "low-calorie"]
        },
        {
            "name": "blueberry",
            "type": "fruit",
            "calories_per_100g": 57,
            "sugar_level": "medium",
            "health_tags": ["antioxidants", "vitamin-c"]
        },
        {
            "name": "cucumber",
            "type": "vegetable",
            "calories_per_100g": 16,
            "sugar_level": "low",
            "health_tags": ["hydrating", "low-calorie", "diabetic-friendly"]
        }
    ]
    
    # Sample recipes data
    recipes_data = [
        {
            "food": "apple",
            "recipe_name": "Apple Pie",
            "appliances": ["oven", "mixer"],
            "health_tags": ["dessert", "traditional"],
            "steps": [
                "Peel and slice apples",
                "Mix cinnamon and sugar",
                "Prepare pie crust",
                "Bake at 350°F for 45 minutes"
            ]
        },
        {
            "food": "apple",
            "recipe_name": "Fresh Apple Salad",
            "appliances": ["knife", "cutting-board"],
            "health_tags": ["healthy", "low-calorie", "quick"],
            "steps": [
                "Dice apples",
                "Mix with greens",
                "Add lemon juice",
                "Serve immediately"
            ]
        },
        {
            "food": "banana",
            "recipe_name": "Banana Smoothie",
            "appliances": ["blender"],
            "health_tags": ["healthy", "quick", "energy-boost"],
            "steps": [
                "Peel banana",
                "Add milk or yogurt",
                "Blend until smooth",
                "Serve cold"
            ]
        },
        {
            "food": "banana",
            "recipe_name": "Banana Bread",
            "appliances": ["oven", "mixer"],
            "health_tags": ["dessert", "comfort-food"],
            "steps": [
                "Mash bananas",
                "Mix with flour and sugar",
                "Pour into pan",
                "Bake at 350°F for 1 hour"
            ]
        },
        {
            "food": "carrot",
            "recipe_name": "Carrot Soup",
            "appliances": ["blender", "stove"],
            "health_tags": ["diabetic-friendly", "warm", "healthy"],
            "steps": [
                "Chop carrots",
                "Boil with vegetable broth",
                "Blend until smooth",
                "Season and serve"
            ]
        },
        {
            "food": "carrot",
            "recipe_name": "Raw Carrot Sticks",
            "appliances": ["knife"],
            "health_tags": ["diabetic-friendly", "quick", "low-calorie"],
            "steps": [
                "Wash carrots",
                "Cut into sticks",
                "Serve with hummus"
            ]
        },
        {
            "food": "broccoli",
            "recipe_name": "Steamed Broccoli with Garlic",
            "appliances": ["steamer", "stove"],
            "health_tags": ["diabetic-friendly", "healthy", "low-calorie"],
            "steps": [
                "Cut broccoli into florets",
                "Steam for 5 minutes",
                "Sauté garlic in olive oil",
                "Toss and serve"
            ]
        },
        {
            "food": "broccoli",
            "recipe_name": "Roasted Broccoli",
            "appliances": ["oven"],
            "health_tags": ["healthy", "vegetarian"],
            "steps": [
                "Cut broccoli into florets",
                "Toss with olive oil",
                "Roast at 400°F for 20 minutes",
                "Season and serve"
            ]
        },
        {
            "food": "strawberry",
            "recipe_name": "Strawberry Jam",
            "appliances": ["pot", "stove"],
            "health_tags": ["dessert", "preserves"],
            "steps": [
                "Hull strawberries",
                "Cook with sugar",
                "Simmer until thickened",
                "Store in jars"
            ]
        },
        {
            "food": "strawberry",
            "recipe_name": "Strawberry Smoothie",
            "appliances": ["blender"],
            "health_tags": ["healthy", "quick", "low-calorie"],
            "steps": [
                "Hull strawberries",
                "Add yogurt and milk",
                "Blend until smooth",
                "Serve cold"
            ]
        },
        {
            "food": "spinach",
            "recipe_name": "Spinach Salad",
            "appliances": ["knife"],
            "health_tags": ["healthy", "quick", "low-calorie"],
            "steps": [
                "Wash spinach",
                "Add fresh vegetables",
                "Drizzle with olive oil and vinegar",
                "Serve immediately"
            ]
        },
        {
            "food": "tomato",
            "recipe_name": "Tomato Soup",
            "appliances": ["pot", "stove", "blender"],
            "health_tags": ["warm", "healthy"],
            "steps": [
                "Chop tomatoes",
                "Simmer with broth",
                "Blend until smooth",
                "Season and serve"
            ]
        }
    ]
    
    # Insert foods collection
    if "foods" not in db.list_collection_names():
        try:
            result = db["foods"].insert_many(foods_data)
            print(f"✓ Inserted {len(result.inserted_ids)} foods into database")
        except Exception as e:
            print(f"✗ Error inserting foods: {e}")
            return False
    else:
        count = db["foods"].count_documents({})
        print(f"ℹ Foods collection already exists with {count} documents")
    
    # Insert recipes collection
    if "recipes" not in db.list_collection_names():
        try:
            result = db["recipes"].insert_many(recipes_data)
            print(f"✓ Inserted {len(result.inserted_ids)} recipes into database")
        except Exception as e:
            print(f"✗ Error inserting recipes: {e}")
            return False
    else:
        count = db["recipes"].count_documents({})
        print(f"ℹ Recipes collection already exists with {count} documents")
    
    print("\n✓ Database initialization complete!")
    print("You can now view the data in MongoDB Compass:")
    print(f"  Connection: {mongo_uri}")
    print(f"  Database: {db_name}")
    print(f"  Collections: foods, recipes")
    
    client.close()
    return True


if __name__ == "__main__":
    success = load_sample_data()
    sys.exit(0 if success else 1)
