# 🏗️ Prapti Associates – Construction Consultancy Web Application & CMS

A modern, responsive business web application developed for **Prapti Associates**, a construction and project consultancy firm.
This platform showcases company projects, services, professional connections, and provides dynamic CMS capabilities and client appointment booking, consultancy requests, and customer feedback management.

---

## 🎯 Features

### 🏠 Static & Dynamic Pages (Frontend)
- **Home Page:** Displays Hero banner, Services Preview, Projects Preview, and Client Testimonials.
- **About Page:** Showcases company background, mission, vision, values, statistics, and Achievements.
- **Projects Page:** Filters projects by Category (Residential, Commercial, Institutional).
- **Services Page:** Details firm capabilities with dynamic service description cards.
- **Connections Page:** Features professional team directories (Core, Associate, Consultant).
- **Contact Page:** Interactive contact form, social media anchors, and Google Maps location.

### 🔐 Custom CMS Admin Dashboard
- **Admin Authentication:** Secure JWT-based auth guard.
- **Inquiry Managers:** View, approve, or reject Client Testimonial Reviews, Appointments, and Consultancy requests.
- **CRUD Content Editors:** Add, edit, or delete Project items (with multi-image uploading) and Team Member profiles.
- **Page Manager:** Live updating of Homepage hero banners, About Us company text, and Contact information cards.
- **My Account:** Secure username and password credential changes hashed via Bcrypt.

---

## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3 (Vanilla), Bootstrap 5, Bootstrap Icons, JavaScript (Vanilla ES6).
- **Backend:** Node.js, Express.js.
- **Database Storage:** JSON Flat-file database storage pattern (`backend/data/*.json`) to optimize server load and remove DBMS configurations.
- **Mailing Engine:** Nodemailer SMTP Integration with automated approval/rejection response pipelines.
- **Upload Engine:** Multer middleware with file validation filters.

---

## 📂 Folder Structure
```text
Prapti Associates/
├── admin/                         # Admin Dashboard Views (HTML)
├── backend/                       # Node.js API Server
│   ├── config/                    # Systems Configurations
│   ├── controllers/               # Request/Response operations
│   ├── data/                      # JSON Database Stores
│   ├── middleware/                # Route security middlewares
│   ├── routes/                    # Express Routing paths
│   └── server.js                  # Main server startup
├── css/                           # Public & Admin Stylesheets
├── js/                            # Client-Side AJAX scripts
├── images/                        # Dynamic Upload Directories
└── serve.json                     # Static server rewrites configuration
```

---

## ⚙️ Environment Variables
Create a `.env` file in the `backend/` folder. Use the following keys:
```env
PORT=5000
JWT_SECRET=<YOUR_JWT_SECRET_KEY>
EMAIL_USER=<YOUR_GMAIL_SMTP_SENDER>
EMAIL_PASS=<YOUR_GMAIL_APP_16_DIGIT_PASSWORD>
ADMIN_EMAIL=<ADMIN_NOTIFICATION_RECEIVER>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<BCRYPT_PASSWORD_HASH>
BASE_URL=http://localhost:5000
```

---

## 🚀 Running the Project

### 1. Start Backend API
```bash
cd backend
npm install
npm run dev
```

### 2. Serve Frontend
```bash
npx serve -p 5500 --no-clipboard
```
Visit the public site at `http://localhost:5500` or the Admin Dashboard at `http://localhost:5500/admin/login.html`.

---

## 📝 License
This project is proprietary software developed for **Prapti Associates** as a sponsored client project. All rights reserved.
