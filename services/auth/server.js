const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'auth-service',
        timestamp: new Date().toISOString()
    });
});

const DatabaseConfig = require('./config/dbConfig');

// Database configuration
const dbConfig = new DatabaseConfig(MONGODB_URI, 'Auth Service');

// Connect to MongoDB
dbConfig.connect()
    .then(async () => {
        // Create default admin user if not exists
        const User = require('./models/User');
        const adminExists = await User.findOne({ email: 'admin@sicepat.com' });

        if (!adminExists) {
            const admin = new User({
                email: 'admin@sicepat.com',
                password: 'admin123',
                name: 'Administrator SICEPAT',
                role: 'admin',
                phone: '081234567890'
            });
            await admin.save();
            console.log('✅ Default admin user created');
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
    console.log(`🔐 Auth Service running on port ${PORT}`);
});
