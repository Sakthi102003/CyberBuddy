import json
import os
from typing import Any, Dict, Optional

import firebase_admin
from database import DatabaseManager
from dotenv import load_dotenv
from fastapi import Depends, Header, HTTPException
from firebase_admin import auth, credentials

# Load environment variables
load_dotenv()


# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    if not firebase_admin._apps:
        try:
            # Check for service account key file
            service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
            
            if service_account_path:
                # Make path relative to the current directory
                if not os.path.isabs(service_account_path):
                    service_account_path = os.path.join(os.path.dirname(__file__), service_account_path)
                
                if os.path.exists(service_account_path):
                    # Use service account key file
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred)
                    print(f"Firebase Admin SDK initialized with service account key file: {service_account_path}")
                else:
                    raise ValueError(f"Service account key file not found: {service_account_path}")
            else:
                raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set")
                    
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            raise e

# Initialize Firebase on module load
initialize_firebase()

db = DatabaseManager()

def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """Verify Firebase ID token and return user info."""
    try:
        print(f"Attempting to verify Firebase token: {id_token[:20]}...")
        # Use Firebase Admin SDK for token verification
        decoded_token = auth.verify_id_token(id_token)
        print(f"✅ Token verification successful for user: {decoded_token.get('email')}")
        return decoded_token
    except Exception as e:
        print(f"❌ Firebase token verification failed: {type(e).__name__}: {e}")
        return None

def get_current_user_firebase(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Get current user from Firebase ID token."""
    print(f"🔐 Authentication attempt with header: {authorization[:50] if authorization else 'None'}...")
    
    if not authorization:
        print("❌ No authorization header provided")
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            print(f"❌ Invalid scheme: {scheme}")
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        print(f"📋 Extracted token: {token[:20]}...")
    except ValueError:
        print("❌ Invalid authorization header format")
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    # Verify Firebase token
    firebase_user_data = verify_firebase_token(token)
    if not firebase_user_data:
        print(f"❌ Token verification failed for token: {token[:20]}...")
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token")
    
    # Return Firebase user data directly (no database lookup needed)
    user = {
        "id": firebase_user_data.get('uid'),
        "username": firebase_user_data.get('name') or firebase_user_data.get('email', '').split('@')[0],
        "email": firebase_user_data.get('email'),
        "firebase_uid": firebase_user_data.get('uid')
    }
    
    print(f"✅ Authentication successful for user: {user.get('username')} ({user.get('email')})")
    return user
