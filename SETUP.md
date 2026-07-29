# SETUP GUIDE — PRAPTI ASSOCIATES

Complete setup instructions for new developers to get the project running locally and deploy to production.

---

## 1. Prerequisites

| Software | Version | Download |
|:---------|:--------|:---------|
| **Node.js** | 18.x or 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x or higher | Included with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **VS Code** (recommended) | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

---

## 2. Installation

### Step 1: Clone the Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd "Prapti Associates"
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

---

## 3. Environment Variables

### Step 3: Create the `.env` File
Create a file named `.env` inside the `backend/` folder with the following content:

```env
# ── Server ──
PORT=5000

# ── Email Service (Brevo / Sendinblue) ──
# Sign up at https://brevo.com → SMTP & API → Generate API Key
BREVO_API_KEY=YOUR_BREVO_API_KEY

# ── Sender Email ──
SENDER_EMAIL=YOUR_SENDER_EMAIL@gmail.com

# ── Admin Notification Email ──
ADMIN_EMAIL=YOUR_ADMIN_NOTIFICATION_EMAIL@gmail.com

# ── Admin Panel Credentials ──
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=YOUR_BCRYPT_PASSWORD_HASH

# ── JWT Secret (use a long random string, 32+ characters) ──
JWT_SECRET=YOUR_JWT_SECRET_KEY
```

> A template is also available at `ENVIRONMENT_TEMPLATE.env` and `backend/.env.example`.

---

## 4. Configure Admin Credentials

### Step 4: Generate a Password Hash

Run the following command inside the `backend/` folder to generate a bcrypt hash of your desired admin password:

```bash
node -e "require('bcryptjs').hash('YOUR_PASSWORD_HERE', 10).then(h => console.log(h))"
```

Copy the output hash and paste it as the value of `ADMIN_PASSWORD_HASH` in your `.env` file.

### Step 5: Initialize `admin.json`

Either start the server (it auto-generates from `.env`) or manually create `backend/data/admin.json`:

```json
{
    "username": "admin",
    "passwordHash": "PASTE_YOUR_BCRYPT_HASH_HERE"
}
```

---

## 5. Configure Email Service

This project uses **Brevo** (formerly Sendinblue) for sending email notifications.

### Step 6: Set Up Brevo
1. Sign up at [brevo.com](https://brevo.com).
2. Go to **SMTP & API** → **API Keys** → Generate a new API key.
3. Paste the key as `BREVO_API_KEY` in your `.env`.
4. Set `SENDER_EMAIL` to a verified sender email address.
5. Set `ADMIN_EMAIL` to the email that should receive appointment/feedback notifications.

---

## 6. Configure API Base URL

### Step 7: Set Frontend API URLs

All frontend JavaScript files point to `http://localhost:5000` by default. For **production deployment**, update these to your live backend URL.

**Files to update** (search for `http://localhost:5000`):

| File | Variable |
|:-----|:---------|
| `js/admin.js` | `const ADMIN_API` |
| `js/about.js` | `var ABOUT_API` |
| `js/connections.js` | `const API_BASE` |
| `js/contact-page.js` | `var CONTACT_API` |
| `js/forms.js` | `const API_BASE` (2 places) |
| `js/homepage.js` | `var HOMEPAGE_API` + `var SERVICES_API` |
| `js/main.js` | `fetch(...)` |
| `js/projects.js` | `const PROJECTS_API` |
| `js/services.js` | `var SERVICES_API` |
| `project-detail.html` | `const DETAIL_API` |

---

## 7. Running the Project

### Step 8: Start the Backend
```bash
cd backend
npm run dev        # Development (auto-reload)
# or
npm start          # Production
```

Expected output:
```
🏗️ Prapti Associates API Server
   Running on: http://localhost:5000
```

### Step 9: Start the Frontend
Open a **new terminal** at the project root:
```bash
npx serve -p 5500 --no-clipboard
```

Expected output:
```
INFO Accepting connections at http://localhost:5500
```

### Step 10: Access the Application

| URL | Page |
|:----|:-----|
| `http://localhost:5500` | Public Website |
| `http://localhost:5500/admin/login.html` | Admin Login |
| `http://localhost:5000` | Backend API Health Check |

Log in with the admin credentials you configured in Step 4-5.

---

## 8. Deployment

### Backend → Render
1. Push code to a GitHub repository.
2. Create a **Web Service** on [render.com](https://render.com).
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add all environment variables from `.env` under **Environment** settings.
7. Set `BASE_URL` to the Render-generated URL (e.g., `https://your-app.onrender.com`).
8. (Recommended) Mount a **persistent disk** at `/opt/render/project/src/backend/data`.

### Frontend → Vercel
1. Import the same GitHub repository on [vercel.com](https://vercel.com).
2. Set **Output Directory** to `.` (root).
3. Leave **Build Command** blank (static files).
4. **Before deploying**, update all JS files to point to your live Render backend URL (see Step 7).

---

## 9. Verification Checklist

After setup, verify the following:

- [ ] Backend starts without errors on `http://localhost:5000`.
- [ ] `GET http://localhost:5000` returns `{ status: "running" }`.
- [ ] Frontend loads on `http://localhost:5500`.
- [ ] Admin login works at `/admin/login.html`.
- [ ] Dashboard loads after login.
- [ ] Projects/Services/Team Members CRUD works.
- [ ] Homepage/About/Contact CMS editors work.
- [ ] Appointment booking sends email notification.
- [ ] Image uploads work (< 5MB, JPG/PNG/WEBP).

---

## 10. Troubleshooting

| Issue | Solution |
|:------|:---------|
| `EADDRINUSE: port 5000` | Change `PORT` in `.env` to another port. |
| `Cannot find module 'bcryptjs'` | Run `npm install` inside `backend/`. |
| `Invalid or expired token` | Clear browser localStorage and re-login. |
| `CORS error in console` | Ensure backend CORS is configured for your frontend domain. |
| Email not sending | Verify `BREVO_API_KEY` and `SENDER_EMAIL` are correct in `.env`. |
| Admin login fails | Regenerate `admin.json` with a fresh bcrypt hash (see Step 4-5). |
