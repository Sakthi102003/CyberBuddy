"""
Configuration settings for the backend application
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Firebase
FIREBASE_CREDENTIALS_PATH = BASE_DIR / "ServiceAccountKey.json"

# CORS Settings
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# API Settings
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"
