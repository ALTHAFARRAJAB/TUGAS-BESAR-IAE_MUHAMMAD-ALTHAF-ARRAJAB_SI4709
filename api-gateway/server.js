const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Service URLs
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    bookings: process.env.BOOKINGS_SERVICE_URL || 'http://localhost:3002',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004',
    profile: process.env.PROFILE_SERVICE_URL || 'http://localhost:3005'
};

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sicepat_jwt_secret_key_2026_very_secure');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Proxy function
const proxyRequest = async (req, res, serviceUrl) => {
    try {
        const config = {
            method: req.method,
            url: `${serviceUrl}${req.path}`,
            data: req.body,
            params: req.query,
            headers: {
                ...req.headers,
                host: new URL(serviceUrl).host
            }
        };

        const response = await axios(config);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Error proxying to ${serviceUrl}:`, error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({
                error: 'Service unavailable',
                message: error.message
            });
        }
    }
};

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: SERVICES
    });
});

// Auth routes (public - no token required)
app.post('/api/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/login`, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Service unavailable' });
        }
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const response = await axios.post(`${SERVICES.auth}/register`, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Service unavailable' });
        }
    }
});

// Protected routes (require authentication)
app.all('/api/auth/*', verifyToken, (req, res) => {
    const path = req.path.replace('/api/auth', '');
    proxyRequest(req, res, SERVICES.auth + path);
});
app.all('/api/bookings/*', verifyToken, (req, res) => {
    const path = req.path.replace('/api/bookings', '');
    proxyRequest(req, res, SERVICES.bookings + path);
});
app.all('/api/analytics/*', verifyToken, (req, res) => {
    const path = req.path.replace('/api/analytics', '');
    proxyRequest(req, res, SERVICES.analytics + path);
});
app.all('/api/notifications/*', verifyToken, (req, res) => {
    const path = req.path.replace('/api/notifications', '');
    proxyRequest(req, res, SERVICES.notifications + path);
});
app.all('/api/profile/*', verifyToken, (req, res) => {
    const path = req.path.replace('/api/profile', '');
    proxyRequest(req, res, SERVICES.profile + path);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚪 API Gateway running on port ${PORT}`);
    console.log(`📋 Services configured:`);
    Object.entries(SERVICES).forEach(([service, url]) => {
        console.log(`   - ${service}: ${url}`);
    });
});
