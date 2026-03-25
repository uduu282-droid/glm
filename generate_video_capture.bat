@echo off
echo ============================================================
echo 🎬 PIXELBIN.IO - CAPTURE TOKENS
echo ============================================================
echo.
echo This will open a browser and capture authentication tokens.
echo 1. Wait for browser to open
echo 2. Go to pixelbin.io
echo 3. Enter a prompt and click Generate
echo 4. Tokens will be captured automatically
echo.
echo Press any key to continue...
pause > nul

cd /d "%~dp0"

node pixelbin_capture_exact_format.js

echo.
echo ============================================================
echo ✅ Capture complete!
echo ============================================================
echo.
echo Now run: generate_video_use.bat
echo.
