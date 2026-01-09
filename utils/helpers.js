// Helper functions for formatting and validation

// Format date to Indonesian locale
export function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Jakarta'
    };
    return new Date(date).toLocaleDateString('id-ID', options);
}

// Format date with time
export function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
    };
    return new Date(date).toLocaleDateString('id-ID', options);
}

// Format currency to Indonesian Rupiah
export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Validate email format
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Indonesian format)
export function isValidPhone(phone) {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

// Sanitize string input
export function sanitizeString(str) {
    return str.trim().replace(/[<>]/g, '');
}

// Generate unique ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Calculate days between two dates
export function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

// Export bookings to CSV
export function exportToCSV(bookings) {
    const headers = ['ID', 'Nama', 'Email', 'Telepon', 'Tujuan', 'Tanggal Berangkat', 'Tanggal Kembali', 'Jumlah Penumpang', 'Harga Total', 'Status', 'Tanggal Booking'];

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

    const rows = bookings.map(booking => [
        booking.id,
        booking.passengerName,
        booking.email,
        booking.phone,
        booking.destination,
        booking.departureDate,
        booking.returnDate || '-',
        booking.passengers,
        booking.totalPrice,
        booking.status,
        formatDateTime(booking.bookingDate)
    ]);

    // Create CSV content with proper escaping
    const csvContent = [
        headers.map(escapeCSVField).join(','),
        ...rows.map(row => row.map(escapeCSVField).join(','))
    ].join('\r\n');

    // Add UTF-8 BOM for better Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `sicepat-bookings-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if date is in the past
export function isPastDate(date) {
    return new Date(date) < new Date();
}

// Get status color class
export function getStatusClass(status) {
    const statusMap = {
        'pending': 'pending',
        'confirmed': 'confirmed',
        'completed': 'completed',
        'cancelled': 'cancelled'
    };
    return statusMap[status] || 'pending';
}

// Get status label in Indonesian
export function getStatusLabel(status) {
    const labels = {
        'pending': 'Menunggu',
        'confirmed': 'Dikonfirmasi',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    return labels[status] || status;
}

// Validate booking form
export function validateBookingForm(data) {
    const errors = [];

    if (!data.passengerName || data.passengerName.trim().length < 3) {
        errors.push('Nama penumpang minimal 3 karakter');
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Email tidak valid');
    }

    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('Nomor telepon tidak valid');
    }

    if (!data.destination || data.destination.trim().length < 3) {
        errors.push('Tujuan harus diisi');
    }

    if (!data.departureDate) {
        errors.push('Tanggal keberangkatan harus diisi');
    }

    if (data.departureDate && isPastDate(data.departureDate)) {
        errors.push('Tanggal keberangkatan tidak boleh di masa lampau');
    }

    if (data.returnDate && new Date(data.returnDate) <= new Date(data.departureDate)) {
        errors.push('Tanggal kembali harus setelah tanggal keberangkatan');
    }

    if (!data.passengers || data.passengers < 1) {
        errors.push('Jumlah penumpang minimal 1');
    }

    if (!data.totalPrice || data.totalPrice < 0) {
        errors.push('Harga total tidak valid');
    }

    return errors;
}
