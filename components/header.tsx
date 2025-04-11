import Link from "next/link"
import Image from "next/image"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/blent-logo.png" alt="Blent Logo" width={120} height={36} className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-light-100 hover:text-primary-400 transition-colors">
              Home
            </Link>
            <Link href="/documentation" className="text-light-100 hover:text-primary-400 transition-colors">
              Documentation
            </Link>
            <Link href="/about" className="text-light-100 hover:text-primary-400 transition-colors">
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
