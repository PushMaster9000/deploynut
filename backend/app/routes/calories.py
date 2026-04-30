from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.utils.jwt_utils import get_current_user # Adjust this import if your auth is elsewhere

router = APIRouter(prefix="/api/v1/calories", tags=["Calories"])

# --- Request Models ---
class CalorieLogRequest(BaseModel):
    calories: int

class GoalUpdateRequest(BaseModel):
    goal: int

# --- Routes ---

@router.get("/")
async def get_weekly_calories(date: Optional[str] = None, current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_db()
    logs_collection = db["calorie_logs"]
    users_collection = db["users"]
    
    # ADD THIS: Grab your scan collection (change "scan_history" if your DB table is named differently)
    scan_collection = db["scan_history"] 
    
    email = current_user["email"]
    
    user = users_collection.find_one({"email": email})
    goal = user.get("daily_calorie_goal", 2000) if user else 2000

    if date:
        today_date = datetime.strptime(date, "%Y-%m-%d")
    else:
        today_date = datetime.now()

    today_str = today_date.strftime("%Y-%m-%d")
    last_7_days = [(today_date - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]

    logs = list(logs_collection.find({
        "user_email": email,
        "date": {"$in": last_7_days}
    }))

    log_dict = {log["date"]: log.get("total_calories", 0) for log in logs}

    weekly_data = []
    for date_str in last_7_days:
        weekly_data.append({
            "date": date_str,
            "calories": log_dict.get(date_str, 0)
        })

    # ADD THIS: Count the user's total scans
    total_scans = scan_collection.count_documents({"user_email": email})

    return {
        "goal": goal,
        "weekly_data": weekly_data,
        "today_calories": log_dict.get(today_str, 0),
        "total_scans": total_scans # <-- Add it to the return payload!
    }


# Create a small model to accept the goal data
class GoalUpdate(BaseModel):
    goal: int

@router.put("/goal")
async def update_goal(goal_data: GoalUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_db()
    users_collection = db["users"]
    
    # Save the custom goal to the user's profile forever
    users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"daily_calorie_goal": goal_data.goal}}
    )
    
    return {"status": "success", "new_goal": goal_data.goal}

@router.post("/log")
async def log_calories(request: CalorieLogRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_db()
    logs_collection = db["calorie_logs"]
    email = current_user["email"]
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Upsert: Atomic operation that adds to existing total or creates a new day if missing
    from pymongo import ReturnDocument
    result = logs_collection.find_one_and_update(
        {"user_email": email, "date": today_str},
        {"$inc": {"total_calories": request.calories}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )

    return {"message": "Calories logged", "today_calories": result["total_calories"]}

@router.put("/goal")
async def update_goal(request: GoalUpdateRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_db()
    users_collection = db["users"]
    email = current_user["email"]

    users_collection.update_one(
        {"email": email},
        {"$set": {"daily_calorie_goal": request.goal}}
    )

    return {"message": "Goal updated successfully", "new_goal": request.goal}