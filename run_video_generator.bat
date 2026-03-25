@echo off
REM 🎬 Pixelbin Video Generator - Quick Launcher

echo.
echo ======================================================================
echo 🎬 PIXELBIN-STYLE VIDEO GENERATOR - QUICK START
echo ======================================================================
echo.
echo Choose your mode:
echo.
echo 1. Interactive Mode (Recommended for beginners)
echo 2. Quick CLI (One-command generation)
echo 3. Batch Processing (Multiple videos)
echo 4. Test API Connection
echo 5. View Documentation
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting Interactive Mode...
    node pixelbin_video_generator.js
) else if "%choice%"=="2" (
    echo.
    echo QUICK CLI MODE
    echo.
    set /p prompt="Enter your video description: "
    set /p style="Enter style (leave empty for none): "
    set /p duration="Enter duration in seconds (default: 3): "
    
    if "%style%"=="" (
        if "%duration%"=="" (
            node pixelbin_cli.js "%prompt%"
        ) else (
            node pixelbin_cli.js "%prompt%" --duration=%duration%
        )
    ) else (
        if "%duration%"=="" (
            node pixelbin_cli.js "%prompt%" --style=%style%
        ) else (
            node pixelbin_cli.js "%prompt%" --style=%style% --duration=%duration%
        )
    )
) else if "%choice%"=="3" (
    echo.
    echo BATCH PROCESSING MODE
    echo.
    set /p batch_choice="Run demo (3 preset videos)? (yes/no): "
    
    if /i "%batch-choice%"=="yes" (
        node pixelbin_batch.js --demo --output=batch_results.json
    ) else (
        if exist "batch_config_example.json" (
            echo Using example config...
            node pixelbin_batch.js --config=batch_config_example.json --output=all_videos.json
        ) else (
            echo Config file not found. Create batch_config.json first.
        )
    )
) else if "%choice%"=="4" (
    echo.
    echo TESTING API CONNECTION...
    echo.
    node test_pixelbin_api.js
) else if "%choice%"=="5" (
    echo.
    echo Opening documentation...
    if exist "QUICK_START_VIDEO_GENERATOR.md" (
        start QUICK_START_VIDEO_GENERATOR.md
    ) else if exist "README_PIXELBIN_VIDEO_GENERATOR.md" (
        start README_PIXELBIN_VIDEO_GENERATOR.md
    ) else (
        echo Documentation files not found.
    )
) else (
    echo.
    echo Invalid choice. Please run the script again.
)

echo.
echo ======================================================================
echo Press any key to exit...
pause > nul
