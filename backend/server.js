// ═══════════════════════════════════════════
//  SERVER.JS — Main Entry Point
//  Prapti Associates Backend API
// ═══════════════════════════════════════════

// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const consultancyRoutes = require('./routes/consultancyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());                // Allow cross-origin requests from frontend
app.use(express.json());        // Parse JSON request bodies

// ── Routes ──
app.use('/api', appointmentRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', consultancyRoutes);

// ── Health Check ──
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'Prapti Associates API is live 🚀',
        endpoints: {
            bookAppointment: 'POST /api/appointments',
            contactForm: 'POST /api/contact',
            feedback: 'POST /api/feedback',
            consultancy: 'POST /api/consultancy',
        },
    });
});

// ── 404 Handler ──
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
});

// ── Start Server ──
app.listen(PORT, () => {
    console.log(`\n🏗️  Prapti Associates API Server`);
    console.log(`   Running on: http://localhost:${PORT}`);
    console.log(`   Endpoints:`);
    console.log(`     POST /api/appointments`);
    console.log(`     POST /api/contact`);
    console.log(`     POST /api/feedback`);
    console.log(`     POST /api/consultancy\n`);
});
