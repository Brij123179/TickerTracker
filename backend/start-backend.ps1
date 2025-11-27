# TickerTracker Backend Startup Script
Write-Host "Starting TickerTracker Backend Server..." -ForegroundColor Green
Set-Location "c:\Users\VICTUS\Downloads\PriyanshiDataQuest1\PriyanshiDataQuest\backend"
Write-Host "Backend directory: $(Get-Location)" -ForegroundColor Yellow
node server.js