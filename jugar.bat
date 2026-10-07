@echo off
REM ============================================================
REM  Ultima Orbita - iniciar el juego
REM  Doble clic en este archivo. Se abre solo en el navegador.
REM ============================================================
setlocal
cd /d "%~dp0"

echo.
echo   Ultima Orbita - arrancando...
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Node.js no esta instalado.
    echo   Descargalo de https://nodejs.org y volve a intentar.
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo   Primera vez: instalando dependencias. Tarda un minuto...
    echo.
    call npm install
    if errorlevel 1 (
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