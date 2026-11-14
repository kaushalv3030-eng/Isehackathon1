# Smart Campus Solutions

**College Hackathon**: CEC-HACKSTORM-2026  
**Theme 1**: Smart Campus Solutions  
**Tech Stack**: React 18 (Vite) + Tailwind CSS + Node.js + Express + SQLite + JWT + Multer

An integrated digital operations platform designed to streamline communication and administration across college campuses. Connects students and faculty through five core pillars: digital timetable management, digital lost & found tracking, campus maintenance complaint escalation, smart attendance analytics with shortage alerts (<75%), and broadcast event announcements.

---

## Deliverables & Architecture Overview

```
isehack/
├── backend/
│   ├── data/
│   │   └── campus.db               # SQLite database file (auto-generated)
│   ├── uploads/                    # Uploaded timetable, lost/found, & complaint photos
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # SQLite connection (better-sqlite3 / native node:sqlite)
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification & role authorization (requireRole)
│   │   │   └── upload.js           # Multer configuration for file uploads
│   │   ├── routes/
│   │   │   ├── auth.routes.js      # Student & Faculty login, student registration, me
│   │   │   ├── timetable.routes.js # Class timetable get, upload/replace
│   │   │   ├── items.routes.js     # Lost & Found CRUD + claims
│   │   │   ├── complaints.routes.js# Complaint lodge, review, status update, faculty remarks
│   │   │   ├── attendance.routes.js# Class roster sheet, mark/update, student summary
│   │   │   ├── events.routes.js    # Campus events & announcements CRUD
│   │   │   ├── notifications.routes.js # Notifications, unread badge, mark read
│   │   │   └── stats.routes.js     # Dashboard metrics & live counts
│   │   ├── scripts/
│   │   │   ├── seed.js             # Demo database seeder
│   │   │   └── test-api.js         # Automated end-to-end verification test suite
│   │   └── server.js               # Express application bootstrap
│   ├── .env                        # Port & JWT Secret configuration
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx       # Status badges (Pending, Resolved, Present, Absent...)
│   │   │   │   ├── EmptyState.jsx  # Zero-state illustration screens
│   │   │   │   ├── Modal.jsx       # Accessible modal dialogs
│   │   │   │   ├── Navbar.jsx      # Top navigation with live notification bell & profile
│   │   │   │   ├── Sidebar.jsx     # Role-based sidebar with active routes
│   │   │   │   └── StatCard.jsx    # Metric overview cards
│   │   │   └── layout/
│   │   │       ├── DashboardLayout.jsx # Base layout with Navbar & Sidebar
│   │   │       └── ProtectedRoute.jsx  # Strict role-based route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User state, JWT storage, student/faculty login
│   │   │   ├── NotificationContext.jsx # 30s background polling + instant refetch
│   │   │   └── ToastContext.jsx    # Toast alert system (success, error, warning)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Dual-role entry landing page
│   │   │   ├── auth/
│   │   │   │   ├── StudentLogin.jsx
│   │   │   │   ├── StudentRegister.jsx
│   │   │   │   └── FacultyLogin.jsx
│   │   │   ├── student/
│   │   │   │   ├── StudentOverview.jsx
│   │   │   │   ├── TimetablePage.jsx
│   │   │   │   ├── LostFoundPage.jsx
│   │   │   │   ├── ComplaintsPage.jsx
│   │   │   │   ├── EventsPage.jsx
│   │   │   │   └── AttendancePage.jsx
│   │   │   └── faculty/
│   │   │       ├── FacultyOverview.jsx
│   │   │       ├── TimetableMgmtPage.jsx
│   │   │       ├── LostFoundMgmtPage.jsx
│   │   │       ├── AttendanceMgmtPage.jsx
│   │   │       ├── ComplaintsMgmtPage.jsx
│   │   │       └── EventsMgmtPage.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with interceptors & helpers
│   │   ├── App.jsx                 # Route definitions & guards
│   │   ├── index.css               # Tailwind CSS directives
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Quick Setup & Run Instructions

### Prerequisites
- Node.js (v18, v20, v22, or v24)
- npm (installed with Node)

### Step 1: Start Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Seed the database with demo accounts, items, attendance, and events
npm run seed

# Start the Express server (Runs on http://localhost:5000)
npm run dev
```

### Step 2: Start Frontend (in a separate terminal window)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server (Runs on http://localhost:5173)
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## Default Login Credentials (Demo Ready)

### Faculty Accounts (Pre-Seeded)
| Name | Email | Password | Role / Department |
| :--- | :--- | :--- | :--- |
| **Prof. Alan Sharma** | `faculty1@campus.edu` | `Faculty@123` | HOD, Computer Science |
| **Dr. Sunita Rao** | `faculty2@campus.edu` | `Faculty@123` | Assistant Professor, CSE |

### Student Accounts (Pre-Seeded)
| Name | Roll Number | Class | Email | Password | Notable State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rahul Verma** | `1CE21CS001` | `CSE-3A` | `student1@campus.edu` | `Student@123` | Active claim & complaint |
| **Priya Nair** | `1CE21CS002` | `CSE-3A` | `student2@campus.edu` | `Student@123` | Complaint in progress |
| **Rohan Kulkarni** | `1CE21CS004` | `CSE-3A` | `student4@campus.edu` | `Student@123` | **<75% Attendance Warning Demo** (50%) |
| **Vikram Singh** | `1CE21CS006` | `CSE-3B` | `student6@campus.edu` | `Student@123` | Section CSE-3B Student |

*Note: You can also click **Register as Student** on the landing page to register any new student account.*

---

## Key Feature Implementation Highlights

1. **Dual Dashboards & Role Separation**:
   - Separate login portals (`/student/login` and `/faculty/login`).
   - Unauthorized access blocked on both frontend (via `ProtectedRoute`) and backend (via `authenticateToken` + `requireRole` middleware with `403 Forbidden`).

2. **Real-Time Cross-Dashboard Sync**:
   - When a student submits a complaint or claim, the faculty dashboard receives a notification and real-time counter increment.
   - When faculty updates complaint status or adds a remark, the student receives an instant notification and status update.
   - Polling every 30 seconds plus instant refetch on all mutation events.

3. **Timetable Viewer & Zoom**:
   - Students see their section's schedule with full-screen zoom and direct download.
   - Faculty can select a section and upload/replace the timetable image with preview before save.

4. **Digital Lost & Found with Verification**:
   - Two tabs: Lost Items and Found Items.
   - Students click "This is Mine" to submit proof; item status transitions to "Claim Pending".
   - Faculty can review proof, Approve, Reject, or mark "Handed Over" (recording student name and timestamp).

5. **Smart Attendance & Deficit Warning**:
   - Calculates exact attendance percentage.
   - Prominent red alert banner displayed whenever attendance drops below 75% (try logging in as `student4@campus.edu` for an instant demonstration).
   - Faculty has toggle buttons (`Present` / `Absent`), "Mark All Present", Save, and Edit mode to modify past records.

---

## 3-Minute Hackathon Demo Script

- **0:00 - 0:30 (Landing Page & Dual Portals)**:
  - Open `http://localhost:5173`. Show the modern, responsive landing page for CEC-HACKSTORM-2026.
  - Explain the dual role entry: Students and Faculty operate on isolated dashboards tailored to their needs.
- **0:30 - 1:15 (Student Portal Walkthrough)**:
  - Click "Student Login" -> Click the quick demo button for **Rahul Verma (CSE-3A)**.
  - Show the **Overview**: Attendance percentage, active complaints, and quick shortcuts.
  - Click **Timetable**: Show the high-res class timetable, full-screen zoom modal, and download button.
  - Click **Complaint Portal**: Submit a new complaint: "Lab 2 AC not cooling" (Category: Infrastructure). Notice the instant submission feedback.
  - Click **My Attendance**: Switch to `student4@campus.edu` (Rohan) to demonstrate the **<75% Attendance Shortage Warning Alert Banner**.
- **1:15 - 2:15 (Faculty Portal & Real-time Synchronization)**:
  - Log out and click "Faculty Login" -> Login as **Prof. Alan Sharma (`faculty1@campus.edu`)**.
  - Show the **Faculty Overview**: Live counter shows the newly received complaint and pending claims.
  - Click the **Bell Icon**: Point out the live notification alerting faculty of Rahul Verma's complaint.
  - Click **Complaints**: Open the ticket, change status to "Resolved", add remark: "Technician dispatched and repaired compressor", click Save.
  - Click **Class Attendance**: Select Section CSE-3A and today's date. Click "Mark All Present", toggle one student Absent, and click "Save Attendance". Show the live summary counter.
- **2:15 - 3:00 (Lost & Found Handover & Summary)**:
  - Click **Lost & Found Mgmt** -> Review incoming claim for the Casio Scientific Calculator.
  - Click "Approve Claim", then click "Mark Handed Over to Student".
  - Log back in as Rahul Verma -> Show the bell notification confirming the claim was approved and the complaint resolved with remarks!
  - Conclude with the zero-configuration database architecture and production readiness.

---

## Future Improvements

1. **Automated WhatsApp / SMS Alerts**: Twilio or WhatsApp Business API integration for instant parent notifications on attendance shortages (<75%).
2. **Dynamic QR Code Attendance**: Geofenced, rotating 5-second QR codes scanned via student smartphone for touchless roll call.
3. **AI Timetable OCR Reader**: Gemini Vision integration allowing faculty to upload a smartphone photo of a printed paper timetable and automatically extract structured lecture slots.
4. **Campus Indoor Navigation**: Integrated campus map pinning the exact room or desk where a lost item was discovered.
5. **Visitor & Gatepass Management**: QR gatepasses for campus visitors and parents integrated into the faculty approval system.
