@echo off
title MediCore HMS - Launcher
color 0B
cls

cd /d "%~dp0"

echo.
echo  ==========================================
echo   MediCore HMS - Starting Application
echo  ==========================================
echo.
echo  Script location : %~dp0
echo  Working dir now : %CD%
echo.

echo  Checking folders...
IF EXIST "backend"               (echo  [OK] backend folder found)        ELSE (echo  [!!] backend folder MISSING)
IF EXIST "frontend"              (echo  [OK] frontend folder found)       ELSE (echo  [!!] frontend folder MISSING)
IF EXIST "backend\node_modules"  (echo  [OK] backend\node_modules found)  ELSE (echo  [!!] backend\node_modules MISSING)
IF EXIST "frontend\node_modules" (echo  [OK] frontend\node_modules found) ELSE (echo  [!!] frontend\node_modules MISSING)
IF EXIST "backend\.env"          (echo  [OK] backend\.env found)          ELSE (echo  [!!] backend\.env MISSING)
echo.

IF NOT EXIST "backend\node_modules" (
    echo  ==========================================
    echo   CANNOT START - run SETUP_WINDOWS.bat first
    echo  ==========================================
    pause
    exit /b 1
)

IF NOT EXIST "frontend\node_modules" (
    echo  ==========================================
    echo   CANNOT START - run SETUP_WINDOWS.bat first
    echo  ==========================================
    pause
    exit /b 1
)

IF NOT EXIST "backend\.env" (
    echo  Creating .env...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/hospital_ms
        echo JWT_SECRET=medicore_secret_key_change_me
        echo NODE_ENV=development
    ) > backend\.env
    echo  [OK] .env created
    echo.
)

echo  Starting Backend  (http://localhost:5000)...
start "MediCore Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo  Starting Frontend (http://localhost:3000)...
start "MediCore Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo  Both servers launching! Browser opens at http://localhost:3000
echo  Close the two terminal windows to stop.
echo.
pause
