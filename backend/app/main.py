"""
Main FastAPI application.
Entry point for the Smart Food Recognition and Recipe Recommendation System.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db, initialize_collections, initialize_users_collection
from app.routes import predict, recipes, auth, community, calories
from app.schemas.schemas import HealthCheckSchema


# Application lifecycle management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application startup and shutdown events.
    """
    # Startup
    try:
        connect_db()
        initialize_collections()
        initialize_users_collection()
        print("OK Application started successfully")
    except Exception as e:
        print(f"ERROR Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    try:
        close_db()
        print("OK Application shut down successfully")
    except Exception as e:
        print(f"ERROR during shutdown: {e}")


# Create FastAPI app
app = FastAPI(
    title="Smart Food Recognition API",
    description="Food image recognition and personalized recipe recommendation system",
    version="1.0.0",
    lifespan=lifespan
)


# CORS middleware setup — reads allowed origins from env for deployment flexibility
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
# Split by comma, strip whitespace, AND strip trailing slashes for robustness
allowed_origins = [origin.strip().rstrip("/") for origin in allowed_origins_env.split(",") if origin.strip()] if allowed_origins_env else []

# Always allow local dev servers
default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Merge: env origins take priority, then defaults. 
# If nothing is specified, we allow all for deployment convenience.
if not allowed_origins:
    cors_origins = ["*"]
else:
    cors_origins = list(set(allowed_origins + default_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routes
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(recipes.router)
app.include_router(community.router)
app.include_router(calories.router)


# Health check and root endpoints
@app.get("/health", response_model=HealthCheckSchema)
async def health_check():
    return {"status": "healthy", "database": "connected"}

@app.get("/")
async def root():
    return {
        "message": "Welcome to Smart Food Recognition API", 
        "version": "1.0.0", 
        "docs": "/docs"
    }