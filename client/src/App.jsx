import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Invitations from './pages/Invitations';
import VerifyOtp from './pages/auth/VerifyOtp';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import { getMeApi } from './api/auth.api';
import Discuss from './pages/Discuss';
import Talk from './pages/Talk';
import Settings from './pages/Settings';

const AppRoutes = () => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const initAuth = useAuthStore((state) => state.initAuth);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.add(systemTheme);

      const listener = (e) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

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
            <SignIn />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <SignUp />
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
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invitations"
        element={
          <ProtectedRoute>
            <Invitations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discuss"
        element={
          <ProtectedRoute>
            <Discuss />
          </ProtectedRoute>
        }
      />
      <Route
        path="/talk"
        element={
          <ProtectedRoute>
            <Talk />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
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