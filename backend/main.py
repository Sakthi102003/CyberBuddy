"""
Main FastAPI application using Firebase for multi-device session management
"""
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from config import ALLOWED_ORIGINS, API_PREFIX
from database import init_db, get_db, FirebaseDB
from auth import get_current_user
from chatbot import chatbot_service

# Initialize FastAPI app
app = FastAPI(
    title="CyberBuddy API",
    description="AI-powered chatbot with Firebase multi-device authentication",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str]
    photo_url: Optional[str]
    created_at: datetime


class ConversationResponse(BaseModel):
    id: str
    title: Optional[str]
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageResponse


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize Firestore on startup"""
    init_db()
    print("Firebase Firestore initialized successfully")


# Health check
@app.get("/")
async def root():
    return {
        "message": "CyberBuddy API is running",
        "version": "2.0.0",
        "database": "Firebase Firestore",
        "auth": "Firebase Multi-Device Sessions",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# User endpoints
@app.get(f"{API_PREFIX}/user/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        display_name=current_user.get("display_name"),
        photo_url=current_user.get("photo_url"),
        created_at=current_user["created_at"]
    )


# Chat endpoints
@app.post(f"{API_PREFIX}/chat", response_model=ChatResponse)
async def send_chat_message(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Send a chat message and get AI response"""
    # Get or create conversation
    if chat_request.conversation_id:
        conversation = db.get_conversation(chat_request.conversation_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Verify conversation belongs to user
        if conversation["user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    else:
        # Create new conversation with auto-generated title
        title = chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message
        conversation = db.create_conversation(
            user_id=current_user["id"],
            title=title
        )
    
    # Save user message
    user_message = db.add_message(
        conversation_id=conversation["id"],
        role="user",
        content=chat_request.message
    )
    
    # Get conversation history
    messages = db.get_messages(conversation["id"])
    
    conversation_history = [
        {"role": msg["role"], "content": msg["content"]}
        for msg in messages[:-1]  # Exclude the just-added user message
    ]
    
    # Get AI response
    ai_response = await chatbot_service.get_response(
        chat_request.message,
        conversation_history
    )
    
    # Save AI message
    assistant_message = db.add_message(
        conversation_id=conversation["id"],
        role="assistant",
        content=ai_response
    )
    
    return ChatResponse(
        conversation_id=conversation["id"],
        message=MessageResponse(
            id=assistant_message["id"],
            role=assistant_message["role"],
            content=assistant_message["content"],
            created_at=assistant_message["created_at"]
        )
    )


@app.get(f"{API_PREFIX}/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all conversations for current user"""
    conversations = db.get_user_conversations(current_user["id"])
    
    return [
        ConversationResponse(
            id=conv["id"],
            title=conv.get("title"),
            created_at=conv["created_at"],
            updated_at=conv["updated_at"]
        )
        for conv in conversations
    ]


@app.get(f"{API_PREFIX}/conversations/{{conversation_id}}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all messages in a conversation"""
    # Verify conversation belongs to user
    conversation = db.get_conversation(conversation_id)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if conversation["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get messages
    messages = db.get_messages(conversation_id)
    
    return [
        MessageResponse(
            id=msg["id"],
            role=msg["role"],
            content=msg["content"],
            created_at=msg["created_at"]
        )
        for msg in messages
    ]


@app.delete(f"{API_PREFIX}/conversations/{{conversation_id}}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a conversation"""
    conversation = db.get_conversation(conversation_id)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if conversation["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete_conversation(conversation_id)
    
    return {"message": "Conversation deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
