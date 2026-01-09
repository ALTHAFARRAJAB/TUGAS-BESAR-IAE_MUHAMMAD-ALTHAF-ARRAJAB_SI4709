// Charts module for data visualization

export class ChartsManager {
    constructor(bookingsManager) {
        this.bookingsManager = bookingsManager;
    }

    // Render booking trend chart
    renderTrendChart() {
        const canvas = document.getElementById('booking-trend-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const trendData = this.bookingsManager.getTrendData();

        // Clear canvas
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Get max value for scaling
        const maxCount = Math.max(...trendData.map(d => d.count), 1);

        // Draw axes
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw line chart
        const pointSpacing = chartWidth / (trendData.length - 1);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-500');
        ctx.lineWidth = 3;
        ctx.beginPath();

        trendData.forEach((data, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (data.count / maxCount) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-500');
        trendData.forEach((data, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (data.count / maxCount) * chartHeight;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';

        trendData.forEach((data, index) => {
            const x = padding + index * pointSpacing;
            ctx.fillText(data.month, x, height - padding + 20);

            const y = height - padding - (data.count / maxCount) * chartHeight;
            ctx.fillText(data.count.toString(), x, y - 10);
        });
    }

    // Render status distribution pie chart
    renderStatusChart() {
        const canvas = document.getElementById('status-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const stats = this.bookingsManager.getStatistics();

        // Clear canvas
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        const data = [
            { label: 'Pending', value: stats.pending, color: '#f59e0b' },
            { label: 'Dikonfirmasi', value: stats.confirmed, color: '#3b82f6' },
            { label: 'Selesai', value: stats.completed, color: '#10b981' },
            { label: 'Dibatalkan', value: stats.cancelled, color: '#ef4444' }
        ];

        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;

        let currentAngle = -Math.PI / 2;

        // Draw pie slices
        data.forEach(item => {
            const sliceAngle = (item.value / total) * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();

            currentAngle += sliceAngle;
        });

        // Draw white circle in center (donut chart)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary');
        ctx.fill();

        // Draw legend
        const legendX = 20;
        let legendY = height - 80;

        ctx.font = '14px Inter';
        ctx.textAlign = 'left';

        data.forEach(item => {
            // Color box
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, legendY, 12, 12);

            // Label
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
            ctx.fillText(`${item.label}: ${item.value}`, legendX + 20, legendY + 10);

            legendY += 20;
        });
    }

    // Render revenue by destination bar chart
    renderRevenueChart() {
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const byDestination = this.bookingsManager.getByDestination();

        // Get top 8 destinations by revenue
        const destinations = Object.entries(byDestination)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 8);

        if (destinations.length === 0) return;

        // Clear canvas
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Get max revenue for scaling
        const maxRevenue = Math.max(...destinations.map(d => d.revenue), 1);

        // Draw axes
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw bars
        const barWidth = chartWidth / destinations.length - 10;
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, '#0073e6');
        gradient.addColorStop(1, '#7300e6');

        destinations.forEach((dest, index) => {
            const barHeight = (dest.revenue / maxRevenue) * chartHeight;
            const x = padding + index * (barWidth + 10) + 5;
            const y = height - padding - barHeight;

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw value on top of bar
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(
                (dest.revenue / 1000000).toFixed(1) + 'M',
                x + barWidth / 2,
                y - 5
            );

            // Draw destination name
            ctx.save();
            ctx.translate(x + barWidth / 2, height - padding + 15);
            ctx.rotate(-Math.PI / 6);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
            ctx.fillText(dest.name, 0, 0);
            ctx.restore();
        });
    }

    // Render all charts
    render() {
        this.renderTrendChart();
        this.renderStatusChart();
        this.renderRevenueChart();
    }
}
