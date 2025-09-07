import base64
import hashlib
import json
import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional


class DatabaseManager:
    def __init__(self, db_path: str = "chatbot.db"):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def init_database(self):
        """Initialize the database with required tables."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT,
                    firebase_uid TEXT UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE
                )
            """)
            
            # Chat sessions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_sessions (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """)
            
            # Chat messages table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
                )
            """)
            
            # User sessions table for JWT token management
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    device_info TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """)
            
            # User API keys table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_api_keys (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'claude')),
                    api_key_hash TEXT NOT NULL,
                    masked_key TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                    UNIQUE(user_id, provider)
                )
            """)
            
            conn.commit()
    
    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256."""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash."""
        return self.hash_password(password) == hashed
    
    # User management methods
    def create_user(self, username: str, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Create a new user."""
        try:
            password_hash = self.hash_password(password)
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO users (username, email, password_hash)
                    VALUES (?, ?, ?)
                """, (username, email, password_hash))
                
                user_id = cursor.lastrowid
                conn.commit()
                
                return self.get_user_by_id(user_id)
        except sqlite3.IntegrityError:
            return None  # User already exists
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, username, email, created_at, last_login, is_active
                FROM users WHERE username = ? AND is_active = TRUE
            """, (username,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'created_at': row[3],
                    'last_login': row[4],
                    'is_active': row[5]
                }
            return None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, username, email, created_at, last_login, is_active
                FROM users WHERE id = ? AND is_active = TRUE
            """, (user_id,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'created_at': row[3],
                    'last_login': row[4],
                    'is_active': row[5]
                }
            return None
    
    def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with username and password."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, username, email, password_hash, created_at, last_login, is_active
                FROM users WHERE username = ? AND is_active = TRUE
            """, (username,))
            
            row = cursor.fetchone()
            if row and self.verify_password(password, row[3]):
                # Update last login
                cursor.execute("""
                    UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
                """, (row[0],))
                conn.commit()
                
                return {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'created_at': row[4],
                    'last_login': datetime.now().isoformat(),
                    'is_active': row[6]
                }
            return None
    
    # Session management methods
    def create_session(self, user_id: int, token_hash: str, expires_at: datetime, device_info: str = None) -> bool:
        """Create a new user session."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO user_sessions (user_id, token_hash, expires_at, device_info)
                    VALUES (?, ?, ?, ?)
                """, (user_id, token_hash, expires_at, device_info))
                conn.commit()
                return True
        except:
            return False
    
    def invalidate_session(self, token_hash: str) -> bool:
        """Invalidate a user session."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE user_sessions SET is_active = FALSE WHERE token_hash = ?
                """, (token_hash,))
                conn.commit()
                return cursor.rowcount > 0
        except:
            return False
    
    def is_session_valid(self, token_hash: str) -> bool:
        """Check if a session is valid."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT COUNT(*) FROM user_sessions 
                WHERE token_hash = ? AND is_active = TRUE AND expires_at > CURRENT_TIMESTAMP
            """, (token_hash,))
            
            return cursor.fetchone()[0] > 0
    
    def get_user_by_session(self, token_hash: str) -> Optional[Dict[str, Any]]:
        """Get user by session token."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.id, u.username, u.email, u.created_at, u.last_login, u.is_active
                FROM users u
                JOIN user_sessions s ON u.id = s.user_id
                WHERE s.token_hash = ? AND s.is_active = TRUE AND s.expires_at > CURRENT_TIMESTAMP
            """, (token_hash,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'created_at': row[3],
                    'last_login': row[4],
                    'is_active': row[5]
                }
            return None
    
    # Chat management methods
    def create_chat_session(self, session_id: str, user_id: int, title: str) -> bool:
        """Create a new chat session."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO chat_sessions (id, user_id, title)
                    VALUES (?, ?, ?)
                """, (session_id, user_id, title))
                conn.commit()
                return True
        except:
            return False
    
    def get_user_chat_sessions(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all chat sessions for a user."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, title, created_at, updated_at
                FROM chat_sessions 
                WHERE user_id = ?
                ORDER BY updated_at DESC
            """, (user_id,))
            
            sessions = []
            for row in cursor.fetchall():
                sessions.append({
                    'id': row[0],
                    'title': row[1],
                    'created_at': row[2],
                    'updated_at': row[3]
                })
            return sessions
    
    def update_chat_session_title(self, session_id: str, user_id: int, title: str) -> bool:
        """Update chat session title."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE chat_sessions 
                    SET title = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND user_id = ?
                """, (title, session_id, user_id))
                conn.commit()
                return cursor.rowcount > 0
        except:
            return False
    
    def delete_chat_session(self, session_id: str, user_id: int) -> bool:
        """Delete a chat session and all its messages."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    DELETE FROM chat_sessions WHERE id = ? AND user_id = ?
                """, (session_id, user_id))
                conn.commit()
                return cursor.rowcount > 0
        except:
            return False
    
    def add_chat_message(self, session_id: str, role: str, content: str) -> bool:
        """Add a message to a chat session."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO chat_messages (session_id, role, content)
                    VALUES (?, ?, ?)
                """, (session_id, role, content))
                
                # Update session updated_at
                cursor.execute("""
                    UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
                """, (session_id,))
                
                conn.commit()
                return True
        except:
            return False
    
    def get_chat_messages(self, session_id: str, user_id: int) -> List[Dict[str, Any]]:
        """Get all messages for a chat session."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT m.id, m.role, m.content, m.timestamp
                FROM chat_messages m
                JOIN chat_sessions s ON m.session_id = s.id
                WHERE m.session_id = ? AND s.user_id = ?
                ORDER BY m.timestamp ASC
            """, (session_id, user_id))
            
            messages = []
            for row in cursor.fetchall():
                messages.append({
                    'id': row[0],
                    'role': row[1],
                    'content': row[2],
                    'timestamp': row[3]
                })
            return messages
    
    def clear_chat_messages(self, session_id: str, user_id: int) -> bool:
        """Clear all messages from a chat session."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    DELETE FROM chat_messages 
                    WHERE session_id = ? AND session_id IN (
                        SELECT id FROM chat_sessions WHERE user_id = ?
                    )
                """, (session_id, user_id))
                conn.commit()
                return True
        except:
            return False

    # API Key management methods
    def encrypt_api_key(self, api_key: str) -> str:
        """Simple encryption for API keys (in production, use proper encryption)."""
        return base64.b64encode(api_key.encode()).decode()
    
    def decrypt_api_key(self, encrypted_key: str) -> str:
        """Simple decryption for API keys (in production, use proper encryption)."""
        return base64.b64decode(encrypted_key.encode()).decode()
    
    def mask_api_key(self, api_key: str) -> str:
        """Create a masked version of the API key for display."""
        if len(api_key) <= 8:
            return '*' * len(api_key)
        return api_key[:4] + '*' * (len(api_key) - 8) + api_key[-4:]
    
    def save_user_api_key(self, user_id: int, provider: str, api_key: str) -> bool:
        """Save or update user's API key for a specific provider."""
        try:
            encrypted_key = self.encrypt_api_key(api_key)
            masked_key = self.mask_api_key(api_key)
            
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if key already exists for this user and provider
                cursor.execute("""
                    SELECT id FROM user_api_keys WHERE user_id = ? AND provider = ?
                """, (user_id, provider))
                
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing key
                    cursor.execute("""
                        UPDATE user_api_keys 
                        SET api_key_hash = ?, masked_key = ?, updated_at = CURRENT_TIMESTAMP, is_active = TRUE
                        WHERE user_id = ? AND provider = ?
                    """, (encrypted_key, masked_key, user_id, provider))
                else:
                    # Insert new key
                    cursor.execute("""
                        INSERT INTO user_api_keys (user_id, provider, api_key_hash, masked_key)
                        VALUES (?, ?, ?, ?)
                    """, (user_id, provider, encrypted_key, masked_key))
                
                conn.commit()
                return True
        except Exception as e:
            print(f"Error saving API key: {e}")
            return False
    
    def get_user_api_key(self, user_id: int, provider: str) -> Optional[str]:
        """Get user's API key for a specific provider."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT api_key_hash FROM user_api_keys 
                    WHERE user_id = ? AND provider = ? AND is_active = TRUE
                """, (user_id, provider))
                
                row = cursor.fetchone()
                if row:
                    # Update last used timestamp
                    cursor.execute("""
                        UPDATE user_api_keys SET last_used = CURRENT_TIMESTAMP 
                        WHERE user_id = ? AND provider = ?
                    """, (user_id, provider))
                    conn.commit()
                    
                    return self.decrypt_api_key(row[0])
                return None
        except Exception as e:
            print(f"Error getting API key: {e}")
            return None
    
    def get_user_api_keys_info(self, user_id: int) -> List[Dict[str, Any]]:
        """Get information about user's API keys (without the actual keys)."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT provider, masked_key, is_active, created_at, updated_at, last_used
                FROM user_api_keys 
                WHERE user_id = ?
                ORDER BY provider
            """, (user_id,))
            
            keys = []
            for row in cursor.fetchall():
                keys.append({
                    'provider': row[0],
                    'masked_key': row[1],
                    'is_active': row[2],
                    'created_at': row[3],
                    'updated_at': row[4],
                    'last_used': row[5]
                })
            return keys
    
    def delete_user_api_key(self, user_id: int, provider: str) -> bool:
        """Delete user's API key for a specific provider."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE user_api_keys SET is_active = FALSE 
                    WHERE user_id = ? AND provider = ?
                """, (user_id, provider))
                conn.commit()
                return cursor.rowcount > 0
        except:
            return False

    # Firebase User management methods
    def create_firebase_user(self, username: str, email: str, firebase_uid: str) -> Optional[Dict[str, Any]]:
        """Create a new Firebase user."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO users (username, email, firebase_uid)
                    VALUES (?, ?, ?)
                """, (username, email, firebase_uid))
                
                user_id = cursor.lastrowid
                conn.commit()
                
                return self.get_user_by_id(user_id)
        except sqlite3.IntegrityError:
            return None  # User already exists
    
    def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[Dict[str, Any]]:
        """Get user by Firebase UID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, username, email, firebase_uid, created_at, last_login, is_active
                FROM users WHERE firebase_uid = ? AND is_active = TRUE
            """, (firebase_uid,))
            
            row = cursor.fetchone()
            if row:
                # Update last login
                cursor.execute("""
                    UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
                """, (row[0],))
                conn.commit()
                
                return {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'firebase_uid': row[3],
                    'created_at': row[4],
                    'last_login': datetime.now().isoformat(),
                    'is_active': row[6]
                }
            return None
