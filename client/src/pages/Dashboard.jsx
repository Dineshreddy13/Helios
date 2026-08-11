import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { logoutApi } from '../api/auth.api';
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
    } catch {
    } finally {
      logout();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="page-container justify-start pt-12 md:pt-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button variant="secondary" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Welcome, {user?.username || 'User'}</CardTitle>
              <CardDescription>
                Here&apos;s an overview of your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--muted-color)] code-text text-sm leading-relaxed">
                User ID: {user?.id || 'N/A'}<br />
                Username: {user?.username || 'N/A'}<br />
                Email: {user?.email || 'N/A'}<br />
                Provider: {user?.provider || 'N/A'}<br />
                Verified: <span className={user?.emailVerified ? 'text-green-500' : 'text-yellow-500'}>
                  {user?.emailVerified ? 'Yes' : 'Pending'}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button variant="secondary" className="w-full justify-start">Settings</Button>
              <Button variant="secondary" className="w-full justify-start">Profile</Button>
              <Button variant="secondary" className="w-full justify-start">Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
