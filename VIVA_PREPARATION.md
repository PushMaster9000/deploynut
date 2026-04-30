# Project Summary for Viva Preparation

## Project: Smart Food Recognition and Personalized Recipe Recommendation System

---

## 🎯 Project Objective

Build a REST API backend that:
1. Recognizes foods from images using ML
2. Fetches nutritional information from a database
3. Recommends recipes based on user constraints (appliances, health requirements)
4. Provides clean, extensible architecture for future React frontend

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Application                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Routes Layer (predict.py)                               │
│  └─> /api/v1/predict, /api/v1/foods, /api/v1/recipes   │
│                    │                                      │
│  Business Logic Layer (services)                          │
│  ├─> CalorieService: Food queries                       │
│  └─> RecipeService: Recipe filtering                    │
│                    │                                      │
│  Data Models (Pydantic schemas)                          │
│  └─> Request/Response validation                        │
│                    │                                      │
│  ML Model (fruit_model.py)                              │
│  └─> Food prediction (currently mocked)                 │
│                    │                                      │
│  Database Layer (database.py)                            │
│  └─> MongoDB connection & initialization                │
│                    │                                      │
└────────────────────┼────────────────────────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │    MongoDB      │
            │  - foods        │
            │  - recipes      │
            └─────────────────┘
```

---

## 📋 Key Components

### 1. **Main Application (app/main.py)**
- FastAPI app initialization
- CORS middleware setup for React frontend
- Lifespan management (connect DB on startup, close on shutdown)
- Health check endpoint
- Route registration

**Key Concepts:**
- ASGI framework for async operations
- Dependency injection through FastAPI
- Automatic API documentation (Swagger UI, ReDoc)

---

### 2. **Database Module (app/database.py)**
- Centralized MongoDB connection
- Collection initialization with sample data
- Connection pooling and error handling
- Singleton pattern for global DB access

**Functions:**
- `connect_db()` - Establish connection
- `get_db()` - Get current DB instance
- `close_db()` - Clean shutdown
- `initialize_collections()` - Create sample data

**Sample Collections:**
- **foods**: name, type, calories_per_100g, sugar_level, health_tags
- **recipes**: food, recipe_name, appliances, health_tags, steps

---

### 3. **ML Model (app/models/fruit_model.py)**
- Mock fruit recognition model
- Extensible design for real ML integration
- Singleton pattern for model instance

**Current Behavior:**
- Returns random fruit from supported list
- Confidence: 0.85-1.0

**Future Enhancement:**
- Load pre-trained CNN (TensorFlow/PyTorch)
- Actual image preprocessing
- Real inference on model

---

### 4. **Services Layer**

#### CalorieService (app/services/calorie_service.py)
**Purpose**: All food-related database queries

**Methods:**
- `get_food_by_name(food_name)` - Get specific food
- `get_all_foods()` - List all foods
- `get_foods_by_type(type)` - Filter by fruit/vegetable
- `get_foods_by_health_tags(tags)` - Filter by health tags
- `get_low_calorie_foods()` - Get <50 cal foods
- `get_low_sugar_foods()` - Diabetic-friendly foods
- `search_foods(query)` - Partial name search

#### RecipeService (app/services/recipe_service.py)
**Purpose**: Recipe management and filtering

**Methods:**
- `get_recipes_for_food(food_name)` - Get recipes for a food
- `filter_recipes_by_appliances(recipes, appliances)` - Match all required appliances
- `filter_recipes_by_health_tags(recipes, tags)` - Match health constraints
- `get_filtered_recipes(food, appliances, tags)` - Combined filtering
- `get_all_recipes()` - List all recipes
- `get_recipes_by_appliance(appliance)` - Filter by appliance
- `get_recipes_by_health_tag(tag)` - Filter by health tag
- `get_quick_recipes()` - Get quick recipes

---

### 5. **Data Models (app/schemas/schemas.py)**
- Pydantic models for request/response validation
- Automatic type checking and conversion
- JSON schema generation for API docs

**Models:**
- `PredictionRequestSchema` - Input for prediction
- `PredictionResponseSchema` - Output with recommendations
- `FoodCalorieSchema` - Food nutritional info
- `RecipeSchema` - Recipe details
- `HealthCheckSchema` - Health status

---

### 6. **API Routes (app/routes/predict.py)**

**Main Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/predict` | POST | Core: Recognize food + recommend recipes |
| `/api/v1/foods/{name}` | GET | Get food nutritional info |
| `/api/v1/recipes/{food}` | GET | Get recipes with optional filtering |
| `/api/v1/foods` | GET | List all foods |
| `/api/v1/low-calorie` | GET | Low-calorie foods |
| `/api/v1/low-sugar` | GET | Diabetic-friendly foods |

---

## 🔄 Prediction Flow (Main Endpoint)

```
POST /api/v1/predict
    │
    ├─ Input: image_base64, health_constraints, available_appliances
    │
    ├─→ [ML Model] Predict food from image
    │    └─ Returns: food_name, confidence
    │
    ├─→ [CalorieService] Fetch food info from MongoDB
    │    └─ Returns: calories, sugar_level, health_tags
    │
    ├─→ [RecipeService] Get recipes for food
    │    ├─ Filter by appliances (ALL required must be available)
    │    └─ Filter by health constraints (ANY matching tag)
    │
    └─→ Output: Structured JSON with food info + filtered recipes
```

---

## 📊 Database Design

### foods Collection
```json
{
  "name": "apple",
  "type": "fruit",
  "calories_per_100g": 52,
  "sugar_level": "medium",
  "health_tags": ["high-fiber", "antioxidants", "low-calorie"]
}
```

### recipes Collection
```json
{
  "food": "apple",
  "recipe_name": "Fresh Apple Salad",
  "appliances": ["knife", "cutting-board"],
  "health_tags": ["healthy", "low-calorie", "quick"],
  "steps": ["Dice apples", "Mix with greens", "Add lemon juice", "Serve"]
}
```

---

## 🧠 Filtering Logic

### Appliance Filtering
- **Logic**: ALL required appliances must be available
- **Example**: Recipe needs [oven, mixer], user has [oven] → NOT included
- **Formula**: `required_appliances ⊆ available_appliances`

### Health Constraint Filtering
- **Logic**: AT LEAST ONE constraint must match recipe tags
- **Example**: User wants "low-sugar", recipe tagged with ["diabetic-friendly", "low-sugar"] → INCLUDED
- **Formula**: `health_constraints ∩ recipe_tags ≠ ∅`

---

## 🔑 Design Patterns Used

### 1. Singleton Pattern
```python
# Ensure only one model/DB instance exists
_model_instance = None

def get_model():
    global _model_instance
    if _model_instance is None:
        _model_instance = FruitRecognitionModel()
    return _model_instance
```

### 2. Service Layer Pattern
- Separates business logic from API routes
- Reusable across different endpoints
- Easy to unit test

### 3. Repository Pattern (Database Abstraction)
- All DB queries go through service methods
- Easy to switch database or add caching

### 4. Dependency Injection
- FastAPI automatically injects dependencies
- Loosely coupled components

---

## ✅ Code Quality Features

### Separation of Concerns
- **API Layer**: Routes only handle HTTP
- **Service Layer**: Business logic isolated
- **Database Layer**: All queries centralized
- **Model Layer**: ML logic independent

### Error Handling
- Try-catch blocks in all services
- Proper HTTP status codes (404, 500)
- Descriptive error messages

### Data Validation
- Pydantic ensures type safety
- Automatic conversion and validation
- OpenAPI schema generation

### Documentation
- Docstrings in all functions
- Type hints for clarity
- Auto-generated Swagger UI
- Comprehensive README

---

## 🚀 Running the Project

### Installation
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Start MongoDB
```bash
mongod
```

### Run Server
```bash
python -m uvicorn app.main:app --reload
```

### Test API
```bash
curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "Content-Type: application/json" \
  -d '{"image_base64": null, "health_constraints": ["low-sugar"], "available_appliances": ["blender"]}'
```

---

## 📈 Future Enhancements

### Phase 1: Real ML Integration
- Load pre-trained CNN model
- Image preprocessing pipeline
- Actual inference instead of mock

### Phase 2: Frontend
- React web app
- Image upload UI
- Recipe display and filtering UI

### Phase 3: Advanced Features
- User authentication
- Preference saving
- Recommendation engine with ML
- Nutrition tracking
- Admin dashboard

### Phase 4: Optimization
- Redis caching
- Database indexing
- Load balancing
- Mobile app

---

## 🎓 Viva Talking Points

### Strengths to Highlight
1. **Clean Architecture**: Each layer has single responsibility
2. **Extensibility**: Mock model easily replaceable
3. **Database Design**: Normalized schema with proper fields
4. **API Design**: RESTful, well-documented, proper status codes
5. **Error Handling**: Comprehensive try-catch and validation
6. **Documentation**: Code comments and comprehensive README
7. **Scalability**: Service layer allows easy optimization

### Potential Questions & Answers

**Q: Why use services layer?**
A: Separates business logic from HTTP layer, enables reuse across endpoints, easier testing

**Q: How would you integrate real ML model?**
A: Replace mock in `fruit_model.py`, load pre-trained model, preprocess images, run inference

**Q: How does recipe filtering work?**
A: Two-stage filter - appliances (all required available), health_tags (any match)

**Q: Why MongoDB?**
A: Flexible schema for food items and recipes, easy to extend with new fields, natural fit for food documents

**Q: How to add user authentication?**
A: Add JWT tokens, create users collection, verify token in middleware

**Q: Can this scale to millions of foods?**
A: Add database indexes on frequently queried fields, implement caching, use pagination

---

## 📝 Sample Test Scenarios

### Test 1: Basic Prediction
```bash
POST /api/v1/predict
{
  "image_base64": null,
  "health_constraints": [],
  "available_appliances": []
}
# Expect: Any food with all recipes
```

### Test 2: Filtered Prediction
```bash
POST /api/v1/predict
{
  "image_base64": null,
  "health_constraints": ["diabetic-friendly"],
  "available_appliances": ["knife"]
}
# Expect: Only recipes with knife AND diabetic-friendly tag
```

### Test 3: Invalid Food
```bash
GET /api/v1/foods/invalid_food
# Expect: 404 Not Found
```

### Test 4: Health Check
```bash
GET /health
# Expect: 200 OK with database status
```

---

## 🎯 Project Evaluation Checklist

- ✅ Clean code with comments
- ✅ Proper separation of concerns
- ✅ Database integration working
- ✅ API endpoints functional
- ✅ Error handling in place
- ✅ Pydantic validation
- ✅ Extensible architecture
- ✅ Comprehensive documentation
- ✅ Sample data included
- ✅ Ready for frontend integration

---

## 📞 Quick Reference

**Project Root**: `Mini/backend/`

**Main App**: `app/main.py`

**Database**: `app/database.py`

**Services**: `app/services/`

**Routes**: `app/routes/predict.py`

**Schemas**: `app/schemas/schemas.py`

**Docs**: `backend/README.md` + `QUICK_START.md`

---

**Ready for viva evaluation!** 🎉
