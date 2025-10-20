# CyberBuddy Backend

A modern, secure backend for the CyberBuddy AI chatbot with Firebase authentication and multi-device session support.

## Features

- 🔐 **Dual Authentication**: Firebase (Google) and Email/Password
- 📱 **Multi-Device Sessions**: Login from multiple devices simultaneously
- 💬 **AI Chatbot**: Powered by Google Gemini AI
- 🗄️ **Persistent Storage**: SQLite database for users, sessions, and chat history
- 🔒 **Secure**: JWT tokens, password hashing, and session management
- 📝 **API Documentation**: Auto-generated OpenAPI/Swagger docs

## Architecture

### Files Overview

- **`config.py`**: Configuration settings (API keys, database, JWT settings)
- **`database.py`**: SQLAlchemy models (User, Session, Conversation, Message)
- **`auth.py`**: Authentication logic (Firebase, JWT, session management)
- **`chatbot.py`**: Google Gemini AI integration
- **`main.py`**: FastAPI application with all API endpoints
- **`run.py`**: Server runner script

### Database Schema

#### Users Table
- Stores user information from both Firebase and email/password auth
- Fields: id, email, display_name, firebase_uid, password_hash, photo_url, etc.

#### Sessions Table
- Supports multiple active sessions per user (multi-device)
- Fields: id, user_id, token, device_info, ip_address, last_activity, expires_at
- Each session has its own JWT token

#### Conversations Table
- Stores chat conversations for each user
- Fields: id, user_id, title, created_at, updated_at

#### Messages Table
- Stores individual messages within conversations
- Fields: id, conversation_id, role (user/assistant), content, created_at

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure you have:
   - `.env` file with `GEMINI_API_KEY`
   - `ServiceAccountKey.json` for Firebase Admin SDK

3. Run the server:
```bash
python run.py
```

The server will start at `http://localhost:8000`

## API Endpoints

### Authentication

- **POST** `/api/v1/auth/firebase` - Login/Register with Firebase
- **POST** `/api/v1/auth/register` - Register with email/password
- **POST** `/api/v1/auth/login` - Login with email/password
- **POST** `/api/v1/auth/logout` - Logout current session
- **GET** `/api/v1/auth/sessions` - Get all active sessions
- **DELETE** `/api/v1/auth/sessions/{session_id}` - Revoke a specific session

### User

- **GET** `/api/v1/user/me` - Get current user information

### Chat

- **POST** `/api/v1/chat` - Send a message and get AI response
- **GET** `/api/v1/conversations` - Get all conversations
- **GET** `/api/v1/conversations/{id}/messages` - Get messages in a conversation
- **DELETE** `/api/v1/conversations/{id}` - Delete a conversation

### Other

- **GET** `/` - Root endpoint (API info)
- **GET** `/health` - Health check
- **GET** `/docs` - Interactive API documentation (Swagger UI)

## Authentication Flow

### Firebase Authentication

1. User signs in with Google on frontend
2. Frontend sends Firebase ID token to `/api/v1/auth/firebase`
3. Backend verifies token with Firebase Admin SDK
4. Backend creates/retrieves user and creates new session
5. Returns JWT token for API access

### Email/Password Authentication

1. **Registration**:
   - User provides email, password, display name
   - Backend hashes password and creates user
   - Creates session and returns JWT token

2. **Login**:
   - User provides email and password
   - Backend verifies credentials
   - Creates new session and returns JWT token

## Multi-Device Session Support

- Each login creates a new session in the database
- Users can have multiple active sessions simultaneously
- Each session has:
  - Unique JWT token
  - Device information (from User-Agent)
  - IP address
  - Last activity timestamp
  - Expiration time (7 days by default)

- Users can view all their active sessions via `/api/v1/auth/sessions`
- Users can revoke specific sessions via `/api/v1/auth/sessions/{session_id}`
- Sessions automatically expire after 7 days of inactivity

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT tokens with expiration
- ✅ Session validation on each request
- ✅ Firebase token verification
- ✅ CORS protection
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Device and IP tracking

## Environment Variables

Required in `.env`:

```
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET_KEY=your_secret_key_change_in_production
DATABASE_URL=sqlite:///./cyberbuddy.db  # Optional, defaults to SQLite
```

## Testing the API

Visit `http://localhost:8000/docs` for interactive API documentation where you can test all endpoints.

### Example: Login with Email

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

### Example: Send Chat Message

```bash
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hello, how are you?"
  }'
```

## Development

The server runs in reload mode by default, so any code changes will automatically restart the server.

## Production Considerations

Before deploying to production:

1. Change `JWT_SECRET_KEY` to a strong, random value
2. Use PostgreSQL instead of SQLite for better concurrency
3. Set up proper CORS origins in `config.py`
4. Enable HTTPS/TLS
5. Set up proper logging and monitoring
6. Consider rate limiting
7. Regular session cleanup for expired sessions

## Troubleshooting

### Firebase Initialization Error
- Ensure `ServiceAccountKey.json` is in the backend directory
- Verify the file has valid Firebase Admin SDK credentials

### Database Errors
- Delete `cyberbuddy.db` to reset the database
- Check file permissions

### API Key Errors
- Verify `GEMINI_API_KEY` is set in `.env`
- Check the API key is valid and has not expired
