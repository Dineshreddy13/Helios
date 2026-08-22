import * as React from "react"

import { cn } from "@/lib/utils"

function Bubble({ className, variant = "default", ...props }) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      className={cn(
        "relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        "data-[variant=default]:bg-primary data-[variant=default]:text-primary-foreground",
        "data-[variant=muted]:bg-muted data-[variant=muted]:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function BubbleContent({ className, ...props }) {
  return (
    <div
      data-slot="bubble-content"
      className={cn("whitespace-pre-wrap break-words", className)}
      {...props}
    />
  )
}

function BubbleGroup({ className, ...props }) {
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function BubbleReactions({ className, ...props }) {
  return (
    <div
      data-slot="bubble-reactions"
      className={cn(
        "mt-1 flex items-center gap-1 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions }
