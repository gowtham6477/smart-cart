@echo off
echo ========================================
echo Smart Service Management System
echo Starting All Services
echo ========================================
echo.

echo Starting Backend Server...
start "SmartCart Backend" cmd /k "run-backend.bat"

echo Starting Frontend Server...
start "SmartCart Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Services are starting in separate windows.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause