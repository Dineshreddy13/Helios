import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { forgotPasswordApi, resetPasswordApi } from "@/api/auth.api"
import Auth from './Auth'

export default function ForgotPassword({ className, ...props }) {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const navigate = useNavigate()

  const { control, handleSubmit, formState: { errors } } = useForm()

  const handleSendEmail = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await forgotPasswordApi({ email })
      setStep(2)
    } catch (err) {
      console.error(err);
      // Even on failure, it's often good practice to move to step 2 to prevent email enumeration,
      // but if the API returns an error we can display it. 
      // The current backend returns success even if the user doesn't exist.
      setStep(2)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = (data) => {
    if (data.otp && data.otp.length === 6) {
      setOtp(data.otp)
      setStep(3)
      setError("")
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await resetPasswordApi({ token: otp, password })
      setStep(4)
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to reset password")
      // If the token was invalid, maybe we should take them back to step 2
      if (err?.response?.status === 400 || err?.response?.status === 404) {
         // OTP was invalid or expired
         setTimeout(() => {
           setStep(2);
           setOtp("");
         }, 2000);
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Auth>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <FieldGroup>
          {step === 1 && (
            <>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Forgot Password</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Enter your email to receive a password reset code
                </p>
              </div>

              <form className="flex flex-col gap-6" onSubmit={handleSendEmail}>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                
                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Code"}
                  </Button>
                </Field>

                <Field>
                  <div className="text-center text-sm">
                    Remember your password?{" "}
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      navigate('/');
                    }} className="underline underline-offset-4">
                      Back to login
                    </a>
                  </div>
                </Field>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Enter Reset Code</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  We sent a 6-digit code to your email
                </p>
              </div>

              <form className="flex flex-col gap-6" onSubmit={handleSubmit(handleVerifyOtp)}>
                {error && (
                  <div className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}
                
                <Field>
                  <FieldLabel htmlFor="otp" className="text-center w-full block">Verification Code</FieldLabel>
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
                    <p className="text-sm text-destructive text-center">{errors.otp.message}</p>
                  )}
                </Field>

                <Field>
                  <Button type="submit">Verify Code</Button>
                </Field>
                
                <Field>
                  <div className="text-center text-sm">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setStep(1);
                    }} className="underline underline-offset-4 text-muted-foreground">
                      Use a different email
                    </a>
                  </div>
                </Field>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Enter your new password below
                </p>
              </div>

              <form className="flex flex-col gap-6" onSubmit={handleResetPassword}>
                {error && (
                  <div className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Field>
                
                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </Field>
                
                <Field>
                  <div className="text-center text-sm">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setStep(2);
                    }} className="underline underline-offset-4 text-muted-foreground">
                      Back to code entry
                    </a>
                  </div>
                </Field>
              </form>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Success!</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Your password has been reset successfully
                </p>
              </div>
              <div className="flex flex-col gap-4 mt-4">
                <Button onClick={() => navigate('/')}>
                  Go to Login
                </Button>
              </div>
            </>
          )}
        </FieldGroup>
      </div>
    </Auth>
  )
}
