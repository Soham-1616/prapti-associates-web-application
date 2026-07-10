// ═══════════════════════════════════════════
//  AUTH CONFIG — JWT & Password Helpers
// ═══════════════════════════════════════════

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '24h';

// ── Generate JWT Token ──
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// ── Verify JWT Token ──
function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

// ── Compare Password with Hash ──
async function comparePassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
}

module.exports = { generateToken, verifyToken, comparePassword };
