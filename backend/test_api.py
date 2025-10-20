"""
Test script to verify backend functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print("Health Check:", response.json())
    return response.status_code == 200

def test_root():
    """Test root endpoint"""
    response = requests.get(BASE_URL)
    print("Root:", response.json())
    return response.status_code == 200

def test_register():
    """Test user registration"""
    data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "display_name": "Test User"
    }
    response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=data)
    print("Register:", response.status_code)
    if response.status_code == 200:
        result = response.json()
        print("  Token:", result["token"][:50] + "...")
        print("  User:", result["user"]["email"])
        return result["token"]
    else:
        print("  Error:", response.text)
        return None

def test_chat(token):
    """Test chat endpoint"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {"message": "Hello, how are you?"}
    response = requests.post(f"{BASE_URL}/api/v1/chat", json=data, headers=headers)
    print("Chat:", response.status_code)
    if response.status_code == 200:
        result = response.json()
        print("  Conversation ID:", result["conversation_id"])
        print("  Response:", result["message"]["content"][:100] + "...")
        return True
    else:
        print("  Error:", response.text)
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("CyberBuddy Backend Test Suite")
    print("=" * 60)
    print()
    
    # Test 1: Health
    print("1. Testing Health Endpoint...")
    test_health()
    print()
    
    # Test 2: Root
    print("2. Testing Root Endpoint...")
    test_root()
    print()
    
    # Test 3: Register
    print("3. Testing User Registration...")
    token = test_register()
    print()
    
    # Test 4: Chat (if registration succeeded)
    if token:
        print("4. Testing Chat Endpoint...")
        test_chat(token)
        print()
    
    print("=" * 60)
    print("Tests Complete!")
    print("=" * 60)
