# ==========================================
# X-UserBot Windows Mega-Installer
# Uses WinGet for automated dependency setup
# ==========================================

$ErrorActionPreference = "Stop"

Write-Host "" -ForegroundColor Cyan
Write-Host "    X-UserBot - Windows Mega-Installer " -ForegroundColor Magenta
Write-Host "" -ForegroundColor Cyan

# 1. Admin Check
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host " Error: Please run PowerShell as Administrator!" -ForegroundColor Red
    exit
}

# 2. WinGet Check
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host " WinGet not found. Installing App Installer..." -ForegroundColor Yellow
    Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe
}

# 3. Dependency Installation
$apps = @("Git.Git", "OpenJS.NodeJS.LTS", "Python.Python.3", "Gyan.FFmpeg", "MongoDB.Server")

foreach ($app in $apps) {
    Write-Host " Installing $app..." -ForegroundColor Blue
    winget install --id $app --silent --accept-package-agreements --accept-source-agreements
}

# 4. yt-dlp Installation
Write-Host " Installing yt-dlp via Python..." -ForegroundColor Blue
python -m pip install yt-dlp

# 5. Smart Environment Configuration (.env)
Write-Host "" -ForegroundColor Cyan
Write-Host "  Environment Configuration" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    New-Item -Path ".env" -ItemType File
}

$pairChoice = Read-Host " Enable One-Device Pairing (Link with Phone No)? (y/n)"
if ($pairChoice -eq "y") {
    $phone = Read-Host " Enter your Phone Number with Country Code (e.g. 919876543210)"
    Add-Content -Path ".env" -Value "PAIRING_ENABLED=true"
    Add-Content -Path ".env" -Value "PHONE_NUMBER=$phone"
    Write-Host " Pairing Mode enabled for $phone" -ForegroundColor Green
} else {
    Add-Content -Path ".env" -Value "PAIRING_ENABLED=false"
}

$mongoChoice = Read-Host " Use a Cloud MongoDB URI? (y/n)"
if ($mongoChoice -eq "y") {
    $muri = Read-Host " Enter MongoDB URI"
    Add-Content -Path ".env" -Value "MONGODB_URI=$muri"
} else {
    Write-Host " Using Local MongoDB (mongodb://localhost:27017/xbot)" -ForegroundColor Green
    Add-Content -Path ".env" -Value "MONGODB_URI=mongodb://localhost:27017/xbot"
}

# 6. Project Setup
Write-Host " Installing NPM Dependencies..." -ForegroundColor Blue
npm install

Write-Host "" -ForegroundColor Cyan
Write-Host " Installation Complete!" -ForegroundColor Green
Write-Host "1. IMPORTANT: Verify your keys in .env" -ForegroundColor Yellow
Write-Host "2. Get your GEMINI_API_KEY from: https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
Write-Host "3. Run 'npm start' to launch X-UserBot." -ForegroundColor Blue
Write-Host "" -ForegroundColor Cyan
