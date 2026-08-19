import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const FieldGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("grid gap-4", className)} {...props} />
))
FieldGroup.displayName = "FieldGroup"

const Field = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("grid gap-2", className)} {...props} />
))
Field.displayName = "Field"

const FieldLabel = React.forwardRef(({ className, ...props }, ref) => (
  <Label ref={ref} className={cn("", className)} {...props} />
))
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[0.8rem] text-muted-foreground", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn("h-[1px] w-full shrink-0 bg-border", className)}
    {...props}
  />
))
FieldSeparator.displayName = "FieldSeparator"

export {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
}
