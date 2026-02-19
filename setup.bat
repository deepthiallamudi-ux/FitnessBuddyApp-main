@echo off
echo ==========================================
echo Fitness Buddy App - Setup Script
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Install Backend Dependencies
echo Installing Backend Dependencies...
cd BackEnd
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
cd ..
echo.

REM Install Frontend Dependencies
echo Installing Frontend Dependencies...
cd FrontEnd
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
cd ..
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next Steps:
echo 1. Verify .env files have correct Supabase credentials
echo 2. Run database schema in Supabase SQL Editor
echo 3. Open 2 terminals:
echo    - Terminal 1: cd BackEnd ^&^& npm run dev
echo    - Terminal 2: cd FrontEnd ^&^& npm run dev
echo.
pause
