# CyberBuddy Render Deployment Guide

This guide will help you deploy your CyberBuddy application on Render.

## 🚀 Prerequisites

1. **GitHub Repository**: Your code is already pushed to https://github.com/Sakthi102003/CyberBuddy.git
2. **Render Account**: Sign up at https://render.com if you haven't already
3. **Firebase Service Account**: You have your `serviceAccountKey.json` file

## 📋 Step-by-Step Deployment

### 1. Extract Firebase Service Account Values

Open your `backend/serviceAccountKey.json` file and extract these values:
- `project_id`
- `private_key_id` 
- `private_key` (the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
- `client_email`
- `client_id`
- `client_x509_cert_url`

### 2. Deploy on Render

1. **Login to Render**: Go to https://render.com and sign in
2. **New Service**: Click "New +" → "Blueprint"
3. **Connect Repository**: 
   - Connect your GitHub account
   - Select the `CyberBuddy` repository
   - Use branch: `main`
4. **Name Your Services**: 
   - Backend: `cyberbuddy-backend`
   - Frontend: `cyberbuddy-frontend`

### 3. Configure Environment Variables

In the Render dashboard, go to your **backend service** and add these environment variables:

#### Required Variables:
```
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=cyberbuddy-da99a
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_from_json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_content_here
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your_client_email_from_json
FIREBASE_CLIENT_ID=your_client_id_from_json
FIREBASE_CLIENT_CERT_URL=your_client_cert_url_from_json
```

#### Optional Variables (already set in render.yaml):
```
GEMINI_MODEL=gemini-1.5-flash
MAX_CONCURRENT_CALLS=1
MIN_CALL_INTERVAL_SECONDS=1.5
```

### 4. Deploy Services

1. **Deploy Backend**: Render will automatically build and deploy your backend
2. **Deploy Frontend**: Render will build the frontend and connect it to the backend
3. **Wait for Build**: This usually takes 5-10 minutes

### 5. Update Frontend Configuration

Once deployed, you'll get URLs like:
- Backend: `https://cyberbuddy-backend-xyz.onrender.com`
- Frontend: `https://cyberbuddy-frontend-xyz.onrender.com`

Update your frontend configuration if needed:
1. Check `frontend/src/config.js`
2. Ensure it uses the correct backend URL (Render handles this automatically via environment variables)

### 6. Configure Firebase Frontend

Update your Firebase configuration in `frontend/src/firebase/config.js` to include your production domain in Firebase Console:

1. Go to Firebase Console → Authentication → Settings
2. Add your Render frontend URL to **Authorized Domains**:
   - `cyberbuddy-frontend-xyz.onrender.com`

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt` and `package.json`

2. **Firebase Auth Errors**:
   - Verify all environment variables are set correctly
   - Check that the private key includes the full BEGIN/END lines
   - Ensure no extra spaces or formatting issues

3. **CORS Errors**:
   - Check that frontend is connecting to correct backend URL
   - Verify CORS settings in `backend/main.py`

4. **Environment Variable Issues**:
   - Double-check all Firebase environment variables
   - Ensure private key is properly formatted (watch for line breaks)

## 🌟 Free Tier Limitations

Render free tier includes:
- **Backend**: 512 MB RAM, goes to sleep after 15 minutes of inactivity
- **Frontend**: Static hosting with global CDN
- **Build Time**: 500 build minutes per month

For production use, consider upgrading to paid plans for better performance.

## 🔒 Security Notes

- Never commit `serviceAccountKey.json` to version control (it's in `.gitignore`)
- Environment variables in Render are encrypted and secure
- Use Firebase Console to monitor authentication and usage
- Consider setting up monitoring and alerts

## 📞 Support

If you encounter issues:
1. Check Render build logs
2. Review environment variable settings
3. Test Firebase configuration locally first
4. Check Firebase Console for authentication errors

---

**Happy Deploying! 🚀**

Your CyberBuddy will be live and accessible to users worldwide once deployment is complete.
