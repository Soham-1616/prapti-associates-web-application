# API DOCUMENTATION — PRAPTI ASSOCIATES

This document lists all the APIs implemented in the backend application.

---

## 1. Authentication Endpoints

### Login
- **Route:** `POST /api/auth/login`
- **Purpose:** Authenticates the administrator and returns a JWT.
- **Request Body:**
  ```json
  {
      "username": "admin",
      "password": "yourpassword"
  }
  ```
- **Response (200 OK):**
  ```json
  {
      "success": true,
      "message": "Login successful.",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Authentication Required:** No

### Verify Token
- **Route:** `GET /api/auth/verify`
- **Purpose:** Validates the active session JWT.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
      "success": true,
      "message": "Token is valid.",
      "admin": { "username": "admin", "role": "admin" }
  }
  ```
- **Authentication Required:** Yes

### Get My Profile details
- **Route:** `GET /api/auth/me`
- **Purpose:** Fetches the active admin username and status.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
      "success": true,
      "data": { "username": "admin", "status": "Active" }
  }
  ```
- **Authentication Required:** Yes

### Update Username
- **Route:** `PUT /api/auth/username`
- **Purpose:** Updates the administrator username.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
      "newUsername": "prapti_admin"
  }
  ```
- **Response (200 OK):**
  ```json
  {
      "success": true,
      "message": "Username updated successfully.",
      "data": { "username": "prapti_admin" }
  }
  ```
- **Authentication Required:** Yes

### Change Password
- **Route:** `PUT /api/auth/password`
- **Purpose:** Securely changes the administrator password (hashed with Bcrypt).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
      "currentPassword": "oldpassword",
      "newPassword": "newpassword123",
      "confirmPassword": "newpassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
      "success": true,
      "message": "Password updated successfully."
  }
  ```
- **Authentication Required:** Yes

---

## 2. Dynamic Content Management (CMS)

### Get Homepage Content
- **Route:** `GET /api/homepage`
- **Purpose:** Fetches editable text and stats for the homepage.
- **Response (200 OK):** Contains Title lines, Subtitle, CTAs, Statistics.
- **Authentication Required:** No

### Update Homepage Content
- **Route:** `PUT /api/homepage`
- **Purpose:** Updates text and counters on the homepage.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** JSON payload matching schema fields.
- **Authentication Required:** Yes

### Get About Us Content
- **Route:** `GET /api/about`
- **Purpose:** Fetches dynamic text, MVV, and achievements for the About page.
- **Response (200 OK):** Contains intro, mission, vision, values, achievements.
- **Authentication Required:** No

### Update About Us Content
- **Route:** `PUT /api/about`
- **Purpose:** Updates About Us text and handles company image upload.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Multipart Form Data (Accepts single file under parameter `aboutImage`).
- **Authentication Required:** Yes

### Get Contact Details
- **Route:** `GET /api/contact-details`
- **Purpose:** Fetches address, social links, timings, and map URL.
- **Authentication Required:** No

### Update Contact Details
- **Route:** `PUT /api/contact-details`
- **Purpose:** Updates office details.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** JSON object with address parameters.
- **Authentication Required:** Yes

---

## 3. Projects CRUD Module

### Get All Projects
- **Route:** `GET /api/projects`
- **Purpose:** Returns list of all active projects.
- **Authentication Required:** No

### Get Single Project
- **Route:** `GET /api/projects/:id`
- **Authentication Required:** No

### Create Project
- **Route:** `POST /api/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Multipart Form Data:
  - `title`, `description`, `category` (residential / commercial / institutional), `location`, `client`, `area`, `year`
  - `heroImage` (Single file)
  - `galleryImages` (Multiple files - max 10)
- **Authentication Required:** Yes

### Update Project
- **Route:** `PUT /api/projects/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Multipart Form Data (updates fields and appends files).
- **Authentication Required:** Yes

### Delete Project
- **Route:** `DELETE /api/projects/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Authentication Required:** Yes

---

## 4. Connections (Team Members) CRUD Module

### Get All Team Members
- **Route:** `GET /api/connections`
- **Authentication Required:** No

### Get Single Team Member
- **Route:** `GET /api/connections/:id`
- **Authentication Required:** No

### Create Team Member
- **Route:** `POST /api/connections`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Multipart Form Data:
  - `name`, `designation`, `category` (core / associate / custom), `customCategory`
  - `photo` (Single file)
- **Authentication Required:** Yes

### Update Team Member
- **Route:** `PUT /api/connections/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Multipart Form Data (Updates profile fields).
- **Authentication Required:** Yes

### Delete Team Member
- **Route:** `DELETE /api/connections/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Authentication Required:** Yes

---

## 5. Services CRUD Module

### Get All Services
- **Route:** `GET /api/services`
- **Authentication Required:** No

### Get Single Service
- **Route:** `GET /api/services/:id`
- **Authentication Required:** No

### Create Service
- **Route:** `POST /api/services`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** JSON payload (`name`, `description`, `icon`, `order`, `status`).
- **Authentication Required:** Yes

### Update Service
- **Route:** `PUT /api/services/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** JSON payload (`name`, `description`, `icon`, `order`, `status`).
- **Authentication Required:** Yes

### Delete Service
- **Route:** `DELETE /api/services/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Authentication Required:** Yes

---

## 6. Public Form Inquiries

### Get All Appointments
- **Route:** `GET /api/appointments`
- **Purpose:** Fetches bookings list for dashboard tables.
- **Headers:** `Authorization: Bearer <token>`
- **Authentication Required:** Yes

### Book Appointment
- **Route:** `POST /api/appointments`
- **Purpose:** Saves booking state and emails approval links to the administrator.
- **Request Body:** JSON object containing `name`, `email`, `phone`, `date`, `time`, `service`, `message`.
- **Authentication Required:** No

### Approve Appointment Link
- **Route:** `GET /api/appointments/approve`
- **Query Parameter:** `id`
- **Purpose:** Sets appointment status to approved and emails confirmation to the client.
- **Authentication Required:** No (Authorized via unique UUID query token)

### Reject Appointment Link
- **Route:** `GET /api/appointments/reject`
- **Query Parameter:** `id`
- **Purpose:** Sets appointment status to rejected and emails rejection to the client.
- **Authentication Required:** No (Authorized via unique UUID query token)

### Submit Contact Inquiry
- **Route:** `POST /api/contact`
- **Purpose:** Receives general inquiry, saves to database, and triggers email notification.
- **Request Body:** JSON object containing `name`, `email`, `phone`, `subject`, `message`.
- **Authentication Required:** No

### Submit Consultancy Request
- **Route:** `POST /api/consultancy`
- **Purpose:** Handles detailed consulting requests and triggers admin notification.
- **Request Body:** JSON object containing `name`, `email`, `phone`, `service`, `details`.
- **Authentication Required:** No

### Submit Client Testimonial/Feedback
- **Route:** `POST /api/feedback`
- **Purpose:** Saves feedback/rating inputs from clients.
- **Request Body:** JSON object containing `name`, `email`, `phone`, `rating`, `comments`.
- **Authentication Required:** No
