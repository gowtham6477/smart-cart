@echo off
REM Git Repository Setup Script for Smart Cart
REM This script will initialize git, add files, and push to GitHub

echo ========================================
echo Smart Cart - Git Setup Script
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Git found! Continuing...
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Check if .git already exists
if exist .git (
    echo Git repository already initialized.
    echo.
) else (
    echo Initializing Git repository...
    git init
    echo.
)

REM Configure git user (if not already configured)
git config user.name >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Please enter your GitHub username:
    set /p username="> "
    git config user.name "%username%"
)

git config user.email >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Please enter your GitHub email:
    set /p email="> "
    git config user.email "%email%"
)

echo.
echo Adding all files to git...
git add .

echo.
echo Committing files...
git commit -m "Initial commit: Smart Service Management System - Complete project setup"

echo.
echo Checking if remote 'origin' exists...
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Adding remote repository...
    git remote add origin https://github.com/gowtham6477/smart-cart.git
) else (
    echo Remote 'origin' already exists.
)

echo.
echo Setting main branch...
git branch -M main

echo.
echo Pushing to GitHub...
echo.
echo NOTE: You may need to enter your GitHub credentials or Personal Access Token
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Project pushed to GitHub
    echo Repository: https://github.com/gowtham6477/smart-cart
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Push failed. Possible reasons:
    echo 1. Authentication failed - You may need a Personal Access Token
    echo 2. Remote repository doesn't exist
    echo 3. You don't have push permissions
    echo.
    echo To use Personal Access Token:
    echo 1. Go to: GitHub Settings ^> Developer settings ^> Personal access tokens
    echo 2. Generate new token with 'repo' permissions
    echo 3. Use this command:
    echo    git remote set-url origin https://YOUR_TOKEN@github.com/gowtham6477/smart-cart.git
    echo 4. Then run: git push -u origin main
    echo ========================================
)

echo.
pause

