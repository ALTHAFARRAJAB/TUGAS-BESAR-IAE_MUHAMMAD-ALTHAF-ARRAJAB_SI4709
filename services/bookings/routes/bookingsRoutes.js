const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookingsController = require('../controllers/bookingsController');

// Validation rules
const bookingValidation = [
    body('passengerName').notEmpty().withMessage('Nama penumpang wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('phone').notEmpty().withMessage('Telepon wajib diisi'),
    body('destination').notEmpty().withMessage('Tujuan wajib diisi'),
    body('departureDate').isISO8601().withMessage('Tanggal keberangkatan tidak valid'),
    body('passengers').isInt({ min: 1 }).withMessage('Jumlah penumpang minimal 1'),
    body('totalPrice').isFloat({ min: 0 }).withMessage('Harga tidak valid')
];

// Routes
router.get('/', bookingsController.getAllBookings);
router.get('/search', bookingsController.searchBookings);
router.get('/export', bookingsController.exportBookings);
router.get('/:id', bookingsController.getBookingById);
router.post('/', bookingValidation, bookingsController.createBooking);
router.put('/:id', bookingValidation, bookingsController.updateBooking);
router.delete('/:id', bookingsController.deleteBooking);

module.exports = router;
