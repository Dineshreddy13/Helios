import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const itemVariants = cva(
  "flex items-center gap-4 rounded-lg p-4 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-background hover:bg-muted",
        outline: "border border-border bg-background hover:bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Item = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(itemVariants({ variant }), className)}
    {...props}
  />
))
Item.displayName = "Item"

const ItemContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-1 flex-col gap-1", className)} {...props} />
))
ItemContent.displayName = "ItemContent"

const ItemTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
ItemTitle.displayName = "ItemTitle"

const ItemDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ItemDescription.displayName = "ItemDescription"

const ItemActions = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
))
ItemActions.displayName = "ItemActions"

const ItemMedia = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-shrink-0", className)}
    {...props}
  />
))
ItemMedia.displayName = "ItemMedia"

export { Item, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemMedia, itemVariants }
