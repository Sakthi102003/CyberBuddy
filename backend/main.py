import asyncio
import os
import random
import time
import uuid
from threading import Lock, Semaphore
from typing import Any, Dict, List, Optional

# Switch to Google Gemini
import google.generativeai as genai
# Import our new modules
from database import DatabaseManager
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_auth import get_current_user_firebase as get_current_user
from pydantic import BaseModel

# Load environment variables
load_dotenv()

app = FastAPI(title="Cybersecurity Chatbot API", version="1.0.0")

# Initialize database
db = DatabaseManager()



# Limit concurrency of outbound OpenAI calls to avoid bursts that trigger 429s
MAX_CONCURRENT_CALLS = int(os.getenv("MAX_CONCURRENT_CALLS", "1"))
openai_semaphore = Semaphore(MAX_CONCURRENT_CALLS)

# Enforce a minimal interval between OpenAI calls (RPM pacing)
# Configure via MIN_CALL_INTERVAL_SECONDS, default 1.2s (~50 RPM)
MIN_CALL_INTERVAL_SECONDS = float(os.getenv("MIN_CALL_INTERVAL_SECONDS", "1.2"))
_last_call_time = 0.0
_last_call_lock = Lock()

def pace_openai_calls():
    global _last_call_time
    with _last_call_lock:
        now = time.time()
        elapsed = now - _last_call_time
        if elapsed < MIN_CALL_INTERVAL_SECONDS:
            time.sleep(MIN_CALL_INTERVAL_SECONDS - elapsed)
        _last_call_time = time.time()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cyberbuddy-hzlt.onrender.com",  # Your frontend domain
        "http://localhost:5173",  # Local development
        "http://127.0.0.1:5173",  # Local development
        "*"  # Allow all origins for now (remove in production if needed)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Added PUT and DELETE
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    # Keep a clear error early if key missing
    raise RuntimeError("GEMINI_API_KEY not configured in environment")

genai.configure(api_key=GEMINI_API_KEY)

# Model name can be customized via env
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# Per-user conversation history storage
# Key: (user_id, session_id), Value: list of messages
user_conversations = {}

class ChatMessage(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    reply: str

class ResetResponse(BaseModel):
    message: str

class ChatSessionCreate(BaseModel):
    title: str = "New Chat"

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str

class ChatSessionUpdate(BaseModel):
    title: str

class ResetRequest(BaseModel):
    session_id: str

# System prompt for cybersecurity focus
SYSTEM_PROMPT = """You are a Cybersecurity Chatbot. Only provide information about cybersecurity laws, digital threats, best practices, frameworks, and security tools. 

Your expertise includes:
- Cybersecurity laws and regulations (GDPR, CCPA, HIPAA, SOX, etc.)
- Digital threats (malware, phishing, ransomware, social engineering, etc.)
- Security best practices (password management, network security, data protection, etc.)
- Security frameworks (NIST, ISO 27001, CIS Controls, OWASP, etc.)
- Security tools (firewalls, antivirus, SIEM, vulnerability scanners, etc.)
- Incident response and forensics
- Risk assessment and management
- Compliance and audit requirements

If asked about topics unrelated to cybersecurity, politely decline and redirect the conversation back to cybersecurity topics. Always provide accurate, helpful, and actionable cybersecurity guidance."""

@app.get("/")
async def root():
    return {"message": "Cybersecurity Chatbot API is running"}

# Health check endpoint for Firebase auth
@app.get("/auth/me")
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user information."""
    return {"user": current_user}

# Chat session management endpoints
@app.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session_data: ChatSessionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new chat session."""
    session_id = str(uuid.uuid4())
    
    success = db.create_chat_session(session_id, current_user["id"], session_data.title)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create chat session")
    
    # Add welcome message
    db.add_chat_message(session_id, "assistant", "Hello, I am your Cybersecurity assistant. How can I help you today?")
    
    # Get the created session
    sessions = db.get_user_chat_sessions(current_user["id"])
    for session in sessions:
        if session["id"] == session_id:
            return ChatSessionResponse(**session)
    
    raise HTTPException(status_code=500, detail="Failed to retrieve created session")

@app.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all chat sessions for the current user."""
    sessions = db.get_user_chat_sessions(current_user["id"])
    return [ChatSessionResponse(**session) for session in sessions]

@app.put("/sessions/{session_id}")
async def update_chat_session(
    session_id: str,
    session_data: ChatSessionUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update a chat session."""
    success = db.update_chat_session_title(session_id, current_user["id"], session_data.title)
    if not success:
        raise HTTPException(status_code=404, detail="Chat session not found or access denied")
    
    return {"message": "Chat session updated successfully"}

@app.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a chat session."""
    success = db.delete_chat_session(session_id, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Chat session not found or access denied")
    
    # Clean up conversation history
    conv_key = (current_user["id"], session_id)
    if conv_key in user_conversations:
        del user_conversations[conv_key]
    
    return {"message": "Chat session deleted successfully"}

@app.get("/sessions/{session_id}/messages")
async def get_chat_messages(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all messages for a chat session."""
    messages = db.get_chat_messages(session_id, current_user["id"])
    return {"messages": messages}



@app.post("/chat", response_model=ChatResponse)
async def chat(chat_message: ChatMessage, current_user: Dict[str, Any] = Depends(get_current_user)):
    try:
        user_id = current_user["id"]
        session_id = chat_message.session_id
        
        # Verify session belongs to user
        messages = db.get_chat_messages(session_id, user_id)
        if messages is None:
            raise HTTPException(status_code=404, detail="Chat session not found or access denied")
        
        # Get conversation history for this user and session
        conv_key = (user_id, session_id)
        if conv_key not in user_conversations:
            # Load existing messages from database
            user_conversations[conv_key] = []
            for msg in messages:
                role = "assistant" if msg["role"] == "assistant" else "user"
                user_conversations[conv_key].append({
                    "role": role,
                    "content": msg["content"]
                })
        
        # Add user message to conversation history
        user_conversations[conv_key].append({
            "role": "user",
            "content": chat_message.message
        })
        
        # Save user message to database
        db.add_chat_message(session_id, "user", chat_message.message)
        
        # Use system API key only
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="System API key not configured. Please contact administrator.")
        
        # Call Gemini with pacing + backoff
        retries = 4
        base_delay = 1.0
        max_delay = 8.0
        response_text = None
        for attempt in range(retries):
            try:
                with openai_semaphore:  # reuse semaphore for concurrency limiting
                    pace_openai_calls()  # reuse pacing
                    
                    # Create model with system instruction using system API key
                    model = genai.GenerativeModel(
                        GEMINI_MODEL,
                        system_instruction=SYSTEM_PROMPT
                    )
                    
                    # Convert conversation history to Gemini format
                    gemini_history = []
                    conversation_history = user_conversations[conv_key]
                    for msg in conversation_history[:-1]:  # Exclude the latest message
                        if msg["role"] == "user":
                            gemini_history.append({"role": "user", "parts": [msg["content"]]})
                        elif msg["role"] == "assistant":
                            gemini_history.append({"role": "model", "parts": [msg["content"]]})
                    
                    # Start chat with history
                    chat_session = model.start_chat(history=gemini_history)
                    
                    # Send the latest message
                    resp = chat_session.send_message(chat_message.message)
                    response_text = resp.text.strip() if hasattr(resp, 'text') and resp.text else None
                    
                if not response_text:
                    response_text = "I'm sorry, I couldn't generate a response."
                    
                # Add assistant response to conversation history
                user_conversations[conv_key].append({
                    "role": "assistant", 
                    "content": response_text
                })
                
                # Save assistant response to database
                db.add_chat_message(session_id, "assistant", response_text)
                
                break
            except Exception as e:
                # Retry on transient errors
                if attempt < retries - 1:
                    sleep_for = min(max_delay, base_delay * (2 ** attempt)) * random.uniform(0.5, 1.5)
                    time.sleep(sleep_for)
                    continue
                raise

        return ChatResponse(reply=response_text)
    except Exception as e:
        # Normalize Gemini errors
        msg = str(e)
        if "429" in msg or "rate" in msg.lower():
            raise HTTPException(status_code=429, detail="Gemini API rate limit exceeded")
        if "403" in msg or "invalid" in msg.lower() and "key" in msg.lower():
            raise HTTPException(status_code=400, detail="Invalid API key. Please contact administrator.")
        raise HTTPException(status_code=500, detail=f"Gemini API error: {msg}")

@app.post("/reset", response_model=ResetResponse)
async def reset_conversation(
    reset_request: ResetRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Clear the conversation history for a specific session."""
    user_id = current_user["id"]
    session_id = reset_request.session_id
    
    # Clear from database
    success = db.clear_chat_messages(session_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat session not found or access denied")
    
    # Clear from memory
    conv_key = (user_id, session_id)
    if conv_key in user_conversations:
        del user_conversations[conv_key]
    
    # Add welcome message back
    db.add_chat_message(session_id, "assistant", "Hello, I am your Cybersecurity assistant. How can I help you today?")
    
    return ResetResponse(message="Conversation history cleared successfully.")

@app.get("/history/{session_id}")
async def get_conversation_history(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get the conversation history for a specific session."""
    messages = db.get_chat_messages(session_id, current_user["id"])
    if messages is None:
        raise HTTPException(status_code=404, detail="Chat session not found or access denied")
    
    return {"history": messages, "message_count": len(messages)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="127.0.0.1", port=port)