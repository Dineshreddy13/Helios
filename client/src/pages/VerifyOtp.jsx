import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { verifyOtpApi, resendOtpApi, getMeApi } from '../api/auth.api';
import Button from '../components/Button';
import Input from '../components/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card';

const RESEND_COOLDOWN = 60;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const requestId = location.state?.requestId;
  const expiresInSeconds = location.state?.expiresInSeconds;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if already authenticated or landed without a requestId
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else if (!requestId) {
      navigate('/', { replace: true });
    }
  }, [requestId, isAuthenticated, navigate]);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  const onSubmit = async ({ otp }) => {
    setApiError('');
    setIsSubmitting(true);
    try {
      const data = await verifyOtpApi({ requestId, otp });
      login(data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setApiError('');
    setResendMsg('');
    setIsResending(true);
    try {
      const data = await resendOtpApi({ requestId });

      // Backend returns verified:true if the email was already verified elsewhere
      if (data.verified) {
        try {
          const me = await getMeApi();
          login(me.user);
          navigate('/dashboard', { replace: true });
          return;
        } catch {
          // Session not available — redirect to login
          navigate('/', { replace: true });
          return;
        }
      }

      setResendMsg('A new code has been sent to your email.');
      startCooldown();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="page-container">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a 6-digit verification code to your email.
              {expiresInSeconds && (
                <> It expires in {Math.round(expiresInSeconds / 60)} minutes.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiError && (
              <div className="alert-error">
                {apiError}
              </div>
            )}
            {resendMsg && (
              <div className="alert-success">
                {resendMsg}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                id="otp"
                type="text"
                label="Verification Code"
                placeholder="123456"
                maxLength={6}
                className="code-text tracking-widest text-center text-lg"
                {...register('otp', {
                  required: 'Verification code is required',
                  pattern: { value: /^\d{6}$/, message: 'Must be a 6-digit number' },
                })}
                error={errors.otp?.message}
              />
              <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-[var(--border-color)]">
            <p className="text-sm text-[var(--muted-color)]">
              Didn&apos;t receive a code?{' '}
              {cooldown > 0 ? (
                <span className="code-text text-[var(--muted-color)]">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-[var(--text-color)] hover:underline outline-none disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOtp;
