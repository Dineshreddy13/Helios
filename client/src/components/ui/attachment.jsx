import * as React from "react"
import { cn } from "@/lib/utils"

const AttachmentGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3", className)} {...props} />
))
AttachmentGroup.displayName = "AttachmentGroup"

const Attachment = React.forwardRef(({ className, orientation = "horizontal", state = "idle", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative flex overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all",
      orientation === "horizontal" ? "flex-row items-center gap-3 p-3" : "flex-col",
      state === "uploading" && "opacity-70",
      className
    )}
    {...props}
  />
))
Attachment.displayName = "Attachment"

const AttachmentMedia = React.forwardRef(({ className, variant = "icon", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex shrink-0 items-center justify-center overflow-hidden bg-muted",
      variant === "image" ? "aspect-video w-full" : "h-10 w-10 rounded-lg",
      className
    )}
    {...props}
  />
))
AttachmentMedia.displayName = "AttachmentMedia"

const AttachmentContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 flex-col justify-center min-w-0 p-3", className)}
    {...props}
  />
))
AttachmentContent.displayName = "AttachmentContent"

const AttachmentTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("truncate text-sm font-medium", className)}
    {...props}
  />
))
AttachmentTitle.displayName = "AttachmentTitle"

const AttachmentDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("truncate text-xs text-muted-foreground mt-0.5", className)}
    {...props}
  />
))
AttachmentDescription.displayName = "AttachmentDescription"

const AttachmentActions = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 pr-3", className)}
    {...props}
  />
))
AttachmentActions.displayName = "AttachmentActions"

const AttachmentAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      className
    )}
    {...props}
  />
))
AttachmentAction.displayName = "AttachmentAction"

export {
  AttachmentGroup,
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
}
