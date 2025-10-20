# CyberBuddy Testing Guide

## Current Status
- ✅ Backend running on `http://localhost:8000`
- ✅ Frontend running on `http://localhost:5173`
- ✅ All authentication fixes applied
- ✅ API endpoints corrected

## Testing Steps

### 1. Clear Browser Data (Important!)
Before testing, clear your browser's storage to start fresh:

1. Open Developer Tools (`F12`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Under **Local Storage**, select `http://localhost:5173`
4. Click **Clear All** or delete all entries
5. Also clear **Session Storage** if present
6. **Reload the page** (`Ctrl+R` or `F5`)

### 2. Test Login Flow

#### Expected: Sign In with Google
1. You should see the login screen
2. Click **"Sign in with Google"** button
3. Google OAuth popup should appear
4. Select your Google account
5. Grant permissions if prompted

#### Check Browser Console (F12 → Console)
Look for these log messages in order:
```
Environment detected: development
Hostname: localhost
Final API_BASE_URL: http://127.0.0.1:8000/api/v1
Auth state changed: User logged in
User data: {id: "...", email: "...", username: "...", ...}
Scheduling chat load...
```

Then after 500ms:
```
Loading user chats...
No authenticated user found (if this appears, wait and retry)
```

OR (successful):
```
Making authenticated request to: http://127.0.0.1:8000/api/v1/conversations
Getting auth headers...
Getting fresh Firebase ID token...
Fresh Firebase ID token obtained
Using Firebase ID token for auth headers
Auth headers obtained: Bearer token present
Response status: 200
Sessions loaded: []
Formatted chats: []
```

#### Check Backend Logs
Your backend terminal should show:
```
INFO:     127.0.0.1:xxxxx - "GET /api/v1/conversations HTTP/1.1" 200 OK
```

**NOT these errors:**
- ❌ `404 Not Found` for `/api/v1/api/v1/...`
- ❌ `401 Unauthorized` for `/api/v1/conversations`
- ❌ `404 Not Found` for `/api/v1/`

### 3. Test Chat Creation

1. Click **"Start New Chat"** or the **"+ New Chat"** button in sidebar
2. You should see:
   - A new chat appears in the sidebar titled "New Chat"
   - The chat window shows a welcome message
   - No backend requests yet (chat has `id: null`)

#### Check Console
```
New chat with no ID, showing welcome message
Messages loaded successfully for chat: null
```

### 4. Test Sending Messages

1. Type a message in the input box (e.g., "What is cybersecurity?")
2. Press Enter or click Send
3. Wait for AI response

#### Check Console
```
Making authenticated request to: http://127.0.0.1:8000/api/v1/chat
Response status: 200
```

#### Check Backend Logs
```
INFO:     127.0.0.1:xxxxx - "POST /api/v1/chat HTTP/1.1" 200 OK
```

#### Expected Behavior
- User message appears immediately
- Loading indicator shows while waiting
- AI response appears after a few seconds
- Chat title is auto-generated from first message
- Chat now has a real ID (not null)
- Messages are saved to Firestore

### 5. Test Chat Persistence

1. **Reload the page** (`F5`)
2. Sign in again if needed
3. Your chats should load from backend
4. Click on a chat to see previous messages

#### Check Console
```
Loading user chats...
Sessions loaded: [{id: "...", title: "What is cybersecurity?", ...}]
Formatted chats: [...]
```

#### Check Backend Logs
```
INFO:     127.0.0.1:xxxxx - "GET /api/v1/conversations HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "GET /api/v1/conversations/{id}/messages HTTP/1.1" 200 OK
```

### 6. Test Chat Deletion

1. Hover over a chat in the sidebar
2. Click the delete icon (trash can)
3. Confirm if prompted

#### For Unsent Chats (id: null)
- Chat should disappear immediately
- No backend request (console shows no API call)

#### For Real Chats (with ID)
**Check Console:**
```
Making authenticated request to: http://127.0.0.1:8000/api/v1/conversations/{id}
Response status: 200
```

**Check Backend Logs:**
```
INFO:     127.0.0.1:xxxxx - "DELETE /api/v1/conversations/{id} HTTP/1.1" 200 OK
```

**NOT this error:**
- ❌ `DELETE /api/v1/conversations/null HTTP/1.1" 401 Unauthorized`

## Common Issues & Solutions

### Issue: 401 Unauthorized Errors
**Symptoms:**
```
INFO:     127.0.0.1:xxxxx - "GET /api/v1/conversations HTTP/1.1" 401 Unauthorized
```

**Solutions:**
1. Wait a bit longer after signing in (Firebase needs time to initialize)
2. Check console for "No authenticated user found" message
3. Clear browser data and try again
4. Check Firebase config files are correct

### Issue: 404 Not Found for `/api/v1/`
**Symptoms:**
```
INFO:     127.0.0.1:xxxxx - "GET /api/v1/ HTTP/1.1" 404 Not Found
```

**Cause:** This might appear briefly during hot reload. If it persists:
1. Hard refresh the frontend (`Ctrl+Shift+R`)
2. Check that `API_BASE_URL` in console shows correct value
3. Restart frontend dev server

### Issue: No Chats Loading
**Check:**
1. Is user authenticated? (check console logs)
2. Is backend running? (visit `http://localhost:8000` - should see API info)
3. Any 401/404 errors in console or backend?
4. Try creating a new chat and sending a message first

### Issue: Messages Not Sending
**Check:**
1. Console for error messages
2. Backend logs for errors
3. Network tab (F12 → Network) for failed requests
4. Verify GEMINI_API_KEY is set in backend `.env` file

## Success Criteria

✅ **All tests pass when:**
- No 404 errors for `/api/v1/api/v1/...` paths
- No 401 errors after successful login
- No DELETE requests to `/conversations/null`
- Chats load after sign in
- Messages send and receive successfully
- Chats persist after page reload
- Chat deletion works correctly

## Backend Endpoints Reference

All endpoints require Bearer token (Firebase ID token) in Authorization header:

- `GET /` - Health check (no auth required)
- `GET /api/v1/user/me` - Get current user info
- `GET /api/v1/conversations` - Get all user conversations
- `GET /api/v1/conversations/{id}/messages` - Get messages in conversation
- `POST /api/v1/chat` - Send message (creates conversation if needed)
- `DELETE /api/v1/conversations/{id}` - Delete conversation

## Date
October 20, 2025
