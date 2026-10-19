#!/bin/bash

# Attendance System Quick Start Script

echo "======================================"
echo "Attendance System - Docker Quick Start"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in PATH"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed"
    echo "It comes bundled with Docker Desktop"
    exit 1
fi

echo "✓ Docker found"
echo "✓ Docker Compose found"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created (using defaults)"
    echo ""
fi

echo "Starting services..."
echo "This may take 15-30 seconds on first run..."
echo ""

# Start docker-compose
docker-compose up

echo ""
echo "Services are running!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  Health:   http://localhost:5000/health"
echo ""
echo "Test Credentials:"
echo "  Teacher: teacher1@example.com / password123"
echo "  Student: student1@example.com / password123"
echo ""
echo "Press Ctrl+C to stop services"
echo ""
