@echo off
echo ========================================
echo  Token Fix - Quick Reset Script
echo ========================================
echo.
echo This script will help you apply the token fix.
echo.
echo What this does:
echo 1. Stops any running backend
echo 2. Recompiles the backend
echo 3. Starts the backend
echo.
echo After this, you need to:
echo - Refresh your browser
echo - Login again (old tokens will be auto-cleared)
echo.
pause

echo.
echo [1/3] Stopping any running Java processes...
taskkill /F /IM java.exe 2>nul
if %errorlevel% == 0 (
    echo Backend stopped successfully!
) else (
    echo No running backend found.
)
timeout /t 2 >nul

echo.
echo [2/3] Recompiling backend...
call mvnw.cmd clean compile -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Starting backend...
echo Backend is starting on port 8080...
echo.
echo ========================================
echo  IMPORTANT: After backend starts
echo ========================================
echo 1. Wait for "Started SmartcartApplication"
echo 2. Open browser to http://localhost:5173
echo 3. You'll be auto-logged out (if old token exists)
echo 4. Login again with your credentials
echo 5. Test the checkout - it should work!
echo ========================================
echo.

start "SmartCart Backend" cmd /k "mvnw.cmd spring-boot:run"

echo.
echo Backend is starting in a new window...
echo You can close this window now.
echo.
pause

