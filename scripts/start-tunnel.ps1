# PropertyFinder Argo Tunnel Starter (PowerShell)
# This script starts the Argo Tunnel for PropertyFinder

Write-Host "🚇 PropertyFinder Argo Tunnel Starter" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Tunnel ID: 766bafc4-59c3-40da-8c65-4a4d285f4c28" -ForegroundColor Yellow
Write-Host "Domain: properties.gursimanoor.com" -ForegroundColor Yellow
Write-Host "Target: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""

Write-Host "Starting tunnel..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Keep this window open!" -ForegroundColor Red
Write-Host "The tunnel will stop if you close this window." -ForegroundColor Red
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
Write-Host ""

try {
    # Start the tunnel
    cloudflared tunnel run --config deployment\cloudflared-tunnel.yml propertyfinder
}
catch {
    Write-Host "Error starting tunnel: $_" -ForegroundColor Red
    Write-Host "Make sure cloudflared is installed and accessible." -ForegroundColor Red
}

Write-Host ""
Write-Host "Tunnel stopped." -ForegroundColor Yellow
Read-Host "Press Enter to close"
