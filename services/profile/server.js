const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const DatabaseConfig = require('./config/dbConfig');
const Profile = require('./models/Profile');

const app = express();
const PORT = process.env.PORT || 3005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/profile';

app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = new DatabaseConfig(MONGODB_URI, 'Profile Service');

// Connect to MongoDB
dbConfig.connect()
    .then(() => {
        console.log('👤 Profile service ready');
    })
    .catch((err) => {
        console.error('❌ Failed to connect to database:', err);
        process.exit(1);
    });

// Get profile by userId
app.get('/api/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await Profile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        res.json({ success: true, profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
});

// Get profile (legacy endpoint - uses demo user)
app.get('/api/profile', async (req, res) => {
    try {
        const userId = req.user?.id || 'demo';
        let profile = await Profile.findOne({ userId });

        // Create demo profile if not exists
        if (!profile) {
            profile = await Profile.findOrCreate(userId, {
                name: 'Demo User',
                email: 'demo@sicepat.com',
                phone: '081234567890'
            });
        }

        res.json({ success: true, profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
});

// Create or update profile
app.put('/api/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        let profile = await Profile.findOne({ userId });

        if (profile) {
            // Update existing profile
            profile = await profile.updateProfile(updates);
        } else {
            // Create new profile
            profile = await Profile.create({
                userId,
                ...updates
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
});

// Update profile (legacy endpoint)
app.put('/api/profile', async (req, res) => {
    try {
        const userId = req.user?.id || 'demo';
        const updates = req.body;

        let profile = await Profile.findOne({ userId });

        if (profile) {
            profile = await profile.updateProfile(updates);
        } else {
            profile = await Profile.create({
                userId,
                ...updates
            });
        }

        res.json({
            success: true,
            message: 'Profile updated',
            profile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
});

// Delete profile
app.delete('/api/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await Profile.findOneAndDelete({ userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
});

// Get all profiles (admin endpoint)
app.get('/api/profiles', async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [profiles, total] = await Promise.all([
            Profile.find()
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 }),
            Profile.countDocuments()
        ]);

        res.json({
            success: true,
            profiles,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'profile-service',
        dbConnected: dbConfig.isDBConnected()
    });
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

app.listen(PORT, () => {
    console.log(`👤 Profile Service running on port ${PORT}`);
});
