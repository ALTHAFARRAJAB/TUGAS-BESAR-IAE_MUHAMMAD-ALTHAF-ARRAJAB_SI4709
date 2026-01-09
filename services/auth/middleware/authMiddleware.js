const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sicepat_jwt_secret_key_2026_very_secure';

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token tidak ditemukan' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token tidak valid' });
    }
};
