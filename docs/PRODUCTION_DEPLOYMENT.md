# 🚀 Production Deployment Guide - CyberBuddy

Complete guide to deploy CyberBuddy (Firebase + Gemini AI) to Render.com

## ⚡ Quick Start

**Current Issue:** Render deployment needs Firebase credentials as environment variable

**Solution Steps:**
1. Get Firebase Service Account JSON
2. Minify JSON to single line
3. Set as `FIREBASE_CREDENTIALS_JSON` environment variable on Render
4. Deploy!

---

## 🔐 Step 1: Prepare Firebase Credentials

### Get Service Account JSON

1. [Firebase Console](https://console.firebase.google.com/) → Your Project
2. ⚙️ **Project Settings** → **Service Accounts**
3. Click **"Generate New Private Key"**
4. Download JSON file

### Minify JSON (PowerShell)

```powershell
# Load and compress JSON
$json = Get-Content ".\ServiceAccountKey.json" -Raw | ConvertFrom-Json
$minified = $json | ConvertTo-Json -Compress -Depth 100

# Copy to clipboard
$minified | Set-Clipboard
Write-Host "✅ Copied to clipboard!" -ForegroundColor Green
```

Result example:
```json
{"type":"service_account","project_id":"your-project","private_key":"-----BEGIN PRIVATE KEY-----\nKEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"...@iam.gserviceaccount.com",...}
```

⚠️ **Keep the `\n` characters in private_key!**

---

## 🖥️ Step 2: Deploy Backend to Render

### Create Web Service

1. [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service**
2. Connect GitHub → Select **CyberBuddy** repo

### Configuration

```
Name: cyberbuddy-backend
Environment: Python 3
Region: Oregon (US West)
Branch: main
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: python main.py
```

### Environment Variables

Add these in **Environment** tab:

**GEMINI_API_KEY**
```
your_api_key_from_google_ai_studio
```

**FIREBASE_CREDENTIALS_JSON**
```
{"type":"service_account","project_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}
```
(Paste your minified JSON from Step 1)

**PYTHON_VERSION** (optional)
```
3.11.0
```

### Deploy

Click **"Create Web Service"** → Wait 2-5 minutes

**Test:** Visit `https://cyberbuddy-backend.onrender.com`

Should show: `{"message": "Cybersecurity Chatbot API is running"}`

✅ **Backend deployed!**

---

## 🌐 Step 3: Deploy Frontend

### Option A: Vercel (Recommended ⚡)

**Pros:** Faster, better for React, instant CDN

```powershell
# Install CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

**Configure Environment:**
1. [Vercel Dashboard](https://vercel.com/dashboard) → Your Project
2. **Settings** → **Environment Variables**
3. Add:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://cyberbuddy-backend.onrender.com` (your backend URL)
4. **Redeploy** from Deployments tab

### Option B: Render Static Site

1. Dashboard → **New +** → **Static Site**
2. Connect CyberBuddy repo

```
Name: cyberbuddy-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

**Environment Variable:**
```
VITE_API_BASE_URL=https://cyberbuddy-backend.onrender.com
```

---

## 🔒 Step 4: Security Configuration

### Update CORS (backend/main.py)

```python
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://cyberbuddy-xxx.vercel.app",  # Your Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```powershell
git add backend/main.py
git commit -m "Add production CORS"
git push origin main
```

### Firebase Authorized Domains

1. [Firebase Console](https://console.firebase.google.com/) → **Authentication**
2. **Settings** → **Authorized domains**
3. Add:
   - `cyberbuddy-backend.onrender.com`
   - `cyberbuddy-xxx.vercel.app`

---

## ✅ Step 5: Test Deployment

### Backend Test
```powershell
curl https://cyberbuddy-backend.onrender.com
```

### Frontend Test
1. Open your frontend URL
2. Sign in with Google
3. Ask a question
4. Create multiple chats
5. Verify persistence

---

## 🐛 Troubleshooting

### ❌ "Firebase app does not exist"

**Fix:**
1. Render → Backend → **Environment**
2. Verify `FIREBASE_CREDENTIALS_JSON` exists and is valid
3. Check JSON has `\n` in private_key
4. **Manual Deploy** → **Clear build cache & deploy**

### ❌ CORS Error

**Fix:**
1. Add frontend URL to `ALLOWED_ORIGINS` in backend/main.py
2. Push to GitHub
3. Clear browser cache (Ctrl+Shift+Delete)

### ❌ Authentication Fails

**Fix:**
1. Check Firebase authorized domains
2. Clear browser cookies
3. Retry sign-in

### ⏱️ Slow First Request

**Normal on free tier** - Services sleep after 15 min

- First request: ~30 seconds
- Subsequent: <1 second
- **Upgrade to $7/month** for always-on

---

## 💰 Cost Summary

### Free Tier

**Render:**
- 750 hours/month compute
- Auto-sleep after 15 min
- ✅ Perfect for demo/testing

**Firebase:**
- 50K reads/day
- 20K writes/day
- 1 GB storage
- ✅ Generous for small apps

**Gemini API:**
- 15 requests/min
- Check [pricing](https://ai.google.dev/pricing)

### Paid Upgrade
- Render: $7/month (always-on)
- Firebase: Pay-as-you-go
- Monitor usage to avoid surprises

---

## 🔄 Auto-Deploy

Configured! Just push to GitHub:

```powershell
git add .
git commit -m "Update feature"
git push origin main
```

Render and Vercel auto-detect and redeploy.

---

## 📋 Launch Checklist

- [ ] Backend deployed and responding
- [ ] Frontend deployed and loading
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Firebase domains authorized
- [ ] Google sign-in working
- [ ] Chats creating and saving
- [ ] Mobile responsive
- [ ] No console errors

---

## 🎉 You're Live!

**Frontend:** `https://cyberbuddy-xxx.vercel.app`  
**Backend:** `https://cyberbuddy-backend.onrender.com`

### Next Steps
- Custom domain (optional)
- Analytics (Google Analytics)
- Error monitoring (Sentry)
- Regular backups

---

## 📚 Resources

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API](https://ai.google.dev/docs)

---

**🚀 Congratulations! CyberBuddy is deployed! 🔐🤖**

Need help? Check logs first:
- **Render:** Dashboard → Service → Logs
- **Browser:** F12 → Console/Network tabs
