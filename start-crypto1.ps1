# TickerTracker with CRYPTO1 Integration Startup Script
Write-Host "========================================" -ForegroundColor Blue
Write-Host "   TickerTracker with CRYPTO1 Integration" -ForegroundColor Blue  
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Starting CRYPTO1 Flask service..." -ForegroundColor Green
Write-Host ""

Set-Location "d:\PriyanshiDataQuest1\PriyanshiDataQuest1\PriyanshiDataQuest\CRYPTO1\CRYPTO"

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python and try again" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install required packages if needed
Write-Host "📦 Installing required Python packages..." -ForegroundColor Yellow
pip install flask flask-cors requests

Write-Host ""
Write-Host "🚀 Starting CRYPTO1 Flask App on http://127.0.0.1:5000" -ForegroundColor Green
Write-Host "📊 This will provide real-time cryptocurrency data to TickerTracker" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Keep this window open - it will serve crypto data to the main app" -ForegroundColor Yellow
Write-Host "🔄 The service will automatically cache data for 2 minutes" -ForegroundColor Cyan
Write-Host ""

python app.py

Read-Host "Press Enter to exit"