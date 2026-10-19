# Attendance Check-in System - MVP

Simple education attendance platform for teachers to manage classes and attendance sessions, students to check in via QR/PIN code.

## 🚀 Quick Start (3 Steps)

### 1️⃣ Start Database
```bash
docker-compose up
```
Database runs on `localhost:5432`

### 2️⃣ Start Backend (new terminal)
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

### 3️⃣ Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## 📋 Test Credentials

```
Teacher:
  Email: teacher1@example.com
  Password: password123

Student:
  Email: student1@example.com
  Password: password123
```

---

## ✨ Features

✅ User auth (register/login)  
✅ Teacher: Create classes & manage attendance sessions  
✅ Student: Enroll in classes & check attendance  
✅ QR code + PIN code check-in  
✅ Attendance history & reports  
✅ CSV export  

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + PostgreSQL
- **Database**: PostgreSQL 15 (Docker)
- **ORM**: Sequelize

---

## 📚 Documentation

- [FRESH_INSTALL_GUIDE.md](./FRESH_INSTALL_GUIDE.md) - Setup guide (Thai)
- [CLAUDE.md](./CLAUDE.md) - Architecture & API details

---

## 📁 Project Structure

```
RoboFlow/
├── docker-compose.yml    # Database container
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── models/       # Sequelize models
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API endpoints
│   │   └── index.js      # Entry point
│   └── package.json
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## 🎯 Status

MVP Phase - **Complete & Ready to Use**
