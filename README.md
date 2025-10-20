# 🛡️ CyberBuddy# CyberBuddy - Cybersecurity AI Assistant



> Your AI-powered Cybersecurity AssistantA self-hosted AI-powered cybersecurity chatbot that provides expert guidance on cybersecurity laws, threats, best practices, frameworks, and security tools. Built with Firebase authentication and powered by Google Gemini API.



CyberBuddy is a modern, full-stack chatbot application designed to help users learn about cybersecurity topics, understand security vulnerabilities, and get expert advice on security best practices. Built with React, FastAPI, Firebase, and Google's Gemini AI.## 🛡️ Features



![CyberBuddy Banner](https://img.shields.io/badge/AI-Powered-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Python](https://img.shields.io/badge/python-3.11+-blue) ![React](https://img.shields.io/badge/react-18+-61DAFB)- **Cybersecurity-Focused**: Only responds to cybersecurity-related queries

- **Firebase Authentication**: Secure email/password and Google sign-in

## ✨ Features- **Centralized API Management**: System-level Gemini API key (no user API key management required)

- **Persistent Chat History**: All conversations saved and synchronized

### 🤖 AI-Powered Chat- **Modern UI**: Responsive React-based chat interface with message bubbles

- **Gemini 2.5 Flash** integration for fast, accurate responses- **Enhanced Markdown Support**: Rich text formatting with code blocks, tables, links, and more

- Specialized cybersecurity knowledge base- **Real-time Chat**: Instant messaging with typing indicators and smooth animations

- Context-aware conversations with message history- **Security-First Design**: Built-in XSS protection and content sanitization

- Real-time typing indicators and smooth animations- **Dark/Light Theme**: Automatic theme switching with smooth transitions

- **Multiple Chat Sessions**: Create and manage multiple conversation threads

### 🎨 Modern UI/UX- **Gemini Integration**: Powered by Google's Gemini API for intelligent responses

- **Beautiful Interface** with gradient designs and smooth animations- **Self-Hosted**: Run entirely on your own infrastructure

- **Dark Mode** support with seamless theme switching- **Professional Formatting**: Tables, code syntax highlighting, and structured content display

- **Responsive Design** optimized for desktop and mobile

- **Message Features**:## 🚀 Quick Start

  - Copy-to-clipboard for AI responses

  - Markdown rendering with syntax highlighting### Prerequisites

  - User and bot avatars

  - Message timestamps- Python 3.8 or higher

- Node.js 16 or higher (for frontend development)

### 📁 Smart Chat Management- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

- **Date-based Grouping** (Today, Yesterday, Last 7 Days, Older)- Firebase project with Authentication enabled

- **Message Previews** in sidebar

- **Search Functionality** to find specific chats### Installation

- **Chat Editing** - rename conversations

- **Loading Skeletons** for better UX1. **Clone or download this repository**

   ```bash

### 🔐 Authentication & Security   cd CyberBuddy

- **Firebase Authentication** with Google OAuth   ```

- **Secure Token Management** with ID tokens

- **Protected API Routes** with bearer token validation2. **Set up Firebase**

- **Clock Skew Tolerance** for token verification   - Go to [Firebase Console](https://console.firebase.google.com/)

   - Create a new project or use existing one

### 🎯 Smart Features   - Enable Authentication with Email/Password and Google sign-in

- **Quick Start Questions** - 24+ example cybersecurity questions   - Go to Project Settings → Service Accounts

- **Auto-Ask Feature** - Click example questions for instant answers   - Generate a new private key and download the JSON file

- **Random Question Rotation** - New suggestions on each login   - Place the JSON file as `ServiceAccountKey.json` in the `backend` folder

- **Home Button** - Easy navigation back to welcome screen   - See `docs/setup_firebase.md` for detailed instructions



## 🚀 Quick Start3. **Set up the backend**

   ```bash

### Prerequisites   cd backend

- Python 3.11+   

- Node.js 18+   # Create virtual environment (recommended)

- Firebase account   python -m venv venv

- Google Gemini API key   

   # Activate virtual environment

### Backend Setup   # On Windows:

   venv\Scripts\activate

1. **Navigate to backend directory**   # On macOS/Linux:

```bash   source venv/bin/activate

cd backend   

```   # Install dependencies

   pip install -r requirements.txt

2. **Create virtual environment**   ```

```bash

python -m venv venv4. **Configure environment variables**

venv\Scripts\activate  # Windows   - Create/edit `backend/.env` file:

source venv/bin/activate  # Linux/Mac   ```env

```   GEMINI_API_KEY=your_actual_gemini_api_key_here

   FIREBASE_SERVICE_ACCOUNT_KEY=serviceAccountKey.json

3. **Install dependencies**   ```

```bash

pip install -r requirements.txt5. **Configure Firebase in frontend**

```   - Update `frontend/src/firebase/config.js` with your Firebase project configuration



4. **Configure environment variables**6. **Start the backend server**

Create a `.env` file in the `backend` directory:   ```bash

```env   # Option 1: Direct run

GEMINI_API_KEY=your_gemini_api_key_here   python main.py

```   

   # Option 2: Using the runner script

5. **Add Firebase credentials**   python run_backend.py

Place your `ServiceAccountKey.json` in the `backend` directory (download from Firebase Console)   ```

   The API will be available at `http://127.0.0.1:8000`

6. **Run the backend**

```bash7. **Set up and start the frontend**

python main.py   ```bash

```   cd ../frontend

Backend will run on `http://localhost:8000`   

   # Install dependencies

### Frontend Setup   npm install

   

1. **Navigate to frontend directory**   # Start development server

```bash   npm run dev

cd frontend   ```

```   The frontend will be available at `http://localhost:5173`



2. **Install dependencies**## 📁 Project Structure

```bash

npm install```

```CyberBuddy/

├── backend/

3. **Configure Firebase**│   ├── main.py                    # FastAPI application

Update `frontend/src/firebase/config.js` with your Firebase config│   ├── firebase_auth.py          # Firebase authentication module

│   ├── database.py               # Database management

4. **Run the frontend**│   ├── postgres_db.py            # PostgreSQL database module

```bash│   ├── auth.py                   # Authentication utilities

npm run dev│   ├── run_backend.py            # Backend runner script

```│   ├── requirements.txt          # Python dependencies

Frontend will run on `http://localhost:5173`│   ├── .env                      # Environment variables (API keys)

│   ├── ServiceAccountKey.json    # Firebase service account key

## 📁 Project Structure│   └── chatbot.db                # SQLite database

├── frontend/

```│   ├── index.html                # Main HTML file

CyberBuddy/│   ├── package.json              # Frontend dependencies

├── backend/│   ├── vite.config.js            # Vite configuration

│   ├── main.py              # FastAPI application│   ├── tailwind.config.js        # Tailwind CSS configuration

│   ├── chatbot.py           # Gemini AI integration│   ├── postcss.config.js         # PostCSS configuration

│   ├── auth.py              # Authentication logic│   └── src/

│   ├── database.py          # Firestore operations│       ├── App.jsx               # Main React application

│   ├── config.py            # Configuration settings│       ├── index.jsx             # React entry point

│   └── requirements.txt     # Python dependencies│       ├── index.css             # Global styles

├── frontend/│       ├── config.js             # API configuration

│   ├── src/│       ├── components/

│   │   ├── components/      # React components│       │   ├── Chatbot.jsx            # Main chat interface

│   │   ├── firebase/        # Firebase config│       │   ├── MarkdownRenderer.jsx   # Enhanced markdown parser

│   │   ├── utils/           # API utilities│       │   ├── Sidebar.jsx            # Chat session sidebar

│   │   └── App.jsx          # Main app component│       │   ├── ThemeToggle.jsx        # Theme switching component

│   └── package.json│       │   ├── LoginForm.jsx          # User authentication

└── README.md│       │   ├── UserProfile.jsx        # User profile management

```│       │   ├── ConnectionStatus.jsx   # Connection monitoring

│       │   └── DebugPanel.jsx         # Debug panel component

## 🔧 API Endpoints│       ├── contexts/

│       │   └── ThemeContext.jsx       # Theme state management

### Chat Endpoints│       ├── firebase/

- `POST /api/v1/chat` - Send message and get AI response│       │   ├── auth.js                # Firebase auth functions

- `GET /api/v1/conversations` - Get all user conversations│       │   └── config.js              # Firebase configuration

- `GET /api/v1/conversations/{id}/messages` - Get conversation messages│       ├── hooks/

- `PUT /api/v1/conversations/{id}` - Update conversation title│       │   └── useMediaQuery.js       # Media query hook

- `DELETE /api/v1/conversations/{id}` - Delete conversation│       └── utils/

│           ├── api.js                 # API service functions

## 🎨 Tech Stack│           └── localStorage.js        # Local storage utilities

├── config/

### Frontend│   ├── docker-compose.yml        # Docker Compose configuration

- React 18, Vite, Tailwind CSS, Firebase Auth│   ├── Dockerfile                # Docker container definition

│   ├── render.yaml               # Render deployment config

### Backend│   └── vercel.json               # Vercel deployment config

- FastAPI, Google Gemini AI, Firebase Admin SDK, Uvicorn├── scripts/

│   ├── deploy.sh                 # Unix deployment script

### Database│   ├── deploy.bat                # Windows deployment script

- Firebase Firestore│   ├── deploy-check.sh           # Deployment verification

│   └── start.sh                  # Application start script

## 🔐 Security├── docs/

│   ├── AUTHENTICATION_MIGRATION.md    # Auth migration guide

⚠️ **Before pushing to GitHub:**│   ├── DEPLOYMENT.md                  # Deployment instructions

- ✅ `.env` file is gitignored│   ├── FIREBASE_INTEGRATION.md        # Firebase setup guide

- ✅ `ServiceAccountKey.json` is gitignored│   ├── IMPLEMENTATION_COMPLETE.md     # Implementation notes

- ✅ Never commit API keys or credentials│   ├── INTEGRATION_SUMMARY.md         # Integration overview

│   ├── RENDER_DEPLOYMENT.md           # Render deployment guide

## 📄 License│   ├── RENDER_DEPLOYMENT_GUIDE.md     # Detailed Render guide

│   └── setup_firebase.md              # Firebase setup steps

MIT License - see LICENSE file for details├── .gitignore                    # Git ignore rules

└── README.md                     # This file

---```



**Built with ❤️ for the cybersecurity community**## 🔧 API Endpoints


### Authentication
All endpoints require Firebase authentication token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

### POST /chat
Send a message to the chatbot.

**Request:**
```json
{
  "message": "What are the key principles of GDPR?",
  "session_id": "session-uuid-here"
}
```

**Response:**
```json
{
  "reply": "The General Data Protection Regulation (GDPR) is built on several key principles..."
}
```

### GET /sessions
Get all chat sessions for the authenticated user.

**Response:**
```json
[
  {
    "id": "session-uuid",
    "title": "GDPR Compliance",
    "created_at": "2025-01-01T12:00:00Z",
    "updated_at": "2025-01-01T12:30:00Z"
  }
]
```

### POST /sessions
Create a new chat session.

**Request:**
```json
{
  "title": "New Security Discussion"
}
```

### GET /sessions/{session_id}/messages
Get all messages for a specific session.

### PUT /sessions/{session_id}
Update a session title.

### DELETE /sessions/{session_id}
Delete a chat session.

### GET /
Health check endpoint.

**Response:**
```json
{
  "message": "Cybersecurity Chatbot API is running"
}
```

## 💬 Example Questions

The chatbot can help with:

- **Laws & Regulations**: "What are the key requirements of HIPAA?", "Explain GDPR compliance"
- **Threats & Attacks**: "How do ransomware attacks work?", "What is social engineering?"
- **Best Practices**: "Password security guidelines", "Network security best practices"
- **Frameworks**: "Explain the NIST Cybersecurity Framework", "What is ISO 27001?"
- **Security Tools**: "What is a SIEM system?", "Types of vulnerability scanners"
- **Incident Response**: "Steps for incident response", "How to handle a data breach"

### 📝 Rich Response Formatting

The chatbot now supports enhanced markdown formatting in responses:

- **Headers**: `# H1`, `## H2`, `### H3` etc.
- **Lists**: Bulleted (`-`, `*`) and numbered (`1.`, `2.`) lists with nesting
- **Code Blocks**: 
  ```python
  # Example vulnerability check
  def check_sql_injection(input_string):
      return validate_input(input_string)
  ```
- **Inline Code**: Use `backticks` for commands and variables
- **Tables**: 
  | Threat Level | Response Time | Actions |
  |--------------|---------------|---------|
  | Critical     | < 1 hour      | Immediate containment |
  | High         | < 4 hours     | Priority response |
- **Links**: [Security Resources](https://example.com)
- **Blockquotes**: 
  > "Security is not a product, but a process" - Bruce Schneier
- **Text Formatting**: **bold**, *italic*, ~~strikethrough~~

## 🛠️ Customization

### Modifying the System Prompt
Edit the `SYSTEM_PROMPT` variable in `backend/main.py` to customize the chatbot's behavior and expertise areas.

### Styling the Frontend
- **Themes**: The app supports both light and dark themes with automatic detection
- **Tailwind CSS**: Modify `tailwind.config.js` for custom styling
- **Components**: Edit individual React components in `src/components/`
- **Global Styles**: Update `src/index.css` for app-wide style changes

### Enhancing the Markdown Renderer
The `MarkdownRenderer` component can be extended to support additional formatting:
- Custom syntax highlighting for specific languages
- Enhanced table features (sorting, filtering)
- Interactive elements (collapsible sections, tabs)
- Integration with security-specific formatting (CVE links, threat indicators)

### Adding Features
- **Message History**: Store conversations in a database
- **User Authentication**: Add login/registration (components already included)
- **File Uploads**: Allow users to upload security documents for analysis
- **Multi-language Support**: Add internationalization
- **Export Functionality**: Export chat sessions as PDF or markdown files
- **Integration APIs**: Connect with security tools (SIEM, vulnerability scanners)

## 🔒 Security Considerations

- **API Key Security**: System API key is stored securely on the server - users cannot access it
- **Firebase Authentication**: Secure token-based authentication with automatic token refresh
- **No User API Keys**: Centralized API key management prevents unauthorized usage
- **CORS Configuration**: In production, restrict CORS origins to your frontend domain
- **Rate Limiting**: Consider implementing rate limiting for the API
- **Input Validation**: The system validates and sanitizes user inputs
- **XSS Protection**: Enhanced MarkdownRenderer includes built-in XSS prevention
- **Content Sanitization**: All user inputs and AI responses are sanitized
- **HTTPS**: Use HTTPS in production environments
- **Service Account Security**: Firebase service account key should be kept secure and not committed to version control
- **CSP Headers**: Implement Content Security Policy for additional protection
- **Data Privacy**: Consider implementing data retention policies for chat history

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to authenticate user" error**
   - Ensure Firebase is properly configured in both frontend and backend
   - Check that the Firebase service account key is in the correct location
   - Verify the user is logged in and has a valid Firebase token
   - Check the browser console for Firebase authentication errors

2. **"Failed to fetch" error**
   - Ensure the backend server is running on `http://127.0.0.1:8000`
   - Check that there are no firewall restrictions
   - Verify the frontend is making requests to the correct backend URL

3. **Firebase configuration errors**
   - Verify your Firebase project configuration in `frontend/src/firebase/config.js`
   - Ensure Authentication is enabled in Firebase Console
   - Check that the service account key file exists and is valid

4. **"Invalid Gemini API key" error**
   - Verify your API key in the `.env` file
   - Ensure your Gemini API key is active and has the necessary permissions
   - Contact administrator if you're a user (you cannot set your own API key)

5. **CORS errors**
   - The backend is configured to allow all origins for development
   - In production, update the CORS settings in `main.py`

6. **Dependencies issues**
   - **Backend**: Make sure you're using Python 3.8+
   - **Frontend**: Ensure Node.js 16+ is installed
   - Try upgrading package managers: `pip install --upgrade pip` and `npm update`
   - Install dependencies in a virtual environment for Python

### Logs and Debugging

- Backend logs are displayed in the terminal where you run `python main.py`
- Frontend errors can be seen in the browser's developer console (F12)
- API responses include detailed error messages
- React development server provides hot-reload and error overlay
- Use browser dev tools to inspect network requests and component state
- Check the Console tab for JavaScript errors and warnings

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the error messages in the console/logs
3. Ensure all prerequisites are met
4. Verify your Gemini API key is valid and has the necessary permissions

---

**Note**: This chatbot is designed specifically for cybersecurity topics. It will politely decline to answer questions outside of its expertise area and redirect users back to cybersecurity-related topics. The system uses centralized API key management for security and cost control - users authenticate through Firebase but don't need to provide their own API keys.