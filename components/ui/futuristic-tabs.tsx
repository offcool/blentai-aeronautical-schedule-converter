"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const FuturisticTabs = TabsPrimitive.Root

const FuturisticTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative inline-flex rounded-lg bg-gradient-to-r from-indigo-900/30 to-violet-900/30 backdrop-blur-sm border border-indigo-500/20 p-1 shadow-[0_0_10px_rgba(79,70,229,0.2)]",
      className,
    )}
    {...props}
  />
))
FuturisticTabsList.displayName = TabsPrimitive.List.displayName

const FuturisticTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    icon?: React.ReactNode
  }
>(({ className, children, value, icon, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    value={value}
    className={cn(
      "relative z-10 flex items-center justify-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      "text-light-300 hover:text-primary-300",
      "data-[state=active]:text-white",
      className,
    )}
    {...props}
  >
    {props["data-state"] === "active" && (
      <motion.div
        layoutId={`tab-bg-${value}`}
        className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-1">
      {icon && <span className="text-current">{icon}</span>}
      {children}
    </span>
  </TabsPrimitive.Trigger>
))
FuturisticTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const FuturisticTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
))
FuturisticTabsContent.displayName = TabsPrimitive.Content.displayName

export { FuturisticTabs, FuturisticTabsList, FuturisticTabsTrigger, FuturisticTabsContent }
