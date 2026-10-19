# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Attendance Check-in System MVP** — Simplified education attendance platform. Teachers create classes & manage attendance sessions. Students check in via QR or PIN code. View history & export reports.

**Scope**: 4-5 week MVP (1 person). Desktop-first, no real-time WebSocket, no security hardening beyond basic JWT.


---

## Stack & Setup

### Core Tech
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js 18+ + Express.js + PostgreSQL 
- **Database ORM**: Sequelize
- **Auth**: JWT (access token only, no refresh token rotation)
- **APIs**: 40-50 RESTful endpoints (no WebSocket)

### Quick Commands

```bash
# Backend
npm run dev              # Start dev server (nodemon)
npm test                # Run tests
npm run migrate          # Run DB migrations
npm run seed             # Seed test data

# Frontend
npm run dev              # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build
```

### Environment Setup
```bash
# Backend .env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev_secret_key_change_in_prod

# Frontend .env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Architecture

### Database Schema (6 Tables — MVP)

```
users (base: id, email, password_hash, full_name, role, is_active)
  ├── teachers (extends users: id)
  └── students (extends users: id, student_id_number)

classes (id, teacher_id, course_code, course_name, room_number)
  ├── schedules (id, class_id, day_of_week, start_time, end_time)
  ├── enrollments (id, student_id, class_id, status)
  └── sessions (id, class_id, session_date, start_time, end_time, status, qr_code, pin_code)
      └── attendance (id, session_id, student_id, check_in_time, check_in_method, status)
```

**Key Simplifications**:
- No co-teaching (teacher owns class)
- No appeals workflow
- No pre-computed stats
- No notification tables
- Attendance status: `present` | `late` | `absent` (grace period logic in backend only)

### Backend Structure

```
backend/
├── src/
│   ├── config/              # DB, JWT, env
│   ├── controllers/         # Request handlers
│   │   ├── authController
│   │   ├── classController
│   │   ├── sessionController
│   │   └── attendanceController
│   ├── services/            # Business logic
│   │   ├── AuthService      # JWT generation, password hashing
│   │   ├── ClassService     # Class CRUD
│   │   ├── SessionService   # Session lifecycle + grace period calc
│   │   ├── AttendanceService # Check-in validation, status logic
│   │   └── QRService        # QR code generation
│   ├── middleware/
│   │   ├── authMiddleware   # JWT verification
│   │   ├── errorHandler
│   │   └── validation       # Input validation (joi/zod)
│   ├── models/              # Sequelize models
│   ├── routes/              # Express routes
│   ├── migrations/          # DB schema migrations
│   └── index.js
├── tests/
└── package.json
```

**Critical Path**:
1. `SessionService` — grace period logic (present/late/absent calculation)
2. `QRService` — QR generation + PIN code gen
3. `AttendanceService` — check-in validation, one-check-per-session

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Button, Input, Card, Table, Modal
│   │   ├── layout/          # Header, Sidebar, MainLayout
│   │   ├── auth/            # LoginForm, RegisterForm
│   │   ├── teacher/         # ClassForm, SessionCreator, LiveMonitor
│   │   └── student/         # EnrollmentForm, QRScanner, PINInput, History
│   ├── pages/               # Page-level components (routes)
│   │   ├── LoginPage, RegisterPage
│   │   ├── TeacherDashboard, ClassDetailPage, SessionPage
│   │   ├── StudentDashboard, EnrollPage, CheckInPage, HistoryPage
│   │   └── AdminDashboard
│   ├── hooks/
│   │   ├── useAuth          # Auth context + login/logout
│   │   └── useFetch         # Axios wrapper with error handling
│   ├── services/
│   │   └── api.ts           # Axios instance, API calls
│   ├── context/             # AuthContext
│   ├── utils/               # Formatters, validators, helpers
│   └── App.jsx              # Router setup
├── vite.config.js
└── tailwind.config.js
```

**Key Components**:
- `SessionPage` — Display QR (static image) + PIN. Manual mark button. Live list of check-ins (polling every 2s)
- `CheckInPage` — QR scanner OR PIN input. Call `/attendance/check-in/qr` or `/attendance/check-in/pin`
- `HistoryPage` — Table of attendance records. Export CSV button

---

## API Endpoints (MVP — 40-50 Total)

### Auth (4)
- `POST /auth/register` — Create user
- `POST /auth/login` — JWT token
- `GET /auth/me` — Current user
- `POST /auth/logout` — No-op (client deletes token)

### Classes (8)
- `GET /classes` (teacher: my classes)
- `POST /classes` (create)
- `GET /classes/:id`
- `PUT /classes/:id` (edit)
- `DELETE /classes/:id`
- `GET /classes/:id/enrollments` (students)
- `POST /classes/:id/enrollments` (enroll student)
- `DELETE /classes/:id/enrollments/:enrollmentId` (drop)

### Schedules (4)
- `GET /classes/:id/schedules`
- `POST /classes/:id/schedules`
- `PUT /schedules/:id`
- `DELETE /schedules/:id`

### Sessions (8)
- `POST /sessions` (create attendance session)
- `GET /sessions/:id`
- `PATCH /sessions/:id/status` (activate/close)
- `GET /sessions/:id/qr-code` (serve QR image)
- `GET /sessions/:id/attendance` (list attendees, paginated)
- `POST /sessions/:id/manual-mark` (teacher marks student)
- `DELETE /sessions/:id` (cancel)

### Check-in (4)
- `POST /attendance/check-in/qr` (QR scan)
- `POST /attendance/check-in/pin` (PIN code)
- `GET /attendance/my-history` (student: own records)
- `GET /attendance/class/:classId` (teacher: class attendance)

### Reports (3)
- `GET /reports/class/:classId` (full attendance list)
- `GET /reports/class/:classId/export` (CSV download)
- `GET /reports/admin/summary` (admin: system stats)

### Users (Admin Only) (3)
- `GET /users` (list)
- `POST /users` (create)
- `DELETE /users/:id` (soft delete)

### Enrollments (2)
- `GET /enrollments/my-classes` (student)
- `POST /enrollments` (student enrolls)

---

## Key Implementation Notes

### Grace Period Logic
**Attendance Status Calculation** (in `SessionService.getAttendanceStatus`):
```
checkInTime - sessionStartTime = diffMinutes
if diffMinutes <= 0 → "present"
if diffMinutes <= gracePeriodMinutes (default 15) → "late"  
else → "absent"
```

Session auto-close: `endTime + autoCloseBuffer (10 min)`. After close, no new check-ins accepted.

### QR Code
- Generate on session creation: `QRCode.toDataURL(sessionId + pin + timestamp)`
- No regeneration per 30s (MVP: static QR for session duration)
- Serve as image endpoint `/sessions/:id/qr-code`
- Frontend displays as `<img>` tag

### PIN Code
- 6-digit numeric, generated on session creation
- Stored in `sessions.pin_code`
- Validate: 6 digits, session active, student enrolled

### Check-in Validation
- Must be enrolled in class
- Session must be "active" (status check)
- Can't check in twice same session (prevent duplicates: `UNIQUE(session_id, student_id)`)
- Must be within grace period + auto-close buffer

### Reports & CSV Export
- No PDF generation (drop)
- CSV: attendance list (student_id, name, date, time, status)
- No analytics charts (drop)

---

## Development Workflow

### Starting Backend Dev
```bash
cd backend
npm install
# Setup .env
npm run migrate
npm run seed (optional)
npm run dev
```

### Starting Frontend Dev
```bash
cd frontend
npm install
# Setup .env
npm run dev
# Access http://localhost:5173
```

### Testing
```bash
# Backend: unit test SessionService
npm test -- SessionService

# Frontend: component test (QRScanner, PINInput)
npm run test
```

### Database Changes
```bash
# Create migration
npm run migrate:create --name add_new_column

# Run pending migrations
npm run migrate
```

---

## Code Style & Patterns

- **Naming**: camelCase (JS), PascalCase (React components)
- **Error Handling**: Try-catch in controllers, pass to errorHandler middleware
- **Validation**: Joi on request body, return 400 on fail
- **Auth**: JWT in `Authorization: Bearer <token>` header. Verify in middleware
- **React**: Functional components + hooks. Avoid inline JSX logic (extract components)
- **API Responses**: 
  ```json
  { "success": true, "data": {...} }
  { "success": false, "error": "message" }
  ```

---

## Common Tasks

### Add New Endpoint
1. Create service method (e.g., `ClassService.createClass`)
2. Create controller (e.g., `classController.create`)
3. Add route (e.g., `router.post('/classes', authMiddleware, classController.create)`)
4. Validate input with Joi
5. Test with Postman/curl

### Add New Frontend Page
1. Create page component in `pages/`
2. Add route in `App.jsx`
3. Create reusable components in `components/`
4. Use `useAuth` for auth checks
5. Use `useFetch` for API calls

### Deploy MVP
1. Build frontend: `npm run build` → `dist/`
2. Use simple HTTP server (Python, Node, Nginx)
3. Point frontend API to backend URL
4. Run backend on port 5000 (or configure VITE_API_URL)

---

## Gotchas & Warnings

- **JWT expires**: Access token only (no refresh token in MVP). Session expires after logout browser close.
- **Check-in once per session**: Use DB unique constraint to prevent duplicates.
- **Grace period off-by-one**: Test edge case at exactly 15 min mark.
- **QR code static**: No regeneration per 30s in MVP (keep code simple).
- **No real-time**: Use polling (2s interval) for live monitor. Will feel slightly delayed.
- **CSV export large datasets**: May be slow. Pagination recommended for reports.

---

## File Size & Performance Notes

- Keep components <300 lines
- Lazy-load pages in React Router
- Index DB queries (class_id, student_id, session_id)
- Paginate attendance lists (50 per page)

---

**Document Version**: MVP v1  
**Last Updated**: 2026-07-11
