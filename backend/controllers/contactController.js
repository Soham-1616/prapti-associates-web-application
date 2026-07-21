// ═══════════════════════════════════════════
//  CONTACT CONTROLLER — CMS Operations
// ═══════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'contact.json');

// Helper: Read/Write Contact Data
function readContactData() {
    if (!fs.existsSync(DATA_FILE)) {
        const defaultData = {
            address: "9/ A Mangal Murt,\n Gayatri park near Sanjivni Hospital, Amba Chowk, Kupwad, Sangli (416 436).",
            primaryPhone: "+91 97639 96291",
            primaryEmail: "praptiassociates555@gmail.com",
            secondaryEmail: "umeshkamble008@gmail.com",
            googleMapsUrl: "https://maps.google.com/maps?q=Amba+Chowk,+Kupwad,+Sangli,+Maharashtra+416436,+India&t=&z=15&ie=UTF8&iwloc=&output=embed",
            facebookUrl: "#",
            instagramUrl: "#",
            linkedinUrl: "#",
            twitterUrl: "#",
            whatsappUrl: "#",
            weekdayHours: "9:00 AM – 7:00 PM",
            saturdayHours: "10:00 AM – 4:00 PM",
            sundayHours: "Closed"
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 4), 'utf-8');
        return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function writeContactData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), 'utf-8');
}

// ── Validation Helpers ──
function sanitizeText(str) {
    if (!str) return '';
    return str.toString().trim().replace(/  +/g, ' ');
}

function containsMaliciousContent(str) {
    if (!str) return false;
    return /<script|<iframe|<img[^>]*onerror|onclick|onload|javascript:|eval\s*\(|<[a-z][^>]*>/i.test(str);
}

function isValidPhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-()]/g, '');
    // +91XXXXXXXXXX or 10-digit number
    return /^(\+91\d{10}|\d{10})$/.test(cleaned);
}

function isValidEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidGoogleMapsUrl(url) {
    if (!url) return false;
    const u = url.trim();
    return /^https:\/\/(www\.)?google\.com\/maps/.test(u) || /^https:\/\/maps\.google\.com\//.test(u);
}

function isValidHttpsUrl(url) {
    if (!url) return false;
    return /^https:\/\/.+/.test(url.trim());
}

function isValidWhatsApp(val) {
    if (!val) return false;
    const v = val.trim();
    // Allow https://wa.me/... or phone number
    if (/^https:\/\/wa\.me\//.test(v)) return true;
    if (/^https:\/\/api\.whatsapp\.com\//.test(v)) return true;
    const cleaned = v.replace(/[\s\-()]/g, '');
    if (/^(\+?\d{10,15})$/.test(cleaned)) return true;
    return false;
}

function validateContactFields(body) {
    const errors = [];

    // Address
    const addr = sanitizeText(body.address);
    if (!addr) errors.push('Office Address is required.');
    else if (addr.length < 15) errors.push('Office Address must be at least 15 characters.');
    else if (addr.length > 300) errors.push('Office Address cannot exceed 300 characters.');
    else if (containsMaliciousContent(body.address)) errors.push('HTML or script tags are not allowed in Office Address.');

    // Primary Phone
    const phone = sanitizeText(body.primaryPhone);
    if (!phone) errors.push('Primary Phone Number is required.');
    else if (!isValidPhone(phone)) errors.push('Please enter a valid phone number.');
    else if (containsMaliciousContent(body.primaryPhone)) errors.push('HTML or script tags are not allowed in Phone Number.');

    // Primary Email
    const email = sanitizeText(body.primaryEmail);
    if (!email) errors.push('Primary Email Address is required.');
    else if (!isValidEmail(email)) errors.push('Please enter a valid email address.');
    else if (containsMaliciousContent(body.primaryEmail)) errors.push('HTML or script tags are not allowed in Email.');

    // Secondary Email (optional)
    const secEmail = sanitizeText(body.secondaryEmail);
    if (secEmail) {
        if (!isValidEmail(secEmail)) errors.push('Please enter a valid secondary email address.');
        else if (containsMaliciousContent(body.secondaryEmail)) errors.push('HTML or script tags are not allowed in Secondary Email.');
    }

    // Google Maps URL
    const maps = sanitizeText(body.googleMapsUrl);
    if (!maps) errors.push('Google Maps Embed URL is required.');
    else if (!isValidGoogleMapsUrl(maps)) errors.push('Please enter a valid Google Maps Embed URL.');

    // Social Media Links (all optional)
    [['facebookUrl', 'Facebook'], ['instagramUrl', 'Instagram'], ['linkedinUrl', 'LinkedIn'], ['twitterUrl', 'Twitter/X']].forEach(([key, label]) => {
        const v = sanitizeText(body[key]);
        if (v && v !== '#') {
            if (!isValidHttpsUrl(v)) errors.push(label + ' URL must be a valid HTTPS link.');
            else if (containsMaliciousContent(body[key])) errors.push('HTML or script tags are not allowed in ' + label + ' URL.');
        }
    });

    // WhatsApp (optional)
    const wa = sanitizeText(body.whatsappUrl);
    if (wa && wa !== '#') {
        if (!isValidWhatsApp(wa)) errors.push('Please enter a valid WhatsApp URL or phone number.');
        else if (containsMaliciousContent(body.whatsappUrl)) errors.push('HTML or script tags are not allowed in WhatsApp field.');
    }

    // Office Hours
    [['weekdayHours', 'Monday-Friday Hours'], ['saturdayHours', 'Saturday Hours'], ['sundayHours', 'Sunday Hours']].forEach(([key, label]) => {
        const v = sanitizeText(body[key]);
        if (!v) errors.push(label + ' is required.');
        else if (v.length < 3) errors.push(label + ' must be at least 3 characters.');
        else if (v.length > 50) errors.push(label + ' cannot exceed 50 characters.');
        else if (containsMaliciousContent(body[key])) errors.push('HTML or script tags are not allowed in ' + label + '.');
    });

    return { valid: errors.length === 0, errors };
}

function sanitizeContactBody(body) {
    const allFields = ['address', 'primaryPhone', 'primaryEmail', 'secondaryEmail', 'googleMapsUrl',
        'facebookUrl', 'instagramUrl', 'linkedinUrl', 'twitterUrl', 'whatsappUrl',
        'weekdayHours', 'saturdayHours', 'sundayHours'];
    allFields.forEach(f => { if (body[f] !== undefined) body[f] = sanitizeText(body[f]); });
    return body;
}

// ────────────────────────────────────────────
//  GET /api/contact-details — Fetch Contact data
// ────────────────────────────────────────────
exports.getContact = (req, res) => {
    try {
        const data = readContactData();
        return res.json({ success: true, data });
    } catch (error) {
        console.error('❌ Error reading Contact data:', error);
        return res.status(500).json({ success: false, message: 'Failed to load Contact details.' });
    }
};

// ────────────────────────────────────────────
//  PUT /api/contact-details — Update Contact data
// ────────────────────────────────────────────
exports.updateContact = (req, res) => {
    try {
        // Validate
        const validation = validateContactFields(req.body);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
        }

        // Sanitize
        sanitizeContactBody(req.body);

        const {
            address, primaryPhone, primaryEmail, secondaryEmail, googleMapsUrl,
            facebookUrl, instagramUrl, linkedinUrl, twitterUrl, whatsappUrl,
            weekdayHours, saturdayHours, sundayHours
        } = req.body;

        const updatedData = {
            address,
            primaryPhone,
            primaryEmail,
            secondaryEmail: secondaryEmail || "",
            googleMapsUrl,
            facebookUrl: facebookUrl || "#",
            instagramUrl: instagramUrl || "#",
            linkedinUrl: linkedinUrl || "#",
            twitterUrl: twitterUrl || "#",
            whatsappUrl: whatsappUrl || "#",
            weekdayHours,
            saturdayHours,
            sundayHours
        };

        writeContactData(updatedData);

        return res.json({
            success: true,
            message: 'Contact details updated successfully.',
            data: updatedData
        });

    } catch (error) {
        console.error('❌ Error updating Contact details:', error);
        return res.status(500).json({ success: false, message: 'Failed to update Contact details.' });
    }
};
