// Authentication module

import { Storage } from '../utils/storage.js';
import { NotificationManager } from '../components/notifications.js';

export class AuthManager {
    constructor() {
        this.notifications = new NotificationManager();
        this.currentUser = null;
    }

    // Initialize authentication state
    init() {
        const user = Storage.getUser();
        if (user) {
            this.currentUser = user;
            return true;
        }
        return false;
    }

    // Login with email and password
    async login(email, password) {
        try {
            // Call backend API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                const user = {
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role,
                    phone: data.user.phone,
                    loginTime: new Date().toISOString()
                };

                // Store user and token
                Storage.setUser(user);
                localStorage.setItem('token', data.token);

                this.currentUser = user;
                this.notifications.success('Login berhasil! Selamat datang, ' + user.name);
                return { success: true, user };
            } else {
                this.notifications.error(data.error || 'Email atau password salah!');
                return { success: false, error: data.error || 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error:', error);
            this.notifications.error('Terjadi kesalahan saat login. Pastikan server berjalan.');
            return { success: false, error: error.message };
        }
    }

    // Logout
    logout() {
        return new Promise((resolve) => {
            Storage.removeUser();
            this.currentUser = null;
            this.notifications.info('Anda telah logout');
            setTimeout(() => resolve(), 500);
        });
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser || Storage.getUser();
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    // Update user profile
    updateProfile(data) {
        const user = this.getCurrentUser();
        if (!user) {
            this.notifications.error('User tidak ditemukan');
            return false;
        }

        const updatedUser = { ...user, ...data };
        Storage.setUser(updatedUser);
        this.currentUser = updatedUser;
        this.notifications.success('Profile berhasil diupdate!');
        return true;
    }
}
