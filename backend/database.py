"""
Firebase Firestore database management
Multi-device sessions handled natively by Firebase Auth
"""
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from datetime import datetime
from config import FIREBASE_CREDENTIALS_PATH
from typing import Optional, List, Dict
import uuid

# Initialize Firebase Admin
try:
    if FIREBASE_CREDENTIALS_PATH.exists():
        cred = credentials.Certificate(str(FIREBASE_CREDENTIALS_PATH))
        firebase_admin.initialize_app(cred)
        print("Firebase Admin initialized successfully")
    else:
        print(f"Warning: Firebase credentials file not found at {FIREBASE_CREDENTIALS_PATH}")
except Exception as e:
    print(f"Warning: Firebase initialization failed: {e}")

# Get Firestore client
db = firestore.client()

# Collection names
USERS_COLLECTION = "users"
CONVERSATIONS_COLLECTION = "conversations"
MESSAGES_COLLECTION = "messages"


class FirebaseDB:
    """Firestore database operations"""
    
    @staticmethod
    def get_or_create_user(firebase_uid: str, email: str, display_name: Optional[str] = None, photo_url: Optional[str] = None) -> Dict:
        """Get or create user in Firestore"""
        user_ref = db.collection(USERS_COLLECTION).document(firebase_uid)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            return user_doc.to_dict()
        
        # Create new user
        user_data = {
            "id": firebase_uid,
            "email": email,
            "display_name": display_name or email.split("@")[0],
            "photo_url": photo_url,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        user_ref.set(user_data)
        return user_data
    
    @staticmethod
    def get_user(firebase_uid: str) -> Optional[Dict]:
        """Get user from Firestore"""
        user_ref = db.collection(USERS_COLLECTION).document(firebase_uid)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            return user_doc.to_dict()
        return None
    
    @staticmethod
    def create_conversation(user_id: str, title: Optional[str] = None) -> Dict:
        """Create a new conversation"""
        conversation_id = str(uuid.uuid4())
        conversation_ref = db.collection(CONVERSATIONS_COLLECTION).document(conversation_id)
        
        conversation_data = {
            "id": conversation_id,
            "user_id": user_id,
            "title": title or "New Chat",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        conversation_ref.set(conversation_data)
        return conversation_data
    
    @staticmethod
    def get_conversation(conversation_id: str) -> Optional[Dict]:
        """Get a conversation by ID"""
        conv_ref = db.collection(CONVERSATIONS_COLLECTION).document(conversation_id)
        conv_doc = conv_ref.get()
        
        if conv_doc.exists:
            return conv_doc.to_dict()
        return None
    
    @staticmethod
    def get_user_conversations(user_id: str) -> List[Dict]:
        """Get all conversations for a user - simplified to avoid index requirement"""
        conversations = db.collection(CONVERSATIONS_COLLECTION)\
            .where("user_id", "==", user_id)\
            .stream()
        
        # Convert to list and sort in Python instead of Firestore to avoid index requirement
        conv_list = [conv.to_dict() for conv in conversations]
        # Sort by updated_at in descending order (most recent first)
        conv_list.sort(key=lambda x: x.get('updated_at', datetime.min), reverse=True)
        return conv_list
    
    @staticmethod
    def update_conversation(conversation_id: str, title: Optional[str] = None) -> bool:
        """Update conversation title and timestamp"""
        conv_ref = db.collection(CONVERSATIONS_COLLECTION).document(conversation_id)
        
        update_data = {
            "updated_at": datetime.utcnow()
        }
        if title:
            update_data["title"] = title
        
        conv_ref.update(update_data)
        return True
    
    @staticmethod
    def delete_conversation(conversation_id: str) -> bool:
        """Delete a conversation and all its messages"""
        # Delete all messages in the conversation
        messages = db.collection(CONVERSATIONS_COLLECTION)\
            .document(conversation_id)\
            .collection(MESSAGES_COLLECTION)\
            .stream()
        
        for msg in messages:
            msg.reference.delete()
        
        # Delete the conversation
        db.collection(CONVERSATIONS_COLLECTION).document(conversation_id).delete()
        return True
    
    @staticmethod
    def add_message(conversation_id: str, role: str, content: str) -> Dict:
        """Add a message to a conversation"""
        message_id = str(uuid.uuid4())
        message_ref = db.collection(CONVERSATIONS_COLLECTION)\
            .document(conversation_id)\
            .collection(MESSAGES_COLLECTION)\
            .document(message_id)
        
        message_data = {
            "id": message_id,
            "role": role,
            "content": content,
            "created_at": datetime.utcnow()
        }
        message_ref.set(message_data)
        
        # Update conversation timestamp
        FirebaseDB.update_conversation(conversation_id)
        
        return message_data
    
    @staticmethod
    def get_messages(conversation_id: str) -> List[Dict]:
        """Get all messages in a conversation"""
        messages = db.collection(CONVERSATIONS_COLLECTION)\
            .document(conversation_id)\
            .collection(MESSAGES_COLLECTION)\
            .order_by("created_at")\
            .stream()
        
        return [msg.to_dict() for msg in messages]
    
    @staticmethod
    def verify_token(id_token: str) -> Dict:
        """Verify Firebase ID token with clock skew tolerance"""
        try:
            # Add 60 seconds of clock skew tolerance
            decoded_token = firebase_auth.verify_id_token(id_token, check_revoked=False, clock_skew_seconds=60)
            return decoded_token
        except Exception as e:
            raise ValueError(f"Invalid token: {str(e)}")


# Initialize database (no-op for Firestore, but kept for compatibility)
def init_db():
    """Initialize Firestore (already initialized with Firebase Admin)"""
    print("Firestore database ready")


# Dependency for getting database instance
def get_db():
    """Get Firestore database instance"""
    return FirebaseDB
