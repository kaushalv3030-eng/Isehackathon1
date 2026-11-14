import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout & Protection
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import FacultyLogin from './pages/auth/FacultyLogin';

// Student Pages
import StudentOverview from './pages/student/StudentOverview';
import TimetablePage from './pages/student/TimetablePage';
import LostFoundPage from './pages/student/LostFoundPage';
import ComplaintsPage from './pages/student/ComplaintsPage';
import EventsPage from './pages/student/EventsPage';
import AttendancePage from './pages/student/AttendancePage';

// Faculty Pages
import FacultyOverview from './pages/faculty/FacultyOverview';
import TimetableMgmtPage from './pages/faculty/TimetableMgmtPage';
import LostFoundMgmtPage from './pages/faculty/LostFoundMgmtPage';
import AttendanceMgmtPage from './pages/faculty/AttendanceMgmtPage';
import ComplaintsMgmtPage from './pages/faculty/ComplaintsMgmtPage';
import EventsMgmtPage from './pages/faculty/EventsMgmtPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/student/register" element={<StudentRegister />} />
                <Route path="/faculty/login" element={<FacultyLogin />} />

                {/* Protected Student Portal */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/student/overview" replace />} />
                  <Route path="overview" element={<StudentOverview />} />
                  <Route path="timetable" element={<TimetablePage />} />
                  <Route path="lost-found" element={<LostFoundPage />} />
                  <Route path="complaints" element={<ComplaintsPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="attendance" element={<AttendancePage />} />
                </Route>

                {/* Protected Faculty Portal */}
                <Route
                  path="/faculty"
                  element={
                    <ProtectedRoute allowedRole="faculty">
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/faculty/overview" replace />} />
                  <Route path="overview" element={<FacultyOverview />} />
                  <Route path="timetables" element={<TimetableMgmtPage />} />
                  <Route path="lost-found" element={<LostFoundMgmtPage />} />
                  <Route path="attendance" element={<AttendanceMgmtPage />} />
                  <Route path="complaints" element={<ComplaintsMgmtPage />} />
                  <Route path="events" element={<EventsMgmtPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
