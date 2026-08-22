import * as React from "react"

import { cn } from "@/lib/utils"

function Marker({ className, ...props }) {
  return (
    <div
      data-slot="marker"
      className={cn("flex justify-center", className)}
      {...props}
    />
  )
}

function MarkerContent({ className, ...props }) {
  return (
    <span
      data-slot="marker-content"
      className={cn(
        "rounded-full px-3 py-1 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Marker, MarkerContent }
