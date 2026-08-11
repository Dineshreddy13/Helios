import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import VerifyOtp from './pages/VerifyOtp';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import { getMeApi } from './api/auth.api';

const AppRoutes = () => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const data = await getMeApi();
        initAuth(data.user);
      } catch {
        initAuth(null);
      }
    };
    bootstrapSession();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={<VerifyOtp />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;