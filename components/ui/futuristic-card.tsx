import type React from "react"
import { cn } from "@/lib/utils"

interface FuturisticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "outline"
  glowEffect?: boolean
  hoverEffect?: boolean
  children: React.ReactNode
}

export function FuturisticCard({
  className,
  variant = "default",
  glowEffect = false,
  hoverEffect = false,
  children,
  ...props
}: FuturisticCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden backdrop-blur-md",
        {
          "bg-gradient-to-br from-dark-600/90 to-dark-800/95 border border-white/5": variant === "default",
          "glass border border-white/10": variant === "glass",
          "bg-gradient-to-r from-indigo-600 to-violet-600": variant === "gradient",
          "bg-dark-800/30 border border-primary-500/20": variant === "outline",
          "shadow-[0_0_25px_rgba(79,70,229,0.2)]": glowEffect,
          "transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(79,70,229,0.3)]": hoverEffect,
        },
        className,
      )}
      {...props}
    >
      {variant === "default" && (
        <>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-violet-600" />
          <div className="absolute top-0 right-0 w-12 h-12 bg-primary-500/10 rounded-bl-2xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-primary-500/10 rounded-tr-2xl" />
        </>
      )}
      {children}
    </div>
  )
}
