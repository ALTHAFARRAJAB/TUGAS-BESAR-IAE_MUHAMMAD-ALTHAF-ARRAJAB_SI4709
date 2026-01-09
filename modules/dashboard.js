// Dashboard module

import { formatCurrency, formatDate } from '../utils/helpers.js';

export class DashboardManager {
    constructor(bookingsManager) {
        this.bookingsManager = bookingsManager;
    }

    // Render statistics cards
    renderStats() {
        const stats = this.bookingsManager.getStatistics();
        const statsGrid = document.getElementById('stats-grid');

        if (!statsGrid) return;

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                            <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Booking</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${formatCurrency(stats.totalRevenue)}</div>
                <div class="stat-label">Total Revenue</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${stats.pending}</div>
                <div class="stat-label">Pending</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${stats.confirmed}</div>
                <div class="stat-label">Dikonfirmasi</div>
            </div>
        `;
    }

    // Render recent bookings
    renderRecentBookings() {
        const recentBookings = this.bookingsManager.getRecent(5);
        const container = document.getElementById('recent-bookings');

        if (!container) return;

        if (recentBookings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <h3>Belum Ada Booking</h3>
                    <p>Tambahkan booking pertama Anda</p>
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
                            <th>Harga</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentBookings.map(booking => `
                            <tr>
                                <td>
                                    <div>
                                        <strong>${booking.passengerName}</strong><br>
                                        <small style="color: var(--text-secondary);">${booking.email}</small>
                                    </div>
                                </td>
                                <td>${booking.destination}</td>
                                <td>${formatDate(booking.departureDate)}</td>
                                <td><strong>${formatCurrency(booking.totalPrice)}</strong></td>
                                <td>
                                    <span class="status-badge ${booking.status}">
                                        ${this.getStatusLabel(booking.status)}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'Menunggu',
            'confirmed': 'Dikonfirmasi',
            'completed': 'Selesai',
            'cancelled': 'Dibatalkan'
        };
        return labels[status] || status;
    }

    // Render dashboard
    render() {
        this.renderStats();
        this.renderRecentBookings();
    }
}
