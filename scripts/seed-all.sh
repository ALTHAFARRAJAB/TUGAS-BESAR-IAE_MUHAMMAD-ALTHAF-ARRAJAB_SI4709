#!/bin/bash

# SICEPAT Database Seeding Script
# Seeds all microservices with initial data

echo "🌱 SICEPAT Database Seeding"
echo "=============================="
echo ""

# Check if Docker containers are running
echo "📋 Checking Docker containers..."
docker ps | grep sicepat-auth-db > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ MongoDB containers are not running!"
    echo "Please start containers first with: docker-compose up -d"
    exit 1
fi
echo "✅ Docker containers are running"
echo ""

# Function to run seed script
seed_service() {
    local service=$1
    local script=$2
    
    echo "🌱 Seeding $service..."
    cd "services/$service"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies for $service..."
        npm install --silent
    fi
    
    # Run seed script
    node "$script"
    
    if [ $? -eq 0 ]; then
        echo "✅ $service seeding completed"
    else
        echo "❌ $service seeding failed"
    fi
    
    cd ../..
    echo ""
}

# Seed services in order
echo "Starting seed process..."
echo ""

# 1. Seed Auth Service (must be first)
seed_service "auth" "scripts/seed-auth.js"

# 2. Seed Profile Service
seed_service "profile" "scripts/seed-profile.js"

# 3. Seed Bookings Service
seed_service "bookings" "scripts/seed-bookings.js"

echo "=============================="
echo "✅ All seeding completed!"
echo ""
echo "You can now start the services with:"
echo "  docker-compose up --build"
