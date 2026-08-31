import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import { getMeApi } from './api/auth.api';
import { Toaster } from '@/components/ui/toast';

const SignIn = lazy(() => import('./pages/auth/SignIn'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Project = lazy(() => import('./pages/Project'));
const VerifyOtp = lazy(() => import('./pages/auth/VerifyOtp'));
const Discuss = lazy(() => import('./pages/Discuss'));
const Talk = lazy(() => import('./pages/Talk'));
const Settings = lazy(() => import('./pages/Settings'));
const CreateProject = lazy(() => import('./pages/CreateProject'));
const TaskPage = lazy(() => import('./pages/TaskPage'));
const ProjectCalendar = lazy(() => import('./pages/ProjectCalendar'));

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
    <Suspense fallback={
      <div className="page-container">
        <div className="spinner" />
      </div>
    }>
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
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/new" element={<CreateProject />} />
        <Route path="/projects/:projectId" element={<Project />} />
        <Route path="/projects/:projectId/calendar" element={<ProjectCalendar />} />
        <Route path="/projects/:projectId/tasks/:taskId" element={<TaskPage />} />
        <Route path="/projects/:projectId/discuss" element={<Discuss />} />
        <Route path="/projects/:projectId/talk" element={<Talk />} />
        <Route path="/projects/:projectId/settings" element={<Settings />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster />
    </>
  );
};

export default App;