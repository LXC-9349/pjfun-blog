@echo off
setlocal EnableDelayedExpansion
title PJ Blog launcher
rem UTF-8 console so the Chinese output of the Node scripts stays readable
rem (this batch file itself is ASCII-only to avoid codepage parsing issues)
chcp 65001 >nul

rem ============================================================
rem  PJ Blog one-click launcher (Windows)
rem
rem  Double-click this file, or run it in a terminal:
rem    start.bat          check env -> install deps -> create .env -> start dev server
rem    start.bat check    only check the environment, write nothing
rem    start.bat setup    prepare the environment, do not start the server
rem    start.bat build    prepare the environment + production build
rem
rem  Options (environment variables):
rem    set PJ_NODE_VERSION=22.14.0   Node.js version to install when missing
rem    set PJ_NO_PAUSE=1             never wait for a key press (CI / unattended)
rem
rem  Node.js is installed into the project folder .tools (no admin rights needed)
rem  when it is missing. Chinese guide: README.md   Changelog: change.md
rem ============================================================

set "ROOT=%~dp0"
cd /d "%ROOT%"

set "MODE=dev"
if /I "%~1"=="check" set "MODE=check"
if /I "%~1"=="setup" set "MODE=setup"
if /I "%~1"=="build" set "MODE=build"

if "%PJ_NODE_VERSION%"=="" set "PJ_NODE_VERSION=22.14.0"
set "TOOLS=%ROOT%.tools"
set "NODE_HOME=%TOOLS%\node-v%PJ_NODE_VERSION%-win-x64"

echo.
echo  ============================================================
echo   PJ Blog launcher  /  mode: %MODE%
echo  ============================================================
echo.

call :ensure_node
if errorlevel 1 goto :fail

call :ensure_pnpm
if errorlevel 1 goto :fail

call :run_task
if errorlevel 1 goto :fail

echo.
echo  Done.
endlocal
exit /b 0

rem ------------------------------------------------------------
:ensure_node
echo [1/3] Checking Node.js
where node >nul 2>nul
if not errorlevel 1 goto :show_node
if exist "%NODE_HOME%\node.exe" goto :use_local_node
echo       Node.js not found. Downloading a portable build into .tools (no admin needed)
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\bootstrap-node.ps1" -Version %PJ_NODE_VERSION% -Dest "%TOOLS%"
if not errorlevel 1 goto :use_local_node
echo       [error] Node.js setup failed. Install it manually from https://nodejs.org/en/download
exit /b 1

:use_local_node
set "PATH=%NODE_HOME%;%PATH%"

:show_node
set "NODE_VER="
for /f "delims=" %%v in ('node -p "process.versions.node"') do set "NODE_VER=%%v"
if "%NODE_VER%"=="" goto :node_bad
echo       Node.js %NODE_VER%
set "NODE_MAJOR="
for /f "delims=.v" %%m in ("%NODE_VER%") do set "NODE_MAJOR=%%m"
if not "%NODE_MAJOR%"=="" if %NODE_MAJOR% LSS 20 echo       [warn] Node.js 20.19+ is recommended, found %NODE_MAJOR%
exit /b 0

:node_bad
echo       [error] node is not usable
exit /b 1

rem ------------------------------------------------------------
:ensure_pnpm
echo [2/3] Checking pnpm
where pnpm >nul 2>nul
if not errorlevel 1 goto :show_pnpm
echo       pnpm not found, enabling it through corepack
corepack enable pnpm
where pnpm >nul 2>nul
if not errorlevel 1 goto :show_pnpm
echo       installing pnpm with npm
call npm install -g pnpm
where pnpm >nul 2>nul
if not errorlevel 1 goto :show_pnpm
echo       [error] pnpm installation failed. Run: npm install -g pnpm
exit /b 1

:show_pnpm
set "PNPM_VER="
for /f "delims=" %%v in ('pnpm --version') do set "PNPM_VER=%%v"
if "%PNPM_VER%"=="" goto :pnpm_bad
echo       pnpm %PNPM_VER%
exit /b 0

:pnpm_bad
echo       [error] pnpm is not usable
exit /b 1

rem ------------------------------------------------------------
:run_task
echo [3/3] Running task
if "%MODE%"=="check" goto :task_check
if "%MODE%"=="setup" goto :task_setup
if "%MODE%"=="build" goto :task_build
goto :task_dev

:task_check
node "%ROOT%scripts\setup.mjs" --check
set "RC=%errorlevel%"
exit /b %RC%

:task_setup
node "%ROOT%scripts\setup.mjs" --pm pnpm
set "RC=%errorlevel%"
exit /b %RC%

:task_build
node "%ROOT%scripts\setup.mjs" --pm pnpm
if errorlevel 1 exit /b 1
call pnpm build
set "RC=%errorlevel%"
exit /b %RC%

:task_dev
node "%ROOT%scripts\setup.mjs" --dev --pm pnpm
set "RC=%errorlevel%"
exit /b %RC%

rem ------------------------------------------------------------
:fail
echo.
echo  Launch failed. Please check the [error] messages above.
echo  Site: http://localhost:1022/   Docs: README.md   Changelog: change.md
if "%PJ_NO_PAUSE%"=="1" exit /b 1
echo.
echo  Press any key to close...
pause >nul
exit /b 1
