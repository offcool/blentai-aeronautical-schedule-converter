import { FuturisticButton } from "@/components/ui/futuristic-button"
import { FuturisticCard } from "@/components/ui/futuristic-card"
import Link from "next/link"
import { ArrowLeft, FileCode2, Calendar, Zap } from "lucide-react"
import { Footer } from "@/components/footer"
import { XMLHighlighter } from "@/components/xml-highlighter"

export default function AboutPage() {
  const exampleXml = `<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>WORK_DAY</aixm:day>
    <aixm:startTime>08:00</aixm:startTime>
    <aixm:endTime>18:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>`

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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 glow-text">About the Converter</h1>
          <p className="text-light-300 text-lg">
            Understanding how our AI-powered converter transforms natural language schedules into AIXM 5.1.1 XML
          </p>
        </div>

        <FuturisticCard variant="glass" className="mb-12 backdrop-blur-md">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-primary-400" />
              <h2 className="text-2xl font-semibold text-white">How It Works</h2>
            </div>
            <div className="text-light-300 space-y-6">
              <p className="text-base">
                The Aeronautical Schedule Converter uses Google's Gemini 1.5 Pro AI model to understand and parse
                natural language descriptions of aeronautical service schedules, then transform them into structured
                AIXM 5.1.1 XML format.
              </p>
              <p className="text-base">The system works in three main steps:</p>
              <ol className="list-decimal pl-6 space-y-4">
                <li className="text-base">
                  <strong className="text-primary-400">Natural Language Understanding:</strong> The AI analyzes the
                  input text to identify schedule patterns, days, times, and special conditions.
                </li>
                <li className="text-base">
                  <strong className="text-primary-400">Semantic Mapping:</strong> The identified schedule components are
                  mapped to the AIXM 5.1.1 data model, determining how to represent each element.
                </li>
                <li className="text-base">
                  <strong className="text-primary-400">XML Generation:</strong> The system generates valid AIXM 5.1.1
                  XML output with proper timeInterval and Timesheet elements.
                </li>
              </ol>
            </div>
          </div>
        </FuturisticCard>

        <FuturisticCard variant="glass" className="mb-12 backdrop-blur-md">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileCode2 className="h-6 w-6 text-secondary-400" />
              <h2 className="text-2xl font-semibold text-white">AIXM 5.1.1 Format</h2>
            </div>
            <div className="text-light-300 space-y-6">
              <p className="text-base">
                AIXM (Aeronautical Information Exchange Model) 5.1.1 is a standard format used in the aviation industry
                to represent aeronautical information in a structured, machine-readable way.
              </p>
              <p className="text-base">For service schedules, AIXM uses the following structure:</p>
              <div className="bg-dark-800/70 border border-white/10 p-6 rounded-lg overflow-x-auto">
                <XMLHighlighter xml={exampleXml} />
              </div>
              <p className="text-base">Key components of the AIXM schedule format include:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li className="text-base">
                  <strong className="text-secondary-400">timeInterval:</strong> Contains a single schedule period
                </li>
                <li className="text-base">
                  <strong className="text-secondary-400">Timesheet:</strong> Defines when a service is available
                </li>
                <li className="text-base">
                  <strong className="text-secondary-400">timeReference:</strong> Usually "UTC" for universal time
                </li>
                <li className="text-base">
                  <strong className="text-secondary-400">startDate/endDate:</strong> Period of validity in DD-MM format
                </li>
                <li className="text-base">
                  <strong className="text-secondary-400">day:</strong> Can be specific days (MON, TUE) or categories
                  (WORK_DAY, WEEKEND)
                </li>
                <li className="text-base">
                  <strong className="text-secondary-400">startTime/endTime:</strong> Operating hours in 24-hour format
                </li>
              </ul>
            </div>
          </div>
        </FuturisticCard>

        <FuturisticCard variant="glass" className="backdrop-blur-md">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-primary-400" />
              <h2 className="text-2xl font-semibold text-white">Supported Schedule Formats</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <FuturisticCard
                variant="outline"
                className="bg-dark-800/30 transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="p-6">
                  <h3 className="text-xl font-medium text-primary-400 mb-4">Basic Daily Schedule</h3>
                  <p className="text-light-100 font-mono text-base mb-4 bg-dark-900/50 p-4 rounded-lg">
                    MON-FRI: 0800-1800, SAT: 0800-1200
                  </p>
                  <p className="text-light-400 text-sm">
                    Weekday service from 8am to 6pm, Saturday service from 8am to noon
                  </p>
                </div>
              </FuturisticCard>

              <FuturisticCard
                variant="outline"
                className="bg-dark-800/30 transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="p-6">
                  <h3 className="text-xl font-medium text-primary-400 mb-4">24-Hour Service</h3>
                  <p className="text-light-100 font-mono text-base mb-4 bg-dark-900/50 p-4 rounded-lg">H24</p>
                  <p className="text-light-400 text-sm">Service available 24 hours a day, every day</p>
                </div>
              </FuturisticCard>

              <FuturisticCard
                variant="outline"
                className="bg-dark-800/30 transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="p-6">
                  <h3 className="text-xl font-medium text-primary-400 mb-4">Seasonal Schedule</h3>
                  <p className="text-light-100 font-mono text-base mb-4 bg-dark-900/50 p-4 rounded-lg">
                    Winter (NOV-MAR):
                    <br />
                    MON-FRI 0700-1900, SAT-SUN 0900-1700
                    <br />
                    Summer (APR-OCT): H24
                  </p>
                  <p className="text-light-400 text-sm">Different operating hours based on season</p>
                </div>
              </FuturisticCard>

              <FuturisticCard
                variant="outline"
                className="bg-dark-800/30 transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="p-6">
                  <h3 className="text-xl font-medium text-primary-400 mb-4">Special Conditions</h3>
                  <p className="text-light-100 font-mono text-base mb-4 bg-dark-900/50 p-4 rounded-lg">
                    Daily: 0900-1700 except holidays
                  </p>
                  <p className="text-light-400 text-sm">Regular schedule with exceptions for specific days</p>
                </div>
              </FuturisticCard>
            </div>
          </div>
        </FuturisticCard>
      </div>
      <Footer />
    </main>
  )
}
