# SICEPAT Database Seeding Script (PowerShell)
# Seeds all microservices with initial data

Write-Host "🌱 SICEPAT Database Seeding" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

# Check if Docker containers are running
Write-Host "📋 Checking Docker containers..." -ForegroundColor Yellow
$authDb = docker ps | Select-String "sicepat-auth-db"
if (-not $authDb) {
    Write-Host "❌ MongoDB containers are not running!" -ForegroundColor Red
    Write-Host "Please start containers first with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker containers are running" -ForegroundColor Green
Write-Host ""

# Function to run seed script
function Seed-Service {
    param (
        [string]$ServiceName,
        [string]$ScriptPath
    )
    
    Write-Host "🌱 Seeding $ServiceName..." -ForegroundColor Cyan
    Set-Location "services\$ServiceName"
    
    # Install dependencies if node_modules doesn't exist
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies for $ServiceName..." -ForegroundColor Yellow
        npm install --silent
    }
    
    # Run seed script
    node $ScriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $ServiceName seeding completed" -ForegroundColor Green
    } else {
        Write-Host "❌ $ServiceName seeding failed" -ForegroundColor Red
    }
    
    Set-Location ..\..
    Write-Host ""
}

# Seed services in order
Write-Host "Starting seed process..." -ForegroundColor Yellow
Write-Host ""

# 1. Seed Auth Service (must be first)
Seed-Service "auth" "scripts\seed-auth.js"

# 2. Seed Profile Service
Seed-Service "profile" "scripts\seed-profile.js"

# 3. Seed Bookings Service
Seed-Service "bookings" "scripts\seed-bookings.js"

Write-Host "==============================" -ForegroundColor Green
Write-Host "✅ All seeding completed!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now start the services with:" -ForegroundColor Yellow
Write-Host "  docker-compose up --build" -ForegroundColor Cyan
