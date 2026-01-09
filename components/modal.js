// Modal component for dialogs and forms

export class Modal {
    constructor() {
        this.container = document.getElementById('modal-container');
        this.currentModal = null;
    }

    open(title, content, actions = [], onClose = null) {
        this.close(); // Close any existing modal

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button type="button" class="modal-close" aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length > 0 ? `
                <div class="modal-footer">
                    ${actions.map(action => `
                        <button type="button" class="btn ${action.className || 'btn-secondary'}" data-action="${action.id}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        backdrop.appendChild(modal);
        this.container.appendChild(backdrop);
        this.currentModal = backdrop;

        // Close button handler
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            this.close();
            if (onClose) onClose();
        });

        // Backdrop click to close
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                this.close();
                if (onClose) onClose();
            }
        });

        // Action buttons handlers
        actions.forEach(action => {
            const btn = modal.querySelector(`[data-action="${action.id}"]`);
            if (btn && action.handler) {
                btn.addEventListener('click', () => action.handler(modal));
            }
        });

        return modal;
    }

    close() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
    }

    confirm(title, message, onConfirm, onCancel = null) {
        const content = `<p>${message}</p>`;
        const actions = [
            {
                id: 'cancel',
                label: 'Batal',
                className: 'btn-secondary',
                handler: () => {
                    this.close();
                    if (onCancel) onCancel();
                }
            },
            {
                id: 'confirm',
                label: 'Konfirmasi',
                className: 'btn-primary',
                handler: () => {
                    this.close();
                    if (onConfirm) onConfirm();
                }
            }
        ];

        this.open(title, content, actions);
    }

    bookingForm(booking = null, onSave) {
        const isEdit = booking !== null;
        const formId = 'booking-form-modal';

        const content = `
            <form id="${formId}" class="booking-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="passenger-name">Nama Penumpang *</label>
                        <input type="text" id="passenger-name" name="passengerName" value="${booking?.passengerName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" value="${booking?.email || ''}" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="phone">Telepon *</label>
                        <input type="tel" id="phone" name="phone" value="${booking?.phone || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="destination">Tujuan *</label>
                        <select id="destination" name="destination" required>
                            <option value="">Pilih Tujuan</option>
                            <option value="Bali" ${booking?.destination === 'Bali' ? 'selected' : ''}>Bali</option>
                            <option value="Jakarta" ${booking?.destination === 'Jakarta' ? 'selected' : ''}>Jakarta</option>
                            <option value="Yogyakarta" ${booking?.destination === 'Yogyakarta' ? 'selected' : ''}>Yogyakarta</option>
                            <option value="Bandung" ${booking?.destination === 'Bandung' ? 'selected' : ''}>Bandung</option>
                            <option value="Surabaya" ${booking?.destination === 'Surabaya' ? 'selected' : ''}>Surabaya</option>
                            <option value="Medan" ${booking?.destination === 'Medan' ? 'selected' : ''}>Medan</option>
                            <option value="Makassar" ${booking?.destination === 'Makassar' ? 'selected' : ''}>Makassar</option>
                            <option value="Lombok" ${booking?.destination === 'Lombok' ? 'selected' : ''}>Lombok</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="departure-date">Tanggal Berangkat *</label>
                        <input type="date" id="departure-date" name="departureDate" value="${booking?.departureDate || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="return-date">Tanggal Kembali</label>
                        <input type="date" id="return-date" name="returnDate" value="${booking?.returnDate || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="passengers">Jumlah Penumpang *</label>
                        <input type="number" id="passengers" name="passengers" min="1" value="${booking?.passengers || 1}" required>
                    </div>
                    <div class="form-group">
                        <label for="total-price">Harga Total (IDR) *</label>
                        <input type="number" id="total-price" name="totalPrice" min="0" value="${booking?.totalPrice || ''}" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="pending" ${booking?.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${booking?.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="completed" ${booking?.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${booking?.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="notes">Catatan</label>
                    <textarea id="notes" name="notes" rows="3">${booking?.notes || ''}</textarea>
                </div>
            </form>
        `;

        const actions = [
            {
                id: 'cancel',
                label: 'Batal',
                className: 'btn-secondary',
                handler: () => this.close()
            },
            {
                id: 'save',
                label: isEdit ? 'Update' : 'Simpan',
                className: 'btn-primary',
                handler: (modal) => {
                    const form = modal.querySelector(`#${formId}`);
                    if (form.checkValidity()) {
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData);

                        // Convert passengers and totalPrice to numbers
                        data.passengers = parseInt(data.passengers);
                        data.totalPrice = parseFloat(data.totalPrice);

                        onSave(data);
                        this.close();
                    } else {
                        form.reportValidity();
                    }
                }
            }
        ];

        this.open(isEdit ? 'Edit Booking' : 'Tambah Booking Baru', content, actions);
    }
}
