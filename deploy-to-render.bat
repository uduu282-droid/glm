@echo off
REM GLM-5 Chat API - Quick Deploy Script for Windows
REM This script helps you deploy to Render in 3 steps

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║      GLM-5 Chat API - Quick Deploy                   ║
echo ╠══════════════════════════════════════════════════════╣
echo ║  This will prepare your code for Render deployment   ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Step 1: Check if Git is installed
echo [Step 1/4] Checking Git installation...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)
echo ✅ Git is installed
echo.

REM Step 2: Initialize Git repository if not already done
echo [Step 2/4] Setting up Git repository...
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)
echo.

REM Step 3: Add all files and commit
echo [Step 3/4] Committing changes...
git add .
git commit -m "GLM-5 Chat API - Ready for Render deployment"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ No changes to commit or commit failed
) else (
    echo ✅ Changes committed successfully
)
echo.

REM Step 4: Display deployment instructions
echo [Step 4/4] Deployment Instructions
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║           NEXT STEPS TO DEPLOY ON RENDER             ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 1. Push your code to GitHub:
echo    git branch -M main
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git push -u origin main
echo.
echo 2. Deploy on Render:
echo    - Go to: https://dashboard.render.com
echo    - Click "New +" ^→ "Web Service"
echo    - Select your repository
echo    - Configure:
echo        * Name: glm-5-chat
echo        * Region: Oregon
echo        * Build Command: pip install -r requirements.txt
echo        * Start Command: python glm_server.py
echo        * Instance Type: Free
echo    - Click "Create Web Service"
echo.
echo 3. Test your deployment:
echo    - Update test_glm_server.py with your Render URL
echo    - Run: python test_glm_server.py --render
echo.
echo ════════════════════════════════════════════════════════
echo.
echo 📖 For detailed instructions, see:
echo    - DEPLOYMENT-GUIDE-COMPLETE.md
echo    - SUMMARY.md
echo.
echo ✅ Your code is ready for deployment!
echo.
pause
