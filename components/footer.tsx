import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="mt-auto py-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <Link href="/" className="mb-4">
            <Image src="/images/blent-logo.png" alt="Blent Logo" width={60} height={18} className="h-4 w-auto" />
          </Link>
          <p className="text-light-300 text-sm max-w-md text-center mb-6">
            Blent's Aeronautical Schedule Converter transforms natural language schedules into structured AIXM 5.1.1 XML
            format using advanced AI technology.
          </p>
          <p className="text-light-400 text-sm">&copy; {new Date().getFullYear()} Blent AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
