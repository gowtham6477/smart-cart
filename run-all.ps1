Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Smart Service Management System" -ForegroundColor Cyan
Write-Host "Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k run-backend.bat" -WorkingDirectory "$PSScriptRoot"

Write-Host "Starting Frontend Server..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd frontend && npm run dev" -WorkingDirectory "$PSScriptRoot"

Write-Host ""
Write-Host "Services are starting in separate windows." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""