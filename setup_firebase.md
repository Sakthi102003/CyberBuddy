# Firebase Setup Instructions

## Method 1: Using Service Account Key File (Recommended for Development)

1. **Get Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project `cyberbuddy-da99a`
   - Go to **Project Settings** (gear icon) → **Service Accounts** tab
   - Click **Generate new private key**
   - Download the JSON file (e.g., `firebase-service-account.json`)

2. **Configure the Backend:**
   - Place the downloaded JSON file in the `backend` folder
   - Update your `.env` file:
     ```
     FIREBASE_SERVICE_ACCOUNT_KEY=firebase-service-account.json
     ```

## Method 2: Using Environment Variables (Recommended for Production)

1. **Extract values from the service account JSON file:**
   ```json
   {
     "type": "service_account",
     "project_id": "cyberbuddy-da99a",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "...",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token"
   }
   ```

2. **Update your `.env` file:**
   ```
   FIREBASE_PROJECT_ID=cyberbuddy-da99a
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@cyberbuddy-da99a.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your_client_id_here
   FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40cyberbuddy-da99a.iam.gserviceaccount.com
   ```

## Security Notes

- **Never commit** the service account JSON file or private keys to version control
- Add `firebase-service-account.json` to your `.gitignore` file
- For production deployment, use environment variables method
- Keep your service account key secure and rotate it periodically

## Testing

After configuration, restart your backend:
```bash
cd backend
python main.py
```

You should see: "Firebase Admin SDK initialized with service account key file" or "Firebase Admin SDK initialized with environment variables"
