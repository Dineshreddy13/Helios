import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import useAuthStore from "@/store/authStore"
import { loginApi } from "@/api/auth.api"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Auth from './Auth'

export default function SignIn({ className, ...props }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await loginApi({ email, password })
      login(result.user)
      navigate('/dashboard', { replace: true })
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
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          
          {error && (
            <div className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

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
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Field>
          
          <Field>
            <FieldDescription className="text-center">
              Don&apos;t have an account?{" "}
              <a href="#" onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }} className="underline underline-offset-4">
                Sign up
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Auth>
  )
}
