@echo off
echo ========================================
echo    TickerTracker with CRYPTO1 Integration
echo ========================================
echo.
echo Starting CRYPTO1 Flask service...
echo.

cd /d "d:\PriyanshiDataQuest1\PriyanshiDataQuest1\PriyanshiDataQuest\CRYPTO1\CRYPTO"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Install required packages if needed
echo 📦 Installing required Python packages...
pip install flask flask-cors requests

echo.
echo 🚀 Starting CRYPTO1 Flask App on http://127.0.0.1:5000
echo 📊 This will provide real-time cryptocurrency data to TickerTracker
echo.
echo ⚠️  Keep this window open - it will serve crypto data to the main app
echo 🔄 The service will automatically cache data for 2 minutes
echo.

python app.py

pause