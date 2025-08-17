@echo off
echo 🚇 PropertyFinder Argo Tunnel Starter
echo ======================================
echo.
echo This will start the Argo Tunnel for PropertyFinder
echo.
echo Tunnel ID: 766bafc4-59c3-40da-8c65-4a4d285f4c28
echo Domain: properties.gursimanoor.com
echo Target: http://localhost:8080
echo.
echo Starting tunnel...
echo.
echo IMPORTANT: Keep this window open!
echo The tunnel will stop if you close this window.
echo.
echo Press Ctrl+C to stop the tunnel
echo.

cloudflared tunnel run --config cloudflared-tunnel.yml propertyfinder

echo.
echo Tunnel stopped.
pause
