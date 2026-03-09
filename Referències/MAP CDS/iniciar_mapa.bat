@echo off
title Servidor del Mapa Interactiu
color 0A
echo ==============================================
echo    INICIANT EL MAPA DE LA CURSA DEL SERRAT
echo ==============================================
echo.

python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Servidor iniciat amb Python! El teu navegador s'obrira ara.
    echo Per tancar el servidor, tanca aquesta finestra negra.
    echo.
    start http://localhost:8000
    python -m http.server 8000
    exit
)

python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Servidor iniciat amb Python! El teu navegador s'obrira ara.
    echo Per tancar el servidor, tanca aquesta finestra negra.
    echo.
    start http://localhost:8000
    python3 -m http.server 8000
    exit
)

npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Servidor iniciat amb Node.js! El teu navegador s'obrira ara.
    echo Per tancar el servidor, tanca aquesta finestra negra.
    echo.
    start http://localhost:3000
    npx serve . -p 3000
    exit
)

echo.
color 0C
echo ERROR IMPORTANT:
echo No s'ha detectat ni Python ni Node.js instal·lats a l'ordinador.
echo.
echo Per veure el mapa amb la ruta KML, necessites:
echo 1. Obrir el projecte amb 'Live Server' (extensio de VS Code)
echo 2. O instal·lar Python des de www.python.org
echo.
pause
