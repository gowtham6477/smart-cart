@echo off
REM Quick Run Script for Smart Service Management System
REM Make sure Java 17 and MongoDB Atlas are configured first!

echo ========================================
echo Smart Service Management System
echo Quick Run Script
echo ========================================
echo.

REM Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed or not in PATH
    echo.
    echo Please install Java 17 first:
    echo https://adoptium.net/temurin/releases/?version=17
    echo.
    echo After installing Java, run this script again.
    pause
    exit /b 1
)

echo Checking Java version...
java -version
echo.

REM Check if MongoDB connection is configured
findstr /C:"mongodb+srv://" src\main\resources\application.properties >nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: MongoDB Atlas connection string not configured!
    echo.
    echo Please update src\main\resources\application.properties
    echo with your MongoDB Atlas connection string.
    echo.
    echo See MONGODB_ATLAS_SETUP.md for instructions.
    echo.
    pause
)

echo ========================================
echo Starting Backend...
echo ========================================
echo.
echo Backend will start on: http://localhost:8080
echo Health check: http://localhost:8080/actuator/health
echo.
echo Press Ctrl+C to stop the server
echo.

REM Run the application
.\mvnw.cmd spring-boot:run

pause

