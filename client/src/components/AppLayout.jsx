import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import useAuthStore from '../store/authStore';

const AppLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={
          <div className="flex flex-1 items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AppLayout;
