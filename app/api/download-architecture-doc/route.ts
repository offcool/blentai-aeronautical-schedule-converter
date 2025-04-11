import { NextResponse } from "next/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export async function GET() {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Add a page to the document
    const page = pdfDoc.addPage([600, 800])

    // Get the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Draw the title
    page.drawText("Aeronautical Schedule Converter", {
      x: 50,
      y: 750,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    page.drawText("System Architecture Document", {
      x: 50,
      y: 720,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    // Draw the date
    const date = new Date().toLocaleDateString()
    page.drawText(`Generated: ${date}`, {
      x: 50,
      y: 690,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    })

    // Table of Contents
    page.drawText("Table of Contents", {
      x: 50,
      y: 650,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    const tocItems = [
      "1. Introduction",
      "2. System Overview",
      "3. Architecture Components",
      "4. Data Flow",
      "5. API Documentation",
      "6. Deployment Architecture",
    ]

    tocItems.forEach((item, index) => {
      page.drawText(item, {
        x: 70,
        y: 620 - index * 20,
        size: 12,
        font: font,
        color: rgb(0, 0, 0.8),
      })
    })

    // Introduction
    const page2 = pdfDoc.addPage([600, 800])
    page2.drawText("1. Introduction", {
      x: 50,
      y: 750,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    const introText = `
The Aeronautical Schedule Converter is an application designed to convert natural language descriptions of aeronautical service schedules into structured AIXM 5.1.1 XML format. This document provides a comprehensive overview of the system architecture, components, and data flow.

The application addresses a critical need in the aeronautical information management domain, where service schedules are often provided in varied natural language formats that need to be converted to standardized AIXM format for integration with aeronautical information systems.
    `

    const introLines = introText.trim().split("\n\n")
    introLines.forEach((line, index) => {
      page2.drawText(line, {
        x: 50,
        y: 720 - index * 60,
        size: 12,
        font: font,
        color: rgb(0, 0, 0.8),
        lineHeight: 16,
        maxWidth: 500,
      })
    })

    // System Overview
    const page3 = pdfDoc.addPage([600, 800])
    page3.drawText("2. System Overview", {
      x: 50,
      y: 750,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    const overviewText = `
The Aeronautical Schedule Converter is built using a modern web application architecture with the following key components:

- Frontend: React/Next.js application providing a user-friendly interface
- Backend: Python FastAPI service for processing and conversion
- AI Integration: Google Gemini 1.5 Pro for natural language understanding
- API Layer: RESTful API for communication between components

The application follows a client-server architecture with clear separation of concerns between the presentation layer, business logic, and data processing.
    `

    const overviewLines = overviewText.trim().split("\n\n")
    overviewLines.forEach((line, index) => {
      page3.drawText(line, {
        x: 50,
        y: 720 - index * 100,
        size: 12,
        font: font,
        color: rgb(0, 0, 0.8),
        lineHeight: 16,
        maxWidth: 500,
      })
    })

    // Architecture Components
    const page4 = pdfDoc.addPage([600, 800])
    page4.drawText("3. Architecture Components", {
      x: 50,
      y: 750,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    // Frontend Components
    page4.drawText("3.1 Frontend Components", {
      x: 50,
      y: 720,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    const frontendText = `
The frontend is built with Next.js and React, providing a responsive and interactive user interface. Key components include:

- Page Components: Main application pages (home, about, documentation)
- UI Components: Reusable interface elements (buttons, cards, textareas)
- State Management: React hooks for managing application state
- API Integration: Server actions for secure communication with backend
    `

    const frontendLines = frontendText.trim().split("\n\n")
    frontendLines.forEach((line, index) => {
      page4.drawText(line, {
        x: 50,
        y: 690 - index * 100,
        size: 12,
        font: font,
        color: rgb(0, 0, 0.8),
        lineHeight: 16,
        maxWidth: 500,
      })
    })

    // Backend Components
    page4.drawText("3.2 Backend Components", {
      x: 50,
      y: 550,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    const backendText = `
The backend is built with Python FastAPI, providing high-performance API endpoints. Key components include:

- API Endpoints: RESTful endpoints for schedule conversion
- AI Integration: Interface with Google Gemini 1.5 Pro
- Error Handling: Comprehensive error management
- Logging: Detailed logging for monitoring and debugging
    `

    const backendLines = backendText.trim().split("\n\n")
    backendLines.forEach((line, index) => {
      page4.drawText(line, {
        x: 50,
        y: 520 - index * 100,
        size: 12,
        font: font,
        color: rgb(0, 0, 0.8),
        lineHeight: 16,
        maxWidth: 500,
      })
    })

    // Data Flow
    const page5 = pdfDoc.addPage([600, 800])
    page5.drawText("4. Data Flow", {
      x: 50,
      y: 750,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    const dataFlowText = `
The data flow through the system follows these steps:

1. User inputs natural language schedule text in the frontend interface
2. Frontend sends the text to the backend via server action
3. Backend prepares the prompt and sends it to Google Gemini 1.5 Pro
4. Gemini processes the text and generates AIXM 5.1.1 XML
5. Backend receives the XML, validates it, and returns it to the frontend
6. Frontend displays the XML to the user with options to copy or download

This flow ensures efficient processing while maintaining separation of concerns between components.
    `

    const dataFlowLines = dataFlowText.trim().split("\n\n")
    dataFlowLines.forEach((line, index) => {
      page5.drawText(line, {
        x: 50,
        y: 720 - index * 150,
        size: 12,
        font: font,
        color: rgb(0, 0, 0.8),
        lineHeight: 16,
        maxWidth: 500,
      })
    })

    // API Documentation
    const page6 = pdfDoc.addPage([600, 800])
    page6.drawText("5. API Documentation", {
      x: 50,
      y: 750,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    const apiDocText = `
The application exposes the following API endpoints:

POST /api/convert
- Description: Converts natural language schedule text to AIXM 5.1.1 XML
- Request Body: { "text": "schedule text" }
- Response: { "aixm_xml": "converted XML" }
- Error Responses: 400 (Invalid Input), 500 (Server Error)

GET /api/download-architecture-doc
- Description: Downloads this architecture document
- Response: PDF file
    `

    const apiDocLines = apiDocText.trim().split("\n\n")
    apiDocLines.forEach((line, index) => {
      page6.drawText(line, {
        x: 50,
        y: 720 - index * 150,
        size: 12,
        font: font,
        color: rgb(0, 0, 0.8),
        lineHeight: 16,
        maxWidth: 500,
      })
    })

    // Deployment Architecture
    const page7 = pdfDoc.addPage([600, 800])
    page7.drawText("6. Deployment Architecture", {
      x: 50,
      y: 750,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    })

    const deploymentText = `
The application is designed for deployment in a cloud environment with the following components:

- Frontend: Deployed on Vercel for optimal Next.js performance
- Backend: Deployed as containerized service on cloud platform
- API Gateway: Manages API requests and authentication
- Environment Variables: Securely stored in cloud provider
- Monitoring: Application performance monitoring and logging

This architecture ensures scalability, reliability, and security while maintaining high performance.
    `

    const deploymentLines = deploymentText.trim().split("\n\n")
    deploymentLines.forEach((line, index) => {
      page7.drawText(line, {
        x: 50,
        y: 720 - index * 150,
        size: 12,
        font: font,
        color: rgb(0, 0, 0.8),
        lineHeight: 16,
        maxWidth: 500,
      })
    })

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save()

    // Return the PDF as a response
    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=architecture-document.pdf",
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF document" }, { status: 500 })
  }
}
