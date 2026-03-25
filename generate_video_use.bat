@echo off
echo ============================================================
echo 🎬 PIXELBIN.IO - GENERATE WITH CAPTURED TOKENS
echo ============================================================
echo.

cd /d "%~dp0"

echo Using captured tokens to generate video...
echo.

node pixelbin_use_captured.js %*

if errorlevel 1 (
    echo.
    echo ============================================================
    echo ❌ Failed to generate video
    echo ============================================================
    exit /b 1
)

echo.
echo ============================================================
echo ✅ Done!
echo ============================================================
