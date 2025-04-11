"use client"

import { useState } from "react"
import { FuturisticButton } from "@/components/ui/futuristic-button"
import { FuturisticCard } from "@/components/ui/futuristic-card"
import { FuturisticInput } from "@/components/ui/futuristic-input"
import {
  FuturisticTabs,
  FuturisticTabsContent,
  FuturisticTabsList,
  FuturisticTabsTrigger,
} from "@/components/ui/futuristic-tabs"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileCode2, Clock, Calendar, ArrowRight, FileText, Sparkles, Code, Eye } from "lucide-react"
import { convertSchedule } from "@/lib/actions"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { XMLHighlighter } from "@/components/xml-highlighter"

export default function Home() {
  const [inputText, setInputText] = useState("")
  const [outputXml, setOutputXml] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleConvert = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a schedule text to convert.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await convertSchedule(inputText)
      setOutputXml(result)
      toast({
        title: "Conversion successful",
        description: "Schedule has been converted to AIXM 5.1.1 format.",
      })
    } catch (error) {
      console.error("Conversion error:", error)
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "An error occurred during conversion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setInputText("")
    setOutputXml("")
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 glow-text tracking-tight">
            Aeronautical Schedule Converter
          </h1>
          <p className="text-light-300 text-lg max-w-2xl mx-auto mb-6">
            Transform natural language aeronautical service schedules into structured AIXM 5.1.1 XML format with our
            advanced AI-powered converter.
          </p>
          <div className="inline-block px-6 py-2 rounded-full bg-primary-500/10 border border-primary-500/20">
            <span className="text-primary-400 text-sm font-medium flex items-center justify-center gap-2">
              <Sparkles size={16} className="animate-pulse" />
              Powered by Google Gemini 1.5 Pro
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <FuturisticCard variant="glass" className="backdrop-blur-md h-full">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-primary-400" />
                <h2 className="text-2xl font-semibold text-white">Input Schedule Text</h2>
              </div>
              <p className="text-light-300 text-base mb-6">
                Enter the aeronautical service schedule in natural language format
              </p>
              <FuturisticInput
                placeholder="e.g. MON-FRI: 0800-1800, SAT: 0800-1200"
                className="min-h-[300px] mb-6 text-base"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                glowEffect
              />
              <div className="flex justify-between">
                <FuturisticButton variant="outline" onClick={handleClear} className="px-8">
                  Clear
                </FuturisticButton>
                <FuturisticButton
                  variant="convert"
                  onClick={handleConvert}
                  disabled={isLoading}
                  glowEffect
                  className="px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      Convert to AIXM
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </FuturisticButton>
              </div>
            </div>
          </FuturisticCard>

          <FuturisticCard variant="glass" className="backdrop-blur-md h-full">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileCode2 className="h-6 w-6 text-secondary-400" />
                <h2 className="text-2xl font-semibold text-white">AIXM 5.1.1 Output</h2>
              </div>
              <p className="text-light-300 text-base mb-6">Generated AIXM 5.1.1 XML representation</p>
              <FuturisticTabs defaultValue="xml" className="w-full">
                <FuturisticTabsList className="mb-4">
                  <FuturisticTabsTrigger value="xml" icon={<Code className="h-5 w-5" />}>
                    XML
                  </FuturisticTabsTrigger>
                  <FuturisticTabsTrigger value="preview" icon={<Eye className="h-5 w-5" />}>
                    Preview
                  </FuturisticTabsTrigger>
                </FuturisticTabsList>
                <FuturisticTabsContent value="xml" className="mt-0">
                  <div className="relative">
                    <FuturisticInput
                      readOnly
                      value={outputXml}
                      placeholder="AIXM 5.1.1 XML will appear here after conversion"
                      className="min-h-[300px] font-mono text-base text-secondary-300"
                    />
                  </div>
                </FuturisticTabsContent>
                <FuturisticTabsContent value="preview" className="mt-0">
                  <div className="min-h-[300px] overflow-auto">
                    <XMLHighlighter xml={outputXml} />
                  </div>
                </FuturisticTabsContent>
              </FuturisticTabs>
              <div className="mt-6 flex justify-end">
                <FuturisticButton
                  variant="secondary"
                  disabled={!outputXml}
                  onClick={() => {
                    navigator.clipboard.writeText(outputXml)
                    toast({
                      title: "Copied to clipboard",
                      description: "AIXM XML has been copied to your clipboard.",
                    })
                  }}
                  className="px-8"
                >
                  Copy XML
                </FuturisticButton>
              </div>
            </div>
          </FuturisticCard>
        </div>

        <FuturisticCard variant="glass" className="mb-16 backdrop-blur-md">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="h-6 w-6 text-primary-400" />
              <h2 className="text-2xl font-semibold text-white">Example Schedules</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  text: "MON-FRI: 0800-1800\nSAT: 0800-1200",
                  description: "Weekday service from 8am to 6pm, Saturday service from 8am to noon",
                },
                {
                  text: "Daily: 0900-1700 except holidays",
                  description: "Regular schedule with exceptions for specific days",
                },
                {
                  text: "Winter (NOV-MAR): MON-FRI 0700-1900, SAT-SUN 0900-1700\nSummer (APR-OCT): H24",
                  description: "Different operating hours based on season",
                },
                {
                  text: "MON WED FRI: 0800-1600\nOther days: By arrangement",
                  description: "Specific days with custom arrangements",
                },
              ].map((example, index) => (
                <FuturisticCard
                  key={index}
                  variant="outline"
                  className="bg-dark-800/30 hover:bg-dark-700/40 transition-all cursor-pointer transform hover:scale-[1.02] duration-300"
                  onClick={() => setInputText(example.text)}
                >
                  <div className="p-6">
                    <div className="font-mono text-base text-primary-300 mb-4 bg-dark-900/50 p-4 rounded-lg whitespace-pre-wrap">
                      {example.text}
                    </div>
                    <div className="text-sm text-light-400">{example.description}</div>
                  </div>
                </FuturisticCard>
              ))}
            </div>
          </div>
        </FuturisticCard>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/about">
              <FuturisticButton variant="outline" className="w-full sm:w-auto px-8">
                Learn more about AIXM conversion
              </FuturisticButton>
            </Link>
            <Link href="/documentation">
              <FuturisticButton variant="elegant" glowEffect className="w-full sm:w-auto px-8">
                <FileText className="mr-2 h-5 w-5" />
                View System Documentation
              </FuturisticButton>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster />
    </main>
  )
}
