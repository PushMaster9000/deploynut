# 🚀 COMPLETE RUN INSTRUCTIONS

Follow these steps exactly to get the project running.

---

## Prerequisites Check

Before starting, ensure you have:
- [ ] Python 3.8+ installed
- [ ] MongoDB installed and ready to run
- [ ] Internet connection (for pip install)

**Check Python version:**
```bash
python --version
```
Should show 3.8 or higher.

---

## Step 1: Navigate to Backend Directory

```bash
cd backend
```

You should see:
- `app/` folder
- `requirements.txt`
- `test_api.py`
- `README.md`

---

## Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

**Success**: You should see `(venv)` at the start of your terminal line.

---

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Time**: ~2 minutes
**Success**: Should complete without errors

---

## Step 4: Start MongoDB

**In a new terminal (keep it open):**

```bash
# Windows - if installed as service
net start MongoDB

# or run directly
mongod
```

**Success**: Should see "waiting for connections" message

---

## Step 5: Start the API Server

**In another terminal (in backend folder, with venv activated):**

```bash
python -m uvicorn app.main:app --reload
```

**Success**: Should show:
```
Uvicorn running on http://127.0.0.1:8000
```

Keep this terminal open!

---

## Step 6: Test the API

### Option A: Swagger UI (Easiest) 🎯

Open in browser:
```
http://localhost:8000/docs
```

You'll see interactive API documentation. Click any endpoint to test!

### Option B: Run Test Suite

**In another terminal (in backend folder):**

```bash
python test_api.py
```

Should see 13 test results.

### Option C: Manual cURL Test

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

## 🎯 Quick Test Sequence

### Test 1: Health Check
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"healthy",...}`

### Test 2: List Foods
```bash
curl http://localhost:8000/api/v1/foods
```
Should return list of 6 foods.

### Test 3: Get One Food
```bash
curl http://localhost:8000/api/v1/foods/apple
```
Should return apple details.

### Test 4: Get Recipes
```bash
curl http://localhost:8000/api/v1/recipes/apple
```
Should return 2 apple recipes.

### Test 5: Prediction
```bash
curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "Content-Type: application/json" \
  -d '{"image_base64": null, "health_constraints": [], "available_appliances": []}'
```
Should return predicted food with recipes.

---

## 📊 What You Should See

### When Server Starts

```
✓ Connected to MongoDB successfully
✓ Initialized foods collection
✓ Initialized recipes collection
✓ Application started successfully

Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### When API is Healthy

Visit: http://localhost:8000/health

Response:
```json
{
  "status": "healthy",
  "database": "healthy",
  "version": "1.0.0"
}
```

### When Tests Pass

```bash
$ python test_api.py

============================================================
  SMART FOOD RECOGNITION API - TEST SUITE
============================================================

[13 test results shown...]

============================================================
  TEST SUMMARY
============================================================
Total: 13 | Passed: 13 | Failed: 0
============================================================

🎉 All tests passed!
```

---

## 🔧 Troubleshooting

### MongoDB Connection Failed

**Problem**: "Failed to connect to MongoDB"

**Solution**:
1. Check MongoDB is running: `net start MongoDB` (Windows)
2. Or run `mongod` in separate terminal
3. Check port 27017 is not blocked

### Port 8000 Already in Use

**Problem**: "Address already in use"

**Solution**:
```bash
# Run on different port
python -m uvicorn app.main:app --port 8001 --reload
```

### ModuleNotFoundError

**Problem**: "No module named 'fastapi'"

**Solution**:
```bash
# Ensure venv is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Python Version Issue

**Problem**: "Command not found: python" or wrong version

**Solution**:
```bash
# Try python3 instead
python3 -m venv venv
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload
```

---

## 📂 File Locations Reference

```
Mini/
├── backend/
│   ├── app/main.py              ← FastAPI app
│   ├── app/database.py          ← MongoDB connection
│   ├── app/routes/predict.py    ← API endpoints
│   ├── requirements.txt         ← Dependencies (install with pip)
│   └── test_api.py              ← Run tests here
│
└── README.md                    ← Navigation guide
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Python 3.8+ installed
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (pip install -r requirements.txt)
- [ ] MongoDB running
- [ ] API server running (http://localhost:8000)
- [ ] Health check returns 200 (http://localhost:8000/health)
- [ ] Swagger UI opens (http://localhost:8000/docs)
- [ ] Can list foods (http://localhost:8000/api/v1/foods)
- [ ] Can run tests (python test_api.py)

---

## 🎓 Using Swagger UI for Testing

Best way to test without code:

1. **Open**: http://localhost:8000/docs
2. **Click** any endpoint (e.g., `/api/v1/predict`)
3. **Click** "Try it out"
4. **Fill** request body (or leave as example)
5. **Click** "Execute"
6. **See** response below

Examples to try:
- GET `/api/v1/foods` - See all foods
- GET `/api/v1/foods/apple` - Get apple details
- POST `/api/v1/predict` - Get prediction
- GET `/api/v1/low-sugar` - Get diabetic-friendly foods

---

## 📚 Documentation Reference

After everything is running:

1. **API Reference** → backend/README.md
2. **Quick Setup** → QUICK_START.md
3. **Viva Prep** → VIVA_PREPARATION.md
4. **Full Project Info** → README.md in Mini/

---

## 🎉 Success Indicators

You're all set when you see:

✅ MongoDB started successfully
✅ API server running on 8000
✅ Health check returns healthy
✅ Swagger UI opens in browser
✅ Tests pass (13/13)
✅ Can get food list
✅ Can predict and get recipes

---

## 🛑 Stop the Project

**Stop API Server:**
Press `CTRL+C` in the API terminal

**Stop MongoDB:**
Press `CTRL+C` in MongoDB terminal (or `net stop MongoDB` on Windows)

**Deactivate Virtual Environment:**
```bash
deactivate
```

---

## 🔄 Restart Later

To start again:

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Backend directory
cd backend
venv\Scripts\activate  # Windows
python -m uvicorn app.main:app --reload

# Terminal 3: Run tests (optional)
cd backend
python test_api.py
```

---

## 📞 Need Help?

Check these files:
- **Setup Issues**: QUICK_START.md
- **API Questions**: backend/README.md
- **Viva Prep**: VIVA_PREPARATION.md
- **Architecture**: VIVA_PREPARATION.md → Architecture section
- **Code**: All files have detailed comments

---

**You're all set! 🚀**

Next: Open http://localhost:8000/docs and start exploring!
