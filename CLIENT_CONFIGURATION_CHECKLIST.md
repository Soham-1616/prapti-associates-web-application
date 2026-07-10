# CLIENT CONFIGURATION CHECKLIST — PRAPTI ASSOCIATES

This checklist identifies every location in the codebase where developer-specific configurations or local credentials are used. These must be replaced with the client's official values before deployment to production.

---

## SECTION 1: SUMMARY

- **Total Files Inspected:** 42 files across the project
- **Total Configuration Items Found:** 18 items
- **Total Client Replacements Required:** 17 replacements
- **Number of Environment Variables:** 7 variables in `.env` (plus 1 optional variable)
- **Number of Hardcoded Frontend Base URLs:** 10 occurrences in script files
- **Number of Security Observations:** 0 hardcoded credentials or secrets inside source files

---

## SECTION 2: ENVIRONMENT VARIABLES (`backend/.env`)

These environment variables configure the backend server, mail systems, and dashboard authentication.

| Variable Name | Purpose | Current Usage | Should Client Replace? | Replacement Required |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Local hosting port | `5000` | **NO** | Set to production environment port (e.g. read automatically on hosting platforms). |
| `EMAIL_USER` | Sender Gmail address | `patilsoham1616@gmail.com` | **YES** | Replace with client's official Gmail account. |
| `EMAIL_PASS` | Gmail SMTP authentication | `vnyf ccnk zrgp ukia` | **YES** | Replace with a generated 16-character Google App Password. |
| `ADMIN_EMAIL` | Receives appointment alerts | `sohampatil200616@gmail.com` | **YES** | Replace with client's notification recipient address. |
| `ADMIN_USERNAME`| Admin login username | `admin` | **YES** | Replace with client's preferred administrator username. |
| `ADMIN_PASSWORD_HASH`| Bcrypt hash for admin login | Hash of `admin` | **YES** | Generate a new hash using Bcrypt cost factor of 10. |
| `JWT_SECRET` | Auth Token signature key | `Pr4pt1A550c14t3s_...` | **YES** | Generate a long random string. |
| `BASE_URL` | Base endpoint for email approval links | *(Defaults to localhost)* | **YES** | Set to the live deployed URL of the backend (e.g. `https://api.prapti.com`). |

---

## SECTION 3: EMAIL CONFIGURATION

The mailer setup utilizes Gmail SMTP to dispatch status alerts:

1.  **Incoming Booking Alert:**
    *   **Where Used:** `backend/controllers/appointmentController.js` (lines 149-165, 434-448), `backend/controllers/consultancyController.js` (lines 115-127), and `backend/controllers/feedbackController.js` (lines 162-174).
    *   **Description:** Sends a notification to the administrator containing booking details and Action buttons (Approve/Reject).
    *   **Client Replacement:** Update `ADMIN_EMAIL` and `EMAIL_USER` in `.env`.
2.  **Approve/Reject Mail Alerts to Clients:**
    *   **Where Used:** `backend/controllers/appointmentController.js` (lines 280-350).
    *   **Description:** Sends confirmation to the client once the admin clicks "Approve" or "Reject".
    *   **Client Replacement:** Update `EMAIL_USER` and `EMAIL_PASS` in `.env`.

---

## SECTION 4: ADMIN ACCOUNT CONFIGURATION

- **Admin Username:** Stored dynamically inside `backend/data/admin.json` (seeded from `ADMIN_USERNAME` in `.env` if missing).
- **Password Hash:** Stored inside `admin.json` (seeded from `ADMIN_PASSWORD_HASH` in `.env`).
- **JWT Configuration:** Cryptographic token signature uses `JWT_SECRET` loaded from `.env`.
- **Modifications Required:**
  1. Change the username and password in the `.env` file before initial startup.
  2. Alternatively, log in to the admin dashboard and navigate to **My Account** (`my-account.html`) to change the username and password directly.

---

## SECTION 5: WEBSITE CONTENT (DASHBOARD EDITABLE)

These values are currently initialized with Prapti Associates' official details inside `backend/data/contact.json`. The client can update these values directly from the **Contact** tab in the Admin Dashboard:
- **Phone Numbers:** `+91 97639 96291`
- **Primary Email:** `praptiassociates555@gmail.com`
- **Secondary Email:** `umeshkamble008@gmail.com`
- **Office Hours:** Weekdays 9:00 AM – 7:00 PM, Saturday 10:00 AM – 4:00 PM, Sunday Closed.
- **Office Address:** `9/ A Mangal Murt, Gayatri park near Sanjivni Hospital, Amba Chowk, Kupwad, Sangli (416 436).`
- **Google Maps Url:** Location coordinates iframe map embed link.

---

## SECTION 6: LOCAL DEVELOPMENT CONFIGURATION

The frontend uses vanilla AJAX fetch calls pointing to a hardcoded local API URL. These must be replaced with the public API URL:

| Script File | Approximate Location | Key/Variable | Description |
| :--- | :--- | :--- | :--- |
| `js/admin.js` | Line 6 | `const ADMIN_API` | Points to localhost backend |
| `js/about.js` | Line 8 | `var ABOUT_API` | Points to about page endpoint |
| `js/connections.js` | Line 7 | `const API_BASE` | Points to team members endpoint |
| `js/contact-page.js` | Line 8 | `var CONTACT_API` | Points to contact endpoint |
| `js/forms.js` | Line 89, Line 176 | `const API_BASE` | Points to appointment booking endpoint |
| `js/homepage.js` | Line 10 | `var HOMEPAGE_API` | Points to homepage endpoint |
| `js/main.js` | Line 165 | `fetch(...)` | Points to testimonials endpoint |
| `js/projects.js` | Line 7 | `const PROJECTS_API` | Points to projects archive endpoint |
| `js/services.js` | Line 8 | `var SERVICES_API` | Points to services endpoint |

---

## SECTION 7: DEPLOYMENT PREREQUISITES

Provide this checklist to the client to retrieve configuration credentials:
- [ ] **Official Client Gmail Account:** (e.g. `praptiassociates555@gmail.com`)
- [ ] **Google App Password:** 16-character passcode generated inside Google Account Security settings.
- [ ] **Domain Name Registration:** (e.g. `praptiassociates.com`)
- [ ] **Cloud Platform Hosting Account:** (e.g. Render, Vercel, Netlify, or VPS)
- [ ] **SSL Security Certification:** (Enforced automatically on platforms like Netlify/Vercel/Render)

---

## SECTION 8: SECURITY REVIEW

*   **Hardcoded Credentials:** None found. Password signatures and tokens are loaded strictly via environment variables.
*   **Secrets Inside Source Code:** None found. No API tokens or Gmail passwords exist inside `.js` or `.html` source files.
*   **Missing Variables:** None. `.env` covers all required keys.
*   **Potential Security Risks:** Ensure CORS is updated to restrict access to the client's official domain name once deployed.

---

## SECTION 9: PRE-DEPLOYMENT CHECKLIST

- [ ] Change `EMAIL_USER` to client Gmail in `.env`.
- [ ] Change `EMAIL_PASS` to 16-digit Google App Password in `.env`.
- [ ] Change `ADMIN_EMAIL` to client notification email in `.env`.
- [ ] Update `ADMIN_USERNAME` and generate a fresh `ADMIN_PASSWORD_HASH` in `.env`.
- [ ] Change `JWT_SECRET` to a cryptographically secure random key in `.env`.
- [ ] Set `BASE_URL` to your production backend URL (e.g. `https://api.prapti.com`).
- [ ] Update all 10 occurrences of `http://localhost:5000` in the frontend `js/` folder to the live backend URL.
- [ ] Verify Nodemailer initialization reports `✅ Email server is ready` on startup.

---

## SECTION 10: FILE REFERENCES

*   **`backend/.env`:**
    *   Holds all server configurations, email credentials, and login secrets.
*   **`backend/config/authConfig.js`:**
    *   Retrieves `process.env.JWT_SECRET` to verify API calls.
*   **`backend/config/emailConfig.js`:**
    *   Retrieves SMTP configurations (`EMAIL_USER` and `EMAIL_PASS`).
*   **`js/admin.js` / `js/forms.js` / etc.:**
    *   Holds frontend API URLs matching localhost development servers.
