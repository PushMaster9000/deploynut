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


import logging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# Use uvicorn logger for better visibility in Render/Gunicorn
logger = logging.getLogger("uvicorn.error")

# --- CORS and Middleware setup ---
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
logger.info(f"RAW ALLOWED_ORIGINS from env: '{allowed_origins_env}'")

# Aggressively clean the origins
allowed_origins = [
    origin.strip().strip("'\"").rstrip("/") 
    for origin in allowed_origins_env.split(",") 
    if origin.strip()
] if allowed_origins_env else []

default_origins = ["http://localhost:5173", "http://localhost:3000"]
cors_origins = list(set(allowed_origins + default_origins)) if allowed_origins else ["*"]

logger.info(f"Final CORS Allowed Origins: {cors_origins}")

# CORS middleware (Outermost - added last)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True if cors_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler to log 422 validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"422 Validation Error: {exc.errors()}")
    logger.error(f"Request body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(await request.body())},
    )

# Debug middleware to log all requests (Innermost)
@app.middleware("http")
async def log_requests(request, call_next):
    if request.method == "OPTIONS":
        logger.info(f"DEBUG OPTIONS Request: Path={request.url.path}, Origin={request.headers.get('origin')}")
    response = await call_next(request)
    return response


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