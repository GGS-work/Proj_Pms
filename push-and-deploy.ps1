# Combined script: Push to GitHub and Deploy to Vercel
# Usage: .\push-and-deploy.ps1

param(
    [string]$Message = "Update"
)

Write-Host "=== Git Push & Vercel Deploy ===" -ForegroundColor Cyan
Write-Host ""

# Git push
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Git push successful!" -ForegroundColor Green
    Write-Host ""
    
    # Deploy to Vercel
    Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "https://api.vercel.com/v1/integrations/deploy/prj_DGbIL5vVnwe6QkERFRlwaUQaUWsL/JXSKSjMHcI" -Method POST -UseBasicParsing
    
    if ($response.StatusCode -eq 201) {
        Write-Host "Vercel deployment triggered successfully!" -ForegroundColor Green
        Write-Host "Check your Vercel dashboard for build progress" -ForegroundColor Yellow
    } else {
        Write-Host "Deployment failed with status: $($response.StatusCode)" -ForegroundColor Red
    }
} else {
    Write-Host "Git push failed! Skipping deployment." -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Complete ===" -ForegroundColor Cyan
