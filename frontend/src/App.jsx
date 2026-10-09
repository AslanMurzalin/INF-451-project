import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import MyCoursesPage from './pages/MyCoursesPage';
import GiveFeedbackPage from './pages/GiveFeedbackPage';
import ViewFeedbackPage from './pages/ViewFeedbackPage';
import SurveysListPage from './pages/SurveysListPage';
import ServicesListPage from './pages/ServicesListPage';
import SettingsPage from './pages/SettingsPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminFeedbacksPage from './pages/admin/AdminFeedbacksPage';
import AdminSurveyResultsPage from './pages/admin/AdminSurveyResultsPage';
import AdminSourcesPage from './pages/admin/AdminSourcesPage';
import AdminCoursesServicesPage from './pages/admin/AdminCoursesServicesPage';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/courses" replace />;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes wrapped in MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Student routes */}
              <Route path="/courses" element={<MyCoursesPage />} />
              <Route path="/feedback" element={<GiveFeedbackPage />} />
              <Route path="/feedback/view" element={<ViewFeedbackPage />} />
              <Route path="/surveys" element={<SurveysListPage />} />
              <Route path="/services" element={<ServicesListPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminHomePage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/feedbacks" element={<AdminFeedbacksPage />} />
              <Route path="/admin/surveys-results" element={<AdminSurveyResultsPage />} />
              <Route path="/admin/sources" element={<AdminSourcesPage />} />
              <Route path="/admin/courses-services" element={<AdminCoursesServicesPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>

            {/* Dynamic root redirect */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
