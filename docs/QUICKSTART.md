# Quick Start - Database Seeding

## Database sudah berjalan dan siap digunakan! ✅

MongoDB containers sudah running di Docker. Data akan otomatis di-seed saat services pertama kali dijalankan.

## Cara Menjalankan Services

### 1. Start Semua Services dengan Docker

```powershell
# Start semua services (API Gateway + Microservices + Databases)
docker-compose up --build
```

Services akan otomatis:
- Connect ke database
- Membuat seed data jika database kosong
- Siap menerima request

### 2. Verify Services Running

```powershell
# Check service health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Bookings Service  
curl http://localhost:3003/health  # Analytics Service
curl http://localhost:3004/health  # Notifications Service
curl http://localhost:3005/health  # Profile Service
```

### 3. Test API Endpoints

```powershell
# Login
curl -X POST http://localhost:8080/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@sicepat.com", "password":"admin123"}'

# Get bookings
curl http://localhost:8080/bookings
```

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@sicepat.com | admin123 | admin |
| user@sicepat.com | user123 | user |

## Sample Data

Saat services pertama kali start, akan otomatis dibuat:
- **3 demo users** (admin, user, budi)
- **8 sample bookings** (berbagai status dan destinasi)
- **User profiles** untuk semua demo users

## Troubleshooting

### MongoDB Not Accessible
Jika ada error koneksi database:
```powershell
# Restart database containers
docker-compose restart auth-db bookings-db analytics-db profile-db

# Check logs
docker logs sicepat-auth-db
```

### Clear All Data
Untuk mulai dari awal:
```powershell
docker-compose down -v
docker-compose up --build
```

## Architecture

```
Frontend (Port 80)
   ↓
API Gateway (Port 8080)
   ↓
Microservices:
├─ Auth Service (Port 3001) → auth-db
├─ Bookings Service (Port 3002) → bookings-db
├─ Analytics Service (Port 3003) → analytics-db
├─ Notifications Service (Port 3004) → bookings-db
└─ Profile Service (Port 3005) → profile-db
```

## Next Steps

1. Start semua services: `docker-compose up --build`
2. Open browser: `http://localhost`
3. Login dengan `admin@sicepat.com` / `admin123`
4. Explore fitur-fitur SICEPAT!

Untuk dokumentasi lengkap, lihat:
- `docs/DATABASE_SETUP.md` - Database architecture & models
- `docs/API.md` - API endpoints documentation
