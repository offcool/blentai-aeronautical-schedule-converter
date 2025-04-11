import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "relative overflow-hidden rounded-lg font-medium transition-all duration-300 whitespace-nowrap px-6 py-3 text-base tracking-wide",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700",
        secondary: "bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-700 hover:to-teal-700",
        outline:
          "bg-transparent border border-primary-500/50 text-primary-400 hover:border-primary-400 hover:text-primary-300",
        ghost: "bg-transparent text-primary-400 hover:text-primary-300 hover:bg-primary-500/10",
        elegant:
          "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700",
        convert:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700",
      },
      glowEffect: {
        true: "shadow-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      glowEffect: false,
    },
  },
)

interface FuturisticButtonProps extends ButtonProps {
  glowEffect?: boolean
  variant?: "primary" | "secondary" | "outline" | "ghost" | "elegant" | "convert"
}

export function FuturisticButton({
  className,
  glowEffect = false,
  variant = "primary",
  children,
  ...props
}: FuturisticButtonProps) {
  return (
    <Button
      className={cn(
        buttonVariants({ variant, glowEffect }),
        {
          "shadow-[0_0_15px_rgba(124,58,237,0.5)]": glowEffect && variant === "primary",
          "shadow-[0_0_15px_rgba(8,145,178,0.5)]": glowEffect && variant === "secondary",
          "shadow-[0_0_15px_rgba(124,58,237,0.5)]": glowEffect && variant === "elegant",
          "shadow-[0_0_15px_rgba(79,70,229,0.5)]": glowEffect && variant === "convert",
        },
        className,
      )}
      variant="ghost"
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">{children}</span>
      <span className="absolute inset-0 overflow-hidden rounded-lg">
        <span className="absolute inset-0 opacity-0 hover:opacity-20 bg-white transition-opacity duration-300"></span>
      </span>
    </Button>
  )
}
