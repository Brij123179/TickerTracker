@echo off
echo ====================================
echo Starting TickerTracker All Services
echo ====================================

REM Start Backend Node.js Server
echo.
echo [1/4] Starting Backend Server (Port 5004)...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 >nul

REM Start CRYPTO1 Flask Service
echo.
echo [2/4] Starting CRYPTO1 Service (Port 5000)...
start "CRYPTO1 Service" cmd /k "cd /d %~dp0CRYPTO1\CRYPTO && python app.py"
timeout /t 3 >nul

REM Start API Flask Service (Indian/US Stocks)
echo.
echo [3/4] Starting API Service (Port 5001)...
start "API Service" cmd /k "cd /d %~dp0API && python app.py"
timeout /t 3 >nul

REM Start Frontend Vite Server
echo.
echo [4/4] Starting Frontend (Port 5173)...
start "Frontend" cmd /k "cd /d %~dp0Frontend && npm run dev"

echo.
echo ====================================
echo All Services Started Successfully!
echo ====================================
echo.
echo Backend:  http://localhost:5004
echo CRYPTO1:  http://localhost:5000
echo API:      http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause >nul
