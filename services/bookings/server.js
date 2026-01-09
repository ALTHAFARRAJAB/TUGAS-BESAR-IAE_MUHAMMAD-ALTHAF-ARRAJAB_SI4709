const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const bookingsRoutes = require('./routes/bookingsRoutes');

const app = express();
const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookings';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'bookings-service',
        timestamp: new Date().toISOString()
    });
});

const DatabaseConfig = require('./config/dbConfig');

// Database configuration
const dbConfig = new DatabaseConfig(MONGODB_URI, 'Bookings Service');

// Connect to MongoDB
dbConfig.connect()
    .then(async () => {
        // Create sample bookings if database is empty
        const Booking = require('./models/Booking');
        const count = await Booking.countDocuments();

        if (count === 0) {
            const sampleBookings = [
                {
                    passengerName: 'Budi Santoso',
                    email: 'budi.santoso@email.com',
                    phone: '081234567890',
                    destination: 'Bali',
                    departureDate: new Date('2026-02-15'),
                    returnDate: new Date('2026-02-20'),
                    passengers: 2,
                    totalPrice: 5000000,
                    status: 'confirmed',
                    notes: 'Honeymoon trip'
                },
                {
                    passengerName: 'Siti Nurhaliza',
                    email: 'siti.nurhaliza@email.com',
                    phone: '082345678901',
                    destination: 'Jakarta',
                    departureDate: new Date('2026-01-20'),
                    returnDate: new Date('2026-01-22'),
                    passengers: 1,
                    totalPrice: 1500000,
                    status: 'pending',
                    notes: 'Business trip'
                },
                {
                    passengerName: 'Ahmad Wijaya',
                    email: 'ahmad.wijaya@email.com',
                    phone: '083456789012',
                    destination: 'Yogyakarta',
                    departureDate: new Date('2026-03-10'),
                    returnDate: new Date('2026-03-15'),
                    passengers: 4,
                    totalPrice: 8000000,
                    status: 'confirmed',
                    notes: 'Family vacation'
                },
                {
                    passengerName: 'Dewi Lestari',
                    email: 'dewi.lestari@email.com',
                    phone: '084567890123',
                    destination: 'Surabaya',
                    departureDate: new Date('2026-01-15'),
                    passengers: 1,
                    totalPrice: 800000,
                    status: 'completed',
                    notes: 'One way trip'
                },
                {
                    passengerName: 'Rizki Ananda',
                    email: 'rizki.ananda@email.com',
                    phone: '085678901234',
                    destination: 'Bandung',
                    departureDate: new Date('2026-02-01'),
                    returnDate: new Date('2026-02-03'),
                    passengers: 3,
                    totalPrice: 3500000,
                    status: 'cancelled',
                    notes: 'Cancelled due to emergency'
                },
                {
                    passengerName: 'Putri Amelia',
                    email: 'putri.amelia@email.com',
                    phone: '086789012345',
                    destination: 'Malang',
                    departureDate: new Date('2026-04-05'),
                    returnDate: new Date('2026-04-10'),
                    passengers: 2,
                    totalPrice: 4200000,
                    status: 'confirmed',
                    notes: 'Anniversary celebration'
                },
                {
                    passengerName: 'Andi Firmansyah',
                    email: 'andi.firmansyah@email.com',
                    phone: '087890123456',
                    destination: 'Lombok',
                    departureDate: new Date('2026-05-20'),
                    returnDate: new Date('2026-05-25'),
                    passengers: 5,
                    totalPrice: 12000000,
                    status: 'pending',
                    notes: 'Group tour'
                },
                {
                    passengerName: 'Maya Angelina',
                    email: 'maya.angelina@email.com',
                    phone: '088901234567',
                    destination: 'Medan',
                    departureDate: new Date('2026-02-25'),
                    returnDate: new Date('2026-02-28'),
                    passengers: 2,
                    totalPrice: 3800000,
                    status: 'confirmed',
                    notes: 'Visit relatives'
                }
            ];

            await Booking.insertMany(sampleBookings);
            console.log('✅ Sample bookings created');
        }
    })
    .catch((err) => {
        console.error('❌ Failed to connect to database:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', async () => {
    await dbConfig.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await dbConfig.disconnect();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`📅 Bookings Service running on port ${PORT}`);
});
