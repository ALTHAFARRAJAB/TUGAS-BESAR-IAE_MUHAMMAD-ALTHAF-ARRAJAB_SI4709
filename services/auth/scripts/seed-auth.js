const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth';

// Demo users to seed
const demoUsers = [
    {
        email: 'admin@sicepat.com',
        password: 'admin123',
        name: 'Administrator SICEPAT',
        role: 'admin',
        phone: '081234567890'
    },
    {
        email: 'user@sicepat.com',
        password: 'user123',
        name: 'Demo User',
        role: 'user',
        phone: '081234567891'
    },
    {
        email: 'budi@sicepat.com',
        password: 'budi123',
        name: 'Budi Santoso',
        role: 'user',
        phone: '081234567892'
    }
];

async function seedUsers() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🌱 Seeding users...');

        for (const userData of demoUsers) {
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`⏭️  User ${userData.email} already exists, skipping...`);
            } else {
                const user = new User(userData);
                await user.save();
                console.log(`✅ Created user: ${userData.email}`);
            }
        }

        console.log('✅ User seeding completed!');

        // Show summary
        const totalUsers = await User.countDocuments();
        console.log(`\n📊 Total users in database: ${totalUsers}`);

    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
}

// Run seed function
seedUsers();
