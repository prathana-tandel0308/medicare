# MediCore — Hospital Management System (MERN Stack)

A full-featured Hospital Management System built with MongoDB, Express, React, and Node.js.

## Features

- 🔐 **JWT Authentication** — Secure login/register with role-based access (Admin, Doctor, Receptionist)
- 👤 **Patient Management** — Full CRUD with search, filter by status, pagination, emergency contacts
- 👨‍⚕️ **Doctor Management** — Staff records with department, specialization, availability, fees
- 📅 **Appointment System** — Book, update, cancel appointments with patient-doctor linking
- 📊 **Dashboard** — Live stats, charts (Recharts), recent activity feed
- 🎨 **Modern Dark UI** — Responsive design with DM Serif Display + DM Sans typography

---

## Project Structure

```
hospital-ms/
├── backend/
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── routes/          # Express API routes
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js      # JWT middleware
│   ├── server.js        # Express app + DB connection
│   ├── seed.js          # Sample data seeder
│   └── .env.example
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   └── api.js
        ├── components/
        │   └── Layout.js
        ├── pages/
        │   ├── Login.js
        │   ├── Dashboard.js
        │   ├── Patients.js
        │   ├── Doctors.js
        │   └── Appointments.js
        ├── App.js
        ├── index.js
        └── index.css
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET

# (Optional) Seed sample data
node seed.js

# Start development server
npm run dev
# or production: npm start
```

Backend runs on **http://localhost:5000**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

Frontend runs on **http://localhost:3000**

---

## Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital_ms
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

### Using MongoDB Atlas (Cloud)

Replace MONGODB_URI with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hospital_ms?retryWrites=true&w=majority
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/patients | List patients (search, filter, paginate) |
| GET | /api/patients/:id | Get single patient |
| POST | /api/patients | Add patient |
| PUT | /api/patients/:id | Update patient |
| DELETE | /api/patients/:id | Delete patient |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/doctors | List doctors |
| POST | /api/doctors | Add doctor |
| PUT | /api/doctors/:id | Update doctor |
| DELETE | /api/doctors/:id | Delete doctor |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/appointments | List appointments |
| GET | /api/appointments/today | Today's appointments |
| POST | /api/appointments | Book appointment |
| PUT | /api/appointments/:id | Update appointment |
| DELETE | /api/appointments/:id | Delete appointment |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | All stats + charts data |

---

## Default Login (after seeding)

```
Email:    admin@medicore.com
Password: admin123
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Pure CSS (CSS variables) |
| Charts | Recharts |
| HTTP | Axios |
| Notifications | react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## Extending the System

The architecture is modular — you can easily add:
- **Billing/Invoice module** — Add a `Bill` model and routes
- **Lab Reports** — Add file upload with Multer
- **Ward/Bed Management** — Add `Ward` and `Bed` models
- **Staff Attendance** — Add attendance tracking
- **SMS/Email notifications** — Integrate Twilio/Nodemailer
