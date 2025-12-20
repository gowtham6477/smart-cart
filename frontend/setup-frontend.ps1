# SmartCart Frontend - Quick Setup Script
# Run this in PowerShell from the frontend directory

Write-Host "🚀 SmartCart Frontend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're in the right directory
$currentDir = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the frontend directory" -ForegroundColor Yellow
    Write-Host "Example: cd 'E:\Smart service management\smartcart\frontend'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found package.json" -ForegroundColor Green

# Step 2: Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Write-Host "This may take 2-5 minutes..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Step 3: Replace App.jsx
Write-Host ""
Write-Host "🔄 Setting up App.jsx..." -ForegroundColor Cyan
if (Test-Path "src\App.new.jsx") {
    if (Test-Path "src\App.jsx") {
        Move-Item -Path "src\App.jsx" -Destination "src\App.old.jsx" -Force
        Write-Host "  → Backed up old App.jsx" -ForegroundColor Gray
    }
    Move-Item -Path "src\App.new.jsx" -Destination "src\App.jsx" -Force
    Write-Host "✅ App.jsx updated!" -ForegroundColor Green
} else {
    Write-Host "⚠️  App.new.jsx not found, skipping..." -ForegroundColor Yellow
}

# Step 4: Check .env file
Write-Host ""
Write-Host "🔧 Checking environment configuration..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    Write-Host "⚠️  Please update it with your actual API keys:" -ForegroundColor Yellow
    Write-Host "   - VITE_API_BASE_URL" -ForegroundColor Gray
    Write-Host "   - VITE_RAZORPAY_KEY_ID" -ForegroundColor Gray
    Write-Host "   - VITE_CLOUDINARY_CLOUD_NAME" -ForegroundColor Gray
} else {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    @"
VITE_API_BASE_URL=http://localhost:8080/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_SOCKET_URL=http://localhost:8080
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created!" -ForegroundColor Green
}

# Step 5: Create stub pages directory structure
Write-Host ""
Write-Host "📁 Creating page structure..." -ForegroundColor Cyan

$directories = @(
    "src\pages\auth",
    "src\pages\customer",
    "src\pages\employee",
    "src\pages\admin",
    "src\components\layout",
    "src\components\common"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  → Created $dir" -ForegroundColor Gray
    }
}

Write-Host "✅ Directory structure ready!" -ForegroundColor Green

# Step 6: Summary and next steps
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Update .env file with your API keys" -ForegroundColor White
Write-Host "   Edit: .env" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create the required page stub files" -ForegroundColor White
Write-Host "   See: QUICK_START_FRONTEND.md (Step 5)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Full Guide: QUICK_START_FRONTEND.md" -ForegroundColor Gray
Write-Host "📖 Implementation Guide: FRONTEND_IMPLEMENTATION_GUIDE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green

