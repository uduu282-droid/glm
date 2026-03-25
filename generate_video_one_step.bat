@echo off
echo ============================================================
echo 🎬 PIXELBIN.IO - ONE-STEP VIDEO GENERATOR
echo ============================================================
echo.
echo This will:
echo   1. Open browser and capture fresh tokens
echo   2. Generate your video automatically  
echo   3. Show you the video URL when ready
echo.
echo ============================================================

cd /d "%~dp0"

if "%~1"=="" (
    echo Usage: %~nx0 "Your prompt here"
    echo Example: %~nx0 "A beautiful sunset over mountains"
    echo.
    pause
    exit /b 1
)

echo.
echo Starting One-Step Video Generator...
echo.

node pixelbin_one_step.js %*

if errorlevel 1 (
    echo.
    echo ============================================================
    echo ⚠️  Video generation did not complete successfully
    echo ============================================================
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo ✅ Done! Your video is ready!
echo ============================================================
pause
