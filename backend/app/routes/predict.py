import io
import google.generativeai as genai
from PIL import Image
import base64
from fastapi import APIRouter, HTTPException
from app.schemas.schemas import PredictionRequestSchema, PredictionResponseSchema
from app.services.calorie_service import CalorieService
from app.services.recipe_service import RecipeService
from app.config import ML_CONFIG

router = APIRouter(prefix="/api/v1", tags=["Prediction"])

# Configure Gemini
genai.configure(api_key=ML_CONFIG.get("gemini_api_key"))

@router.post("/predict", response_model=PredictionResponseSchema)
async def predict_food(request: PredictionRequestSchema) -> PredictionResponseSchema:
    try:
        if request.food_name:
            predicted_food = request.food_name.lower()
            confidence = 1.0
        else:
            if not request.image_base64:
                raise HTTPException(status_code=400, detail="No image or food_name provided.")

            # 1. Prepare Image Data
            b64_data = request.image_base64.split(",")[1] if "," in request.image_base64 else request.image_base64
            image_bytes = base64.b64decode(b64_data)
            img = Image.open(io.BytesIO(image_bytes))

            # 2. Call Gemini Vision
            vision_model = genai.GenerativeModel('gemini-2.5-flash')
            
            prompt = "Identify the single most prominent food item in this image. Return only the name of the food in 1-2 words (e.g., 'pizza' or 'grilled chicken')."
            
            gemini_response = vision_model.generate_content([prompt, img])
            predicted_food = gemini_response.text.strip().lower().replace(".", "")
            confidence = 0.99  # Gemini is highly reliable

        # 3. Database & Recipe Logic
        food_info = CalorieService.get_food_by_name(predicted_food)
        
        if not food_info:
            raise HTTPException(status_code=404, detail=f"Food '{predicted_food}' not in database")
        
        matching_recipes = RecipeService.get_filtered_recipes(
            predicted_food,
            available_appliances=request.available_appliances,
            health_constraints=request.health_constraints
        )
        
        return PredictionResponseSchema(
            detected_food=predicted_food,
            confidence=confidence,
            food_info=food_info,
            matching_recipes=matching_recipes
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Prediction failed: {str(e)}")
