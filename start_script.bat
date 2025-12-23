@echo off
echo ===============================================================
echo      Epsilon Resource Planner - Windows Setup
echo ===============================================================
echo.

REM Skip npm check - it hangs on some Windows systems
REM Since Node.js is installed, npm is there too

echo Checking Python...
python -c "print('OK')" 2>nul
if errorlevel 1 (
    echo [ERROR] Python not found
    pause
    exit /b 1
)
echo [OK] Python found

echo Checking Node.js...
node -e "console.log('OK')" 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found
    pause
    exit /b 1
)
echo [OK] Node.js found
echo [OK] npm is included with Node.js

echo.
echo ===============================================================
echo Starting setup...
echo ===============================================================
echo.

REM Backend setup
echo [1/4] Installing backend packages...
cd backend
pip install flask flask-cors
cd ..
echo.

REM Frontend setup
echo [2/4] Installing frontend packages (2-3 minutes)...
cd /d "%cd%/frontend"
call npm install
cd ..
echo.

REM Start backend
echo [3/4] Starting backend server...
start "Backend Server - Port 5000" cmd /k cd /d "%~dp0/backend" ^& echo Backend starting... ^& python backend.py
timeout /t 3 /nobreak >nul

REM Start frontend
echo [4/4] Starting frontend server...
echo.
echo ===============================================================
echo                      SERVERS STARTING
echo ===============================================================
echo.
echo   Backend:  http://localhost:5000 (in other window)
echo   Frontend: http://localhost:3000 (opening now...)
echo.
echo   Press Ctrl+C to stop frontend
echo   Close backend window to stop backend
echo.
echo ===============================================================
echo.

cd frontend
timeout /t 2 /nobreak >nul
start http://localhost:3000
npm run dev
