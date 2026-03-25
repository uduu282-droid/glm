@echo off
echo ============================================================
echo 🎬 PIXELBIN.IO - DIRECT API GENERATOR (NO BROWSER!)
echo ============================================================
echo.
echo Usage:
echo   generate_direct.bat "Your prompt here"
echo.
echo Example:
echo   generate_direct.bat "A beautiful sunset"
echo.
echo This will:
echo 1. Use captured endpoint data
echo 2. Spoof fresh session for each video
echo 3. Generate unlimited videos (bypasses rate limits)
echo 4. No browser needed!
echo.
echo ============================================================
echo.

cd /d "%~dp0"

if "%~1"=="" (
    echo No prompt provided!
    echo.
    echo Usage: generate_direct.bat "Your prompt"
    echo.
    exit /b 1
)

node pixelbin_direct.js %*

if errorlevel 1 (
    echo.
    echo ============================================================
    echo ❌ Failed
    echo ============================================================
    exit /b 1
)

echo.
echo ============================================================
echo ✅ Done!
echo ============================================================
