import * as React from "react"

import { cn } from "@/lib/utils"

function Message({ className, align = "start", ...props }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        "group/message flex gap-3 w-full",
        "data-[align=end]:flex-row-reverse",
        className
      )}
      {...props}
    />
  )
}

function MessageAvatar({ className, children, ...props }) {
  return (
    <div
      data-slot="message-avatar"
      className={cn("flex shrink-0 items-end", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function MessageContent({ className, ...props }) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex flex-col gap-1 flex-1 min-w-0",
        "group-data-[align=end]/message:items-end",
        "group-data-[align=start]/message:items-start",
        className
      )}
      {...props}
    />
  )
}

function MessageHeader({ className, ...props }) {
  return (
    <div
      data-slot="message-header"
      className={cn(
        "px-1 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function MessageFooter({ className, ...props }) {
  return (
    <div
      data-slot="message-footer"
      className={cn(
        "flex items-center gap-1 px-1 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function MessageGroup({ className, ...props }) {
  return (
    <div
      data-slot="message-group"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

export {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
  MessageGroup,
}
