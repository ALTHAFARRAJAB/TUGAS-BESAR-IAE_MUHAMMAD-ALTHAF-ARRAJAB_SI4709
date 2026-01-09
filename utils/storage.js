// Storage utility for managing localStorage operations

export const Storage = {
    // Keys for localStorage
    KEYS: {
        USER: 'sicepat_user',
        BOOKINGS: 'sicepat_bookings',
        SETTINGS: 'sicepat_settings'
    },

    // Get item from localStorage
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Set item in localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // User methods
    getUser() {
        return this.get(this.KEYS.USER);
    },

    setUser(user) {
        return this.set(this.KEYS.USER, user);
    },

    removeUser() {
        return this.remove(this.KEYS.USER);
    },

    // Bookings methods
    getBookings() {
        return this.get(this.KEYS.BOOKINGS) || [];
    },

    setBookings(bookings) {
        return this.set(this.KEYS.BOOKINGS, bookings);
    },

    addBooking(booking) {
        const bookings = this.getBookings();
        bookings.push(booking);
        return this.setBookings(bookings);
    },

    updateBooking(id, updatedBooking) {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === id);
        if (index !== -1) {
            bookings[index] = { ...bookings[index], ...updatedBooking };
            return this.setBookings(bookings);
        }
        return false;
    },

    deleteBooking(id) {
        const bookings = this.getBookings();
        const filtered = bookings.filter(b => b.id !== id);
        return this.setBookings(filtered);
    },

    // Settings methods
    getSettings() {
        return this.get(this.KEYS.SETTINGS) || { theme: 'light' };
    },

    setSettings(settings) {
        return this.set(this.KEYS.SETTINGS, settings);
    }
};
