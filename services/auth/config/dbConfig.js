const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 * Handles connection with retry logic and proper error handling
 */
class DatabaseConfig {
    constructor(uri, serviceName) {
        this.uri = uri;
        this.serviceName = serviceName;
        this.isConnected = false;
    }

    /**
     * Connect to MongoDB with retry logic
     */
    async connect() {
        const options = {
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            family: 4 // Use IPv4
        };

        try {
            await mongoose.connect(this.uri, options);
            this.isConnected = true;
            console.log(`✅ ${this.serviceName} connected to MongoDB`);

            // Handle connection events
            mongoose.connection.on('disconnected', () => {
                console.log(`⚠️  ${this.serviceName} disconnected from MongoDB`);
                this.isConnected = false;
            });

            mongoose.connection.on('error', (err) => {
                console.error(`❌ ${this.serviceName} MongoDB error:`, err);
            });

            mongoose.connection.on('reconnected', () => {
                console.log(`♻️  ${this.serviceName} reconnected to MongoDB`);
                this.isConnected = true;
            });

        } catch (error) {
            console.error(`❌ ${this.serviceName} MongoDB connection error:`, error.message);
            throw error;
        }
    }

    /**
     * Graceful shutdown
     */
    async disconnect() {
        try {
            await mongoose.connection.close();
            console.log(`👋 ${this.serviceName} disconnected from MongoDB`);
        } catch (error) {
            console.error(`❌ Error disconnecting from MongoDB:`, error);
        }
    }

    /**
     * Check if connected
     */
    isDBConnected() {
        return this.isConnected && mongoose.connection.readyState === 1;
    }
}

module.exports = DatabaseConfig;
