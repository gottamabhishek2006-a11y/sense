# sense – CivicFix Smart MERN Civic Issue Reporting Platform

CivicFix is a modern, responsive civic issue reporting web application built with the **MERN** stack (MongoDB Atlas, Express.js, React 18 + Vite, Node.js) and styled with Tailwind CSS. It enables real citizens to report public infrastructure issues (potholes, streetlights, water pipeline leaks, sanitation) and track municipal repairs with transparent, real-time updates.

---

## 🌟 Smart Unified Authentication Flow (No Dummy Users)

CivicFix uses a **Smart, Real-User Unified Authentication System**:

```
[Landing Page] ──► [Get Started / Sign In]
                          │
                          ▼
            [Step 1: Enter Real Email]
                          │
                          ▼
           POST /api/auth/check-email
                 (Rate-Limited)
                 /             \
    [Email Exists]         [New Email]
          │                     │
          ▼                     ▼
 [Step 2: Enter Password]  [Step 2: Enter Full Name, Password & Confirm]
          │                     │
   POST /api/auth/login   POST /api/auth/signup (Role strictly 'citizen')
          \                     /
           ▼                   ▼
      [Issue JWT & Secure Cookie Session]
                          │
                          ▼
              [Citizen / Admin Dashboard]
```

* **No Hardcoded Credentials / No Dummy Users**: No pre-seeded fake accounts. Users enter their own real email, name, and password.
* **Smart Step Detection**: The user enters their email once. If an account exists, it prompts for password. If not, it prompts to complete citizen registration with the email pre-locked.
* **Email Never Asked Twice**: The verified email is automatically carried forward to the next step with an option to edit/change.
* **Abuse Protection & Rate Limiting**: `express-rate-limit` guards against brute-force and account enumeration attacks on authentication routes.
* **Dual Session Support**: Issues both signed JWT tokens for Authorization headers and secure `HttpOnly` cookies.

---

## 📑 Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Project Folder Structure](#2-project-folder-structure)
3. [Environment Variables](#3-environment-variables)
4. [Running the Application](#4-running-the-application)
5. [API Documentation](#5-api-documentation)
6. [Postman Testing Instructions](#6-postman-testing-instructions)
7. [Security Best Practices](#7-security-best-practices)

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Tailwind CSS, Lucide React Icons |
| **Routing** | React Router DOM v6 |
| **API Client** | Axios (with credentials & auth interceptors) |
| **Backend** | Node.js (v22+), Express.js |
| **Database** | MongoDB Atlas Cloud + Mongoose ODM |
| **Security & Auth** | JWT (`jsonwebtoken`), `bcryptjs` (12 rounds), `cookie-parser`, `express-rate-limit` |
| **Environment Config** | `dotenv` |

---

## 2. Project Folder Structure

```
civicsense/
├── client/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, IssueCard, ReportModal, ProtectedRoute
│   │   ├── context/            # AuthContext (session state, persistence)
│   │   ├── hooks/              # useAuth
│   │   ├── layouts/            # MainLayout (global navbar, footer, report modal)
│   │   ├── pages/              # LandingPage, AuthPage (Smart Get Started/Login/Signup), DashboardPage, AdminPage
│   │   ├── routes/             # AppRoutes (Public, Protected, Admin Role Guarded)
│   │   ├── services/           # api.js (Axios with checkEmail, login, signup, getMe)
│   │   └── index.css           # Tailwind design tokens & glassmorphism
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── config/db.js            # MongoDB Atlas connection
│   ├── controllers/            # authController (checkEmail, signup, login, getMe, logout)
│   ├── middleware/             # authMiddleware (cookie & header JWT protection), errorMiddleware
│   ├── models/User.js          # Mongoose User schema with pre-save bcrypt hashing
│   ├── routes/authRoutes.js    # Rate-limited auth routes
│   ├── utils/                  # generateToken.js, cleanupDummyUsers.js
│   └── server.js               # Express app with CORS & cookie-parser
└── README.md
```

---

## 3. Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://gottamabhishek2006_db_user:QnSfX93btbpZe6hv@cluster0.dsbeokg.mongodb.net/civicfix?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=civicfix_super_secure_jwt_secret_key_2026_production_ready!
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Running the Application

### Start Backend Server
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:5000`*

### Start Frontend Server
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 5. API Documentation

### 1. Check Email Existence
* **POST** `/api/auth/check-email`
* **Rate Limit**: 50 requests per 15 minutes per IP.
* **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Response (New User)**:
  ```json
  {
    "success": true,
    "exists": false,
    "email": "user@example.com",
    "nextStep": "signup"
  }
  ```
* **Response (Existing User)**:
  ```json
  {
    "success": true,
    "exists": true,
    "email": "user@example.com",
    "nextStep": "login"
  }
  ```

### 2. Register Citizen Account
* **POST** `/api/auth/signup`
* **Body**:
  ```json
  {
    "name": "Alex Johnson",
    "email": "user@example.com",
    "password": "StrongPassword@2026!",
    "confirmPassword": "StrongPassword@2026!"
  }
  ```
* **Security Enforcement**: Server strictly assigns `role: "citizen"`. Privilege escalation attempts are discarded.
* **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Citizen account registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6ab40780d89478bf331fd5e9",
      "name": "Alex Johnson",
      "email": "user@example.com",
      "role": "citizen",
      "createdAt": "2026-09-23T17:42:00.000Z"
    }
  }
  ```

### 3. Login
* **POST** `/api/auth/login`
* **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword@2026!"
  }
  ```
* **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Logged in successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6ab40780d89478bf331fd5e9",
      "name": "Alex Johnson",
      "email": "user@example.com",
      "role": "citizen"
    }
  }
  ```

### 4. Get Current User Profile (Protected)
* **GET** `/api/auth/me`
* **Headers**: `Authorization: Bearer <token>` (or HttpOnly cookie `civicfix_token`)
* **Response** (200 OK):
  ```json
  {
    "success": true,
    "user": {
      "id": "6ab40780d89478bf331fd5e9",
      "name": "Alex Johnson",
      "email": "user@example.com",
      "role": "citizen",
      "createdAt": "2026-09-23T17:42:00.000Z"
    }
  }
  ```

### 5. Logout
* **POST** `/api/auth/logout`
* **Response** (200 OK): Clears auth cookie.

---

## 6. Postman Testing Instructions

1. **Check an Unregistered Email**:
   * Method: `POST`
   * URL: `http://localhost:5000/api/auth/check-email`
   * Body (JSON): `{ "email": "your_personal_email@domain.com" }`
   * Verify: Response returns `exists: false` and `nextStep: "signup"`.
2. **Register the Account**:
   * Method: `POST`
   * URL: `http://localhost:5000/api/auth/signup`
   * Body (JSON):
     ```json
     {
       "name": "Your Name",
       "email": "your_personal_email@domain.com",
       "password": "YourSecurePassword@2026!",
       "confirmPassword": "YourSecurePassword@2026!"
     }
     ```
   * Verify: Response status is `201 Created` with JWT token.
3. **Re-Check the Email**:
   * Re-send the `POST /api/auth/check-email` request with the same email.
   * Verify: Response now returns `exists: true` and `nextStep: "login"`.
4. **Log In**:
   * Method: `POST`
   * URL: `http://localhost:5000/api/auth/login`
   * Body (JSON):
     ```json
     {
       "email": "your_personal_email@domain.com",
       "password": "YourSecurePassword@2026!"
     }
     ```
   * Verify: Response status is `200 OK` with session token.

---

## 7. Security Best Practices

* **No Plain-Text Passwords**: Hashed with bcrypt using 12 salt rounds before database storage.
* **Safe JSON Serialization**: Passwords and internal versions are excluded from API payloads via schema transforms.
* **Strict Role Assignment**: Public registration forces `role = 'citizen'`.
* **Strong Password Policy**: Enforces minimum 8 characters, uppercase, lowercase, numbers, and symbols.
* **Rate Limiting**: Protects authentication endpoints from credential-stuffing and enumeration attacks.
* **Dual Token & Cookie Security**: Supports `Authorization: Bearer` and secure `HttpOnly` cookies.
