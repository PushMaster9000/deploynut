import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from bson.objectid import ObjectId
from app.database import get_db
from app.utils.jwt_utils import get_current_user


router = APIRouter(prefix="/api/v1/community", tags=["Community"])
load_dotenv()  # Load environment variables from .env file
# --- CLOUDINARY CONFIGURATION ---
cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET") 
)

# --- Request Models ---
class ShareRecipeRequest(BaseModel):
    title: str
    post_type: str = "recipe" 
    text: Optional[str] = None 
    image: Optional[str] = None 
    ingredients: List[str] = []
    calories: int = 0
    instructions: List[str] = []
    health_tags: List[str] = []

class VoteRequest(BaseModel):
    vote_type: str

class ReplyRequest(BaseModel):
    text: str

class EditPostRequest(BaseModel):
    text: Optional[str] = None
    title: Optional[str] = None


# --- NEW ROUTE: UPLOAD IMAGE TO CLOUDINARY ---
@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: Dict[str, Any] = Depends(get_current_user)):
    try:
        # Read the file bytes safely
        contents = await file.read()
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents, 
            folder="community_uploads",
            resource_type="image"
        )
        
        return {"url": result.get("secure_url")}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary error: {str(e)}")
    
# --- YOUR EXISTING ROUTES (Untouched) ---

@router.post("/share")
async def share_to_community(
    recipe: ShareRecipeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    db = get_db()
    community_collection = db["community_recipes"]
    
    # Bulletproof Name Extraction (Fixes the "Chef" bug)
    author_name = current_user.get("name") or current_user.get("username") or current_user["email"].split("@")[0]

    recipe_doc = recipe.model_dump() if hasattr(recipe, "model_dump") else recipe.dict()
    recipe_doc["author_email"] = current_user["email"]
    recipe_doc["author_username"] = author_name
    recipe_doc["shared_at"] = datetime.now(timezone.utc)
    
    recipe_doc["upvotes"] = 0
    recipe_doc["downvotes"] = 0
    recipe_doc["upvoted_by"] = []
    recipe_doc["downvoted_by"] = []
    recipe_doc["replies"] = []

    community_collection.insert_one(recipe_doc)
    return {"message": "Successfully shared to the community!"}


@router.get("/")
async def get_community_recipes(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    db = get_db()
    community_collection = db["community_recipes"]
    recipes = list(community_collection.find().sort("shared_at", -1))
    
    for r in recipes:
        r["_id"] = str(r["_id"])
        if current_user["email"] in r.get("upvoted_by", []):
            r["user_vote"] = "up"
        elif current_user["email"] in r.get("downvoted_by", []):
            r["user_vote"] = "down"
        else:
            r["user_vote"] = None
        if "replies" not in r: r["replies"] = []

    return {"recipes": recipes}


@router.post("/{recipe_id}/vote")
async def vote_on_recipe(recipe_id: str, vote: VoteRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_db()
    community_collection = db["community_recipes"]
    email = current_user["email"]
    
    recipe = community_collection.find_one({"_id": ObjectId(recipe_id)})
    if not recipe: raise HTTPException(status_code=404, detail="Recipe not found")

    upvoted_by = recipe.get("upvoted_by", [])
    downvoted_by = recipe.get("downvoted_by", [])

    if email in upvoted_by: upvoted_by.remove(email)
    if email in downvoted_by: downvoted_by.remove(email)

    if vote.vote_type == "up": upvoted_by.append(email)
    elif vote.vote_type == "down": downvoted_by.append(email)

    community_collection.update_one(
        {"_id": ObjectId(recipe_id)},
        {"$set": {"upvoted_by": upvoted_by, "downvoted_by": downvoted_by, "upvotes": len(upvoted_by), "downvotes": len(downvoted_by)}}
    )
    return {"message": "Vote recorded!"}


@router.post("/{recipe_id}/reply")
async def reply_to_recipe(recipe_id: str, reply: ReplyRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_db()
    community_collection = db["community_recipes"]
    author_name = current_user.get("name") or current_user.get("username") or current_user["email"].split("@")[0]
    
    recipe = community_collection.find_one({"_id": ObjectId(recipe_id)})
    if not recipe: raise HTTPException(status_code=404, detail="Recipe not found")

    replies = recipe.get("replies", [])
    if any(r.get("user_email") == current_user["email"] for r in replies):
        raise HTTPException(status_code=400, detail="You can only reply once.")

    new_reply = {
        "user_email": current_user["email"],
        "username": author_name,
        "text": reply.text,
        "created_at": datetime.now(timezone.utc)
    }

    community_collection.update_one({"_id": ObjectId(recipe_id)}, {"$push": {"replies": new_reply}})
    return {"message": "Reply added!", "reply": new_reply}


@router.put("/{post_id}")
async def edit_post(post_id: str, request: EditPostRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_db()
    collection = db["community_recipes"]
    
    post = collection.find_one({"_id": ObjectId(post_id)})
    if not post: 
        raise HTTPException(404, "Post not found")
    
    if post.get("author_email") != current_user["email"]: 
        raise HTTPException(403, "You can only edit your own posts.")
        
    update_data = {}
    if request.text is not None: update_data["text"] = request.text
    if request.title is not None: update_data["title"] = request.title
    
    collection.update_one({"_id": ObjectId(post_id)}, {"$set": update_data})
    return {"message": "Post updated successfully!"}


@router.delete("/{post_id}")
async def delete_post(post_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_db()
    collection = db["community_recipes"]
    
    post = collection.find_one({"_id": ObjectId(post_id)})
    if not post: 
        raise HTTPException(404, "Post not found")
        
    if post.get("author_email") != current_user["email"]: 
        raise HTTPException(403, "You can only delete your own posts.")
        
    collection.delete_one({"_id": ObjectId(post_id)})
    return {"message": "Post deleted successfully!"}