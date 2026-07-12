"""
NEC AI Voice Assistant — FastAPI Backend
Handles AI chat (local FAQ matching + Gemini), and data endpoints.
Runs on port 8000.
"""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.chat import router as chat_router
from routers.health import router as health_router

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NEC AI Backend",
    description="AI chat and FAQ service for Narasaraopeta Engineering College Voice Assistant",
    version="1.0.0"
)

# CORS — allow Angular frontend
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:4200").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(health_router, prefix="/api")


@app.on_event("startup")
async def startup():
    logger.info("NEC AI FastAPI service started on port 8000")
