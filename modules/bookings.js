// Bookings module for managing travel bookings

import { Storage } from '../utils/storage.js';
import { NotificationManager } from '../components/notifications.js';
import { generateId, validateBookingForm } from '../utils/helpers.js';
import { sampleBookings } from '../data/sample-bookings.js';

export class BookingsManager {
    constructor() {
        this.notifications = new NotificationManager();
        this.bookings = [];
        this.filteredBookings = [];
    }

    // Initialize bookings
    init() {
        let bookings = Storage.getBookings();

        // If no bookings exist, load sample data
        if (bookings.length === 0) {
            bookings = sampleBookings;
            Storage.setBookings(bookings);
        }

        this.bookings = bookings;
        this.filteredBookings = [...bookings];
    }

    // Get all bookings
    getAll() {
        return this.bookings;
    }

    // Get filtered bookings
    getFiltered() {
        return this.filteredBookings;
    }

    // Get booking by ID
    getById(id) {
        return this.bookings.find(booking => booking.id === id);
    }

    // Create new booking
    create(bookingData) {
        const errors = validateBookingForm(bookingData);
        if (errors.length > 0) {
            this.notifications.error(errors[0]);
            return { success: false, errors };
        }

        const booking = {
            id: generateId(),
            ...bookingData,
            bookingDate: new Date().toISOString(),
            status: bookingData.status || 'pending'
        };

        this.bookings.push(booking);
        Storage.addBooking(booking);
        this.filteredBookings = [...this.bookings];

        this.notifications.success('Booking berhasil ditambahkan!');
        return { success: true, booking };
    }

    // Update existing booking
    update(id, bookingData) {
        const errors = validateBookingForm(bookingData);
        if (errors.length > 0) {
            this.notifications.error(errors[0]);
            return { success: false, errors };
        }

        const index = this.bookings.findIndex(b => b.id === id);
        if (index === -1) {
            this.notifications.error('Booking tidak ditemukan');
            return { success: false, error: 'Booking not found' };
        }

        this.bookings[index] = { ...this.bookings[index], ...bookingData };
        Storage.updateBooking(id, bookingData);
        this.filteredBookings = [...this.bookings];

        this.notifications.success('Booking berhasil diupdate!');
        return { success: true, booking: this.bookings[index] };
    }

    // Delete booking
    delete(id) {
        const index = this.bookings.findIndex(b => b.id === id);
        if (index === -1) {
            this.notifications.error('Booking tidak ditemukan');
            return { success: false, error: 'Booking not found' };
        }

        this.bookings.splice(index, 1);
        Storage.deleteBooking(id);
        this.filteredBookings = [...this.bookings];

        this.notifications.success('Booking berhasil dihapus!');
        return { success: true };
    }

    // Search bookings
    search(query) {
        if (!query || query.trim() === '') {
            this.filteredBookings = [...this.bookings];
            return this.filteredBookings;
        }

        const searchTerm = query.toLowerCase();
        this.filteredBookings = this.bookings.filter(booking =>
            booking.passengerName.toLowerCase().includes(searchTerm) ||
            booking.email.toLowerCase().includes(searchTerm) ||
            booking.destination.toLowerCase().includes(searchTerm) ||
            booking.phone.includes(searchTerm) ||
            (booking.notes && booking.notes.toLowerCase().includes(searchTerm))
        );

        return this.filteredBookings;
    }

    // Filter by status
    filterByStatus(status) {
        if (!status || status === '') {
            this.filteredBookings = [...this.bookings];
        } else {
            this.filteredBookings = this.bookings.filter(b => b.status === status);
        }
        return this.filteredBookings;
    }

    // Sort bookings
    sort(sortBy) {
        const sortFunctions = {
            'date-desc': (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate),
            'date-asc': (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate),
            'price-desc': (a, b) => b.totalPrice - a.totalPrice,
            'price-asc': (a, b) => a.totalPrice - b.totalPrice
        };

        const sortFn = sortFunctions[sortBy];
        if (sortFn) {
            this.filteredBookings.sort(sortFn);
        }

        return this.filteredBookings;
    }

    // Get statistics
    getStatistics() {
        const stats = {
            total: this.bookings.length,
            pending: this.bookings.filter(b => b.status === 'pending').length,
            confirmed: this.bookings.filter(b => b.status === 'confirmed').length,
            completed: this.bookings.filter(b => b.status === 'completed').length,
            cancelled: this.bookings.filter(b => b.status === 'cancelled').length,
            totalRevenue: this.bookings
                .filter(b => b.status !== 'cancelled')
                .reduce((sum, b) => sum + b.totalPrice, 0),
            totalPassengers: this.bookings.reduce((sum, b) => sum + b.passengers, 0)
        };

        return stats;
    }

    // Get recent bookings
    getRecent(limit = 5) {
        return [...this.bookings]
            .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
            .slice(0, limit);
    }

    // Get bookings by destination
    getByDestination() {
        const byDestination = {};
        this.bookings.forEach(booking => {
            if (!byDestination[booking.destination]) {
                byDestination[booking.destination] = {
                    count: 0,
                    revenue: 0
                };
            }
            if (booking.status !== 'cancelled') {
                byDestination[booking.destination].count++;
                byDestination[booking.destination].revenue += booking.totalPrice;
            }
        });
        return byDestination;
    }

    // Get trend data (last 6 months)
    getTrendData() {
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
                count: 0,
                revenue: 0
            });
        }

        this.bookings.forEach(booking => {
            const bookingDate = new Date(booking.bookingDate);
            const monthDiff = (now.getFullYear() - bookingDate.getFullYear()) * 12 +
                (now.getMonth() - bookingDate.getMonth());

            if (monthDiff >= 0 && monthDiff < 6) {
                const index = 5 - monthDiff;
                if (booking.status !== 'cancelled') {
                    months[index].count++;
                    months[index].revenue += booking.totalPrice;
                }
            }
        });

        return months;
    }
}
