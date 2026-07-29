# CLIENT CONFIGURATION CHECKLIST — PRAPTI ASSOCIATES

This checklist identifies every location in the codebase where developer-specific configurations or credentials are used. These must be replaced with your own values before deployment to production.

---

## SECTION 1: SUMMARY

- **Total Configuration Items:** 18 items
- **Number of Environment Variables:** 7 variables in `backend/.env`
- **Number of Frontend Base URLs:** 10 occurrences in `js/` folder
- **Hardcoded Credentials in Source Code:** None

---

## SECTION 2: ENVIRONMENT VARIABLES (`backend/.env`)

These environment variables configure the backend server, email service, and dashboard authentication.

| Variable Name | Purpose | Default / Placeholder | Must Replace? | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Server port | `5000` | **NO** | Auto-set on hosting platforms. |
| `BREVO_API_KEY` | Email service API key | `YOUR_BREVO_API_KEY` | **YES** | Sign up at [brevo.com](https://brevo.com) → SMTP & API → Generate Key. |
| `SENDER_EMAIL` | Sender email address | `YOUR_SENDER_EMAIL@gmail.com` | **YES** | The "from" address for outgoing emails. |
| `ADMIN_EMAIL` | Receives notification alerts | `YOUR_ADMIN_NOTIFICATION_EMAIL@gmail.com` | **YES** | Replace with notification recipient address. |
| `ADMIN_USERNAME` | Admin login username | `admin` | **YES** | Replace with preferred administrator username. |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash for admin login | `YOUR_BCRYPT_PASSWORD_HASH` | **YES** | Generate using `node -e "require('bcryptjs').hash('YOUR_PASSWORD', 10).then(h => console.log(h))"` |
| `JWT_SECRET` | Auth token signature key | `YOUR_JWT_SECRET_KEY` | **YES** | Generate a long random string (32+ characters). |
| `BASE_URL` | Base URL for email action links | `http://localhost:5000` | **YES** | Set to your live backend URL (e.g. `https://your-app.onrender.com`). |

---

## SECTION 3: EMAIL CONFIGURATION

The email system uses Brevo (formerly Sendinblue) to send notifications:

1.  **Incoming Booking Alert:**
    *   **Where Used:** `backend/controllers/appointmentController.js`, `consultancyController.js`, `feedbackController.js`
    *   **Description:** Sends a notification to the administrator with booking details and Approve/Reject buttons.
    *   **Configuration:** Set `ADMIN_EMAIL`, `SENDER_EMAIL`, and `BREVO_API_KEY` in `.env`.
2.  **Approve/Reject Mail Alerts to Clients:**
    *   **Where Used:** `backend/controllers/appointmentController.js`
    *   **Description:** Sends confirmation to the client when admin clicks "Approve" or "Reject".
    *   **Configuration:** Set `SENDER_EMAIL` and `BREVO_API_KEY` in `.env`.

---

## SECTION 4: ADMIN ACCOUNT CONFIGURATION

- **Admin Username:** Stored in `backend/data/admin.json` (seeded from `ADMIN_USERNAME` in `.env` if missing).
- **Password Hash:** Stored in `admin.json` (seeded from `ADMIN_PASSWORD_HASH` in `.env`).
- **JWT Configuration:** Token signature uses `JWT_SECRET` loaded from `.env`.
- **Modifications Required:**
  1. Set the username and password hash in `.env` before initial startup.
  2. Alternatively, log in and navigate to **My Account** to change credentials from the dashboard.

---

## SECTION 5: WEBSITE CONTENT (DASHBOARD EDITABLE)

These values are stored in `backend/data/contact.json`. Update them via the **Contact** tab in the Admin Dashboard:
- **Phone Numbers**
- **Primary Email**
- **Secondary Email**
- **Office Hours**
- **Office Address**
- **Google Maps URL**

---

## SECTION 6: FRONTEND API URL CONFIGURATION

The frontend uses `fetch()` calls pointing to a backend API URL. Update these to your production backend URL:

| Script File | Variable | Description |
| :--- | :--- | :--- |
| `js/admin.js` | `const ADMIN_API` | Admin dashboard API base |
| `js/about.js` | `var ABOUT_API` | About page endpoint |
| `js/connections.js` | `const API_BASE` | Team members endpoint |
| `js/contact-page.js` | `var CONTACT_API` | Contact details endpoint |
| `js/forms.js` | `const API_BASE` (2 places) | Form submission endpoints |
| `js/homepage.js` | `var HOMEPAGE_API`, `var SERVICES_API` | Homepage endpoints |
| `js/main.js` | `fetch(...)` | Testimonials endpoint |
| `js/projects.js` | `const PROJECTS_API` | Projects endpoint |
| `js/services.js` | `var SERVICES_API` | Services endpoint |
| `project-detail.html` | `const DETAIL_API` | Project detail endpoint |

---

## SECTION 7: DEPLOYMENT PREREQUISITES

- [ ] **Email Service Account:** Sign up at [brevo.com](https://brevo.com) and generate an API key.
- [ ] **Cloud Hosting Account:** (e.g. Render for backend, Vercel for frontend)
- [ ] **Domain Name** (optional)
- [ ] **SSL Certificate:** Enforced automatically on platforms like Vercel/Render.

---

## SECTION 8: SECURITY REVIEW

*   **Hardcoded Credentials:** None. All secrets are loaded via environment variables.
*   **Secrets in Source Code:** None. No API tokens or passwords exist in `.js` or `.html` files.
*   **CORS:** Update CORS settings to restrict access to your official domain once deployed.

---

## SECTION 9: PRE-DEPLOYMENT CHECKLIST

- [ ] Set `BREVO_API_KEY` in `.env`.
- [ ] Set `SENDER_EMAIL` in `.env`.
- [ ] Set `ADMIN_EMAIL` in `.env`.
- [ ] Set `ADMIN_USERNAME` and generate a fresh `ADMIN_PASSWORD_HASH` in `.env`.
- [ ] Set `JWT_SECRET` to a cryptographically secure random key in `.env`.
- [ ] Set `BASE_URL` to your production backend URL.
- [ ] Update all frontend `js/` files to point to the live backend URL (search for `http://localhost:5000`).
- [ ] Update contact information via the Admin Dashboard → Contact tab.
- [ ] Test email notifications end-to-end.

---

## SECTION 10: FILE REFERENCES

*   **`backend/.env`:** Server configurations, email credentials, and login secrets.
*   **`backend/.env.example`:** Template showing all required variables.
*   **`backend/config/authConfig.js`:** Retrieves `process.env.JWT_SECRET` for API auth.
*   **`backend/data/admin.json`:** Admin login credentials (username + bcrypt hash).
*   **`backend/data/contact.json`:** Business contact details (editable via dashboard).
*   **`js/admin.js` / `js/forms.js` / etc.:** Frontend API URLs.
