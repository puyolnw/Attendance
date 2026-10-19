@echo off
REM Attendance System Quick Start Script for Windows

echo ======================================
echo Attendance System - Docker Quick Start
echo ======================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose is not installed
    echo It comes bundled with Docker Desktop
    pause
    exit /b 1
)

echo Docker found
echo Docker Compose found
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo .env file created (using defaults)
    echo.
)

echo Starting services...
echo This may take 15-30 seconds on first run...
echo.

REM Start docker-compose
docker-compose up

echo.
echo Services are running!
echo.
echo Access the application:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   Health:   http://localhost:5000/health
echo.
echo Test Credentials:
echo   Teacher: teacher1@example.com / password123
echo   Student: student1@example.com / password123
echo.
echo Press Ctrl+C to stop services
echo.
pause
