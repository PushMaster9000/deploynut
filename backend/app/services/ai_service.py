import os
import json
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the Gemini API with your free key
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_recipes(ingredients: List[str], user_preferences: str = "") -> List[Dict[str, Any]]:
    """
    Generate real recipes using Google's free Gemini AI.
    """
    ingredients_list = ", ".join(ingredients)
    preference_context = f"The user also has these specific preferences/health constraints: {user_preferences}" if user_preferences else ""

    # 1. The strict instructions for the AI
    system_instruction = """
    You are an expert AI Chef and strict Clinical Nutritionist. You must generate EXACTLY ONE recipe based on the user's ingredients and preferences.
    
    CRITICAL NUTRITION RULE: You must accurately calculate the total estimated calories based on the standard nutritional values of the specific quantities of ingredients used. Do not guess; do the math.
    
    You MUST return the recipe as a valid JSON object in this EXACT format, with no markdown formatting or extra text:
    {
        "title": "Creative Recipe Name",
        "ingredients": ["1 cup ingredient A", "2 tbsp ingredient B"],
        "calories": 450,
        "instructions": ["Step 1...", "Step 2...", "Step 3..."],
        "health_tags": ["vegan", "quick", "low-carb"]
    }
    """

    user_prompt = f"I have these ingredients: {ingredients_list}. {preference_context}. Please make me a recipe!"

    try:
        # 2. Setup the free Gemini 2.5 Flash model
        # We enforce JSON output so it never breaks your frontend
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            system_instruction=system_instruction,
            generation_config={"response_mime_type": "application/json"}
        )

        # 3. Call the AI
        response = model.generate_content(user_prompt)
        
        # 4. Parse the AI's JSON reply
        recipe_data = json.loads(response.text)

        # Return it as a list so it matches what recipes.py expects
        return [recipe_data]

    except Exception as e:
        print(f"Gemini AI Generation Error: {e}")
        # Fallback recipe if the API key is missing or something goes wrong
        return [{
            "title": "Chef's API Error",
            "ingredients": ingredients,
            "calories": 0,
            "instructions": [
                "The AI failed to generate a recipe.", 
                "Please make sure your GEMINI_API_KEY is set in your .env file!",
                f"Error details: {str(e)}"
            ],
            "health_tags": ["error"]
        }]