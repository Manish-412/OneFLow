@echo off
echo Starting OneFlow Backend Server...
echo.
cd /d "%~dp0server"
echo Current directory: %CD%
echo.
echo Checking Node.js...
node --version
echo.
echo Starting server...
node src\index.js
