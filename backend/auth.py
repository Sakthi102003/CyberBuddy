from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import FirebaseDB
from typing import Optional

security = HTTPBearer(auto_error=False)  # Don't auto-error, we'll handle it

async def get_current_user(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    try:
        # Log the incoming request for debugging
        print(f"\n=== Auth attempt from {request.client.host} ===")
        auth_header = request.headers.get('authorization', 'NOT PROVIDED')
        print(f"Authorization header: {auth_header[:50] if len(auth_header) > 50 else auth_header}...")
        
        if not credentials:
            print("ERROR: No credentials provided (HTTPBearer returned None)")
            raise HTTPException(status_code=401, detail='No authorization token provided')
        
        token = credentials.credentials
        print(f"Token extracted (first 30 chars): {token[:30]}...")
        
        decoded_token = FirebaseDB.verify_token(token)
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        
        print(f"✓ Token verified successfully for user: {email}")
        
        if not firebase_uid:
            print("ERROR: No firebase_uid in decoded token")
            raise HTTPException(status_code=401, detail='Invalid token: no uid')
        
        user = FirebaseDB.get_or_create_user(
            firebase_uid=firebase_uid,
            email=email,
            display_name=decoded_token.get('name'),
            photo_url=decoded_token.get('picture')
        )
        print(f"✓ User loaded: {user['email']}")
        return user
    except ValueError as e:
        print(f"✗ ValueError in auth: {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"✗ Exception in auth: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=401, detail=f'Authentication failed: {str(e)}')
