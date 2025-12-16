// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/flight_booking')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==================== SCHEMAS ====================

// Flight Schema
const flightSchema = new mongoose.Schema({
    flight_id: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    departure_city: { type: String, required: true },
    arrival_city: { type: String, required: true },
    base_price: { type: Number, required: true },
    current_price: { type: Number, required: true },
    available_seats: { type: Number, required: true },
    booking_count: { type: Number, default: 0 },
    last_booking_time: { type: Date, default: null }
});

const Flight = mongoose.model('Flight', flightSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
    pnr: { type: String, required: true, unique: true },
    flight_id: { type: String, required: true },
    passenger_name: { type: String, required: true },
    booking_date: { type: Date, default: Date.now },
    final_price: { type: Number, required: true },
    status: { type: String, default: 'confirmed' }
});

const Booking = mongoose.model('Booking', bookingSchema);

// User Wallet Schema (Simplified)
const walletSchema = new mongoose.Schema({
    user_id: { type: String, required: true, default: 'user_001' },
    balance: { type: Number, default: 50000 }
});

const Wallet = mongoose.model('Wallet', walletSchema);

// ==================== HELPER FUNCTIONS ====================

// Generate Random PNR
function generatePNR() {
    return 'PNR' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Dynamic Pricing Logic (10% surge if booking within 5 seconds)
function calculateSurgePrice(flight) {
    const now = Date.now();
    const lastBooking = flight.last_booking_time ? flight.last_booking_time.getTime() : 0;
    const timeDiff = (now - lastBooking) / 1000; // seconds

    // Surge pricing: if last booking was within 5 seconds
    const isSurged = timeDiff < 5 && flight.booking_count > 0;
    const finalPrice = isSurged 
        ? Math.round(flight.base_price * 1.10) 
        : flight.base_price;

    return { finalPrice, isSurged };
}

// ==================== ROUTES ====================
app.get("/", (req, res) => {
  res.send("Flight Booking Backend is running 🚀");
});


// 1. Search Flights (GET /api/flights/search)
app.get('/api/flights/search', async (req, res) => {
    try {
        const { departure_city, arrival_city } = req.query;
        
        let query = {};
        if (departure_city) query.departure_city = new RegExp(departure_city, 'i');
        if (arrival_city) query.arrival_city = new RegExp(arrival_city, 'i');

        const flights = await Flight.find(query);
        res.json(flights);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch flights' });
    }
});

// 2. Calculate Dynamic Price (POST /api/flights/calculate-price/:flight_id)
app.post('/api/flights/calculate-price/:flight_id', async (req, res) => {
    try {
        const flight = await Flight.findOne({ flight_id: req.params.flight_id });
        
        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        const { finalPrice, isSurged } = calculateSurgePrice(flight);

        // Update current price temporarily (for display)
        flight.current_price = finalPrice;
        await flight.save();

        res.json({ finalPrice, isSurged });
    } catch (err) {
        res.status(500).json({ error: 'Failed to calculate price' });
    }
});

// 3. Book Flight (POST /api/book/:flight_id)
app.post('/api/book/:flight_id', async (req, res) => {
    try {
        const { passengerName, finalPrice } = req.body;
        const flight = await Flight.findOne({ flight_id: req.params.flight_id });

        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        if (flight.available_seats <= 0) {
            return res.status(400).json({ error: 'No seats available' });
        }

        // Get wallet
        let wallet = await Wallet.findOne({ user_id: 'user_001' });
        if (!wallet) {
            wallet = await Wallet.create({ user_id: 'user_001', balance: 50000 });
        }

        // Check balance
        if (wallet.balance < finalPrice) {
            return res.status(400).json({ error: 'Insufficient wallet balance' });
        }

        // Deduct from wallet
        wallet.balance -= finalPrice;
        await wallet.save();

        // Update flight
        flight.available_seats -= 1;
        flight.booking_count += 1;
        flight.last_booking_time = new Date();
        await flight.save();

        // Create booking
        const pnr = generatePNR();
        const booking = await Booking.create({
            pnr,
            flight_id: flight.flight_id,
            passenger_name: passengerName,
            final_price: finalPrice
        });

        res.json({
            success: true,
            pnr: booking.pnr,
            newBalance: wallet.balance
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Booking failed' });
    }
});

// 4. Get Ticket PDF (GET /api/ticket/:pnr/pdf)
app.get('/api/ticket/:pnr/pdf', async (req, res) => {
    try {
        const booking = await Booking.findOne({ pnr: req.params.pnr });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const flight = await Flight.findOne({ flight_id: booking.flight_id });

        // Create PDF
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ticket_${booking.pnr}.pdf`);

        doc.pipe(res);

        // PDF Content
        doc.fontSize(20).text('✈️ FLIGHT TICKET', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`PNR: ${booking.pnr}`);
        doc.text(`Passenger: ${booking.passenger_name}`);
        doc.text(`Flight: ${flight.airline} (${flight.flight_id})`);
        doc.text(`Route: ${flight.departure_city} → ${flight.arrival_city}`);
        doc.text(`Price Paid: ₹${booking.final_price.toLocaleString('en-IN')}`);
        doc.text(`Booking Date: ${booking.booking_date.toLocaleString()}`);
        doc.text(`Status: ${booking.status.toUpperCase()}`);
        
        doc.end();

    } catch (err) {
        res.status(500).json({ error: 'Failed to generate ticket' });
    }
});

// 5. Get Wallet Balance (GET /api/user/wallet)
app.get('/api/user/wallet', async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user_id: 'user_001' });
        if (!wallet) {
            wallet = await Wallet.create({ user_id: 'user_001', balance: 50000 });
        }
        res.json({ balance: wallet.balance });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
});

// ==================== SEED DATA (Optional) ====================
app.get('/api/seed', async (req, res) => {
    try {
        await Flight.deleteMany({});
        
        const sampleFlights = [
            {
                flight_id: 'AI101',
                airline: 'Air India',
                departure_city: 'Delhi',
                arrival_city: 'Mumbai',
                base_price: 5000,
                current_price: 5000,
                available_seats: 50
            },
            {
                flight_id: 'SG202',
                airline: 'SpiceJet',
                departure_city: 'Mumbai',
                arrival_city: 'Bangalore',
                base_price: 4500,
                current_price: 4500,
                available_seats: 60
            },
            {
                flight_id: 'IG303',
                airline: 'IndiGo',
                departure_city: 'Delhi',
                arrival_city: 'Kolkata',
                base_price: 6000,
                current_price: 6000,
                available_seats: 45
            },
            {
                flight_id: 'AI104',
                airline: 'Air India',
                departure_city: 'Chennai',
                arrival_city: 'Delhi',
                base_price: 7000,
                current_price: 7000,
                available_seats: 40
            }
        ];

        await Flight.insertMany(sampleFlights);
        res.json({ message: 'Database seeded successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Seeding failed' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});