// Sample booking data for demonstration

export const sampleBookings = [
    {
        id: '1a2b3c4d',
        passengerName: 'Budi Santoso',
        email: 'budi.santoso@email.com',
        phone: '081234567890',
        destination: 'Bali',
        departureDate: '2026-02-15',
        returnDate: '2026-02-20',
        passengers: 2,
        totalPrice: 5000000,
        status: 'confirmed',
        bookingDate: '2026-01-05T10:30:00',
        notes: 'Honeymoon trip'
    },
    {
        id: '5e6f7g8h',
        passengerName: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@email.com',
        phone: '082345678901',
        destination: 'Jakarta',
        departureDate: '2026-01-20',
        returnDate: '2026-01-22',
        passengers: 1,
        totalPrice: 1500000,
        status: 'pending',
        bookingDate: '2026-01-04T14:20:00',
        notes: 'Business trip'
    },
    {
        id: '9i0j1k2l',
        passengerName: 'Ahmad Wijaya',
        email: 'ahmad.wijaya@email.com',
        phone: '083456789012',
        destination: 'Yogyakarta',
        departureDate: '2026-03-10',
        returnDate: '2026-03-15',
        passengers: 4,
        totalPrice: 8000000,
        status: 'confirmed',
        bookingDate: '2026-01-03T09:15:00',
        notes: 'Family vacation'
    },
    {
        id: '3m4n5o6p',
        passengerName: 'Dewi Lestari',
        email: 'dewi.lestari@email.com',
        phone: '084567890123',
        destination: 'Surabaya',
        departureDate: '2026-01-15',
        returnDate: null,
        passengers: 1,
        totalPrice: 800000,
        status: 'completed',
        bookingDate: '2025-12-28T16:45:00',
        notes: 'One way trip'
    },
    {
        id: '7q8r9s0t',
        passengerName: 'Rizki Ananda',
        email: 'rizki.ananda@email.com',
        phone: '085678901234',
        destination: 'Bandung',
        departureDate: '2026-02-01',
        returnDate: '2026-02-03',
        passengers: 3,
        totalPrice: 3500000,
        status: 'cancelled',
        bookingDate: '2026-01-02T11:30:00',
        notes: 'Cancelled due to emergency'
    },
    {
        id: '1u2v3w4x',
        passengerName: 'Putri Amelia',
        email: 'putri.amelia@email.com',
        phone: '086789012345',
        destination: 'Malang',
        departureDate: '2026-04-05',
        returnDate: '2026-04-10',
        passengers: 2,
        totalPrice: 4200000,
        status: 'confirmed',
        bookingDate: '2026-01-05T13:00:00',
        notes: 'Anniversary celebration'
    },
    {
        id: '5y6z7a8b',
        passengerName: 'Andi Firmansyah',
        email: 'andi.firmansyah@email.com',
        phone: '087890123456',
        destination: 'Lombok',
        departureDate: '2026-05-20',
        returnDate: '2026-05-25',
        passengers: 5,
        totalPrice: 12000000,
        status: 'pending',
        bookingDate: '2026-01-04T08:45:00',
        notes: 'Group tour'
    },
    {
        id: '9c0d1e2f',
        passengerName: 'Maya Angelina',
        email: 'maya.angelina@email.com',
        phone: '088901234567',
        destination: 'Medan',
        departureDate: '2026-02-25',
        returnDate: '2026-02-28',
        passengers: 2,
        totalPrice: 3800000,
        status: 'confirmed',
        bookingDate: '2026-01-01T15:20:00',
        notes: 'Visit relatives'
    }
];

// Destination data
export const destinations = [
    'Bali',
    'Jakarta',
    'Yogyakarta',
    'Bandung',
    'Surabaya',
    'Medan',
    'Makassar',
    'Semarang',
    'Palembang',
    'Malang',
    'Lombok',
    'Manado',
    'Batam',
    'Padang',
    'Denpasar'
];

// Price per person by destination (in IDR)
export const destinationPrices = {
    'Bali': 2500000,
    'Jakarta': 1500000,
    'Yogyakarta': 2000000,
    'Bandung': 1800000,
    'Surabaya': 1600000,
    'Medan': 2200000,
    'Makassar': 2800000,
    'Semarang': 1400000,
    'Palembang': 1700000,
    'Malang': 2100000,
    'Lombok': 2600000,
    'Manado': 3000000,
    'Batam': 1900000,
    'Padang': 2300000,
    'Denpasar': 2500000
};
