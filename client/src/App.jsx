import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OverviewPage from './pages/dashboard/OverviewPage';
import ThreatDetectionPage from './pages/dashboard/ThreatDetectionPage';
import AlertsPage from './pages/dashboard/AlertsPage';
import NetworkMonitorPage from './pages/dashboard/NetworkMonitorPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import ThreatIntelPage from './pages/dashboard/ThreatIntelPage';
import LogsPage from './pages/dashboard/LogsPage';
import UsersPage from './pages/dashboard/UsersPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import AIInsightsPage from './pages/dashboard/AIInsightsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  const { initAuth } = useAuthStore();
  const { connect, disconnect } = useSocketStore();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      connect(token);
    } else {
      disconnect();
    }
    return () => disconnect();
  }, [isAuthenticated, token]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<OverviewPage />} />
        <Route path="threats" element={<ThreatDetectionPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="network" element={<NetworkMonitorPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="intelligence" element={<ThreatIntelPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        <Route path="reports" element={<ProtectedRoute roles={['admin', 'analyst']}><ReportsPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
