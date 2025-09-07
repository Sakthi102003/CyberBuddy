# Deployment Guide

This guide provides instructions for deploying your Cybersecurity Chatbot to either Vercel or Render.

## Option 1: Deploy to Vercel (Recommended)

Vercel is excellent for React applications and provides seamless serverless Python functions.

### Prerequisites
1. Create a [Vercel account](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`
3. Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Steps

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub** (recommended):
   - Create a new repository on GitHub
   - Push your code to the repository

3. **Deploy via Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the `vercel.json` configuration

4. **Set Environment Variables**:
   - In your Vercel project dashboard, go to "Settings" → "Environment Variables"
   - Add: `GEMINI_API_KEY` with your actual API key
   - Make sure to enable it for all environments (Production, Preview, Development)

5. **Deploy**:
   - Click "Deploy" or push changes to your repository
   - Vercel will automatically build and deploy your application

### Alternative: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy (run from project root)
vercel

# Set environment variable
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

---

## Option 2: Deploy to Render

Render provides straightforward deployment for both frontend and backend services.

### Prerequisites
1. Create a [Render account](https://render.com)
2. Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Steps

1. **Push to GitHub**:
   - Create a new repository on GitHub
   - Push your code to the repository

2. **Deploy Backend**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `cyber-chatbot-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Set Environment Variable:
     - Key: `GEMINI_API_KEY`
     - Value: Your actual Gemini API key
   - Deploy

3. **Deploy Frontend**:
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `cyber-chatbot-frontend`
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`
   - Set Environment Variable:
     - Key: `VITE_API_URL`
     - Value: Your backend service URL (e.g., `https://cyber-chatbot-backend.onrender.com`)
   - Deploy

### Alternative: Deploy using render.yaml

If you use the included `render.yaml` file, you can deploy both services at once:

1. Go to Render Dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically configure both services based on `render.yaml`
5. Set the `GEMINI_API_KEY` environment variable for the backend service

---

## Post-Deployment Configuration

### Update CORS Settings (Important for Production)

After deployment, update the CORS settings in your backend to only allow your frontend domain:

**For Vercel deployment**, update `api/index.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app-name.vercel.app"],  # Replace with your actual domain
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

**For Render deployment**, update `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-name.onrender.com"],  # Replace with your actual domain
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### Environment Variables Needed

- **GEMINI_API_KEY**: Your Google Gemini API key (required)
- **GEMINI_MODEL**: Model to use (optional, defaults to "gemini-1.5-flash")
- **MAX_CONCURRENT_CALLS**: Maximum concurrent API calls (optional, defaults to 1)
- **MIN_CALL_INTERVAL_SECONDS**: Minimum interval between calls (optional, defaults to 1.2)

---

## Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Verify your Gemini API key is correct
   - Check that the environment variable is properly set in your deployment platform
   - Ensure the API key has the necessary permissions

2. **CORS Errors**:
   - Update the CORS settings to include your frontend domain
   - Make sure the backend is accessible from your frontend URL

3. **Build Failures**:
   - Check that all dependencies are listed in `requirements.txt` and `package.json`
   - Verify Node.js and Python versions are compatible
   - Check build logs for specific error messages

4. **API Route Not Working**:
   - Ensure the API routes are properly configured in `vercel.json` or `render.yaml`
   - Check that the backend is responding at the expected endpoints

### Testing Your Deployment

1. **Check API Health**:
   - Visit `https://your-domain.com/api/` (should return a JSON message)

2. **Test Chat Functionality**:
   - Send a cybersecurity-related question through the chat interface
   - Verify responses are generated correctly

3. **Monitor Logs**:
   - **Vercel**: Check function logs in the Vercel dashboard
   - **Render**: Check service logs in the Render dashboard

---

## Performance Considerations

1. **Cold Starts**: Serverless functions may have cold start delays
2. **Rate Limiting**: Gemini API has rate limits - the app includes built-in pacing
3. **Memory Usage**: Monitor memory usage, especially with conversation history
4. **Database**: Consider adding a database for persistent conversation storage

---

## Security Best Practices

1. **Environment Variables**: Never commit API keys to your repository
2. **CORS**: Restrict CORS to your specific domain in production
3. **Rate Limiting**: Implement additional rate limiting if needed
4. **HTTPS**: Both Vercel and Render provide HTTPS by default
5. **Input Validation**: The app includes input validation and sanitization

---

Your cybersecurity chatbot should now be successfully deployed and accessible to users worldwide! 🚀
