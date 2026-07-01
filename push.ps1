# PowerShell Script to Automate GitHub Push
# Repository: https://github.com/omarsaber7656-code/soha-work

$repoUrl = "https://github.com/omarsaber7656-code/soha-work.git"
$rootPath = "c:\Users\Tech Shop\Desktop\soha work"

Write-Host "Checking if Git is installed..." -ForegroundColor Cyan

# Check if git is installed
$gitCheck = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitCheck) {
    Write-Host "Git not found. Installing Git via winget..." -ForegroundColor Yellow
    winget install --id Git.Git -e --silent --accept-source-agreements --accept-package-agreements
    
    # Reload environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    $gitCheck = Get-Command git -ErrorAction SilentlyContinue
    if (-not $gitCheck) {
        Write-Host "Git installation failed or PATH not updated. Please restart your terminal and run this script again." -ForegroundColor Red
        Exit
    }
    Write-Host "Git installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Git is already installed." -ForegroundColor Green
}

# Change directory
Set-Location $rootPath

# Initialize Git if not initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
}

# Set remote origin
Write-Host "Setting Git remote origin..." -ForegroundColor Cyan
$remoteCheck = git remote get-url origin 2>$null
if ($remoteCheck) {
    git remote set-url origin $repoUrl
} else {
    git remote add origin $repoUrl
}

# Add files and commit
Write-Host "Staging files and committing..." -ForegroundColor Cyan
# Create a standard gitignore to ignore lock files or server scripts
if (-not (Test-Path ".gitignore")) {
    @"
serve.ps1
push.ps1
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
}

git add .
git commit -m "Initial commit - SOHA Premium E-Commerce Store with Admin Live Editor and Coupons"

# Rename branch to main
git branch -M main

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Please check for any GitHub login/credentials window that pops up and authorize it." -ForegroundColor Cyan

git push -u origin main -f

Write-Host "Push completed! Your website is now on GitHub." -ForegroundColor Green
Write-Host "You can now go to Settings -> Pages in your GitHub repository and enable GitHub Pages on the 'main' branch to launch it online." -ForegroundColor Green
