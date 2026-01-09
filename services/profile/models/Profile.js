const mongoose = require('mongoose');

/**
 * User Profile Model
 * Stores user profile information separate from authentication
 */
const profileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        trim: true
    },
    preferences: {
        language: {
            type: String,
            default: 'id',
            enum: ['id', 'en']
        },
        currency: {
            type: String,
            default: 'IDR'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            },
            push: {
                type: Boolean,
                default: true
            }
        },
        theme: {
            type: String,
            default: 'light',
            enum: ['light', 'dark', 'auto']
        }
    },
    settings: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
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
profileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    this.lastUpdated = Date.now();
    next();
});

// Index for efficient queries
profileSchema.index({ userId: 1, isActive: 1 });
profileSchema.index({ email: 1 });

/**
 * Static method to find or create profile
 */
profileSchema.statics.findOrCreate = async function (userId, defaultData = {}) {
    let profile = await this.findOne({ userId });

    if (!profile) {
        profile = new this({
            userId,
            ...defaultData
        });
        await profile.save();
    }

    return profile;
};

/**
 * Instance method to update profile
 */
profileSchema.methods.updateProfile = async function (updates) {
    Object.assign(this, updates);
    this.lastUpdated = new Date();
    return await this.save();
};

module.exports = mongoose.model('Profile', profileSchema);
