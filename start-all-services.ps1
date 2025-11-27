# PowerShell script to start all TickerTracker services
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Starting TickerTracker All Services" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend Server
Write-Host "[1/4] Starting Backend Server (Port 5004)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; npm start"
Start-Sleep -Seconds 3

# Start CRYPTO1 Service
Write-Host "[2/4] Starting CRYPTO1 Service (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\CRYPTO1\CRYPTO'; python app.py"
Start-Sleep -Seconds 3

# Start API Service
Write-Host "[3/4] Starting API Service (Port 5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\API'; python app.py"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[4/4] Starting Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\Frontend'; npm run dev"

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "All Services Started Successfully!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5004" -ForegroundColor White
Write-Host "CRYPTO1:  http://localhost:5000" -ForegroundColor White
Write-Host "API:      http://localhost:5001" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
