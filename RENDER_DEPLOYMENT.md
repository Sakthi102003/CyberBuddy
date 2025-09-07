# 🚀 Render Deployment Guide - Updated for Authentication

This guide provides instructions for deploying your Cybersecurity Chatbot with the new authentication system to Render.

## 🔧 Prerequisites
1. Create a [Render account](https://render.com)
2. Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Push your code to GitHub

## 📦 New Features in This Deployment
- ✅ **User Authentication**: Secure login/signup system
- ✅ **Cross-Device Access**: Users can access chats from any device
- ✅ **Persistent Database**: SQLite database for data storage
- ✅ **JWT Security**: Token-based authentication
- ✅ **Session Management**: Secure session handling

## 🚀 Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add authentication system"
   git push origin main
   ```

2. **Deploy using Blueprint**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file and configure both services

3. **Set Required Environment Variables**:
   After deployment, go to your backend service in the Render dashboard:
   - Go to "Environment" section
   - **Required**: `GEMINI_API_KEY` - Your actual Gemini API key
   - **Auto-Generated**: `JWT_SECRET_KEY` - Render will generate this automatically
   - **Optional**: Other variables are set in render.yaml

### Option 2: Manual Setup

1. **Deploy Backend Service**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `cyber-chatbot-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   
   **Set Environment Variables**:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   JWT_SECRET_KEY=your_secure_random_key_here
   GEMINI_MODEL=gemini-1.5-flash
   MAX_CONCURRENT_CALLS=1
   MIN_CALL_INTERVAL_SECONDS=1.5
   ```

2. **Deploy Frontend Service**:
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `cyber-chatbot-frontend`
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`
   - Set Environment Variable:
     - Key: `VITE_API_URL`
     - Value: Your backend service URL

## 🔒 Security Configuration

### 1. Update CORS for Production:
After deployment, update CORS in `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-name.onrender.com",  # Replace with actual domain
        "http://localhost:5173",  # Keep for local development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

### 2. Database Persistence:
- SQLite database file (`chatbot.db`) will be created automatically
- **Note**: On Render's free tier, the database resets when the service restarts
- For production, consider upgrading to a persistent disk or external database

## 🧪 Testing Your Deployment

### 1. Backend Health Check:
Visit your backend URL:
```
https://cyber-chatbot-backend.onrender.com
```
Should return: `{"message": "Cybersecurity Chatbot API is running"}`

### 2. Authentication Test:
- Visit your frontend URL
- Try creating a new account
- Login and create some chat sessions
- Logout and login again - chats should persist
- Test from different browsers/devices

### 3. API Endpoints Test:
Test these endpoints (replace with your actual backend URL):
```
POST /auth/register - User registration
POST /auth/login - User login
GET /auth/me - Current user info
POST /sessions - Create chat session
GET /sessions - Get user's chat sessions
POST /chat - Send message
```

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication Errors**:
   - Check JWT_SECRET_KEY is set in backend
   - Verify frontend API_BASE_URL points to correct backend
   - Check browser console for CORS errors

2. **Database Issues**:
   - Database resets on free tier service restarts
   - Check logs for SQLite errors
   - Verify database.py imports correctly

3. **Build Failures**:
   - Ensure PyJWT is in requirements.txt
   - Check that all new files are committed to git
   - Verify build commands include `cd backend/frontend`

4. **API Connection Issues**:
   - Verify VITE_API_URL in frontend environment
   - Check network tab in browser dev tools
   - Test backend endpoints directly

### Performance Notes:
- **Cold Starts**: Authentication adds ~1-2 seconds to initial load
- **Database**: SQLite is sufficient for moderate traffic
- **Sessions**: JWT tokens reduce server load
- **Free Tier**: Services sleep after 15 minutes of inactivity

## 📊 Service URLs After Deployment:
- **Backend**: `https://cyber-chatbot-backend.onrender.com`
- **Frontend**: `https://cyber-chatbot-frontend.onrender.com`

## 🎉 What's New for Users:
- 🔐 **Secure Login**: Users create accounts with email/password
- 💾 **Persistent Chats**: All conversations saved permanently
- 📱 **Cross-Device**: Access from phone, tablet, laptop seamlessly
- 🔄 **Session Management**: Automatic login/logout handling
- 🛡️ **Security**: Industry-standard authentication

Your enhanced cybersecurity chatbot with full authentication is now live! 🚀

## 📋 Post-Deployment Checklist:
- [ ] Test user registration/login
- [ ] Verify chat persistence across sessions
- [ ] Test cross-device functionality
- [ ] Check all API endpoints work
- [ ] Monitor authentication logs
- [ ] Update CORS for production domain
- [ ] Set up monitoring/alerts if needed
