const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const DatabaseConfig = require('./config/dbConfig');
const AnalyticsCache = require('./models/AnalyticsCache');

const app = express();
const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/analytics';
const BOOKINGS_URL = process.env.BOOKINGS_SERVICE_URL || 'http://localhost:3002';

app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = new DatabaseConfig(MONGODB_URI, 'Analytics Service');

// Connect to MongoDB
dbConfig.connect()
    .then(() => {
        console.log('💾 Analytics caching enabled');
    })
    .catch((err) => {
        console.error('❌ Failed to connect to database:', err);
        console.log('⚠️  Continuing without caching...');
    });

// Helper function to fetch bookings
async function fetchBookings() {
    try {
        const response = await axios.get(`${BOOKINGS_URL}/api/bookings`);
        return response.data.bookings;
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        throw error;
    }
}

// Get statistics with caching
app.get('/api/analytics/stats', async (req, res) => {
    try {
        const stats = await AnalyticsCache.getOrFetch('stats', async () => {
            const bookings = await fetchBookings();

            return {
                total: bookings.length,
                pending: bookings.filter(b => b.status === 'pending').length,
                confirmed: bookings.filter(b => b.status === 'confirmed').length,
                completed: bookings.filter(b => b.status === 'completed').length,
                cancelled: bookings.filter(b => b.status === 'cancelled').length,
                totalRevenue: bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.totalPrice, 0),
                totalPassengers: bookings.reduce((sum, b) => sum + b.passengers, 0)
            };
        }, 5); // Cache for 5 minutes

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Stats error:', error.message);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil statistik' });
    }
});

// Get trends with caching
app.get('/api/analytics/trends', async (req, res) => {
    try {
        const trends = await AnalyticsCache.getOrFetch('trends', async () => {
            const bookings = await fetchBookings();
            const months = {};

            bookings.forEach(b => {
                const month = new Date(b.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
                if (!months[month]) {
                    months[month] = { count: 0, revenue: 0 };
                }
                if (b.status !== 'cancelled') {
                    months[month].count++;
                    months[month].revenue += b.totalPrice;
                }
            });

            return months;
        }, 5);

        res.json({ success: true, trends });
    } catch (error) {
        console.error('Trends error:', error.message);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
});

// Revenue by destination with caching
app.get('/api/analytics/revenue', async (req, res) => {
    try {
        const revenue = await AnalyticsCache.getOrFetch('revenue', async () => {
            const bookings = await fetchBookings();
            const byDestination = {};

            bookings.forEach(b => {
                if (!byDestination[b.destination]) {
                    byDestination[b.destination] = { count: 0, revenue: 0 };
                }
                if (b.status !== 'cancelled') {
                    byDestination[b.destination].count++;
                    byDestination[b.destination].revenue += b.totalPrice;
                }
            });

            return byDestination;
        }, 5);

        res.json({ success: true, revenue });
    } catch (error) {
        console.error('Revenue error:', error.message);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
});

// Clear cache endpoint (for manual invalidation)
app.delete('/api/analytics/cache', async (req, res) => {
    try {
        await AnalyticsCache.deleteMany({});
        res.json({ success: true, message: 'Cache cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'analytics-service',
        cacheEnabled: dbConfig.isDBConnected()
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
    console.log(`📊 Analytics Service running on port ${PORT}`);
});
