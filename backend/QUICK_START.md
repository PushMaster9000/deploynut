# 🚀 QUICK SETUP & USAGE GUIDE

## What Was Fixed?

| Issue | Solution | File |
|-------|----------|------|
| 🍎 Hardcoded data in Python | MongoDB collections + data loader | `load_data.py` |
| 📊 MongoDB Compass not working | Proper config + connection pooling | `database.py` |
| 🚫 ML libraries crashing install | Graceful fallback, optional deps | `image_utils.py` |
| 📡 Missing API endpoints | Added `/foods` and `/recipes` | `routes/predict.py` |
| 🔧 Heavy dependencies | Removed Pillow, marked ML as optional | `requirements.txt` |

---

## Setup (4 Steps)

### Step 1: Start MongoDB
```bash
# Windows Service
net start MongoDB

# OR manual (if service not installed)
mongod.exe
```

### Step 2: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Load Sample Data
```bash
python load_data.py
```
Expected output:
```
✓ Connected to database: food_recognition_db
✓ Inserted 10 foods into database
✓ Inserted 12 recipes into database
✓ Database initialization complete!
```

### Step 4: Start Backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Expected output:
```
✓ Connected to MongoDB successfully
✓ Application started successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## API Reference

### 🍎 Get All Foods
```bash
curl http://localhost:8000/api/v1/foods
```
**Response**:
```json
[
  {
    "name": "apple",
    "type": "fruit",
    "calories_per_100g": 52,
    "sugar_level": "medium",
    "health_tags": ["high-fiber", "antioxidants"]
  },
  ...
]
```

### 🔍 Get Food Details
```bash
curl http://localhost:8000/api/v1/foods/apple
```

### 👨‍🍳 Get All Recipes
```bash
curl http://localhost:8000/api/v1/recipes
```

### 🍳 Get Recipes for Food
```bash
curl "http://localhost:8000/api/v1/recipes/apple?appliances=knife,cutting-board&health_tags=healthy"
```

### 🧬 Predict Food + Get Recipes
```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{
    "health_constraints": ["low-sugar"],
    "available_appliances": ["blender"]
  }'
```
**Response**:
```json
{
  "detected_food": "apple",
  "confidence": 0.92,
  "food_info": {
    "name": "apple",
    "type": "fruit",
    "calories_per_100g": 52,
    "sugar_level": "medium",
    "health_tags": ["high-fiber", "antioxidants"]
  },
  "matching_recipes": [
    {
      "recipe_name": "Apple Pie",
      "appliances": ["oven", "mixer"],
      "health_tags": ["dessert"],
      "steps": [...]
    }
  ]
}
```

### 💪 Get Low-Calorie Foods
```bash
curl "http://localhost:8000/api/v1/low-calorie?max_calories=50"
```

### 🩺 Get Diabetic-Friendly Foods
```bash
curl http://localhost:8000/api/v1/low-sugar
```

### ✅ Health Check
```bash
curl http://localhost:8000/health
```

---

## MongoDB Compass Verification

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Database: `food_recognition_db`
4. Collections to see:
   - `foods` (10 items: apple, banana, orange, carrot, broccoli, strawberry, spinach, tomato, blueberry, cucumber)
   - `recipes` (12 items: Apple Pie, Banana Smoothie, etc.)

---

## Frontend Integration Checklist

- [ ] Load foods list: `GET /api/v1/foods`
- [ ] Show food selector (dropdown/search)
- [ ] Display selected food details: `GET /api/v1/foods/{food_name}`
- [ ] Show appliance selector (checkboxes)
- [ ] Show health constraint selector (checkboxes)
- [ ] Fetch recipes: `GET /api/v1/recipes/{food_name}?appliances=...&health_tags=...`
- [ ] Display recipes with steps
- [ ] (Optional) Image upload → `POST /api/v1/predict` (mock currently)

---

## File Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py          ← Centralized configuration (MONGODB_CONFIG)
│   ├── database.py        ← ✅ UPDATED: Uses config, MongoDB Compass ready
│   ├── main.py            ← Entry point
│   ├── models/
│   │   └── fruit_model.py ← Mock ML model (ready for real implementation)
│   ├── routes/
│   │   └── predict.py     ← ✅ UPDATED: Added /foods, /recipes endpoints
│   ├── schemas/
│   │   └── schemas.py     ← Request/response models
│   ├── services/
│   │   ├── calorie_service.py    ← Food queries
│   │   └── recipe_service.py     ← Recipe queries & filtering
│   └── utils/
│       └── image_utils.py ← ✅ UPDATED: PIL optional
├── requirements.txt       ← ✅ UPDATED: Clean dependencies
├── load_data.py          ← ✅ NEW: Data loader for MongoDB
├── test_api.py           ← Existing tests
├── CHANGES_SUMMARY.md    ← ✅ NEW: What changed
└── IMPLEMENTATION_GUIDE.md ← ✅ NEW: Detailed guide
```

---

## Troubleshooting

### ❌ "Failed to connect to MongoDB"
**Solution**:
```bash
# Check if MongoDB is running
tasklist | findstr mongod

# Start MongoDB
net start MongoDB

# Or run manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

### ❌ "ModuleNotFoundError: No module named 'PIL'"
**Solution**: This is OK - app works without PIL. If you need image processing:
```bash
pip install Pillow
```

### ❌ "Food 'xyz' not found in database"
**Solution**: Run data loader:
```bash
python load_data.py
```

### ❌ "No database connection"
**Solution**: Verify MongoDB is running and accessible:
```bash
# Test connection
python -c "from pymongo import MongoClient; client = MongoClient('mongodb://localhost:27017'); print(client.admin.command('ping'))"
```

---

## Key Improvements Made

✅ **Data Management**: Hardcoded data → MongoDB collections
✅ **Database**: Config-based connection → Compass compatible
✅ **Dependencies**: No crashes on missing ML libraries
✅ **API**: Complete endpoints for food/recipe discovery
✅ **Documentation**: Clear frontend integration points
✅ **Maintainability**: Services layer for clean business logic

---

## Next: Real ML Integration

When ready to add real image recognition:

1. Update `backend/app/models/fruit_model.py`:
   - Replace mock prediction
   - Load actual model (TensorFlow/PyTorch)
   - Decode base64 image
   - Run inference

2. Add to `requirements.txt`:
   ```
   tensorflow==2.14.0
   # OR
   torch==2.1.0
   ```

3. Test with `POST /api/v1/predict` sending base64 image

See `fruit_model.py` for code template.

---

## Summary

✅ All 4 problems fixed
✅ Database ready for MongoDB Compass
✅ API ready for frontend
✅ Data loading automated
✅ No dependencies blocking startup
✅ Clear integration docs

**Ready to build frontend!**
