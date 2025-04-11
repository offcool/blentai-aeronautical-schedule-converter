import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { FuturisticBackground } from "@/components/futuristic-background"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Aeronautical Schedule Converter | Blent",
  description: "Convert natural language aeronautical service schedules to AIXM 5.1.1 XML format",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans dark`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <FuturisticBackground />
          <Header />
          <div className="pt-20">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'