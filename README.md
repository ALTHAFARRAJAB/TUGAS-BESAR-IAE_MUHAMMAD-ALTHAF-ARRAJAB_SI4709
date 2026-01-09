# SICEPAT - Sistem Cerdas Paling Tepat

Website travel booking modern dengan arsitektur microservices, fitur lengkap untuk mengelola pemesanan travel dengan database MongoDB persistence.

## 🚀 Fitur Utama

### Core Features
- ✅ **Login & Logout** - Sistem autentikasi JWT dengan session management
- ✅ **Dashboard** - Statistik dan ringkasan booking dengan visualisasi real-time
- ✅ **CRUD Booking** - Tambah, lihat, edit, dan hapus booking
- ✅ **Search** - Pencarian real-time berdasarkan nama, email, tujuan
- ✅ **Notifikasi** - Alert sukses/error untuk setiap aksi
- ✅ **Notification History** - Tracking semua notifikasi yang dikirim

### Enhanced Features
- 📊 **Analytics Dashboard** - Charts interaktif (trend, status, revenue) dengan caching
- 🔍 **Advanced Filters** - Filter berdasarkan status dan sorting
- 📤 **Export CSV** - Ekspor data booking ke CSV
- 👤 **Profile Management** - Kelola informasi akun pengguna dengan preferences
- 🌙 **Dark Mode** - Toggle tema terang/gelap dengan animasi smooth
- 📱 **Fully Responsive** - Optimal di desktop, tablet, dan mobile
- ✨ **Premium UI/UX** - Glassmorphism, gradients, micro-animations

## 🛠️ Teknologi

### Frontend
- **HTML5** - Struktur semantik dengan SEO optimization
- **CSS3** - Custom properties, flexbox, grid, animations
- **JavaScript ES6+** - Modules, classes, async/await
- **Canvas API** - Rendering charts dan visualisasi

### Backend (Microservices)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database dengan 4 database terpisah
- **Mongoose** - ODM untuk MongoDB
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server untuk frontend

**Cek instalasi:**
```powershell
docker --version
docker-compose --version
```

**Apa yang terjadi:**
- ✅ Download/build Docker images (pertama kali ~5-10 menit)
- ✅ Start 4 MongoDB containers (auth, bookings, analytics, profile)
- ✅ Start 5 microservices (auth, bookings, analytics, notifications, profile)
- ✅ Start API Gateway
- ✅ Start Frontend (Nginx)
- ✅ Auto-create database dan seed data (user, bookings, profiles)

**Tunggu hingga muncul pesan:**
```
✅ Auth Service connected to MongoDB
✅ Default admin user created
✅ Bookings Service connected to MongoDB
✅ Sample bookings created
✅ Profile Service connected to MongoDB
✅ Analytics Service connected to MongoDB
✅ Notifications Service connected to MongoDB
```

### Langkah 1: Buka Aplikasi di Browser

Setelah semua services running, buka:

**🌐 Frontend:** http://localhost

**API Gateway:** http://localhost:8080

### Langkah 2: Login ke Aplikasi

Gunakan kredensial demo:
- **Email:** `admin@sicepat.com`
- **Password:** `admin123`

## 🎯 Demo Credentials

| Email | Password | Role | Deskripsi |
|-------|----------|------|-----------|
| admin@sicepat.com | admin123 | admin | Administrator dengan akses penuh |
| user@sicepat.com | user123 | user | User biasa |
| budi@sicepat.com | budi123 | user | User contoh |

## 📊 Arsitektur Microservices

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Nginx)                     │
│                   http://localhost:80                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway (Express)                 │
│                  http://localhost:8080                  │
└────────────────┬───────────────────────────┬────────────┘
                 │                           │
        ┌────────┴────────┐         ┌────────┴────────┐
        │                 │         │                 │
        ▼                 ▼         ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │   Bookings   │  │  Analytics   │
│  Port: 3001  │  │ Port: 3002   │  │ Port: 3003   │
│      ↓       │  │      ↓       │  │      ↓       │
│   auth-db    │  │ bookings-db  │  │ analytics-db │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│Notifications │  │   Profile    │
│ Port: 3004   │  │ Port: 3005   │
│      ↓       │  │      ↓       │
│ bookings-db  │  │ profile-db   │
└──────────────┘  └──────────────┘
```

## 📖 Panduan Penggunaan

### Dashboard
- Lihat statistik total booking, revenue, dan status
- Grafik trend booking 6 bulan terakhir
- Akses booking terbaru dari dashboard
- Klik "Lihat Semua" untuk menuju halaman booking

### Manajemen Booking
- **Tambah**: Klik tombol "Tambah Booking" dan isi form
- **Edit**: Klik icon pensil pada booking yang ingin diedit
- **Hapus**: Klik icon tempat sampah dengan konfirmasi
- **Search**: Gunakan search bar untuk pencarian real-time
- **Filter**: Filter berdasarkan status (pending, confirmed, completed, cancelled)
- **Sort**: Urutkan berdasarkan tanggal atau harga
- **Export**: Download semua data ke CSV

### Analytics
- **Trend Chart**: Grafik booking per bulan
- **Status Distribution**: Pie chart distribusi status
- **Revenue per Destination**: Bar chart pendapatan per tujuan
- **Auto-refresh**: Data di-cache 5 menit untuk performa optimal

### Profile Management
- Update nama lengkap dan nomor telepon
- Atur preferensi notifikasi (email, SMS, push)
- Pilih tema (light/dark/auto)
- Atur bahasa dan mata uang

### Dark Mode
- Klik icon matahari/bulan di sidebar untuk toggle tema
- Preference tersimpan otomatis di database

## 🔍 Monitoring & Troubleshooting

### Cek Status Services

```powershell
# Lihat container yang running
docker ps

# Lihat logs semua services
docker-compose logs -f

# Lihat logs service tertentu
docker-compose logs -f auth-service
docker-compose logs -f bookings-service
```

### Health Check Endpoints

```powershell
# Check semua services
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Bookings
curl http://localhost:3003/health  # Analytics
curl http://localhost:3004/health  # Notifications
curl http://localhost:3005/health  # Profile
```

### Common Issues

**1. Port sudah digunakan**
```powershell
# Stop aplikasi lain yang menggunakan port 80, 8080, atau 3001-3005
# Atau ubah port di docker-compose.yml
```

**2. Docker tidak running**
```powershell
# Buka Docker Desktop dan tunggu sampai running
# Cek status: docker ps
```

**3. Database kosong/error**
```powershell
# Stop dan hapus semua data
docker-compose down -v

# Start ulang (akan auto-seed)
docker-compose up --build
```

**4. Build error**
```powershell
# Clear Docker cache
docker system prune -a

# Build ulang
docker-compose up --build
```

## 🛑 Stop Aplikasi

```powershell
# Stop semua services (data tetap tersimpan)
docker-compose down

# Stop dan hapus semua data (fresh start)
docker-compose down -v
```

## 🎨 Struktur Proyek

```
EAI_ALTHAF/
├── frontend/                # Frontend Nginx
│   ├── Dockerfile
│   └── nginx.conf
├── api-gateway/            # API Gateway
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── services/
│   ├── auth/              # Authentication Service
│   │   ├── models/        # User model
│   │   ├── routes/        # Auth routes
│   │   ├── controllers/   # Auth logic
│   │   ├── config/        # Database config
│   │   ├── scripts/       # Seed scripts
│   │   └── server.js
│   ├── bookings/          # Bookings Service
│   │   ├── models/        # Booking model
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── config/
│   │   ├── scripts/
│   │   └── server.js
│   ├── analytics/         # Analytics Service
│   │   ├── models/        # Analytics cache model
│   │   ├── config/
│   │   └── server.js
│   ├── notifications/     # Notifications Service
│   │   ├── models/        # Notification model
│   │   ├── config/
│   │   └── server.js
│   └── profile/           # Profile Service
│       ├── models/        # Profile model
│       ├── config/
│       ├── scripts/
│       └── server.js
├── docs/                  # Documentation
│   ├── DATABASE_SETUP.md  # Database guide
│   └── QUICKSTART.md      # Quick start guide
├── index.html             # Main frontend HTML
├── styles.css             # CSS styles
├── app.js                 # Main app logic
├── components/            # UI components
├── modules/               # Feature modules
├── utils/                 # Utility functions
├── docker-compose.yml     # Docker orchestration
└── README.md             # This file
```

## � Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt dengan 10 salt rounds
- ✅ **Session Management** - Secure session handling
- ✅ **Input Validation** - Server-side validation
- ✅ **XSS Protection** - Input sanitization
- ✅ **CORS Configuration** - Controlled cross-origin requests
- ✅ **Isolated Databases** - Separate DB per service

## 📊 Database & Data

### Databases
- **auth** - User credentials (3 demo users)
- **bookings** - Travel bookings (8 sample bookings)
- **analytics** - Cached analytics data
- **profile** - User profiles dan preferences
- **notifications** - Notification history

### Sample Data
- **Total Bookings**: 8 bookings
- **Total Revenue**: Rp 37,800,000 (excluding cancelled)
- **Destinations**: Bali, Jakarta, Yogyakarta, Surabaya, Bandung, Malang, Lombok, Medan
- **Status Distribution**: 2 pending, 4 confirmed, 1 completed, 1 cancelled

## � API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register user
- `POST /auth/logout` - Logout user

### Bookings
- `GET /bookings` - Get all bookings
- `GET /bookings/:id` - Get booking by ID
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking

### Analytics
- `GET /analytics/stats` - Get statistics
- `GET /analytics/trends` - Get trends
- `GET /analytics/revenue` - Get revenue by destination
- `DELETE /analytics/cache` - Clear cache

### Notifications
- `POST /notifications/send` - Send notification
- `GET /notifications/history` - Get notification history
- `GET /notifications/:id` - Get notification by ID
- `GET /notifications/stats/summary` - Get stats

### Profile
- `GET /profile/:userId` - Get profile
- `PUT /profile/:userId` - Update profile
- `DELETE /profile/:userId` - Delete profile
- `GET /profiles` - Get all profiles (admin)

## 📚 Dokumentasi Lengkap

- **[docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)** - Setup database dan arsitektur
- **[docs/QUICKSTART.md](docs/QUICKSTART.md)** - Quick start guide

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

## 📱 Responsive Design

- 📱 **Mobile**: < 768px
- 💻 **Tablet**: 768px - 1024px
- 🖥️ **Desktop**: > 1024px

## 📄 License

MIT License - Created for educational purposes

## 👨‍💻 Developer

SICEPAT Development Team

---

**SICEPAT** - Sistem Cerdas Paling Tepat untuk kemudahan booking travel Anda! 🚀

**Need Help?** Check [docs/QUICKSTART.md](docs/QUICKSTART.md) atau [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)
