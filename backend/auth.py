import hashlib
import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt
from database import DatabaseManager
from fastapi import Depends, Header, HTTPException

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

db = DatabaseManager()

def create_access_token(user_data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = user_data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def hash_token(token: str) -> str:
    """Hash token for storage."""
    return hashlib.sha256(token.encode()).hexdigest()

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # Check if session is still valid in database
        token_hash = hash_token(token)
        if not db.is_session_valid(token_hash):
            return None
            
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Get current user from JWT token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    # Verify token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get user from database using session
    token_hash = hash_token(token)
    user = db.get_user_by_session(token_hash)
    if not user:
        raise HTTPException(status_code=401, detail="User not found or session invalid")
    
    return user

def create_user_session(user: Dict[str, Any], device_info: str = None) -> str:
    """Create a new user session and return JWT token."""
    # Create JWT token
    token_data = {
        "sub": str(user["id"]),
        "username": user["username"],
        "email": user["email"]
    }
    
    token = create_access_token(token_data)
    token_hash = hash_token(token)
    
    # Store session in database
    expires_at = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    db.create_session(user["id"], token_hash, expires_at, device_info)
    
    return token

def invalidate_user_session(token: str) -> bool:
    """Invalidate a user session."""
    token_hash = hash_token(token)
    return db.invalidate_session(token_hash)
