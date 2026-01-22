# Quick deployment script for Vercel
# Run this after pushing to GitHub to trigger deployment

Write-Host "Triggering Vercel deployment..." -ForegroundColor Cyan

$response = Invoke-WebRequest -Uri "https://api.vercel.com/v1/integrations/deploy/prj_DGbIL5vVnwe6QkERFRlwaUQaUWsL/k0Q57XplWQ" -Method POST -UseBasicParsing

if ($response.StatusCode -eq 201) {
    Write-Host "Deployment triggered successfully!" -ForegroundColor Green
    Write-Host "Check your Vercel dashboard for build progress" -ForegroundColor Yellow
} else {
    Write-Host "Deployment failed with status: $($response.StatusCode)" -ForegroundColor Red
}
