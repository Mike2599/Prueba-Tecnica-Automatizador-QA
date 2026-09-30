@echo off
setlocal
title Pruebas automatizadas - Automatizador QA
cd /d "%~dp0"

echo ============================================================
echo  Prueba tecnica Automatizador QA - Playwright + TypeScript
echo ============================================================
echo.

rem --- 1. Node.js (18 o superior) ---
where node >nul 2>&1
if errorlevel 1 (
    echo [1/4] No se encontro Node.js. Instalando la version LTS con winget...
    where winget >nul 2>&1
    if errorlevel 1 goto sin_winget
    winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
    where node >nul 2>&1
    if errorlevel 1 goto reiniciar
)

for /f "tokens=1 delims=v." %%v in ('node -v') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 18 (
    echo Se necesita Node.js 18 o superior y esta instalada la version:
    node -v
    echo Actualicelo desde https://nodejs.org y vuelva a ejecutar este archivo.
    goto fin_error
)
for /f %%v in ('node -v') do echo [1/4] Node.js %%v encontrado.

rem --- 2. Dependencias del proyecto ---
echo.
echo [2/4] Instalando dependencias del proyecto...
call npm ci
if errorlevel 1 (
    echo No se pudieron instalar las dependencias. Revise la conexion a internet.
    goto fin_error
)

rem --- 3. Navegador de Playwright ---
echo.
echo [3/4] Instalando el navegador Chromium de Playwright...
call npx playwright install chromium
if errorlevel 1 (
    echo No se pudo instalar Chromium. Revise la conexion a internet.
    goto fin_error
)

rem --- 4. Ejecucion de las pruebas ---
echo.
echo [4/4] Ejecutando pruebas web y API...
call npm test
set RESULTADO=%errorlevel%

echo.
if %RESULTADO%==0 (
    echo Todas las pruebas pasaron.
) else (
    echo Algunas pruebas fallaron. Revise el reporte para ver el detalle.
)
echo Abriendo el reporte HTML...
start "" "%~dp0reports\html\index.html"
echo.
pause
exit /b %RESULTADO%

:sin_winget
echo No se encontro winget para instalar Node.js automaticamente.
echo Instale Node.js LTS desde https://nodejs.org y vuelva a ejecutar este archivo.
start "" https://nodejs.org
goto fin_error

:reiniciar
echo Node.js quedo instalado, pero esta ventana aun no lo reconoce.
echo Cierre esta ventana y vuelva a ejecutar este archivo.
goto fin_error

:fin_error
echo.
pause
exit /b 1
