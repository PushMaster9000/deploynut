# Smart Food Recognition and Personalized Recipe Recommendation System

## Project Overview

This is a backend-only REST API for a smart food recognition system that:
1. **Identifies foods** from images using ML (currently mocked, can be extended to real ML models)
2. **Fetches nutritional information** (calories, sugar levels, health tags)
3. **Recommends personalized recipes** based on:
   - Available kitchen appliances
   - Health constraints (low-sugar, diabetic-friendly, etc.)

The system demonstrates clean architecture principles with separated concerns for ML, database access, business logic, and API routes. Perfect for a college mini project viva evaluation.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend Framework** | Python FastAPI |
| **ML Model** | Python (mock initially, extensible for TensorFlow/PyTorch) |
| **Database** | MongoDB with PyMongo |
| **API Style** | REST with Pydantic validation |
| **ASGI Server** | Uvicorn |
| **Documentation** | Auto-generated Swagger UI |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app initialization and routes
│   ├── database.py             # MongoDB connection and initialization
│   ├── routes/
│   │   └── predict.py          # Prediction and recipe endpoints
│   ├── models/
│   │   └── fruit_model.py      # Mock ML model for fruit recognition
│   ├── services/
│   │   ├── calorie_service.py  # Food/calorie database queries
│   │   └── recipe_service.py   # Recipe filtering and recommendations
│   ├── schemas/
│   │   └── schemas.py          # Pydantic request/response models
│   └── utils/
│       └── image_utils.py      # Image processing utilities
├── requirements.txt             # Python dependencies
└── README.md                   # This file
```

---

## Setup Instructions

### Prerequisites
- Python 3.8+
- MongoDB (running on localhost:27017)
- pip

### Installation

1. **Clone/Extract project:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Ensure MongoDB is running:**
   ```bash
   # On Windows (if installed as service):
   net start MongoDB
   
   # Or run MongoDB directly:
   mongod
   ```

5. **Start the API server:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   Server runs on `http://localhost:8000`

6. **Access documentation:**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

---

## API Usage Examples

### 1. Health Check
**GET** `/health`

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "healthy",
  "version": "1.0.0"
}
```

---

### 2. Main Prediction Endpoint
**POST** `/api/v1/predict`

Recognize food, get nutrition info, and receive recipe recommendations.

**Request:**
```json
{
  "image_base64": null,
  "health_constraints": ["low-sugar"],
  "available_appliances": ["blender", "knife"]
}
```

**Response:**
```json
{
  "detected_food": "carrot",
  "confidence": 0.92,
  "food_info": {
    "name": "carrot",
    "type": "vegetable",
    "calories_per_100g": 41,
    "sugar_level": "low",
    "health_tags": ["beta-carotene", "low-sugar", "diabetic-friendly"]
  },
  "matching_recipes": [
    {
      "food": "carrot",
      "recipe_name": "Raw Carrot Sticks",
      "appliances": ["knife"],
      "health_tags": ["diabetic-friendly", "quick", "low-calorie"],
      "steps": ["Wash carrots", "Cut into sticks", "Serve with hummus"]
    }
  ]
}
```

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": null,
    "health_constraints": ["low-sugar"],
    "available_appliances": ["blender", "knife"]
  }'
```

---

### 3. Get Food Information
**GET** `/api/v1/foods/{food_name}`

```bash
curl http://localhost:8000/api/v1/foods/apple
```

**Response:**
```json
{
  "name": "apple",
  "type": "fruit",
  "calories_per_100g": 52,
  "sugar_level": "medium",
  "health_tags": ["high-fiber", "antioxidants", "low-calorie"]
}
```

---

### 4. Get Recipes for a Food
**GET** `/api/v1/recipes/{food_name}`

With optional filtering:
```bash
# All recipes for apple
curl http://localhost:8000/api/v1/recipes/apple

# With appliance filter
curl "http://localhost:8000/api/v1/recipes/apple?appliances=oven,mixer"

# With health filter
curl "http://localhost:8000/api/v1/recipes/apple?health_tags=healthy,low-calorie"

# Combined filters
curl "http://localhost:8000/api/v1/recipes/apple?appliances=knife&health_tags=quick"
```

---

### 5. List All Foods
**GET** `/api/v1/foods`

```bash
curl http://localhost:8000/api/v1/foods
```

---

### 6. Get Low-Calorie Foods
**GET** `/api/v1/low-calorie?max_calories=50`

```bash
curl http://localhost:8000/api/v1/low-calorie
```

---

### 7. Get Low-Sugar Foods (Diabetic-Friendly)
**GET** `/api/v1/low-sugar`

```bash
curl http://localhost:8000/api/v1/low-sugar
```

---

## Database Design (MongoDB)

### Collections

#### 1. **foods** Collection
Stores food information with nutritional data.

**Schema:**
```javascript
{
  "name": "apple",           // Food name (lowercase)
  "type": "fruit",           // fruit or vegetable
  "calories_per_100g": 52,   // Numeric calories
  "sugar_level": "medium",   // low, medium, or high
  "health_tags": [
    "high-fiber",
    "antioxidants",
    "low-calorie"
  ]
}
```

**Sample Data:**
- apple (fruit, 52 cal, medium sugar)
- banana (fruit, 89 cal, high sugar)
- carrot (vegetable, 41 cal, low sugar)
- broccoli (vegetable, 34 cal, low sugar)
- strawberry (fruit, 32 cal, medium sugar)

#### 2. **recipes** Collection
Stores recipes with filtering criteria.

**Schema:**
```javascript
{
  "food": "apple",              // Associated food
  "recipe_name": "Apple Pie",   // Recipe name
  "appliances": [
    "oven",
    "mixer"
  ],                            // Required appliances
  "health_tags": [
    "dessert",
    "traditional"
  ],                            // Health-related tags
  "steps": [
    "Peel and slice apples",
    "Mix cinnamon and sugar",
    "Prepare pie crust",
    "Bake at 350°F for 45 minutes"
  ]                             // Recipe steps
}
```

**Sample Data Included:**
- Apple Pie, Fresh Apple Salad
- Banana Smoothie
- Carrot Soup, Raw Carrot Sticks
- Steamed Broccoli with Garlic
- Strawberry Jam

### Database Initialization
The database automatically initializes on first run with sample data for all collections.

---

## ML Model Integration

### Current Behavior (Mock Mode)
The `FruitRecognitionModel` currently:
- Returns a random fruit from the supported list
- Confidence: 0.85-1.0
- No actual image processing

### Future Extension (Real ML Integration)
The architecture supports easy integration of real ML models:

```python
# Example: Replace mock with real TensorFlow model
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image

class FruitRecognitionModel:
    def __init__(self, model_path):
        self.model = tf.keras.models.load_model(model_path)
        self.class_names = ['apple', 'banana', 'orange', 'carrot', 'broccoli', 'strawberry']
    
    def predict(self, image_base64):
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(image_data))
        
        # Preprocess
        img = img.resize((224, 224))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Inference
        predictions = self.model.predict(img_array)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        
        return self.class_names[class_idx], confidence
```

### Recommended Models:
- **MobileNet**: Fast, lightweight, suitable for edge devices
- **ResNet50**: Higher accuracy, more compute-intensive
- **EfficientNet**: Good balance of accuracy and speed
- **Custom CNN**: Trained on food images for better domain-specific accuracy

### Training Pipeline:
1. Collect labeled food images
2. Data augmentation (rotation, zoom, brightness)
3. Split into train/validation/test
4. Train model with transfer learning
5. Export to SavedModel/ONNX format
6. Replace mock in `fruit_model.py`

---

## Frontend Integration (React - Future)

### Architecture for React Integration

```
┌─────────────────┐
│   React App     │  (Not implemented yet)
│   (Browser)     │
└────────┬────────┘
         │ HTTP REST
         ▼
┌─────────────────────────────────────────┐
│   FastAPI Backend (Current)             │
│  ✓ /api/v1/predict                      │
│  ✓ /api/v1/foods/{name}                 │
│  ✓ /api/v1/recipes/{food}               │
│  ✓ /api/v1/foods (list all)             │
│  ✓ /api/v1/low-calorie                  │
│  ✓ /api/v1/low-sugar                    │
└────────┬────────────────────────────────┘
         │ PyMongo
         ▼
┌─────────────────┐
│   MongoDB       │
│  - foods        │
│  - recipes      │
└─────────────────┘
```

### React Frontend Flow (To be implemented):

1. **User uploads image** → Send to `/api/v1/predict`
2. **Select filters** → health_constraints, available_appliances
3. **Receive recommendations** → Display food info + recipes
4. **Browse recipes** → Call `/api/v1/recipes/{food}` for more details
5. **Filter foods** → Call `/api/v1/low-calorie`, `/api/v1/low-sugar`

### React Component Structure (Example):
```
FoodRecognitionApp/
├── components/
│   ├── ImageUpload.jsx         # Upload and predict
│   ├── FoodInfo.jsx            # Display food details
│   ├── RecipeList.jsx          # Show recipes
│   ├── FilterPanel.jsx         # Select appliances/constraints
│   └── RecipeDetail.jsx        # Recipe steps
├── services/
│   └── api.js                  # API client wrapper
├── hooks/
│   └── useFoodPrediction.js   # Custom hook for API calls
└── App.jsx
```

### API Client Example (TypeScript/React):
```typescript
const api = axios.create({ baseURL: 'http://localhost:8000' });

export const predictFood = (
  imageBase64: string,
  healthConstraints: string[],
  appliances: string[]
) => api.post('/api/v1/predict', {
  image_base64: imageBase64,
  health_constraints: healthConstraints,
  available_appliances: appliances
});

export const getFoodInfo = (foodName: string) =>
  api.get(`/api/v1/foods/${foodName}`);
```

### CORS is already enabled in the backend:
```python
# In app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Key Features & Design Decisions

### ✓ Clean Architecture
- **Separation of Concerns**: ML, database, business logic, and API routes are in separate modules
- **Reusable Services**: `CalorieService` and `RecipeService` can be used independently
- **Database Abstraction**: All database queries go through centralized connection

### ✓ Extensibility
- Mock ML model can be replaced with real models without changing the API
- Database schema can be extended with new fields
- New endpoints can be added by creating new route modules

### ✓ Error Handling
- Proper HTTP status codes (404, 500)
- Detailed error messages
- Try-catch blocks in services

### ✓ Data Validation
- Pydantic schemas validate all inputs and outputs
- Automatic type checking and conversion
- Swagger documentation generated automatically

### ✓ Database Initialization
- Automatic collection creation on first run
- Sample data included for testing
- Index support ready for optimization

---

## Testing the API

### Using Swagger UI (Easiest)
1. Start the server
2. Visit `http://localhost:8000/docs`
3. Try endpoints directly in the browser

### Using Python Requests
```python
import requests

base_url = "http://localhost:8000"

# Test prediction
response = requests.post(
    f"{base_url}/api/v1/predict",
    json={
        "image_base64": None,
        "health_constraints": ["low-sugar"],
        "available_appliances": ["blender"]
    }
)
print(response.json())

# Test food info
response = requests.get(f"{base_url}/api/v1/foods/apple")
print(response.json())
```

### Using PowerShell
```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:8000/health"

# Test prediction
$body = @{
    image_base64 = $null
    health_constraints = @("low-sugar")
    available_appliances = @("blender", "knife")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/v1/predict" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## Troubleshooting

### MongoDB Connection Failed
- **Ensure MongoDB is running**: `mongod` should be running on localhost:27017
- **Check default port**: Modify `MONGO_URI` in `app/database.py` if using different port
- **Windows Service**: `net start MongoDB`

### Module Not Found Errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

### Port 8000 Already in Use
```bash
# Run on different port
python -m uvicorn app.main:app --port 8001 --reload
```

### Image Processing Errors
- Ensure PIL is installed: `pip install Pillow`
- Only base64-encoded images are supported

---

## Dependencies

See `requirements.txt` for complete list:
- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **pymongo**: MongoDB driver
- **pydantic**: Data validation
- **python-multipart**: File upload support
- **pillow**: Image processing

---

## Future Enhancements

1. **Real ML Model**: Replace mock with actual trained CNN model
2. **Image Upload**: Accept image files directly (not just base64)
3. **User Profiles**: Store user preferences and history
4. **JWT Authentication**: Secure endpoints with tokens
5. **Caching**: Redis cache for frequently accessed data
6. **Recommendation Engine**: ML-based recipe personalization
7. **Nutrition Tracking**: Track daily calorie intake
8. **Admin Dashboard**: Manage foods and recipes
9. **Multi-language Support**: Internationalization
10. **Mobile App**: Native Android/iOS app

---

## Author Notes

This project is designed as a **college mini project** with emphasis on:
- Clean, readable, well-commented code
- Proper separation of concerns
- Extensible architecture
- Clear API documentation
- Easy to understand for evaluation

The mock ML model is intentionally simple to allow focus on the overall system architecture. The framework is ready for real ML model integration once trained.

---

## License

Educational use only.

---

## Contact & Support

For viva preparation:
- All code is modular and can be explained component-by-component
- Database schema is simple and relatable
- API endpoints are well-documented
- Mock model is easy to extend

Good luck with your evaluation! 🎓
