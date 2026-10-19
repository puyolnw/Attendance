import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherCreateClass from './pages/TeacherCreateClass';
import TeacherEditClass from './pages/TeacherEditClass';
import TeacherClassDetail from './pages/TeacherClassDetail';
import TeacherSessionPage from './pages/TeacherSessionPage';
import TeacherSessionDetail from './pages/TeacherSessionDetail';
import TeacherReportPage from './pages/TeacherReportPage';
import TeacherClasses from './pages/TeacherClasses';
import TeacherReports from './pages/TeacherReports';
import SchedulePage from './pages/SchedulePage';
import StudentDashboard from './pages/StudentDashboard';
import StudentBrowseClasses from './pages/StudentBrowseClasses';
import StudentClassHistory from './pages/StudentClassHistory';
import StudentEnroll from './pages/StudentEnroll';
import StudentCheckInPage from './pages/StudentCheckInPage';
import StudentHistoryPage from './pages/StudentHistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import ErrorPage from './pages/ErrorPage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/unauthorized" element={<ErrorPage status={403} message="Unauthorized" />} />

          {/* Teacher routes */}
          <Route path="/teacher" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherClasses />
            </ProtectedRoute>
          } />
          <Route path="/teacher/reports" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherReports />
            </ProtectedRoute>
          } />
          <Route path="/teacher/schedule" element={
            <ProtectedRoute requiredRole="teacher">
              <SchedulePage />
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes/create" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherCreateClass />
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes/:classId" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherClassDetail />
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes/:classId/edit" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherEditClass />
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes/:classId/session" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherSessionPage />
            </ProtectedRoute>
          } />
          <Route path="/teacher/sessions/:sessionId" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherSessionDetail />
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes/:classId/reports" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherReportPage />
            </ProtectedRoute>
          } />

          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/classes" element={
            <ProtectedRoute requiredRole="student">
              <StudentBrowseClasses />
            </ProtectedRoute>
          } />
          <Route path="/student/classes/:classId/history" element={
            <ProtectedRoute requiredRole="student">
              <StudentClassHistory />
            </ProtectedRoute>
          } />
          <Route path="/student/enroll" element={
            <ProtectedRoute requiredRole="student">
              <StudentEnroll />
            </ProtectedRoute>
          } />
          <Route path="/student/checkin" element={
            <ProtectedRoute requiredRole="student">
              <StudentCheckInPage />
            </ProtectedRoute>
          } />
          <Route path="/student/history" element={
            <ProtectedRoute requiredRole="student">
              <StudentHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/student/schedule" element={
            <ProtectedRoute requiredRole="student">
              <SchedulePage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<ErrorPage status={404} message="Not Found" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
