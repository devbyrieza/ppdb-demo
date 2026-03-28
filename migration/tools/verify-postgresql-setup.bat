@echo off
echo ====================================
echo VERIFY POSTGRESQL SETUP
echo ====================================
echo.

REM Test basic PostgreSQL connection
echo Testing PostgreSQL basic connection...
psql -U postgres -h localhost -c "SELECT version();" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL connection FAILED!
    echo Check:
    echo 1. PostgreSQL service running
    echo 2. Password correct
    echo 3. Port 5432 available
    pause
    exit /b 1
)

echo ✅ PostgreSQL basic connection OK!
echo.

REM Test database exists
echo Testing database ppdb_alimam_test...
psql -U postgres -h localhost -c "\l" | findstr "ppdb_alimam_test" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Database ppdb_alimam_test NOT FOUND!
    echo Create database di Stack Builder
    pause
    exit /b 1
)

echo ✅ Database ppdb_alimam_test found!
echo.

REM Test user exists
echo Testing user ppdb_user...
psql -U postgres -h localhost -c "\du" | findstr "ppdb_user" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ User ppdb_user NOT FOUND!
    echo Create user di Stack Builder
    pause
    exit /b 1
)

echo ✅ User ppdb_user found!
echo.

REM Test user connection to database
echo Testing ppdb_user connection to database...
psql -U ppdb_user -d ppdb_alimam_test -h localhost -c "SELECT current_database();" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ppdb_user connection FAILED!
    echo Check:
    echo 1. Password: ppdb_password123
    echo 2. Privileges granted
    echo 3. Database exists
    pause
    exit /b 1
)

echo ✅ ppdb_user connection OK!
echo.

REM Test table creation
echo Testing table creation...
psql -U ppdb_user -d ppdb_alimam_test -h localhost -c "CREATE TABLE test_table (id SERIAL PRIMARY KEY, name VARCHAR(100));" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Table creation FAILED!
    echo Check user privileges
    pause
    exit /b 1
)

echo ✅ Table creation OK!
echo.

REM Clean up test table
psql -U ppdb_user -d ppdb_alimam_test -h localhost -c "DROP TABLE test_table;" >nul 2>&1

echo.
echo ====================================
echo ✅ ALL TESTS PASSED!
echo Database siap untuk import data!
echo ====================================
echo.
echo Next step: Import 67 records dari Supabase
echo Command: cd migration\backup && import-to-local.bat
echo.
pause
