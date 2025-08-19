@echo off
echo Starting PropertyFinder Argo Tunnel...
echo Tunnel ID: 766bafc4-59c3-40da-8c65-4a4d285f4c28
echo Domain: properties.gursimanoor.com
echo Target: http://localhost:8080
echo.
echo Press Ctrl+C to stop the tunnel
echo.

cloudflared tunnel run --config deployment\cloudflared-tunnel.yml propertyfinder

pause
