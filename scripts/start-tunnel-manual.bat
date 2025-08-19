@echo off
echo 🚇 PropertyFinder Argo Tunnel Starter
echo ======================================
echo.
echo This will start the Argo Tunnel for PropertyFinder
echo.
echo Tunnel ID: faef6594-a266-401d-9c9c-a2f4eb80b5dc
echo Domain: properties.gursimanoor.com
echo Target: http://192.168.86.46:8000
echo.
echo Starting tunnel...
echo.
echo IMPORTANT: Keep this window open!
echo The tunnel will stop if you close this window.
echo.
echo Press Ctrl+C to stop the tunnel
echo.

cloudflared --config deployment\cloudflared-tunnel.yml tunnel run propertyfinder

echo.
echo Tunnel stopped.
pause
