# PROJECT DOCUMENTATION — PRAPTI ASSOCIATES

Welcome to the technical documentation of the Prapti Associates website and CMS dashboard.

---

## 1. Project Overview
- **Project Name:** Prapti Associates Web Application & Custom CMS Dashboard
- **Client:** Prapti Associates (Construction Consultancy & Engineering)
- **Developer Reference:** Technical handover documentation
- **Development Status:** Fully Completed and Stable

---

## 2. Project Objective
To replace a static website with a fully dynamic web platform. The administrator can manage all content—projects, team members, services, home section, company history, contact cards, social links, and credentials—directly via a custom secure Admin Dashboard, without writing code or editing files. The platform also automates client appointments, consulting requests, and testimonials/feedback via mailer notifications.

---

## 3. Technology Stack
- **Frontend Architecture:** Clean HTML5, CSS3 (Vanilla), Bootstrap v5.3.3, Bootstrap Icons v1.11.3, Vanilla JavaScript (ES6+).
- **Backend Architecture:** Node.js, Express.js.
- **Data Storage:** Flat-file database pattern (`backend/data/*.json`) for consistent state mapping.
- **File Uploads:** Multer-based middleware saving files directly to `images/` directory in the frontend.
- **Mailer Engine:** Nodemailer with secure Gmail SMTP configuration.

---

## 4. Folder Structure
The actual workspace layout:
```text
Prapti Associates/
├── admin/                         # Admin Dashboard Views (HTML)
│   ├── connections.html           # Team member management UI
│   ├── dashboard.html             # Main dashboard (Inquiry & appointment tables)
│   ├── login.html                 # Secure authentication screen
│   ├── my-account.html            # Profile username & password editor
│   ├── projects.html              # Projects CRUD view
│   ├── services.html              # Services CRUD view
│   └── website-content.html       # Tabbed Homepage, About Us & Contact editor
├── backend/                       # API Server
│   ├── config/                    # System Configurations (Multer, Nodemailer, Auth)
│   │   ├── authConfig.js
│   │   ├── emailConfig.js
│   │   └── uploadConfig.js
│   ├── controllers/               # API Controllers (Request/Response operations)
│   ├── data/                      # Flat JSON file stores (Data collections)
│   │   ├── about.json
│   │   ├── admin.json
│   │   ├── appointments.json
│   │   ├── connections.json
│   │   ├── contact.json
│   │   ├── feedback.json
│   │   ├── homepage.json
│   │   ├── projects.json
│   │   └── services.json
│   ├── middleware/                # Route security middleware
│   │   └── authMiddleware.js
│   ├── routes/                    # API Route mapping
│   ├── uploads/                   # Temporary upload directory
│   ├── server.js                  # Main server startup file
│   ├── package.json
│   └── .env                       # Environment variables (secret)
├── css/                           # Styling (Public & Admin CSS overrides)
│   ├── style.css
│   └── admin.css
├── js/                            # Public & Admin AJAX scripts
│   ├── about.js
│   ├── admin-about.js
│   ├── admin-connections.js
│   ├── admin-contact.js
│   ├── admin-homepage.js
│   ├── admin-my-account.js
│   ├── admin-projects.js
│   ├── admin-services.js
│   ├── admin.js
│   ├── connections.js
│   ├── contact-page.js
│   ├── forms.js
│   ├── homepage.js
│   ├── main.js
│   ├── projects.js
│   └── services.js
├── images/                        # Dynamic & Static Asset uploads
│   └── connections/
├── index.html                     # Public Homepage
├── about.html                     # Public About Us Page
├── projects.html                  # Public Projects Archive
├── project-detail.html            # Public Project Details Page
├── services.html                  # Public Services Page
├── connections.html               # Public Team Members/Connections Page
├── contact.html                   # Public Contact Page
├── appointment.html               # Public Booking Screen
├── consultancy.html               # Public Consultancy Request Screen
├── feedback.html                  # Public Testimonials Submission
└── serve.json                     # Frontend static server clean URL mapping
```

---

## 5. Frontend & Backend Architectures

### Frontend Architecture
- Simple and premium visual layouts. Uses standard grid systems.
- Employs JavaScript to check backend endpoints on load and dynamically inject configurations into target DOM elements using unique IDs.
- Includes clean fallbacks: if the backend is down, standard text values defined in the raw HTML show up automatically.

### Backend Architecture
- Express middleware chains parse JSON payloads (`express.json()`) and handle CORS requests (`cors()`).
- File uploads are validated via single or multiple field configurations in Multer, storing temp files in `backend/uploads/` before controllers relocate them to the frontend `images/` structure.
- State is preserved via synchronous JSON operations (`fs.readFileSync`, `fs.writeFileSync`), avoiding the complexity of DBMS installations.

---

## 6. Project Evolution Timeline
```text
Project Started
       ↓
Static HTML Website Developed
       ↓
Appointment Booking & Consultancy Notification System Implemented
       ↓
JWT Admin Authentication & Secure Dashboard Foundation Added
       ↓
Dynamic Projects Module (CRUD with Image Uploads) Built
       ↓
Dynamic Team Members Management Module (CRUD) Implemented
       ↓
Dynamic Services Module (CRUD with Icon Classes) Completed
       ↓
Homepage Management Module (Hero Carousel and Stat counters)
       ↓
About Page Management Module (Company Story, Statistics, MVV, and Achievements)
       ↓
Contact Page Management Module (Addresses, Timings, Embed Map, and Social Links)
       ↓
My Account Module (Secure password changing and username updates)
       ↓
Project Fully Completed and Stable
```

---

## 7. Dynamic CMS & CRUD Modules

| Module | Storage File | Operations | Upload Fields |
|---|---|---|---|
| **Projects** | `projects.json` | Create, Read, Update, Delete | `heroImage` (single), `galleryImages` (multiple) |
| **Team Members** | `connections.json` | Create, Read, Update, Delete | `photo` (single profile photo) |
| **Services** | `services.json` | Create, Read, Update, Delete | None (Uses Bootstrap Icons classes) |
| **Homepage** | `homepage.json` | View, Update | None |
| **About Us** | `about.json` | View, Update | `aboutImage` (single company story image) |
| **Contact Cards** | `contact.json` | View, Update | None (Exposes social links & Map parameters) |
| **My Account** | `admin.json` | View, Update | None (Uses hashed Bcrypt credentials) |

---

## 8. Authentication Flow
```text
[Admin Login Screen]
       ↓
Inputs Username & Password
       ↓
POST /api/auth/login
       ↓
Reads backend/data/admin.json (fallback to process.env if missing)
       ↓
Validates username & Bcrypt password match
       ↓
Generates signed JWT token (expires in 24h)
       ↓
Dashboard stores JWT token in localStorage
       ↓
Admin visits protected pages -> headers: { Authorization: "Bearer <token>" }
```

---

## 9. Appointment & Notification Workflow
```text
[Client submits Appointment Form]
       ↓
POST /api/appointments
       ↓
Saves state (status: "pending") inside appointments.json
       ↓
Nodemailer triggers email notification to ADMIN_EMAIL containing:
- Client Info
- Requested DateTime
- Approve Link (/api/appointments/approve?id=xxx)
- Reject Link (/api/appointments/reject?id=xxx)
       ↓
Admin clicks Approve / Reject
       ↓
Backend updates state inside appointments.json
       ↓
Automated confirmation email is triggered to Client's inbox
```

---

## 10. Dependencies & Libraries

### Core Dependencies
- `express` (v4.21.2) - API framework
- `cors` (v2.8.5) - Cross-Origin Request handler
- `dotenv` (v16.4.7) - Environment loader
- `bcryptjs` (v3.0.3) - Password hashing
- `jsonwebtoken` (v9.0.3) - Admin authentication tokens
- `multer` (v2.1.1) - Multipart form image uploading
- `nodemailer` (v6.9.16) - Email notification engines

### Dev Dependencies
- `nodemon` (v3.1.9) - Backend live reloader

---

## 11. Known Limitations & Future Scope
- **File System Locking:** Since JSON flat files are updated using synchronous write operations, simultaneous updates could theoretically collide.
- **Email Delivery:** Relies on Nodemailer with a single SMTP account. High-volume traffic should transition to transactional email APIs (e.g. SendGrid, Mailgun).
- **Single Admin:** The dashboard does not support multi-tenant accounts, roles, or fine-grained permissions.
