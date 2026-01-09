const mongoose = require('mongoose');
require('dotenv').config();

const Profile = require('../models/Profile');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/profile';

// Demo profiles to seed
const demoProfiles = [
    {
        userId: 'admin',
        name: 'Administrator SICEPAT',
        email: 'admin@sicepat.com',
        phone: '081234567890',
        avatar: '',
        preferences: {
            language: 'id',
            currency: 'IDR',
            notifications: {
                email: true,
                sms: false,
                push: true
            },
            theme: 'light'
        }
    },
    {
        userId: 'demo',
        name: 'Demo User',
        email: 'user@sicepat.com',
        phone: '081234567891',
        avatar: '',
        preferences: {
            language: 'id',
            currency: 'IDR',
            notifications: {
                email: true,
                sms: false,
                push: true
            },
            theme: 'dark'
        }
    },
    {
        userId: 'budi',
        name: 'Budi Santoso',
        email: 'budi@sicepat.com',
        phone: '081234567892',
        avatar: '',
        preferences: {
            language: 'id',
            currency: 'IDR',
            notifications: {
                email: true,
                sms: true,
                push: true
            },
            theme: 'light'
        }
    }
];

async function seedProfiles() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🌱 Seeding profiles...');

        for (const profileData of demoProfiles) {
            const existingProfile = await Profile.findOne({ userId: profileData.userId });

            if (existingProfile) {
                console.log(`⏭️  Profile for ${profileData.userId} already exists, skipping...`);
            } else {
                const profile = new Profile(profileData);
                await profile.save();
                console.log(`✅ Created profile: ${profileData.name} (${profileData.userId})`);
            }
        }

        console.log('✅ Profile seeding completed!');

        // Show summary
        const totalProfiles = await Profile.countDocuments();
        console.log(`\n📊 Total profiles in database: ${totalProfiles}`);

    } catch (error) {
        console.error('❌ Error seeding profiles:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
}

// Run seed function
seedProfiles();
