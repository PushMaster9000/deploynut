# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Prerequisites
- Python 3.8+ installed
- MongoDB running locally
- Git/Terminal access

### 2. Quick Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start MongoDB (if not already running)
mongod

# In a new terminal, start the API
python -m uvicorn app.main:app --reload
```

### 3. Test the API
- **Swagger UI**: Visit http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Prediction**: POST to http://localhost:8000/api/v1/predict

### 4. Example Request

```bash
curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": null,
    "health_constraints": ["low-sugar"],
    "available_appliances": ["blender"]
  }'
```

---

## 📁 Project Structure Overview

```
backend/
├── app/
│   ├── main.py              ← FastAPI app & routes
│   ├── database.py          ← MongoDB setup
│   ├── routes/predict.py    ← Endpoints
│   ├── models/fruit_model.py ← ML model
│   ├── services/            ← Business logic
│   ├── schemas/schemas.py   ← Pydantic models
│   └── utils/image_utils.py ← Helpers
├── requirements.txt         ← Dependencies
└── README.md               ← Full documentation
```

---

## 🔑 Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/predict` | Recognize food + get recipes |
| GET | `/api/v1/foods/{name}` | Get food nutritional info |
| GET | `/api/v1/recipes/{food}` | Get recipes for food |
| GET | `/api/v1/foods` | List all foods |
| GET | `/api/v1/low-calorie` | Get low-calorie foods |
| GET | `/api/v1/low-sugar` | Get diabetic-friendly foods |
| GET | `/health` | API health status |

---

## 📚 Full Documentation
See `README.md` for:
- Complete API examples with responses
- Database schema details
- ML model integration guide
- Future React frontend architecture
- Troubleshooting tips

---

## 🎓 For Viva Evaluation

The code is organized to demonstrate:
✓ Clean architecture with separation of concerns
✓ Proper service layer abstraction
✓ Pydantic data validation
✓ MongoDB integration
✓ RESTful API design
✓ Extensible ML model framework
✓ Comprehensive error handling
✓ Well-documented, readable code

Each file is self-contained and can be explained independently.

---

**Enjoy! Good luck with your evaluation!** 🎉
