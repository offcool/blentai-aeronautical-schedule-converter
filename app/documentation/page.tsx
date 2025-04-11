"use client"

import { useState } from "react"
import { FuturisticButton } from "@/components/ui/futuristic-button"
import { FuturisticCard } from "@/components/ui/futuristic-card"
import Link from "next/link"
import { ArrowLeft, FileDown, FileText, Server, Database, Code, Cpu, Loader2 } from "lucide-react"
import { Footer } from "@/components/footer"
import { XMLHighlighter } from "@/components/xml-highlighter"
import { useToast } from "@/hooks/use-toast"

export default function DocumentationPage() {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const apiExampleXml = `<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>WORK_DAY</aixm:day>
    <aixm:startTime>08:00</aixm:startTime>
    <aixm:endTime>18:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>`

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      // Fetch the PDF document
      const response = await fetch("/api/download-architecture-doc")

      if (!response.ok) {
        throw new Error("Failed to download document")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url
      link.download = "architecture-document.pdf"

      // Append the link to the body
      document.body.appendChild(link)

      // Click the link to trigger the download
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: "Your architecture document is being downloaded.",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <Link href="/">
            <FuturisticButton variant="outline" className="px-8">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Converter
            </FuturisticButton>
          </Link>
        </div>

        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 glow-text">System Documentation</h1>
          <p className="text-light-300 text-lg">
            Technical documentation for the Aeronautical Schedule Converter application
          </p>
        </div>

        <FuturisticCard variant="glass" className="mb-12 backdrop-blur-md">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-primary-400" />
              <h2 className="text-2xl font-semibold text-white">System Architecture Documentation</h2>
            </div>
            <p className="text-light-300 text-base mb-8">
              This document provides a comprehensive overview of the system architecture, components, and data flow of
              the Aeronautical Schedule Converter application.
            </p>
            <FuturisticButton
              variant="elegant"
              glowEffect
              className="px-8"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparing Download...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-5 w-5" />
                  Download Architecture Document (PDF)
                </>
              )}
            </FuturisticButton>
          </div>
        </FuturisticCard>

        {/* Rest of the component remains the same */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <FuturisticCard variant="glass" className="backdrop-blur-md h-full">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Server className="h-6 w-6 text-secondary-400" />
                <h2 className="text-2xl font-semibold text-white">Frontend Architecture</h2>
              </div>
              <div className="text-light-300 space-y-6">
                <p className="text-base">
                  The frontend is built with Next.js and React, providing a responsive and interactive user interface
                  with the following components:
                </p>
                <ul className="list-disc pl-6 space-y-4">
                  <li className="text-base">
                    <strong className="text-secondary-400">React Components:</strong> Modular UI building blocks
                  </li>
                  <li className="text-base">
                    <strong className="text-secondary-400">Server Actions:</strong> Secure API communication
                  </li>
                  <li className="text-base">
                    <strong className="text-secondary-400">Tailwind CSS:</strong> Utility-first styling
                  </li>
                  <li className="text-base">
                    <strong className="text-secondary-400">State Management:</strong> React hooks for local state
                  </li>
                </ul>
              </div>
            </div>
          </FuturisticCard>

          <FuturisticCard variant="glass" className="backdrop-blur-md h-full">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-6 w-6 text-primary-400" />
                <h2 className="text-2xl font-semibold text-white">Backend Architecture</h2>
              </div>
              <div className="text-light-300 space-y-6">
                <p className="text-base">
                  The backend is built with Python FastAPI, providing high-performance API endpoints:
                </p>
                <ul className="list-disc pl-6 space-y-4">
                  <li className="text-base">
                    <strong className="text-primary-400">FastAPI:</strong> High-performance API framework
                  </li>
                  <li className="text-base">
                    <strong className="text-primary-400">Google Gemini Integration:</strong> AI-powered text processing
                  </li>
                  <li className="text-base">
                    <strong className="text-primary-400">Error Handling:</strong> Comprehensive error management
                  </li>
                  <li className="text-base">
                    <strong className="text-primary-400">Logging:</strong> Detailed logging for monitoring
                  </li>
                </ul>
              </div>
            </div>
          </FuturisticCard>
        </div>

        <FuturisticCard variant="glass" className="mb-12 backdrop-blur-md">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Code className="h-6 w-6 text-secondary-400" />
              <h2 className="text-2xl font-semibold text-white">API Documentation</h2>
            </div>
            <div className="text-light-300 space-y-6">
              <h3 className="text-xl font-medium text-white">POST /api/convert</h3>
              <p className="text-base">Converts natural language schedule text to AIXM 5.1.1 XML format.</p>
              <div className="bg-dark-800/70 border border-white/10 p-6 rounded-lg">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-secondary-400 mb-2">Request</h4>
                  <pre className="text-sm text-cyan-300 font-mono whitespace-pre-wrap bg-dark-900/50 p-4 rounded-lg">
                    {`POST /api/convert
Content-Type: application/json

{
  "text": "MON-FRI: 0800-1800, SAT: 0800-1200"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-secondary-400 mb-2">Response</h4>
                  <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap bg-dark-900/50 p-4 rounded-lg mb-2">
                    {`{
  "aixm_xml": `}
                  </pre>
                  <div className="bg-dark-900/70 p-4 rounded-lg">
                    <XMLHighlighter xml={apiExampleXml} />
                  </div>
                  <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap bg-dark-900/50 p-4 rounded-lg mt-2">
                    {`}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </FuturisticCard>

        <FuturisticCard variant="glass" className="backdrop-blur-md">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="h-6 w-6 text-primary-400" />
              <h2 className="text-2xl font-semibold text-white">AI Integration</h2>
            </div>
            <div className="text-light-300 space-y-6">
              <p className="text-base">
                The application integrates with Google Gemini 1.5 Pro for natural language processing:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <FuturisticCard
                  variant="outline"
                  className="bg-dark-800/30 transform hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-primary-400 mb-4">Model Configuration</h3>
                    <p className="text-light-400 text-base">
                      Optimized settings for accurate AIXM generation with temperature, top-p, and top-k parameters
                      tuned for technical content.
                    </p>
                  </div>
                </FuturisticCard>

                <FuturisticCard
                  variant="outline"
                  className="bg-dark-800/30 transform hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-primary-400 mb-4">Prompt Engineering</h3>
                    <p className="text-light-400 text-base">
                      Carefully crafted prompts with detailed instructions and examples to guide the AI in generating
                      correct AIXM format.
                    </p>
                  </div>
                </FuturisticCard>

                <FuturisticCard
                  variant="outline"
                  className="bg-dark-800/30 transform hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-primary-400 mb-4">Error Handling</h3>
                    <p className="text-light-400 text-base">
                      Robust error handling with detailed logging and user-friendly error messages for troubleshooting.
                    </p>
                  </div>
                </FuturisticCard>

                <FuturisticCard
                  variant="outline"
                  className="bg-dark-800/30 transform hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-primary-400 mb-4">Performance Optimization</h3>
                    <p className="text-light-400 text-base">
                      Optimized API calls with appropriate timeouts and response handling for efficient processing.
                    </p>
                  </div>
                </FuturisticCard>
              </div>
            </div>
          </div>
        </FuturisticCard>
      </div>
      <Footer />
    </main>
  )
}
