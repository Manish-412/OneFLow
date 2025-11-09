Write-Host "Starting OneFlow Backend Server..." -ForegroundColor Green
Write-Host ""

Set-Location "c:\OneFlow\server"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking Node.js..." -ForegroundColor Cyan
node --version
Write-Host ""

Write-Host "Starting server..." -ForegroundColor Green
node src\index.js
