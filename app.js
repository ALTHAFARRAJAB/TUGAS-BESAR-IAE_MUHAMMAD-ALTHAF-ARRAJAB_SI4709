// Main application file
// SICEPAT - Sistem Cerdas Paling Tepat

import { Storage } from './utils/storage.js';
import { formatCurrency, formatDate, debounce, exportToCSV } from './utils/helpers.js';
import { AuthManager } from './modules/auth.js';
import { BookingsManager } from './modules/bookings.js';
import { DashboardManager } from './modules/dashboard.js';
import { ChartsManager } from './modules/charts.js';
import { NotificationManager } from './components/notifications.js';
import { Modal } from './components/modal.js';

class SicepatApp {
    constructor() {
        this.auth = new AuthManager();
        this.bookings = new BookingsManager();
        this.dashboard = null;
        this.charts = null;
        this.notifications = new NotificationManager();
        this.modal = new Modal();

        this.currentView = 'dashboard';

        // Debounced search function
        this.debouncedSearch = debounce((query) => this.handleSearch(query), 300);
    }

    // Initialize the application
    init() {
        // Check authentication
        if (this.auth.init()) {
            this.showApp();
        } else {
            this.showLogin();
        }

        // Initialize theme
        this.initTheme();

        // Set up event listeners
        this.setupEventListeners();
    }

    // Show login page
    showLogin() {
        document.getElementById('login-page').classList.add('active');
        document.getElementById('app-container').classList.remove('active');
    }

    // Show main application
    showApp() {
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('app-container').classList.add('active');

        // Initialize managers
        this.bookings.init();
        this.dashboard = new DashboardManager(this.bookings);
        this.charts = new ChartsManager(this.bookings);

        // Show dashboard by default
        this.showView('dashboard');
    }

    // Initialize theme
    initTheme() {
        const settings = Storage.getSettings();
        if (settings.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // Toggle theme
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        Storage.setSettings({ theme: newTheme });

        // Re-render charts with new theme
        if (this.currentView === 'analytics') {
            setTimeout(() => this.charts.render(), 100);
        }
    }

    // Show specific view
    showView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            }
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) {
            viewElement.classList.add('active');
            this.currentView = viewName;

            // Render view-specific content
            this.renderView(viewName);
        }
    }

    // Render view content
    renderView(viewName) {
        switch (viewName) {
            case 'dashboard':
                this.dashboard.render();
                break;
            case 'bookings':
                this.renderBookings();
                break;
            case 'analytics':
                setTimeout(() => this.charts.render(), 100);
                break;
            case 'profile':
                this.renderProfile();
                break;
        }
    }

    // Render bookings table
    renderBookings() {
        const bookings = this.bookings.getFiltered();
        const container = document.getElementById('bookings-table');

        if (!container) return;

        if (bookings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <h3>Tidak Ada Booking</h3>
                    <p>Belum ada booking yang sesuai dengan filter Anda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Penumpang</th>
                            <th>Tujuan</th>
                            <th>Tanggal</th>
                            <th>Penumpang</th>
                            <th>Harga</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.map(booking => `
                            <tr>
                                <td>
                                    <div>
                                        <strong>${booking.passengerName}</strong><br>
                                        <small style="color: var(--text-secondary);">${booking.email}</small>
                                    </div>
                                </td>
                                <td><strong>${booking.destination}</strong></td>
                                <td>
                                    ${formatDate(booking.departureDate)}
                                    ${booking.returnDate ? '<br><small style="color: var(--text-secondary);">s/d ' + formatDate(booking.returnDate) + '</small>' : ''}
                                </td>
                                <td>${booking.passengers} orang</td>
                                <td><strong>${formatCurrency(booking.totalPrice)}</strong></td>
                                <td>
                                    <span class="status-badge ${booking.status}">
                                        ${this.getStatusLabel(booking.status)}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn" onclick="app.editBooking('${booking.id}')" title="Edit">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </button>
                                        <button class="action-btn" onclick="app.deleteBooking('${booking.id}')" title="Hapus" style="color: var(--error);">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Render profile
    renderProfile() {
        const user = this.auth.getCurrentUser();
        if (!user) return;

        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-phone').value = user.phone || '';
        document.getElementById('profile-role').value = user.role || '';
    }

    // Get status label
    getStatusLabel(status) {
        const labels = {
            'pending': 'Menunggu',
            'confirmed': 'Dikonfirmasi',
            'completed': 'Selesai',
            'cancelled': 'Dibatalkan'
        };
        return labels[status] || status;
    }

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const result = await this.auth.login(email, password);
        if (result.success) {
            setTimeout(() => this.showApp(), 500);
        }
    }

    // Handle logout
    handleLogout() {
        this.modal.confirm(
            'Konfirmasi Logout',
            'Apakah Anda yakin ingin keluar dari aplikasi?',
            () => {
                this.auth.logout().then(() => {
                    setTimeout(() => {
                        this.showLogin();
                        // Reset form
                        document.getElementById('login-form').reset();
                    }, 500);
                });
            }
        );
    }

    // Show add booking modal
    addBooking() {
        this.modal.bookingForm(null, (data) => {
            const result = this.bookings.create(data);
            if (result.success) {
                this.renderView(this.currentView);
            }
        });
    }

    // Edit booking
    editBooking(id) {
        const booking = this.bookings.getById(id);
        if (!booking) return;

        this.modal.bookingForm(booking, (data) => {
            const result = this.bookings.update(id, data);
            if (result.success) {
                this.renderView(this.currentView);
            }
        });
    }

    // Delete booking
    deleteBooking(id) {
        const booking = this.bookings.getById(id);
        if (!booking) return;

        this.modal.confirm(
            'Hapus Booking',
            `Apakah Anda yakin ingin menghapus booking untuk ${booking.passengerName}?`,
            () => {
                const result = this.bookings.delete(id);
                if (result.success) {
                    this.renderView(this.currentView);
                }
            }
        );
    }

    // Handle search
    handleSearch(query) {
        this.bookings.search(query);
        this.renderBookings();
    }

    // Handle status filter
    handleStatusFilter(status) {
        this.bookings.filterByStatus(status);
        this.renderBookings();
    }

    // Handle sort
    handleSort(sortBy) {
        this.bookings.sort(sortBy);
        this.renderBookings();
    }

    // Export bookings to CSV
    exportBookings() {
        const bookings = this.bookings.getAll();
        if (bookings.length === 0) {
            this.notifications.warning('Tidak ada data untuk diekspor');
            return;
        }

        exportToCSV(bookings);
        this.notifications.success('Data berhasil diekspor ke CSV');
    }

    // Handle profile update
    handleProfileUpdate(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (this.auth.updateProfile(data)) {
            this.renderProfile();
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                if (view) {
                    this.showView(view);
                }
            });
        });

        // Add booking button
        const addBookingBtn = document.getElementById('add-booking-btn');
        if (addBookingBtn) {
            addBookingBtn.addEventListener('click', () => this.addBooking());
        }

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debouncedSearch(e.target.value);
            });
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.handleStatusFilter(e.target.value);
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportBookings());
        }

        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }
    }
}

// Initialize app when DOM is ready
const app = new SicepatApp();
window.app = app; // Make app globally accessible for onclick handlers

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
