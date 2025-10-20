# Authentication Testing & Debugging

## Quick Debug Steps

### 1. Open Browser Developer Tools
Press `F12` and keep it open while testing

### 2. Check the Network Tab
1. Go to **Network** tab
2. **Clear** all requests
3. **Reload** the page (`F5`)
4. Try to **sign in**
5. Look for these requests:

#### Should see:
- ✅ `GET http://127.0.0.1:8000/api/v1/conversations` with status `200` or `401`
- ✅ Request Headers should include: `Authorization: Bearer eyJ...` (long token)

#### Should NOT see:
- ❌ `GET http://127.0.0.1:8000/api/v1/api/v1/conversations` (double path)
- ❌ `GET http://127.0.0.1:8000/api/v1/` (base path only)

### 3. Check Console Tab
Look for these specific messages:

#### Good signs:
```javascript
Environment detected: development
Final API_BASE_URL: http://127.0.0.1:8000/api/v1
Auth state changed: User logged in
User data: {...}
Getting fresh Firebase ID token...
Fresh Firebase ID token obtained
Making authenticated request to: http://127.0.0.1:8000/api/v1/conversations
Auth headers obtained: Bearer token present
Response status: 200
```

#### Bad signs:
```javascript
No Firebase user available
No authenticated user found
Response status: 401
Response status: 404
```

### 4. Test Authentication Token Manually

Open browser console and run:

```javascript
// Check if Firebase auth is initialized
console.log('Firebase auth:', window.firebase ? 'Found' : 'Not found');

// Check if user is logged in
import { auth } from './firebase/config.js';
console.log('Current user:', auth.currentUser);

// Get token manually
if (auth.currentUser) {
  auth.currentUser.getIdToken().then(token => {
    console.log('Token obtained:', token.substring(0, 50) + '...');
    
    // Test API call manually
    fetch('http://127.0.0.1:8000/api/v1/user/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(r => r.json())
    .then(data => console.log('User data:', data))
    .catch(err => console.error('Error:', err));
  });
} else {
  console.log('No user logged in');
}
```

## Common Issues and Fixes

### Issue 1: "No authenticated user found"
**Symptom:** Console shows this right after "Making authenticated request"

**Cause:** Firebase user not fully initialized yet

**Fix:** Already implemented - wait 500ms before loading chats

**Test:** 
1. Clear browser data
2. Reload page
3. Sign in
4. Wait 1-2 seconds
5. Check if chats load

### Issue 2: 401 Unauthorized
**Symptom:** Backend returns 401 for API calls

**Possible causes:**
1. Firebase token not being sent
2. Firebase token expired
3. Backend Firebase Admin SDK not initialized
4. Token format incorrect

**Fix steps:**

#### A. Verify token is being sent:
1. Open Network tab
2. Click on a failed request (red, status 401)
3. Look at **Request Headers**
4. Should see: `Authorization: Bearer eyJ...`
5. If missing → Frontend not sending token

#### B. Verify backend can decode token:
Run this in backend terminal:
```bash
cd backend
python -c "
from firebase_admin import auth
import firebase_admin
from firebase_admin import credentials

# Initialize if not already
try:
    cred = credentials.Certificate('ServiceAccountKey.json')
    firebase_admin.initialize_app(cred)
except:
    pass

# Test token verification (replace with actual token from browser)
token = 'YOUR_TOKEN_HERE'
try:
    decoded = auth.verify_id_token(token)
    print('Token valid!', decoded['email'])
except Exception as e:
    print('Token invalid:', e)
"
```

### Issue 3: 404 Not Found
**Symptom:** Backend returns 404 for API paths

**Causes:**
1. Wrong URL being called
2. Double `/api/v1/` in path
3. Endpoint doesn't exist

**Check:**
1. Network tab → Click failed request
2. Look at **Request URL**
3. Should be: `http://127.0.0.1:8000/api/v1/conversations`
4. NOT: `http://127.0.0.1:8000/api/v1/api/v1/conversations`
5. NOT: `http://127.0.0.1:8000/api/v1/`

### Issue 4: CORS Error
**Symptom:** Console shows "CORS policy" error

**Fix:** Check `backend/config.py`:
```python
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
```

## Manual API Test

Test backend directly with curl or Python:

### Python Test:
```python
import requests
import json

# Get a token from browser console first
token = "YOUR_FIREBASE_TOKEN_HERE"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Test user endpoint
response = requests.get("http://localhost:8000/api/v1/user/me", headers=headers)
print("Status:", response.status_code)
print("Response:", response.json())

# Test conversations
response = requests.get("http://localhost:8000/api/v1/conversations", headers=headers)
print("Conversations:", response.json())

# Test chat
data = {"message": "Hello, test message"}
response = requests.post("http://localhost:8000/api/v1/chat", headers=headers, json=data)
print("Chat response:", response.json())
```

## Reset Everything

If nothing works, nuclear option:

### 1. Clear ALL browser data:
- F12 → Application tab
- Clear Local Storage
- Clear Session Storage
- Clear Cookies for `localhost`

### 2. Restart backend:
```bash
cd backend
# Kill existing process
# On Windows: taskkill /F /PID 18140
# Then restart:
python main.py
```

### 3. Restart frontend:
```bash
cd frontend
# Ctrl+C to stop
npm run dev
```

### 4. Hard reload page:
`Ctrl + Shift + R` (clears cache too)

## Success Checklist

Before reporting issues, verify:

- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 5173
- [ ] Firebase config exists and is valid
- [ ] ServiceAccountKey.json exists in backend/
- [ ] Can sign in with Google
- [ ] Browser console shows "Fresh Firebase ID token obtained"
- [ ] Network tab shows Authorization header in requests
- [ ] Backend logs show the incoming requests
- [ ] No CORS errors in console
- [ ] API_BASE_URL is `http://127.0.0.1:8000/api/v1` (check console)

## Get Help

If still not working, provide:
1. Screenshot of browser console (all errors)
2. Screenshot of Network tab (failed request details)
3. Backend terminal output (last 20 lines)
4. Results of manual API test above
