@echo off
echo ============================================================
echo 🎬 PIXELBIN.IO VIDEO GENERATOR - FULLY AUTOMATED
echo ============================================================
echo.

cd /d "%~dp0"

echo Running fully automated video generator...
echo.

node pixelbin_fully_automated.js %*

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
