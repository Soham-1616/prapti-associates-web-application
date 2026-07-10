// ═══════════════════════════════════════════
//  AUTH CONTROLLER — Login, Verify & Profile Updates
// ═══════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { generateToken, comparePassword } = require('../config/authConfig');

const DATA_FILE = path.join(__dirname, '..', 'data', 'admin.json');

// Helper: Get Admin Credentials (with environment variable fallback)
function getAdminCredentials() {
    let username = process.env.ADMIN_USERNAME || 'admin';
    let passwordHash = process.env.ADMIN_PASSWORD_HASH || '';

    // Ensure data folder exists
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
            if (data.username) username = data.username;
            if (data.passwordHash) passwordHash = data.passwordHash;
        } catch (err) {
            console.error('⚠️ Error reading admin credentials:', err);
        }
    } else {
        // Seed the JSON file on first run
        const initial = { username, passwordHash };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 4), 'utf-8');
    }
    return { username, passwordHash };
}

// Helper: Save Admin Credentials
function saveAdminCredentials(username, passwordHash) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ username, passwordHash }, null, 4), 'utf-8');
}

// ────────────────────────────────────────────
//  POST /api/auth/login
// ────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required.',
            });
        }

        // Check credentials from storage
        const creds = getAdminCredentials();

        if (username !== creds.username) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.',
            });
        }

        const passwordValid = await comparePassword(password, creds.passwordHash);
        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.',
            });
        }

        // Generate token
        const token = generateToken({ username: creds.username, role: 'admin' });

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again.',
        });
    }
};

// ────────────────────────────────────────────
//  GET /api/auth/verify
// ────────────────────────────────────────────
exports.verify = (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Token is valid.',
        admin: req.admin,
    });
};

// ────────────────────────────────────────────
//  GET /api/auth/me — Fetch active admin profile details
// ────────────────────────────────────────────
exports.getAccountDetails = (req, res) => {
    try {
        const creds = getAdminCredentials();
        return res.status(200).json({
            success: true,
            data: {
                username: creds.username,
                status: 'Active'
            }
        });
    } catch (error) {
        console.error('❌ Get account details error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load account details.'
        });
    }
};

// ────────────────────────────────────────────
//  PUT /api/auth/username — Update admin username
// ────────────────────────────────────────────
exports.updateUsername = (req, res) => {
    try {
        const { newUsername } = req.body;

        if (!newUsername || !newUsername.trim()) {
            return res.status(400).json({
                success: false,
                message: 'New username cannot be empty.'
            });
        }

        const creds = getAdminCredentials();
        const updatedUsername = newUsername.trim();

        saveAdminCredentials(updatedUsername, creds.passwordHash);

        return res.status(200).json({
            success: true,
            message: 'Username updated successfully.',
            data: { username: updatedUsername }
        });

    } catch (error) {
        console.error('❌ Update username error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update username.'
        });
    }
};

// ────────────────────────────────────────────
//  PUT /api/auth/password — Change admin password
// ────────────────────────────────────────────
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required.'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirmation password do not match.'
            });
        }

        const creds = getAdminCredentials();

        // Verify current password
        const isMatch = await comparePassword(currentPassword, creds.passwordHash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect current password.'
            });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        saveAdminCredentials(creds.username, newHash);

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully.'
        });

    } catch (error) {
        console.error('❌ Update password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update password.'
        });
    }
};

