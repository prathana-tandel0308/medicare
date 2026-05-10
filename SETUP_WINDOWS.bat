@echo off
title MediCore HMS - Setup
color 0B
cls

:: Always run from the folder this .bat file lives in
cd /d "%~dp0"

echo.
echo  ==========================================
echo   MediCore Hospital Management System
echo   Windows Setup Script
echo  ==========================================
echo.

:: -----------------------------------------------
:: STEP 1 - Check Node.js
:: -----------------------------------------------
echo [1/5] Checking Node.js...
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Node.js is NOT installed!
    echo.
    echo  Please install Node.js from: https://nodejs.org
    echo  Download the LTS version ^(18 or higher^)
    echo  After installing, re-run this script.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  OK - Node.js %NODE_VER% found
echo.

:: -----------------------------------------------
:: STEP 2 - Check MongoDB
:: -----------------------------------------------
echo [2/5] Checking MongoDB...
mongod --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  WARNING: MongoDB not found in PATH.
    echo.
    echo  You have 2 options:
    echo    A) Install MongoDB Community locally:
    echo       https://www.mongodb.com/try/download/community
    echo.
    echo    B) Use MongoDB Atlas ^(free cloud^):
    echo       https://www.mongodb.com/cloud/atlas/register
    echo       Then update MONGODB_URI in backend\.env
    echo.
    echo  If MongoDB IS installed but not in PATH, you can continue.
    set /p MONGO_CHOICE="Continue anyway? (y/n): "
    if /i not "%MONGO_CHOICE%"=="y" exit /b 1
) ELSE (
    for /f "tokens=*" %%v in ('mongod --version 2^>^&1 ^| findstr /i "version"') do echo  OK - %%v
)
echo.

:: -----------------------------------------------
:: STEP 3 - Create .env file
:: -----------------------------------------------
echo [3/5] Setting up environment file...

IF EXIST "backend\.env" (
    echo  INFO: backend\.env already exists, skipping.
) ELSE (
    echo  Creating backend\.env ...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/hospital_ms
        echo JWT_SECRET=medicore_super_secret_jwt_key_2024_change_me
        echo NODE_ENV=development
    ) > backend\.env
    echo  OK - backend\.env created
    echo.
    echo  *** IMPORTANT ***
    echo  If using MongoDB Atlas, edit backend\.env and change MONGODB_URI to:
    echo  MONGODB_URI=mongodb+srv://^<user^>:^<pass^>@cluster.mongodb.net/hospital_ms
    echo  *****************
)
echo.

:: -----------------------------------------------
:: STEP 4 - Install dependencies
:: -----------------------------------------------
echo [4/5] Installing dependencies...
echo.

echo  Installing backend packages...
cd backend
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Backend npm install failed!
    pause
    exit /b 1
)
echo  Backend packages installed!
echo.

echo  Installing frontend packages...
cd ..\frontend
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Frontend npm install failed!
    pause
    exit /b 1
)
echo  Frontend packages installed!
cd ..
echo.

:: -----------------------------------------------
:: STEP 5 - Seed database
:: -----------------------------------------------
echo [5/5] Seeding sample data...
set /p SEED_CHOICE="Do you want to add sample data (doctors, patients)? (y/n): "
if /i "%SEED_CHOICE%"=="y" (
    cd backend
    node seed.js
    IF %ERRORLEVEL% NEQ 0 (
        echo  WARNING: Seeding failed. Make sure MongoDB is running.
    ) ELSE (
        echo  Sample data added!
    )
    cd ..
)
echo.

:: -----------------------------------------------
:: DONE
:: -----------------------------------------------
echo  ==========================================
echo   SETUP COMPLETE!
echo  ==========================================
echo.
echo  To START the project:
echo    Run START_WINDOWS.bat
echo.
echo  OR manually:
echo    Terminal 1: cd backend  ^&^&  npm run dev
echo    Terminal 2: cd frontend ^&^&  npm start
echo.
echo  Then open: http://localhost:3000
echo.
echo  Default login ^(if seeded^):
echo    Email:    admin@medicore.com
echo    Password: admin123
echo.
pause
