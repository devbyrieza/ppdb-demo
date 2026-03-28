@echo off
echo ====================================
echo TEST POSTGRESQL CONNECTION
echo ====================================
echo.

REM Test connection ke PostgreSQL
echo Testing PostgreSQL connection...
psql -U postgres -h localhost -c "\l" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL connection FAILED!
    echo Pastikan:
    echo 1. PostgreSQL service running
    echo 2. Password benar
    echo 3. Port 5432 tidak blocked
    pause
    exit /b 1
)

echo ✅ PostgreSQL connection OK!
echo.

REM Test database creation
echo Testing database ppdb_alimam_test...
psql -U postgres -h localhost -c "\l" | findstr "ppdb_alimam_test" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Database ppdb_alimam_test NOT FOUND!
    echo Silakan create database di pgAdmin
    pause
    exit /b 1
)

echo ✅ Database ppdb_alimam_test found!
echo.

REM Test user creation
echo Testing user ppdb_user...
psql -U postgres -h localhost -c "\du" | findstr "ppdb_user" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ User ppdb_user NOT FOUND!
    echo Silakan create user di pgAdmin
    pause
    exit /b 1
)

echo ✅ User ppdb_user found!
echo.

REM Test user connection
echo Testing user ppdb_user connection...
psql -U ppdb_user -d ppdb_alimam_test -h localhost -c "\dt" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ppdb_user connection FAILED!
    echo Pastikan:
    echo 1. Password: ppdb_password123
    echo 2. Privileges sudah diberikan
    pause
    exit /b 1
)

echo ✅ ppdb_user connection OK!
echo.

REM Test table listing
echo Listing tables in ppdb_alimam_test...
psql -U ppdb_user -d ppdb_alimam_test -h localhost -c "\dt"

echo.
echo ====================================
echo ✅ ALL TESTS PASSED!
echo Database siap untuk import data!
echo ====================================
echo.
echo Next step: Import data dari Supabase
echo Command: cd migration\backup && import-to-local.bat
echo.
pause
