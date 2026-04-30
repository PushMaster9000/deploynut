"""
Configuration and constants for the Food Recognition API.
Centralized place to manage app settings.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Configuration - Read from environment variables
MONGODB_CONFIG = {
    "uri": os.getenv("MONGO_URI", "mongodb://localhost:27017"),
    "database_name": os.getenv("MONGO_DB_NAME", "nutrivision_db"),
}

# Email Configuration
EMAIL_CONFIG = {
    "smtp_server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
    "smtp_port": int(os.getenv("SMTP_PORT", "587")),
    "smtp_email": os.getenv("SMTP_EMAIL", ""),
    "smtp_password": os.getenv("SMTP_PASSWORD", "")
}

# API Configuration
API_CONFIG = {
    "title": "Smart Food Recognition API",
    "description": "Food image recognition and personalized recipe recommendation system",
    "version": "1.0.0",
    "debug": True,
    "reload": True
}

# Server Configuration
SERVER_CONFIG = {
    "host": "0.0.0.0",
    "port": 8000,
    "workers": 1
}

# CORS Configuration
CORS_CONFIG = {
    "allow_origins": ["*"],  # Change to specific domains in production
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

# Image Configuration
IMAGE_CONFIG = {
    "target_size": (224, 224),
    "formats": ["JPEG", "PNG", "JPG"],
    "max_size_mb": 10
}

# ML Model Configuration
ML_CONFIG = {
    "model_type": "COLAB_MICROSERVICE",  # Updated to reflect Sam's architecture
    "ngrok_url": os.getenv("ML_NGROK_URL", ""),  # Sam's live tunnel URL from .env
    "gemini_api_key": os.getenv("GEMINI_API_KEY", ""), # Load Gemini Key
    "confidence_threshold": 0.7,
    "supported_foods": [
        "apple",
        "banana",
        "orange",
        "carrot",
        "broccoli",
        "strawberry",
        "spinach",
        "tomato",
        "blueberry",
        "cucumber"
    ]
}

# Health Filter Tags
HEALTH_TAGS = {
    "low-calorie": "Less than 50 calories per 100g",
    "low-sugar": "Sugar level: low",
    "diabetic-friendly": "Suitable for diabetic diet",
    "high-fiber": "High in dietary fiber",
    "antioxidants": "Rich in antioxidants",
    "vitamin-c": "High in vitamin C",
    "potassium-rich": "High in potassium",
    "calcium-rich": "High in calcium",
    "high-protein": "High protein content",
    "energy-boost": "Good energy source",
    "immune-boost": "Supports immune system",
    "beta-carotene": "Contains beta-carotene",
    "quick": "Quick/easy recipe",
    "healthy": "Healthy recipe",
    "dessert": "Dessert recipe",
    "traditional": "Traditional recipe",
    "preserves": "Preserved/canned",
    "warm": "Warm dish"
}

# Common Kitchen Appliances
KITCHEN_APPLIANCES = [
    "blender",
    "oven",
    "stove",
    "microwave",
    "steamer",
    "mixer",
    "food-processor",
    "slow-cooker",
    "instant-pot",
    "toaster",
    "grill",
    "knife",
    "cutting-board",
    "pot",
    "pan"
]

# Database Initialization Data
INITIAL_FOODS = [
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

INITIAL_RECIPES = [
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


def get_mongodb_uri():
    """Get MongoDB connection URI"""
    return MONGODB_CONFIG["uri"]


def get_database_name():
    """Get database name"""
    return MONGODB_CONFIG["database_name"]


def get_api_version():
    """Get API version"""
    return API_CONFIG["version"]
