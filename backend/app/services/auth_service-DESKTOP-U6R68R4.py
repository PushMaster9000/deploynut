"""
Authentication service for user management.
Handles password hashing, user creation, and credential verification.
Uses bcrypt for secure password hashing.
"""
import re
import random
import string
from passlib.context import CryptContext
from typing import Optional, Dict, Any
from app.database import get_db
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from app.services.email_service import EmailService

# Bcrypt password hashing configuration
# bcrypt__truncate_error=False silences the 72-byte truncation warning
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=False)


class AuthService:
    """Service for authentication operations"""

    # ================= PASSWORD UTILS ================= #

    @staticmethod
    def hash_password(password) -> str:
        """
        Hash a password safely with a 72-byte limit for bcrypt.
        Truncates by bytes, not characters, to handle multi-byte UTF-8 properly.
        """
        # Extract secret value if Pydantic SecretStr
        if hasattr(password, "get_secret_value"):
            password = password.get_secret_value()
        
        # Convert to string and strip whitespace
        pw_str = str(password).strip()
        
        # DEBUG: Log what we're hashing (without revealing the actual password)
        print(f"[DEBUG] Password type: {type(password).__name__}, Length: {len(pw_str)}, Bytes: {len(pw_str.encode('utf-8'))}")
        
        # Truncate by BYTES, not characters (important for UTF-8 multi-byte chars)
        safe_password = pw_str.encode('utf-8')[:72].decode('utf-8', errors='ignore')

        if len(safe_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters"
            )

        return pwd_context.hash(safe_password)

    @staticmethod
    def verify_password(plain_password, hashed_password: str) -> bool:
        """
        Verify a plain text password against its hash.
        Truncates by bytes, not characters, to handle multi-byte UTF-8 properly.
        """
        if hasattr(plain_password, "get_secret_value"):
            plain_password = plain_password.get_secret_value()

        if isinstance(plain_password, bytes):
            plain_password = plain_password.decode("utf-8", errors="ignore")

        # Truncate by BYTES, not characters (important for UTF-8 multi-byte chars)
        plain_password = str(plain_password).encode('utf-8')[:72].decode('utf-8', errors='ignore')

        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False

    # ================= USER CRUD ================= #

    @staticmethod
    def create_user(username: str, email: str, password) -> Dict[str, Any]:
        db = get_db()
        users_collection = db["users"]

        if not username:
             raise HTTPException(status_code=400, detail="Username is required")

        username = str(username).strip().lower()
        email = str(email).strip().lower()
        
        # Ensure password is a plain string, not an object
        if hasattr(password, "get_secret_value"):
            password = password.get_secret_value()
        password = str(password).strip()

        # Check duplicates
        existing_user = users_collection.find_one({
            "$or": [{"email": email}, {"username": username}]
        })

        if existing_user:
            if existing_user.get("email") == email:
                raise HTTPException(status_code=409, detail="Email already registered")
            raise HTTPException(status_code=409, detail="Username already taken")

        # Hash password
        hashed_pw = AuthService.hash_password(password)
        verification_code = ''.join(random.choices(string.digits, k=6))

        user_doc = {
            "username": username,
            "email": email,
            "hashed_password": hashed_pw,
            "role": "user",
            "is_verified": False,
            "verification_code": verification_code,
            "created_at": datetime.utcnow()
        }
        
        try:
            result = users_collection.insert_one(user_doc)
            user_doc["_id"] = str(result.inserted_id)
            
            # Send verification email
            EmailService.send_verification_email(email, verification_code)
            
            print(f"✓ User created successfully: {email}")
            return AuthService._format_user_response(user_doc)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user: {str(e)}"
            )

    @staticmethod
    def authenticate_user(email: str, password) -> Optional[Dict[str, Any]]:
        db = get_db()
        users_collection = db["users"]

        email = email.strip().lower()
        user = users_collection.find_one({"email": email})

        if not user:
            return None

        stored_password = user.get("hashed_password") or user.get("password", "")

        if not AuthService.verify_password(password, stored_password):
            return None

        if not user.get("is_verified", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email to log in"
            )

        return AuthService._format_user_response(user)

    @staticmethod
    def verify_user_email(email: str, code: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        users_collection = db["users"]
        email = email.strip().lower()

        user = users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if user.get("is_verified"):
            return AuthService._format_user_response(user)
            
        if user.get("verification_code") != code:
            raise HTTPException(status_code=400, detail="Invalid verification code")
            
        users_collection.update_one(
            {"email": email},
            {"$set": {"is_verified": True}, "$unset": {"verification_code": ""}}
        )
        user["is_verified"] = True
        return AuthService._format_user_response(user)

    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        user = db["users"].find_one({"email": email.strip().lower()})
        return AuthService._format_user_response(user) if user else None

    @staticmethod
    def _format_user_response(user: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "username": user.get("username"),
            "email": user.get("email"),
            "role": user.get("role", "user"),
            "created_at": user.get("created_at")
        }

    # ================= PROFILE & SECURITY ================= #

    @staticmethod
    def update_user_profile(email: str, name: str, bio: str) -> bool:
        db = get_db()
        name = name.strip().lower()
        email_clean = email.strip().lower()
        
        existing_user = db["users"].find_one({"username": name})
        if existing_user and existing_user.get("email") != email_clean:
            raise HTTPException(status_code=409, detail="Username already taken")
        
        result = db["users"].update_one(
            {"email": email_clean},
            {"$set": {"username": name, "bio": bio}}
        )
        return result.acknowledged

    @staticmethod
    def update_password(email: str, old_password: str, new_password: str) -> bool:
        db = get_db()
        user = db["users"].find_one({"email": email.strip().lower()})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        stored_password = user.get("hashed_password") or user.get("password", "")
        if not AuthService.verify_password(old_password, stored_password):
            raise HTTPException(status_code=400, detail="Incorrect current password")

        new_hashed = AuthService.hash_password(new_password)
        db["users"].update_one(
            {"email": email.strip().lower()},
            {"$set": {"hashed_password": new_hashed, "password": new_hashed}}
        )
        return True

    @staticmethod
    def delete_account(email: str) -> bool:
        db = get_db()
        email_clean = email.strip().lower()
        db["users"].delete_one({"email": email_clean})
        db["saved_recipes"].delete_many({"user_email": email_clean})
        db["calorie_logs"].delete_many({"user_email": email_clean})
        return True

    # ================= FULL RECIPE SAVE & CALORIE LOGGING ================= #

    @staticmethod
    def toggle_save_recipe(email: str, recipe_data: dict) -> dict:
        db = get_db()
        recipe_title = recipe_data.get("name") or recipe_data.get("title")
        
        today_str = recipe_data.get("date") or datetime.now().strftime("%Y-%m-%d")

        existing_save = db["saved_recipes"].find_one({"user_email": email, "title": recipe_title})
        
        if not existing_save:
            recipe_data["user_email"] = email
            recipe_data["title"] = recipe_title
            db["saved_recipes"].insert_one(recipe_data)

        # Calorie logging
        cal_str = str(recipe_data.get("calories", "0"))
        digits = re.findall(r'\d+', cal_str)
        cal_value = int(digits[0]) if digits else 0

        if cal_value > 0:
            db["calorie_logs"].update_one(
                {"user_email": email, "date": today_str},
                {"$inc": {"total_calories": cal_value}},
                upsert=True
            )
            
        return {"status": "saved", "title": recipe_title}
        
    @staticmethod
    def get_saved_recipe_titles(email: str) -> list:
        db = get_db()
        user_saved_docs = db["saved_recipes"].find({"user_email": email}, {"title": 1})
        return [doc["title"] for doc in user_saved_docs if "title" in doc]