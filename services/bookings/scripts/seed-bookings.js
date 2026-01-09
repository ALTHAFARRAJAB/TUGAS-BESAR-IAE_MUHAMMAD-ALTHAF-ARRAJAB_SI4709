const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('../models/Booking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookings';

// Sample bookings data
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

async function seedBookings() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const count = await Booking.countDocuments();

        if (count > 0) {
            console.log(`⚠️  Database already has ${count} bookings`);
            console.log('Do you want to clear and reseed? This will delete all existing data.');
            console.log('Skipping seeding for safety. To force reseed, manually delete the collection.');
            return;
        }

        console.log('🌱 Seeding bookings...');
        await Booking.insertMany(sampleBookings);
        console.log(`✅ Created ${sampleBookings.length} sample bookings`);

        // Show summary
        const stats = {
            total: sampleBookings.length,
            pending: sampleBookings.filter(b => b.status === 'pending').length,
            confirmed: sampleBookings.filter(b => b.status === 'confirmed').length,
            completed: sampleBookings.filter(b => b.status === 'completed').length,
            cancelled: sampleBookings.filter(b => b.status === 'cancelled').length
        };

        console.log('\n📊 Booking Summary:');
        console.log(`   Total: ${stats.total}`);
        console.log(`   Pending: ${stats.pending}`);
        console.log(`   Confirmed: ${stats.confirmed}`);
        console.log(`   Completed: ${stats.completed}`);
        console.log(`   Cancelled: ${stats.cancelled}`);

    } catch (error) {
        console.error('❌ Error seeding bookings:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
}

// Run seed function
seedBookings();
