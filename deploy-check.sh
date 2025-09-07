#!/bin/bash

# 🚀 Render Deployment Helper Script
# This script helps prepare your project for Render deployment

echo "🚀 Preparing CyberBuddy for Render Deployment..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root directory."
    exit 1
fi

echo "✅ Found render.yaml"

# Check if backend/.env exists with required variables
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env not found."
    echo "💡 Please create backend/.env with your GEMINI_API_KEY"
    echo "💡 You can copy from backend/.env.example"
    exit 1
fi

echo "✅ Found backend/.env"

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=" backend/.env; then
    echo "❌ Error: GEMINI_API_KEY not found in backend/.env"
    echo "💡 Please add your Gemini API key to backend/.env"
    exit 1
fi

echo "✅ GEMINI_API_KEY configured"

# Check if JWT_SECRET_KEY is set
if ! grep -q "JWT_SECRET_KEY=" backend/.env; then
    echo "❌ Error: JWT_SECRET_KEY not found in backend/.env"
    echo "💡 Please add a JWT secret key to backend/.env"
    exit 1
fi

echo "✅ JWT_SECRET_KEY configured"

# Test backend dependencies
echo "🔍 Checking backend dependencies..."
cd backend
if ! python -c "import fastapi, uvicorn, pydantic, jwt, google.generativeai" 2>/dev/null; then
    echo "❌ Error: Missing backend dependencies"
    echo "💡 Please run: pip install -r requirements.txt"
    cd ..
    exit 1
fi
cd ..

echo "✅ Backend dependencies OK"

# Test frontend dependencies
echo "🔍 Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "❌ Error: Frontend dependencies not installed"
    echo "💡 Please run: npm install"
    cd ..
    exit 1
fi
cd ..

echo "✅ Frontend dependencies OK"

# Check git status
if [ -d ".git" ]; then
    echo "🔍 Checking git status..."
    if ! git diff --quiet || ! git diff --cached --quiet; then
        echo "⚠️  Warning: You have uncommitted changes"
        echo "💡 Consider committing your changes before deployment"
        echo ""
        echo "Uncommitted files:"
        git status --porcelain
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Deployment cancelled"
            exit 1
        fi
    fi
    echo "✅ Git status OK"
else
    echo "⚠️  Warning: Not a git repository"
    echo "💡 You'll need to push your code to GitHub for Render deployment"
fi

echo ""
echo "🎉 Pre-deployment checks complete!"
echo ""
echo "📋 Next Steps for Render Deployment:"
echo "1. 📤 Push your code to GitHub"
echo "2. 🌐 Go to https://dashboard.render.com/"
echo "3. ➕ Click 'New' → 'Blueprint'"
echo "4. 🔗 Connect your GitHub repository"
echo "5. 🔑 Set GEMINI_API_KEY in backend service environment"
echo "6. 🚀 Deploy!"
echo ""
echo "📖 See RENDER_DEPLOYMENT.md for detailed instructions"
echo ""
echo "✨ Your authentication-enabled chatbot will be live soon!"
