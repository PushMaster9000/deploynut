"""
Pydantic schemas for authentication and authorization.
Defines data models for user registration, login, and JWT tokens.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    """Schema for user signup request"""
    # Change 'username' to 'name' here
    name: str = Field(..., min_length=3, max_length=50, description="Name for account")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "samuel", # Update this too
                "email": "samuel@example.com",
                "password": "SecurePassword123!"
            }
        }

class UserLogin(BaseModel):
    """Schema for user login request"""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "samuel@example.com",
                "password": "SecurePassword123!"
            }
        }


class VerifyEmailRequest(BaseModel):
    """Schema for email verification request"""
    email: EmailStr = Field(..., description="Email address")
    code: str = Field(..., description="6-digit verification code")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "samuel@example.com",
                "code": "123456"
            }
        }


class UserDB(BaseModel):
    """Schema for user data in database (response model, no password)"""
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    role: str = Field(default="user", description="User role (user/admin)")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "samuel",
                "email": "samuel@example.com",
                "role": "user",
                "created_at": "2026-02-24T12:00:00"
            }
        }


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Access token expiration time in seconds")
    user: UserDB = Field(..., description="User information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
                "user": {
                    "username": "samuel",
                    "email": "samuel@example.com",
                    "role": "user",
                    "created_at": "2026-02-24T12:00:00"
                }
            }
        }


class TokenRefresh(BaseModel):
    """Schema for token refresh request"""
    refresh_token: str = Field(..., description="Refresh token")
    
    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class AuthError(BaseModel):
    """Schema for authentication error responses"""
    detail: str = Field(..., description="Error message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid credentials"
            }
        }
