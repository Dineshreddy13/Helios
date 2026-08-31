import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import useAuthStore from '@/store/authStore';
import { verifyOtpApi, resendOtpApi, getMeApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import Auth from './Auth';

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
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm();

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
    setIsSubmitting(true);
    try {
      const data = await verifyOtpApi({ requestId, otp });
      login(data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
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
      console.error(err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Auth>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-sm text-balance text-muted-foreground">
              We sent a 6-digit verification code to your email.
              {expiresInSeconds && (
                <> It expires in {Math.round(expiresInSeconds / 60)} minutes.</>
              )}
            </p>
          </div>

          {resendMsg && (
            <div className="text-sm font-medium text-green-600 text-center p-2 bg-green-100 rounded-md">
              {resendMsg}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
            <div className="flex justify-center my-4">
              <Controller
                name="otp"
                control={control}
                rules={{
                  required: 'Verification code is required',
                  pattern: { value: /^\d{6}$/, message: 'Must be a 6-digit number' }
                }}
                render={({ field }) => (
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
            </div>
            {errors.otp && (
              <p className="text-sm text-destructive">{errors.otp.message}</p>
            )}
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </Button>
          </Field>

          <Field>
            <FieldDescription className="text-center">
              Didn&apos;t receive a code?{' '}
              {cooldown > 0 ? (
                <span className="text-muted-foreground">Resend in {cooldown}s</span>
              ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleResend();
                  }}
                  className="underline underline-offset-4"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </a>
              )}
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Auth>
  );
};

export default VerifyOtp;
