"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface XMLHighlighterProps {
  xml: string
  className?: string
}

export function XMLHighlighter({ xml, className = "" }: XMLHighlighterProps) {
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (!preRef.current || !xml) return

    const highlightXML = (xmlString: string) => {
      // Replace < and > with &lt; and &gt; to prevent HTML rendering
      let highlighted = xmlString.replace(/</g, "&lt;").replace(/>/g, "&gt;")

      // Highlight tags with enhanced colors
      highlighted = highlighted.replace(
        /&lt;(\/?)([\w:]+)(.*?)(\/?)&gt;/g,
        (match, slash, tagName, attrs, endSlash) => {
          // Tag brackets with glow effect
          const startBracket = `<span class="text-amber-400 font-bold" style="text-shadow: 0 0 8px rgba(251, 191, 36, 0.7)">&lt;${slash}</span>`
          // Tag name with enhanced color
          const nameSpan = `<span class="text-violet-400 font-semibold" style="text-shadow: 0 0 8px rgba(167, 139, 250, 0.5)">${tagName}</span>`
          // Attributes with better highlighting
          const attributes = attrs.replace(
            /(\s+)([\w:]+)="([^"]*)"/g,
            '$1<span class="text-cyan-400 font-medium">$2</span>=<span class="text-emerald-400">"$3"</span>',
          )
          // End bracket with glow effect
          const endBracket = `<span class="text-amber-400 font-bold" style="text-shadow: 0 0 8px rgba(251, 191, 36, 0.7)">${endSlash}&gt;</span>`

          return `${startBracket}${nameSpan}${attributes}${endBracket}`
        },
      )

      // Highlight content between tags with better contrast
      highlighted = highlighted.replace(/&gt;([^<&]*?)&lt;/g, '&gt;<span class="text-white font-medium">$1</span>&lt;')

      return highlighted
    }

    preRef.current.innerHTML = highlightXML(xml)
  }, [xml])

  if (!xml) {
    return <div className="flex items-center justify-center h-full text-light-500 italic">No AIXM data to display</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-lg overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-indigo-900/30 to-transparent z-10"></div>
      <pre
        ref={preRef}
        className={`text-sm font-mono whitespace-pre-wrap overflow-auto p-4 bg-gradient-to-br from-dark-800/80 to-dark-900/90 border border-indigo-500/20 rounded-lg ${className}`}
        style={{ maxHeight: "300px" }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-dark-900/90 to-transparent z-10"></div>
    </motion.div>
  )
}
