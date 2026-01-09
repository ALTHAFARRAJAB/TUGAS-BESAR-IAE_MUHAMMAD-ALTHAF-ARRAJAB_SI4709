const Booking = require('../models/Booking');
const axios = require('axios');

const NOTIFICATIONS_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004';

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const { status, sort = 'createdAt', order = 'desc' } = req.query;

        const filter = {};
        if (status) filter.status = status;

        const sortOrder = order === 'asc' ? 1 : -1;
        const sortOptions = { [sort]: sortOrder };

        const bookings = await Booking.find(filter).sort(sortOptions);

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data' });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ error: 'Booking tidak ditemukan' });
        }

        res.json({ success: true, booking });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Create booking
exports.createBooking = async (req, res) => {
    try {
        const bookingData = {
            ...req.body,
            userId: req.user?.id
        };

        const booking = new Booking(bookingData);
        await booking.save();

        // Send notification (fire and forget)
        try {
            await axios.post(`${NOTIFICATIONS_URL}/api/notifications/send`, {
                type: 'booking_created',
                booking: booking,
                email: booking.email
            });
        } catch (notifError) {
            console.error('Notification error:', notifError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Booking berhasil dibuat',
            booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat membuat booking' });
    }
};

// Update booking
exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({ error: 'Booking tidak ditemukan' });
        }

        // Send notification
        try {
            await axios.post(`${NOTIFICATIONS_URL}/api/notifications/send`, {
                type: 'booking_updated',
                booking: booking,
                email: booking.email
            });
        } catch (notifError) {
            console.error('Notification error:', notifError.message);
        }

        res.json({
            success: true,
            message: 'Booking berhasil diupdate',
            booking
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat update booking' });
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);

        if (!booking) {
            return res.status(404).json({ error: 'Booking tidak ditemukan' });
        }

        res.json({
            success: true,
            message: 'Booking berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus booking' });
    }
};

// Search bookings
exports.searchBookings = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter diperlukan' });
        }

        const bookings = await Booking.find({
            $or: [
                { passengerName: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { destination: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Search bookings error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat pencarian' });
    }
};

// Export to CSV
exports.exportBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });

        // Helper function to escape CSV fields properly
        const escapeCSVField = (field) => {
            if (field === null || field === undefined) return '';
            const str = String(field);
            // If field contains comma, quote, or newline, wrap in quotes and escape quotes
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        // Create CSV
        const headers = ['ID', 'Nama', 'Email', 'Telepon', 'Tujuan', 'Tanggal Berangkat', 'Tanggal Kembali', 'Penumpang', 'Harga', 'Status', 'Tanggal Booking'];
        const rows = bookings.map(b => [
            b._id,
            b.passengerName,
            b.email,
            b.phone,
            b.destination,
            b.departureDate.toISOString().split('T')[0],
            b.returnDate ? b.returnDate.toISOString().split('T')[0] : '-',
            b.passengers,
            b.totalPrice,
            b.status,
            b.createdAt.toISOString()
        ]);

        // Create CSV content with proper escaping
        const csv = [
            headers.map(escapeCSVField).join(','),
            ...rows.map(row => row.map(escapeCSVField).join(','))
        ].join('\r\n');

        // Add UTF-8 BOM for better Excel compatibility
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csv;

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `sicepat-bookings-${timestamp}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvWithBOM);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat export' });
    }
};
