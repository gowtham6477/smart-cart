# Git Repository Setup Script for Smart Cart
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Smart Cart - Git Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Git found! Continuing..." -ForegroundColor Green
Write-Host ""

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if .git already exists
if (Test-Path .git) {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    Write-Host ""
}

# Configure git user (if not already configured)
$userName = git config user.name 2>$null
if (-not $userName) {
    $username = Read-Host "Please enter your GitHub username"
    git config user.name "$username"
}

$userEmail = git config user.email 2>$null
if (-not $userEmail) {
    $email = Read-Host "Please enter your GitHub email"
    git config user.email "$email"
}

Write-Host ""
Write-Host "Adding all files to git..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "Committing files..." -ForegroundColor Cyan
git commit -m "Initial commit: Smart Service Management System - Complete project setup"

Write-Host ""
Write-Host "Checking if remote 'origin' exists..." -ForegroundColor Cyan
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "Adding remote repository..." -ForegroundColor Cyan
    git remote add origin https://github.com/gowtham6477/smart-cart.git
} else {
    Write-Host "Remote 'origin' already exists: $remoteUrl" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setting main branch..." -ForegroundColor Cyan
git branch -M main

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: You may need to enter your GitHub credentials or Personal Access Token" -ForegroundColor Yellow
Write-Host ""

$pushResult = git push -u origin main 2>&1
$pushSuccess = $LASTEXITCODE -eq 0

if ($pushSuccess) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Project pushed to GitHub" -ForegroundColor Green
    Write-Host "Repository: https://github.com/gowtham6477/smart-cart" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Push failed. Possible reasons:" -ForegroundColor Red
    Write-Host "1. Authentication failed - You may need a Personal Access Token" -ForegroundColor Yellow
    Write-Host "2. Remote repository doesn't exist" -ForegroundColor Yellow
    Write-Host "3. You don't have push permissions" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To use Personal Access Token:" -ForegroundColor Cyan
    Write-Host "1. Go to: GitHub Settings > Developer settings > Personal access tokens" -ForegroundColor White
    Write-Host "2. Generate new token with 'repo' permissions" -ForegroundColor White
    Write-Host "3. Run these commands:" -ForegroundColor White
    Write-Host "   git remote set-url origin https://YOUR_TOKEN@github.com/gowtham6477/smart-cart.git" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"

