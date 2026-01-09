const mongoose = require('mongoose');

/**
 * Analytics Cache Model
 * Stores cached analytics data to reduce API calls to bookings service
 */
const analyticsCacheSchema = new mongoose.Schema({
    dataType: {
        type: String,
        required: true,
        enum: ['stats', 'trends', 'revenue'],
        index: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
analyticsCacheSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// TTL index - automatically delete expired documents
analyticsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for fast lookups
analyticsCacheSchema.index({ dataType: 1, expiresAt: 1 });

/**
 * Helper method to get or create cache
 */
analyticsCacheSchema.statics.getOrFetch = async function (dataType, fetchFunction, cacheDurationMinutes = 5) {
    // Check if valid cache exists
    const cache = await this.findOne({
        dataType,
        expiresAt: { $gt: new Date() }
    });

    if (cache) {
        return cache.data;
    }

    // Cache miss - fetch new data
    const data = await fetchFunction();

    // Store in cache
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + cacheDurationMinutes);

    await this.findOneAndUpdate(
        { dataType },
        {
            dataType,
            data,
            expiresAt,
            updatedAt: new Date()
        },
        { upsert: true, new: true }
    );

    return data;
};

module.exports = mongoose.model('AnalyticsCache', analyticsCacheSchema);
