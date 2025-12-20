# Quick Run Script for Smart Service Management System
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Smart Service Management System" -ForegroundColor Cyan
Write-Host "Quick Run Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Java is installed
$javaPath = Get-Command java -ErrorAction SilentlyContinue
if (-not $javaPath) {
    Write-Host "ERROR: Java is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Java 17 first:" -ForegroundColor Yellow
    Write-Host "https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installing Java, run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Checking Java version..." -ForegroundColor Green
java -version
Write-Host ""

# Check if MongoDB connection is configured
$appProperties = "src\main\resources\application.properties"
if (Test-Path $appProperties) {
    $content = Get-Content $appProperties -Raw
    if ($content -notmatch "mongodb\+srv://") {
        Write-Host "WARNING: MongoDB Atlas connection string not configured!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please update src\main\resources\application.properties" -ForegroundColor Yellow
        Write-Host "with your MongoDB Atlas connection string." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "See MONGODB_ATLAS_SETUP.md for instructions." -ForegroundColor Cyan
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') {
            exit
        }
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will start on: http://localhost:8080" -ForegroundColor Green
Write-Host "Health check: http://localhost:8080/actuator/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run the application
.\mvnw.cmd spring-boot:run

