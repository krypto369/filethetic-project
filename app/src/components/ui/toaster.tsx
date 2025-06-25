"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "bg-background border border-border rounded-md p-4 shadow-lg",
          title: "text-foreground text-sm font-medium",
          description: "text-muted-foreground text-sm",
          actionButton: "bg-primary text-primary-foreground text-sm",
          cancelButton: "bg-muted text-muted-foreground text-sm",
          closeButton: "text-foreground/50 hover:text-foreground"
        },
        duration: 5000,
      }}
      closeButton
    />
  )
}
