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
        const {
            address,
            primaryPhone,
            primaryEmail,
            secondaryEmail,
            googleMapsUrl,
            facebookUrl,
            instagramUrl,
            linkedinUrl,
            twitterUrl,
            whatsappUrl,
            weekdayHours,
            saturdayHours,
            sundayHours
        } = req.body;

        // Validation
        if (!address || !address.trim()) {
            return res.status(400).json({ success: false, message: 'Address is required.' });
        }
        if (!primaryPhone || !primaryPhone.trim()) {
            return res.status(400).json({ success: false, message: 'Primary Phone Number is required.' });
        }
        if (!primaryEmail || !primaryEmail.trim()) {
            return res.status(400).json({ success: false, message: 'Primary Email Address is required.' });
        }
        if (!googleMapsUrl || !googleMapsUrl.trim()) {
            return res.status(400).json({ success: false, message: 'Google Maps URL is required.' });
        }

        const existingData = readContactData();

        const updatedData = {
            address: address.trim(),
            primaryPhone: primaryPhone.trim(),
            primaryEmail: primaryEmail.trim(),
            secondaryEmail: secondaryEmail ? secondaryEmail.trim() : "",
            googleMapsUrl: googleMapsUrl.trim(),
            facebookUrl: facebookUrl ? facebookUrl.trim() : "#",
            instagramUrl: instagramUrl ? instagramUrl.trim() : "#",
            linkedinUrl: linkedinUrl ? linkedinUrl.trim() : "#",
            twitterUrl: twitterUrl ? twitterUrl.trim() : "#",
            whatsappUrl: whatsappUrl ? whatsappUrl.trim() : "#",
            weekdayHours: weekdayHours ? weekdayHours.trim() : existingData.weekdayHours,
            saturdayHours: saturdayHours ? saturdayHours.trim() : existingData.saturdayHours,
            sundayHours: sundayHours ? sundayHours.trim() : existingData.sundayHours
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
