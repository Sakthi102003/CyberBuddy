# Frontend Integration with New Backend

## Changes Made

### 1. Updated API Configuration (`frontend/src/config.js`)
- Changed API base URL to include `/api/v1` prefix
- Development: `http://127.0.0.1:8000/api/v1`
- Production: `https://[domain]/api/v1`

### 2. Updated API Service (`frontend/src/utils/api.js`)

#### Token Service
- Modified to handle JWT tokens from backend instead of just Firebase tokens
- `getFreshToken()` now exchanges Firebase ID token for backend JWT
- Stores backend JWT in localStorage

#### Authentication API
- **`register(email, password, displayName)`** - Register with email/password
  - Endpoint: `POST /api/v1/auth/register`
  - Returns: `{ token, user, expires_at }`

- **`login(email, password)`** - Login with email/password
  - Endpoint: `POST /api/v1/auth/login`
  - Returns: `{ token, user, expires_at }`

- **`loginWithFirebase(idToken)`** - Login with Firebase/Google
  - Endpoint: `POST /api/v1/auth/firebase`
  - Body: `{ id_token }`
  - Returns: `{ token, user, expires_at }`

- **`getCurrentUser()`** - Get current user info
  - Endpoint: `GET /api/v1/user/me`

- **`logout()`** - Logout current session
  - Endpoint: `POST /api/v1/auth/logout`

- **`getSessions()`** - Get all active sessions (multi-device)
  - Endpoint: `GET /api/v1/auth/sessions`

- **`revokeSession(sessionId)`** - Revoke specific session
  - Endpoint: `DELETE /api/v1/auth/sessions/{sessionId}`

#### Conversation API (formerly sessionAPI)
- **`getSessions()`** - Get all conversations
  - Endpoint: `GET /api/v1/conversations`
  - Returns: Array of `{ id, title, created_at, updated_at }`

- **`deleteSession(sessionId)`** - Delete conversation
  - Endpoint: `DELETE /api/v1/conversations/{sessionId}`

- **`getMessages(sessionId)`** - Get messages in conversation
  - Endpoint: `GET /api/v1/conversations/{sessionId}/messages`
  - Returns: Array of `{ id, role, content, created_at }`

- **`updateSession(sessionId, title)`** - Update conversation title
  - **Note**: Not supported in new backend (auto-generated)
  - Now silently skips the API call

- **`createSession(title)`** - Create conversation
  - **Note**: Not needed in new backend (auto-created on first message)
  - Returns placeholder object

#### Chat API
- **`sendMessage(message, conversationId)`** - Send message
  - Endpoint: `POST /api/v1/chat`
  - Body: `{ message, conversation_id? }`
  - Returns: `{ conversation_id, message: { id, role, content, created_at } }`
  - Automatically creates conversation if `conversation_id` is null

- **`resetSession(sessionId)`** - Reset conversation
  - **Note**: Not supported (delete and create new instead)
  - Throws error with user-friendly message

### 3. Updated Components

#### App.jsx
- Modified Firebase auth flow to exchange ID token for backend JWT
- Updated to use new backend response format
- Removed fallback to Firebase user data (now always uses backend)

#### Chatbot.jsx
- Updated `sendMessage` to handle new response format:
  - Old: `response.reply`
  - New: `response.message.content`
- Updated `loadChatMessages` to handle array response instead of wrapped object:
  - Old: `response.messages`
  - New: direct array

### 4. Backend Response Formats

#### Auth Responses
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "photo_url": "https://...",
    "created_at": "2025-10-20T..."
  },
  "expires_at": "2025-10-27T..."
}
```

#### Chat Response
```json
{
  "conversation_id": "uuid",
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "AI response here...",
    "created_at": "2025-10-20T..."
  }
}
```

#### Conversations List
```json
[
  {
    "id": "uuid",
    "title": "Conversation title",
    "created_at": "2025-10-20T...",
    "updated_at": "2025-10-20T..."
  }
]
```

#### Messages List
```json
[
  {
    "id": "uuid",
    "role": "user",
    "content": "User message",
    "created_at": "2025-10-20T..."
  },
  {
    "id": "uuid",
    "role": "assistant",
    "content": "AI response",
    "created_at": "2025-10-20T..."
  }
]
```

## Authentication Flow

### Firebase/Google Sign-In
1. User signs in with Google via Firebase
2. Frontend gets Firebase ID token
3. Frontend sends ID token to backend: `POST /api/v1/auth/firebase`
4. Backend verifies token with Firebase Admin SDK
5. Backend creates/retrieves user and creates session
6. Backend returns JWT token (valid for 7 days)
7. Frontend stores JWT token
8. Frontend uses JWT token for all API requests

### Email/Password Sign-In
1. User enters email and password
2. Frontend sends to backend: `POST /api/v1/auth/login`
3. Backend verifies credentials
4. Backend creates session and returns JWT token
5. Frontend stores JWT token
6. Frontend uses JWT token for all API requests

## Multi-Device Session Support

Users can now:
- Login from multiple devices simultaneously
- Each device gets its own JWT token
- View all active sessions: `GET /api/v1/auth/sessions`
- Revoke specific sessions: `DELETE /api/v1/auth/sessions/{sessionId}`
- Sessions expire after 7 days

## Breaking Changes

### Removed Features
1. **Manual conversation title updates** - Titles are now auto-generated from first message
2. **Reset conversation endpoint** - Delete and create new conversation instead
3. **Manual conversation creation** - Conversations auto-created on first message

### Changed Response Formats
1. Chat response now includes full message object, not just reply text
2. Messages list is now a direct array, not wrapped in object
3. User object structure changed to match backend schema

## Migration Notes

If you have existing frontend code:

1. **Update all API endpoints** to include `/api/v1` prefix
2. **Update auth flow** to exchange Firebase token for backend JWT
3. **Update message handling**:
   - Change `response.reply` to `response.message.content`
   - Change `response.messages` to direct array
4. **Remove conversation title updates** or make them no-op
5. **Handle conversation auto-creation** on first message
6. **Store backend JWT** instead of Firebase token

## Testing

After these changes:
1. ✅ Firebase/Google sign-in should work and exchange for JWT
2. ✅ Email/password authentication should work
3. ✅ Conversations should load correctly
4. ✅ Messages should send and receive properly
5. ✅ Chat history should persist across sessions
6. ✅ Multi-device login should work
7. ❌ Title updates will be silently skipped (auto-generated)

## Next Steps

1. Test the frontend with the new backend
2. Add email/password registration UI if needed
3. Add session management UI for multi-device support
4. Consider adding user profile editing
5. Add error handling for expired JWT tokens
