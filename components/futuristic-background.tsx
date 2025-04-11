"use client"

import { useEffect, useRef } from "react"

export function FuturisticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Grid parameters
    const gridSize = 50
    const gridDotSize = 1.2
    const gridLineWidth = 0.3

    // Particles
    const particles: Particle[] = []
    const particleCount = 60

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      opacity: number
      pulse: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2.5 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.4
        this.speedY = (Math.random() - 0.5) * 0.4

        // Use more purple/indigo hues
        const hue = Math.floor(Math.random() * 60) + 230 // 230-290 range (purple to indigo)
        const saturation = Math.floor(Math.random() * 30) + 70 // 70-100%
        const lightness = Math.floor(Math.random() * 20) + 50 // 50-70%

        this.color = `hsla(${hue}, ${saturation}%, ${lightness}%, `
        this.opacity = Math.random() * 0.5 + 0.2
        this.pulse = 0
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Pulse effect
        this.pulse += 0.01
        const pulseOpacity = this.opacity + Math.sin(this.pulse) * 0.1

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1

        return pulseOpacity
      }

      draw(pulseOpacity: number) {
        ctx.fillStyle = `${this.color}${pulseOpacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "rgba(79, 70, 229, 0.1)"
      ctx.lineWidth = gridLineWidth

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Draw grid dots
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.fillStyle = "rgba(79, 70, 229, 0.2)"
          ctx.beginPath()
          ctx.arc(x, y, gridDotSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Update and draw particles
      particles.forEach((particle) => {
        const pulseOpacity = particle.update()
        particle.draw(pulseOpacity)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      }}
    />
  )
}
