@echo off
echo ============================================================
echo 🎬 PIXELBIN.IO VIDEO GENERATOR - FINAL WORKING VERSION
echo ============================================================
echo.

cd /d "%~dp0"

if "%~1"=="" (
    echo Usage: %~nx0 "Your prompt here"
    echo Example: %~nx0 "A beautiful sunset over mountains"
    echo.
    pause
    exit /b 1
)

echo Running video generator with prompt: %*
echo.

node pixelbin_final_working.js %*

if errorlevel 1 (
    echo.
    echo ============================================================
    echo ⚠️  Video generation did not complete
    echo ============================================================
    echo.
    echo 💡 TIP: Captcha tokens expire quickly!
    echo Please capture fresh tokens first:
    echo   node pixelbin_capture_exact_format.js
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo ✅ Done! Check the video URL above
echo ============================================================
pause
