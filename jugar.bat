@echo off
REM ============================================================
REM  Ultima Orbita - iniciar el juego en esta maquina
REM
REM  Si no tenes Node.js instalado, esto no va a funcionar.
REM  En ese caso jugalo online, que no necesita nada:
REM      https://valentinobatiston.github.io/Ultima-Orbita/
REM ============================================================
setlocal
cd /d "%~dp0"

echo.
echo   Ultima Orbita - arrancando...
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo   ==========================================================
    echo    NO SE ENCONTRO NODE.JS
    echo   ==========================================================
    echo.
    echo   Este archivo necesita Node.js para funcionar.
    echo.
    echo   Podes jugar sin instalarlo, en linea:
    echo     https://valentinobatiston.github.io/Ultima-Orbita/
    echo.
    echo   Para instalar Node.js, descargalo de:
    echo     https://nodejs.org  ^(eleccion LTS, un solo clic^)
    echo   y volve a hacer doble clic en este archivo.
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo   Primera vez: instalando dependencias. Tarda un minuto...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo   ERROR: fallo la instalacion de dependencias.
        pause
        exit /b 1
    )
)

echo   Compilando el juego...
call npm run build
if errorlevel 1 (
    echo.
    echo   ERROR: fallo la compilacion. Revisa los mensajes de arriba.
    pause
    exit /b 1
)

echo.
echo   Abriendo el juego en el navegador...
echo   Para cerrarlo: cerra esta ventana.
echo.
start "" http://localhost:4173/
call npm run preview

endlocal