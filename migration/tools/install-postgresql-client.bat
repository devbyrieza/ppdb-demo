@echo off
echo Installing PostgreSQL Client Tools for Windows...
echo.

REM Check if Chocolatey is installed
where choco >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing Chocolatey first...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072 -b 3073; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    choco -y
)

REM Install PostgreSQL client tools
echo Installing PostgreSQL client tools...
choco install -y postgresql

echo.
echo PostgreSQL client tools installed!
echo You can now use: psql, pg_dump, pg_restore
echo.
pause
