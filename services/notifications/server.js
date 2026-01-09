const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const DatabaseConfig = require('./config/dbConfig');
const Notification = require('./models/Notification');

const app = express();
const PORT = process.env.PORT || 3004;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notifications';

app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = new DatabaseConfig(MONGODB_URI, 'Notifications Service');

// Connect to MongoDB
dbConfig.connect()
    .then(() => {
        console.log('📬 Notifications history enabled');
    })
    .catch((err) => {
        console.error('❌ Failed to connect to database:', err);
        process.exit(1);
    });

// Send notification
app.post('/api/notifications/send', async (req, res) => {
    const { type, email, booking, subject, message } = req.body;

    try {
        console.log('📧 Sending notification:', type);
        console.log('  To:', email);
        console.log('  Booking:', booking?.passengerName);

        // In production, integrate with email service (SendGrid, AWS SES, etc.)
        // For now, just log and store in database

        // Create notification record
        const notification = await Notification.createAndSend({
            type: type || 'custom',
            email,
            bookingId: booking?.id || booking?._id,
            subject: subject || `Notification: ${type}`,
            message: message || `Notification sent for ${type}`,
            metadata: {
                passengerName: booking?.passengerName,
                destination: booking?.destination,
                departureDate: booking?.departureDate
            }
        });

        res.json({
            success: true,
            message: 'Notification sent',
            type,
            notificationId: notification._id
        });
    } catch (error) {
        console.error('Error sending notification:', error);

        // Store failed notification
        try {
            await Notification.create({
                type: type || 'custom',
                email,
                bookingId: booking?.id,
                subject: subject || `Notification: ${type}`,
                message: message || `Failed notification`,
                status: 'failed',
                errorMessage: error.message
            });
        } catch (dbError) {
            console.error('Failed to store error notification:', dbError);
        }

        res.status(500).json({
            success: false,
            error: 'Failed to send notification'
        });
    }
});

// Get notification history
app.get('/api/notifications/history', async (req, res) => {
    try {
        const { email, limit = 50 } = req.query;

        let notifications;
        if (email) {
            notifications = await Notification.getHistory(email, parseInt(limit));
        } else {
            notifications = await Notification.find()
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .select('-__v')
                .lean();
        }

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        console.error('Error fetching notification history:', error);
        res.status(500).json({ error: 'Failed to fetch notification history' });
    }
});

// Get notification by ID
app.get('/api/notifications/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ error: 'Failed to fetch notification' });
    }
});

// Get notification stats
app.get('/api/notifications/stats/summary', async (req, res) => {
    try {
        const [total, sent, failed, pending] = await Promise.all([
            Notification.countDocuments(),
            Notification.countDocuments({ status: 'sent' }),
            Notification.countDocuments({ status: 'failed' }),
            Notification.countDocuments({ status: 'pending' })
        ]);

        res.json({
            success: true,
            stats: {
                total,
                sent,
                failed,
                pending
            }
        });
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'notifications-service',
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
    console.log(`📬 Notifications Service running on port ${PORT}`);
});
