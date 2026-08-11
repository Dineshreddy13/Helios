import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useAuthStore from '../store/authStore';
import { loginApi, registerApi } from '../api/auth.api';

import AuthForm from '../components/auth/AuthForm';
import AuthModeToggle from '../components/auth/AuthModeToggle';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/Card';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setApiError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await handleLogin(data);
      } else {
        await handleRegister(data);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (!isLogin || status !== 403) {
        setApiError(message || 'Something went wrong. Please try again.');
        return;
      }

      setApiError(
        'Your email is not verified. Please register again to receive a new verification code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async ({ email, password }) => {
    const result = await loginApi({
      email,
      password,
    });

    login(result.user);

    navigate('/dashboard', {
      replace: true,
    });
  };

  const handleRegister = async ({
    username,
    email,
    password,
  }) => {
    const result = await registerApi({
      username,
      email,
      password,
    });

    navigate('/verify-otp', {
      state: {
        requestId: result.requestId,
        expiresInSeconds: result.expiresInSeconds,
      },
    });
  };

  const handleModeToggle = () => {
    setIsLogin((previous) => !previous);
    setApiError('');
  };

  return (
    <div className="page-container">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>
              {isLogin
                ? 'Welcome back'
                : 'Create an account'}
            </CardTitle>

            <CardDescription>
              {isLogin
                ? 'Enter your credentials to access your account.'
                : 'Enter your details below to create your account.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {apiError && (
              <div
                role="alert"
                className="alert-error"
              >
                {apiError}
              </div>
            )}

            <AuthForm
              key={isLogin ? 'login' : 'register'}
              isLogin={isLogin}
              isLoading={isLoading}
              onSubmit={handleSubmit}
            />
          </CardContent>

          <CardFooter className="flex justify-center border-t border-[var(--border-color)]">
            <AuthModeToggle
              isLogin={isLogin}
              onToggle={handleModeToggle}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;