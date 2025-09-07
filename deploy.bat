@echo off
REM Deployment script for Cybersecurity Chatbot (Windows)
echo 🚀 Preparing Cybersecurity Chatbot for deployment...

REM Check if we're in the right directory
if not exist "frontend\package.json" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install frontend dependencies
    exit /b 1
)

REM Build frontend
echo 🔨 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to build frontend
    exit /b 1
)

cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install backend dependencies
    exit /b 1
)

cd ..

REM Install API dependencies (for Vercel)
echo 📦 Installing API dependencies...
cd api
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install API dependencies
    exit /b 1
)

cd ..

echo ✅ Project is ready for deployment!
echo.
echo Next steps:
echo 1. For Vercel:
echo    - Run: vercel
echo    - Set GEMINI_API_KEY environment variable
echo.
echo 2. For Render:
echo    - Push to GitHub
echo    - Connect repository in Render dashboard
echo    - Set GEMINI_API_KEY environment variable
echo.
echo 3. Don't forget to update CORS settings in production!

pause
