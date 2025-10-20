#!/bin/bash

# Deployment script for Cybersecurity Chatbot
echo "🚀 Preparing Cybersecurity Chatbot for deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install frontend dependencies"
    exit 1
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build frontend"
    exit 1
fi

cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install backend dependencies"
    exit 1
fi

cd ..

# Install API dependencies (for Vercel)
echo "📦 Installing API dependencies..."
cd api
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install API dependencies"
    exit 1
fi

cd ..

echo "✅ Project is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. For Vercel:"
echo "   - Run: vercel"
echo "   - Set GEMINI_API_KEY environment variable"
echo ""
echo "2. For Render:"
echo "   - Push to GitHub"
echo "   - Connect repository in Render dashboard"
echo "   - Set GEMINI_API_KEY environment variable"
echo ""
echo "3. Don't forget to update CORS settings in production!"
