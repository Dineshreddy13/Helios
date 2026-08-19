import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { registerApi } from "@/api/auth.api"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Auth from './Auth'

export default function SignUp({ className, ...props }) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await registerApi({ username, email, password })
      navigate('/verify-otp', { 
        state: { 
          requestId: response.requestId, 
          expiresInSeconds: response.expiresInSeconds 
        } 
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Auth>
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>

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
            <FieldLabel htmlFor="password">Password</FieldLabel>
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
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </Field>

          <Field>
            <FieldDescription className="text-center">
              Already have an account?{" "}
              <a href="#" onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }} className="underline underline-offset-4">
                Login
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Auth>
  )
}
