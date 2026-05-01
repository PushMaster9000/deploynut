"""
Database module for MongoDB connection and initialization.
Provides centralized database access for the application.
Integrates with MongoDB Compass for local development.
"""

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from typing import Optional
from app.config import MONGODB_CONFIG

# Configuration from config.py (loaded from environment variables)
MONGO_URI = MONGODB_CONFIG["uri"]
DATABASE_NAME = MONGODB_CONFIG["database_name"]

# Global database instance
_client: Optional[MongoClient] = None
_db = None


def connect_db():
    """
    Establish connection to MongoDB.
    Works with:
    - Local mongod instance
    - MongoDB service (Windows: net start MongoDB)
    - MongoDB Compass
    
    Raises exception if connection fails.
    """
    global _client, _db
    try:
        # Connect with timeout for Windows MongoDB service compatibility
        _client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        # Verify connection
        _client.admin.command("ping")
        _db = _client[DATABASE_NAME]
        print("OK Connected to MongoDB successfully")
        print(f"  Database: {DATABASE_NAME}")
        return _db
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        print(f"ERROR Failed to connect to MongoDB: {e}")
        print("\nTroubleshooting:")
        print("  1. Ensure MongoDB is running:")
        print("     - Windows Service: net start MongoDB")
        print("     - Manual: mongod.exe from MongoDB installation")
        print("  2. Check your MONGO_URI environment variable or .env file")
        print("  3. Verify with MongoDB Compass")
        raise


def get_db():
    """
    Get the current database instance.
    """
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _db


def close_db():
    """
    Close MongoDB connection.
    """
    global _client, _db
    if _client:
        _client.close()
        _db = None
        print("OK MongoDB connection closed")


def initialize_collections():
    """
    Initialize required collections with sample data if they don't exist.
    This is run once during app startup.
    """
    db = get_db()
    
    # Initialize foods collection
    if "foods" not in db.list_collection_names():
        foods = [
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
            }
        ]
        db["foods"].insert_many(foods)
        print("OK Initialized foods collection")
    
    # Initialize recipes collection
    if "recipes" not in db.list_collection_names():
        recipes = [
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
            }
        ]
        db["recipes"].insert_many(recipes)
        print("OK Initialized recipes collection")


def initialize_users_collection():
    """
    Initialize users collection with required indexes.
    Creates unique indexes on email and username.
    This is run once during app startup.
    """
    db = get_db()
    users_collection = db["users"]
    
    # Create unique index on email
    try:
        users_collection.create_index("email", unique=True)
        print("OK Created unique index on users.email")
    except Exception as e:
        print(f"  users.email index already exists or error: {e}")
    
    # Create index on username (non-unique now)
    try:
        # Drop old unique index if it exists
        users_collection.drop_index("username_1") 
    except Exception:
        pass

    try:
        users_collection.create_index("username")
        print("OK Created index on users.username")
    except Exception as e:
        print(f"  users.username index already exists or error: {e}")
    
    # Create index on created_at for sorting
    try:
        users_collection.create_index("created_at")
        print("OK Created index on users.created_at")
    except Exception as e:
        print(f"  users.created_at index already exists or error: {e}")
