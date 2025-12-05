# SmartMock LinkedIn Integration - Quick Install Script
# For Windows PowerShell

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SmartMock LinkedIn Integration - Quick Setup  🚀         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Check if npm is installed
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm found: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Write-Host ""

# Navigate to server directory
Set-Location server

# Install dependencies
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

# Check if .env exists
if (Test-Path .env) {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file with your LinkedIn credentials!" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://www.linkedin.com/developers/apps" -ForegroundColor Cyan
    Write-Host "   2. Create an app and get Client ID & Secret" -ForegroundColor Cyan
    Write-Host "   3. Add them to server/.env file" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Installation Complete!                                ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Get LinkedIn credentials:" -ForegroundColor White
Write-Host "   → Visit: https://www.linkedin.com/developers/apps" -ForegroundColor Cyan
Write-Host "   → Create app and copy Client ID & Secret" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Edit .env file:" -ForegroundColor White
Write-Host "   → Open: server\.env" -ForegroundColor Cyan
Write-Host "   → Add your LINKEDIN_CLIENT_ID" -ForegroundColor Cyan
Write-Host "   → Add your LINKEDIN_CLIENT_SECRET" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Start backend server:" -ForegroundColor White
Write-Host "   → cd server" -ForegroundColor Cyan
Write-Host "   → npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Start frontend (in new terminal):" -ForegroundColor White
Write-Host "   → python -m http.server 8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Test it!" -ForegroundColor White
Write-Host "   → Open: http://localhost:8080/resume-builder.html" -ForegroundColor Cyan
Write-Host "   → Click 'Connect LinkedIn'" -ForegroundColor Cyan
Write-Host "   → Authorize and import your data!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host "   → Quick Start: LINKEDIN_SETUP_QUICKSTART.md" -ForegroundColor Cyan
Write-Host "   → Full Guide: server\README.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Ready to use REAL LinkedIn data in your resumes! 🚀" -ForegroundColor Green
Write-Host ""

# Go back to root
Set-Location ..

pause
