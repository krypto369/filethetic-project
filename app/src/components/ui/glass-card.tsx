import React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  backgroundColors?: string
  animatedGradient?: boolean
  borderOpacity?: string
}

export function GlassCard({
  children,
  className,
  backgroundColors = "from-cyan-500/5 via-blue-500/5 to-emerald-500/5",
  animatedGradient = false,
  borderOpacity = "border-white/20",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl backdrop-blur-lg border shadow-xl",
        borderOpacity,
        className
      )}
      {...props}
    >
      {/* Background gradient */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          backgroundColors,
          animatedGradient && "animate-gradient"
        )}
      />
      
      {/* Actual content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function GlassPanel({
  children,
  className,
  backgroundColors = "from-white/5 to-white/10",
  borderOpacity = "border-white/10",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl backdrop-blur-sm border",
        borderOpacity,
        className
      )}
      {...props}
    >
      {/* Background gradient */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          backgroundColors
        )}
      />
      
      {/* Actual content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
