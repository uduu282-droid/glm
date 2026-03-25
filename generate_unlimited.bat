@echo off
echo ============================================================
echo 🎬 PIXELBIN.IO - UNLIMITED VIDEO GENERATOR
echo ============================================================
echo.
echo This will:
echo 1. Launch fresh browser (incognito, no cookies)
echo 2. Spoof session with random fingerprint
echo 3. Capture your video generation
echo 4. Generate unlimited videos by bypassing rate limits
echo.
echo Usage: generate_unlimited.bat "prompt1" "prompt2" ...
echo.
echo Example: generate_unlimited.bat "A sunset" "A car" "Ocean"
echo.
echo ============================================================
echo.

cd /d "%~dp0"

if "%~1"=="" (
    echo Running with demo prompts...
    echo.
    node pixelbin_unlimited.js
) else (
    node pixelbin_unlimited.js %*
)

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
