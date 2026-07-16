// ═══════════════════════════════════════════
//  SERVER.JS — Main Entry Point
//  Prapti Associates Backend API
// ═══════════════════════════════════════════

// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const appointmentRoutes = require('./routes/appointmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const consultancyRoutes = require('./routes/consultancyRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());                // Allow cross-origin requests from frontend
app.use(express.json());        // Parse JSON request bodies

// ── Serve project images ──
// First check backend/images/ (new uploads on Render), then parent/images/ (seeded local data)
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// ── Routes ──
app.use('/api', appointmentRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', consultancyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact-details', contactRoutes);

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
            adminLogin: 'POST /api/auth/login',
            adminVerify: 'GET /api/auth/verify',
            projects: 'GET /api/projects',
            projectCrud: 'POST|PUT|DELETE /api/projects/:id',
            connections: 'GET /api/connections',
            connectionsCrud: 'POST|PUT|DELETE /api/connections/:id',
            services: 'GET /api/services',
            servicesCrud: 'POST|PUT|DELETE /api/services/:id'
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
    console.log(`     POST /api/consultancy`);
    console.log(`     POST /api/auth/login`);
    console.log(`     GET  /api/auth/verify`);
    console.log(`     GET  /api/projects`);
    console.log(`     CRUD /api/projects/:id`);
    console.log(`     GET  /api/connections`);
    console.log(`     CRUD /api/connections/:id`);
    console.log(`     GET  /api/services`);
    console.log(`     CRUD /api/services/:id\n`);
});
