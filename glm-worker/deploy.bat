@echo off
REM GLM-5 Worker Deployment Script for Windows
REM Automates the entire deployment process

echo ╔══════════════════════════════════════════════════════╗
echo ║     GLM-5 Cloudflare Worker Deployment              ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo.

REM Step 1: Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Step 2: Deploy
echo 🚀 Deploying to Cloudflare Workers...
call npx wrangler deploy

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ╔══════════════════════════════════════════════════════╗
    echo ║          🎉 DEPLOYMENT SUCCESSFUL!                  ║
    echo ╚══════════════════════════════════════════════════════╝
    echo.
    echo Your worker is now live at:
    echo https://glm-worker-proxy.^<your-subdomain^>.workers.dev
    echo.
    echo Next steps:
    echo 1. Test with: node verify.js
    echo 2. Run full tests: node test-worker.js
    echo 3. Use with OpenAI SDK or any HTTP client
    echo.
) else (
    echo.
    echo ❌ Deployment failed. Check the error messages above.
    exit /b 1
)
