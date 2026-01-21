@echo off
echo =====================================
echo    Starting SkillSphere
echo =====================================
echo.

REM Check if setup has been run
if not exist "backend\node_modules" (
    echo ERROR: Backend dependencies not installed!
    echo Please run setup.bat first
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo ERROR: Frontend dependencies not installed!
    echo Please run setup.bat first
    pause
    exit /b 1
)

echo Starting backend server...
start "SkillSphere Backend" cmd /k "cd backend && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend dev server...
start "SkillSphere Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================
echo    SkillSphere is starting!
echo =====================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop all servers...
pause >nul

echo Stopping servers...
taskkill /FI "WindowTitle eq SkillSphere Backend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq SkillSphere Frontend*" /F >nul 2>&1

echo.
echo Servers stopped.
pause
