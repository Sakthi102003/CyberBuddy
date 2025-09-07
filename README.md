# CyberBuddy - Cybersecurity AI Assistant

A self-hosted AI-powered cybersecurity chatbot that provides expert guidance on cybersecurity laws, threats, best practices, frameworks, and security tools. Built with Firebase authentication and powered by Google Gemini API.

## 🛡️ Features

- **Cybersecurity-Focused**: Only responds to cybersecurity-related queries
- **Firebase Authentication**: Secure email/password and Google sign-in
- **Centralized API Management**: System-level Gemini API key (no user API key management required)
- **Persistent Chat History**: All conversations saved and synchronized
- **Modern UI**: Responsive React-based chat interface with message bubbles
- **Enhanced Markdown Support**: Rich text formatting with code blocks, tables, links, and more
- **Real-time Chat**: Instant messaging with typing indicators and smooth animations
- **Security-First Design**: Built-in XSS protection and content sanitization
- **Dark/Light Theme**: Automatic theme switching with smooth transitions
- **Multiple Chat Sessions**: Create and manage multiple conversation threads
- **Gemini Integration**: Powered by Google's Gemini API for intelligent responses
- **Self-Hosted**: Run entirely on your own infrastructure
- **Professional Formatting**: Tables, code syntax highlighting, and structured content display

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher (for frontend development)
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Firebase project with Authentication enabled

### Installation

1. **Clone or download this repository**
   ```bash
   cd CyberBuddy
   ```

2. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Authentication with Email/Password and Google sign-in
   - Go to Project Settings → Service Accounts
   - Generate a new private key and download the JSON file
   - Place the JSON file as `serviceAccountKey.json` in the `backend` folder

3. **Set up the backend**
   ```bash
   cd backend
   
   # Create virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   - Create/edit `backend/.env` file:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   FIREBASE_SERVICE_ACCOUNT_KEY=serviceAccountKey.json
   ```

5. **Configure Firebase in frontend**
   - Update `frontend/src/firebase/config.js` with your Firebase project configuration

6. **Start the backend server**
   ```bash
   python main.py
   ```
   The API will be available at `http://127.0.0.1:8000`

7. **Set up and start the frontend**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
CyberBuddy/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── firebase_auth.py          # Firebase authentication module
│   ├── database.py               # Database management
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables (API keys)
│   ├── serviceAccountKey.json    # Firebase service account key
│   └── chatbot.db               # SQLite database
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   └── src/
│       ├── App.jsx              # Main React application
│       ├── index.jsx            # React entry point
│       ├── index.css            # Global styles
│       ├── config.js            # API configuration
│       ├── components/
│       │   ├── Chatbot.jsx            # Main chat interface
│       │   ├── MarkdownRenderer.jsx   # Enhanced markdown parser
│       │   ├── Sidebar.jsx            # Chat session sidebar
│       │   ├── ThemeToggle.jsx        # Theme switching component
│       │   ├── LoginForm.jsx          # User authentication
│       │   └── UserProfile.jsx        # User profile management
│       ├── contexts/
│       │   └── ThemeContext.jsx       # Theme state management
│       ├── firebase/
│       │   ├── auth.js                # Firebase auth functions
│       │   └── config.js              # Firebase configuration
│       └── utils/
│           ├── api.js                 # API service functions
│           └── localStorage.js        # Local storage utilities
├── setup_firebase.md            # Firebase setup instructions
└── README.md                    # This file
```

## 🔧 API Endpoints

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