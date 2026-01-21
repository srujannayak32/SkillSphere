@echo off
echo =====================================
echo    SkillSphere Setup Script
echo =====================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed: 
node --version
echo.

REM Check if MongoDB is running
echo [2/6] Checking MongoDB status...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %errorlevel% neq 0 (
    echo WARNING: MongoDB is not running!
    echo Please start MongoDB with: mongod --dbpath "C:\data\db"
    echo.
    echo Do you want to continue anyway? (Y/N)
    set /p continue=
    if /i not "%continue%"=="Y" exit /b 1
)
echo MongoDB is running
echo.

REM Install backend dependencies
echo [3/6] Installing backend dependencies...
cd backend
if not exist node_modules (
    echo Installing backend packages...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)
cd ..
echo.

REM Install frontend dependencies
echo [4/6] Installing frontend dependencies...
cd frontend
if not exist node_modules (
    echo Installing frontend packages...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)
cd ..
echo.

REM Check environment files
echo [5/6] Checking environment files...
if not exist "backend\.env" (
    echo WARNING: backend\.env file not found!
    echo Creating from .env.example...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env"
        echo Please update backend\.env with your actual credentials
    ) else (
        echo ERROR: .env.example not found. Please create backend\.env manually
    )
    echo.
)

if not exist "frontend\.env" (
    echo WARNING: frontend\.env file not found!
    echo Creating from .env.example...
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env"
    )
    echo.
)
echo Environment files checked
echo.

echo [6/6] Setup complete!
echo.
echo =====================================
echo    Ready to start SkillSphere!
echo =====================================
echo.
echo To start the application:
echo   1. Start backend:  cd backend ^&^& npm start
echo   2. Start frontend: cd frontend ^&^& npm run dev
echo.
echo Or use the start.bat script to run both
echo.
pause
