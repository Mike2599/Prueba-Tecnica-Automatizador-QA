@echo off
setlocal
title Pruebas automatizadas - Automatizador QA
cd /d "%~dp0"
set "NODE_DIR=%~dp0.node"

echo ============================================================
echo  Prueba tecnica Automatizador QA - Playwright + TypeScript
echo ============================================================
echo.

rem --- 1. Node.js 18 o superior ---
rem Usa el Node.js del equipo si sirve. Si no, usa (o descarga) una copia portable
rem dentro de la carpeta .node del proyecto. No instala nada en el sistema.
call :buscar_node
if defined NODE_OK goto node_listo

if not exist "%NODE_DIR%\node.exe" goto descargar_node
set "PATH=%NODE_DIR%;%PATH%"
call :buscar_node
if defined NODE_OK goto node_listo

:descargar_node
echo [1/4] No se encontro Node.js 18 o superior.
echo       Descargando Node.js portable desde nodejs.org (solo para este proyecto)...
set "NODE_ARCH=x64"
if /i "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "NODE_ARCH=arm64"
if exist "%NODE_DIR%" rmdir /s /q "%NODE_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol='Tls12'; $all=Invoke-RestMethod 'https://nodejs.org/dist/index.json'; $v=($all | Where-Object { $_.lts } | Select-Object -First 1).version; $n='node-'+$v+'-win-%NODE_ARCH%'; Write-Host ('      Version: '+$v); $zip=Join-Path $env:TEMP ($n+'.zip'); $tmp=Join-Path $env:TEMP 'node-portable-qa'; Invoke-WebRequest ('https://nodejs.org/dist/'+$v+'/'+$n+'.zip') -OutFile $zip -UseBasicParsing; if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }; Expand-Archive $zip $tmp -Force; Move-Item (Join-Path $tmp $n) '%NODE_DIR%'; Remove-Item $zip -Force; Remove-Item $tmp -Recurse -Force"
if errorlevel 1 (
    echo.
    echo No se pudo descargar Node.js. Revise la conexion a internet o instalelo
    echo manualmente desde https://nodejs.org y vuelva a ejecutar este archivo.
    goto fin_error
)
set "PATH=%NODE_DIR%;%PATH%"
call :buscar_node
if not defined NODE_OK (
    echo No se pudo preparar Node.js. Instalelo desde https://nodejs.org y vuelva a intentar.
    goto fin_error
)

:node_listo
for /f %%v in ('node -v') do echo [1/4] Node.js %%v listo.

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

rem Deja NODE_OK definido si hay un node.exe 18 o superior en el PATH.
:buscar_node
set "NODE_OK="
set "NODE_MAJOR=0"
where node >nul 2>&1 || exit /b 0
for /f "tokens=1 delims=v." %%v in ('node -v') do set "NODE_MAJOR=%%v"
if %NODE_MAJOR% GEQ 18 set "NODE_OK=1"
exit /b 0

:fin_error
echo.
pause
exit /b 1
