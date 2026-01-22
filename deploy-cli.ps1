# Deploy using Vercel CLI (more reliable than webhooks)
# First install: npm install -g vercel

param(
    [string]$Message = "Deploy"
)

Write-Host "=== Vercel CLI Deploy ===" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "Vercel CLI not installed. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host ""
Write-Host "=== Deploy Complete ===" -ForegroundColor Green
