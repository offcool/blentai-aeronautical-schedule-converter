import type React from "react"
import { cn } from "@/lib/utils"

interface FuturisticInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  glowEffect?: boolean
}

export function FuturisticInput({ className, glowEffect = false, ...props }: FuturisticInputProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-white/10 bg-dark-800/50 px-5 py-4 text-base text-light-100 placeholder:text-light-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200",
        {
          "focus:shadow-[0_0_15px_rgba(79,70,229,0.3)]": glowEffect,
        },
        className,
      )}
      {...props}
    />
  )
}
