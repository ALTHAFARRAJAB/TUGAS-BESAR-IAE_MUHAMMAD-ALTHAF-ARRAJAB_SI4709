const mongoose = require('mongoose');

/**
 * Notification Model
 * Stores notification history for audit and tracking
 */
const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['booking_created', 'booking_updated', 'booking_cancelled', 'booking_confirmed', 'reminder', 'custom'],
        index: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    bookingId: {
        type: String,
        trim: true,
        index: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending',
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    errorMessage: {
        type: String
    },
    sentAt: {
        type: Date,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound indexes for common queries
notificationSchema.index({ email: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ bookingId: 1, type: 1 });

/**
 * Static method to create and mark notification as sent
 */
notificationSchema.statics.createAndSend = async function (notificationData) {
    const notification = new this({
        ...notificationData,
        status: 'sent',
        sentAt: new Date()
    });

    await notification.save();
    return notification;
};

/**
 * Static method to get notification history for a user
 */
notificationSchema.statics.getHistory = async function (email, limit = 50) {
    return this.find({ email })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-__v')
        .lean();
};

module.exports = mongoose.model('Notification', notificationSchema);
