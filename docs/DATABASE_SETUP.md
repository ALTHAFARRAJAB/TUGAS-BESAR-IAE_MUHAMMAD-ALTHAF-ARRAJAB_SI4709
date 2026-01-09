# Database Setup Guide

## Overview

SICEPAT menggunakan MongoDB sebagai database untuk semua microservices. Setiap service memiliki database terpisah untuk implementasi microservices yang proper.

## Database Architecture

```
┌─────────────────────────────────────────────────┐
│                  MongoDB Cluster                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌──────────────┐            │
│  │   auth-db   │  │ bookings-db  │            │
│  │  (port 27017)│  │ (port 27017) │            │
│  └─────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ analytics-db │  │  profile-db  │           │
│  │ (port 27017) │  │ (port 27017) │           │
│  └──────────────┘  └──────────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Database Services

### 1. Auth Database
- **Container**: `sicepat-auth-db`
- **Database**: `auth`
- **Collections**:
  - `users` - User authentication data

### 2. Bookings Database
- **Container**: `sicepat-bookings-db`
- **Database**: `bookings`
- **Collections**:
  - `bookings` - Travel booking records

### 3. Analytics Database
- **Container**: `sicepat-analytics-db`
- **Database**: `analytics`
- **Collections**:
  - `analyticscaches` - Cached analytics data (TTL enabled)

### 4. Profile Database
- **Container**: `sicepat-profile-db`
- **Database**: `profile`
- **Collections**:
  - `profiles` - User profile information

### 5. Notifications Database
- **Container**: `sicepat-bookings-db` (shared with bookings)
- **Database**: `notifications`
- **Collections**:
  - `notifications` - Notification history

## Getting Started

### 1. Start MongoDB Containers

```bash
# Start all containers
docker-compose up -d auth-db bookings-db analytics-db profile-db

# Verify containers are running
docker ps | grep sicepat
```

### 2. Seed Initial Data

#### Option A: Using PowerShell (Windows)
```powershell
.\scripts\seed-all.ps1
```

#### Option B: Using Bash (Linux/Mac)
```bash
chmod +x scripts/seed-all.sh
./scripts/seed-all.sh
```

#### Option C: Manual Seeding
```bash
# Seed Auth Service
cd services/auth
npm install
node scripts/seed-auth.js

# Seed Bookings Service
cd ../bookings
npm install
node scripts/seed-bookings.js

# Seed Profile Service
cd ../profile
npm install
node scripts/seed-profile.js
```

### 3. Verify Data

```bash
# Connect to auth database
docker exec -it sicepat-auth-db mongosh auth

# In mongosh:
> db.users.find().pretty()
> exit

# Connect to bookings database
docker exec -it sicepat-bookings-db mongosh bookings

# In mongosh:
> db.bookings.find().pretty()
> exit
```

## Seeded Data

### Demo Users
| Email | Password | Role |
|-------|----------|------|
| admin@sicepat.com | admin123 | admin |
| user@sicepat.com | user123 | user |
| budi@sicepat.com | budi123 | user |

### Sample Bookings
- 8 travel bookings with various statuses (pending, confirmed, completed, cancelled)
- Destinations: Bali, Jakarta, Yogyakarta, Surabaya, Bandung, Malang, Lombok, Medan

### User Profiles
- Profiles for all demo users with preferences and settings

## Database Models

### User Model (Auth Service)
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['admin', 'user']),
  phone: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model (Bookings Service)
```javascript
{
  passengerName: String (required),
  email: String (required),
  phone: String (required),
  destination: String (required),
  departureDate: Date (required),
  returnDate: Date,
  passengers: Number (min: 1),
  totalPrice: Number (min: 0),
  status: String (enum: ['pending', 'confirmed', 'completed', 'cancelled']),
  notes: String,
  userId: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Profile Model (Profile Service)
```javascript
{
  userId: String (unique, required),
  name: String (required),
  email: String (required),
  phone: String,
  avatar: String,
  preferences: {
    language: String (enum: ['id', 'en']),
    currency: String,
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    theme: String (enum: ['light', 'dark', 'auto'])
  },
  settings: Object,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model (Notifications Service)
```javascript
{
  type: String (enum: ['booking_created', 'booking_updated', ...]),
  email: String (required),
  bookingId: String,
  subject: String (required),
  message: String (required),
  status: String (enum: ['pending', 'sent', 'failed']),
  metadata: Object,
  errorMessage: String,
  sentAt: Date,
  createdAt: Date
}
```

### AnalyticsCache Model (Analytics Service)
```javascript
{
  dataType: String (enum: ['stats', 'trends', 'revenue']),
  data: Mixed (required),
  expiresAt: Date (TTL indexed),
  createdAt: Date,
  updatedAt: Date
}
```

## Connection Configuration

Each service uses a centralized `DatabaseConfig` class located at `services/{service}/config/dbConfig.js`:

```javascript
const dbConfig = new DatabaseConfig(MONGODB_URI, 'Service Name');
await dbConfig.connect();
```

Features:
- Connection pooling (max: 10, min: 2)
- Automatic reconnection
- Graceful shutdown handling
- Error logging and monitoring

## Environment Variables

Each service requires the following environment variable:

```env
MONGODB_URI=mongodb://localhost:27017/{database_name}
```

Or when using Docker:

```env
MONGODB_URI=mongodb://{container_name}:27017/{database_name}
```

## Maintenance

### Clear All Data
```bash
# Stop and remove containers with volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Reseed Data
```bash
# Clear database manually via mongosh or Docker
docker-compose down -v
docker-compose up -d

# Run seed scripts
.\scripts\seed-all.ps1  # Windows
# or
./scripts/seed-all.sh   # Linux/Mac
```

### Backup Database
```bash
# Backup auth database
docker exec sicepat-auth-db mongodump --db auth --out /backup

# Copy backup from container
docker cp sicepat-auth-db:/backup ./backup
```

### Restore Database
```bash
# Copy backup to container
docker cp ./backup sicepat-auth-db:/backup

# Restore database
docker exec sicepat-auth-db mongorestore --db auth /backup/auth
```

## Troubleshooting

### Connection Issues
```bash
# Check if containers are running
docker ps | grep sicepat

# Check container logs
docker logs sicepat-auth-db

# Restart containers
docker-compose restart auth-db bookings-db analytics-db profile-db
```

### Seed Script Fails
```bash
# Make sure containers are running first
docker-compose up -d

# Check if port 27017 is accessible
telnet localhost 27017

# Try manual connection
docker exec -it sicepat-auth-db mongosh
```

## Performance Tips

1. **Indexes**: All models have appropriate indexes for common queries
2. **Caching**: Analytics service uses TTL caching (5 minutes)
3. **Connection Pooling**: Each service maintains 2-10 connections
4. **Graceful Shutdown**: All services handle SIGTERM/SIGINT properly

## Security Considerations

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **No Default Credentials in Production**: Change demo passwords
3. **Network Isolation**: Services communicate via internal Docker network
4. **Environment Variables**: Never commit sensitive data to git
5. **Database Access**: MongoDB runs in isolated containers

## Monitoring

### Check Database Stats
```javascript
// In mongosh
db.stats()
db.users.stats()
db.bookings.countDocuments()
```

### Check Connection Health
```bash
# Via service health endpoints
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Bookings Service
curl http://localhost:3003/health  # Analytics Service
curl http://localhost:3004/health  # Notifications Service
curl http://localhost:3005/health  # Profile Service
```
