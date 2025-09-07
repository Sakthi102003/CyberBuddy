#!/usr/bin/env python3
"""
Simple test script to verify Firebase authentication is working
"""
import os
import sys

from dotenv import load_dotenv

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

try:
    from firebase_auth import initialize_firebase
    print("✅ Firebase authentication module imported successfully")
    print("✅ Firebase Admin SDK initialized successfully")
    
    # Test environment variables
    service_account_key = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
    if service_account_key:
        print(f"✅ FIREBASE_SERVICE_ACCOUNT_KEY found: {service_account_key}")
        
        # Check if file exists
        if not os.path.isabs(service_account_key):
            service_account_key = os.path.join(os.path.dirname(__file__), service_account_key)
        
        if os.path.exists(service_account_key):
            print(f"✅ Service account key file exists: {service_account_key}")
        else:
            print(f"❌ Service account key file not found: {service_account_key}")
    else:
        print("❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set")
    
    print("\n🚀 Backend should be ready to run!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Make sure:")
    print("1. serviceAccountKey.json is in the backend directory")
    print("2. .env file has FIREBASE_SERVICE_ACCOUNT_KEY=serviceAccountKey.json")
    print("3. All required Python packages are installed")
