import os
from fpdf import FPDF
from datetime import datetime

import logging
logger = logging.getLogger(__name__)

class ArchitectureDocGenerator:
    def __init__(self):
        self.pdf = FPDF()
        self.pdf.set_auto_page_break(auto=True, margin=15)
        self.pdf.add_page()
        
    def generate_architecture_doc(self):
        # Set up the document
        self.pdf.set_font("Arial", "B", 16)
        self.pdf.cell(0, 10, "Aeronautical Schedule Converter", ln=True, align="C")
        self.pdf.cell(0, 10, "System Architecture Document", ln=True, align="C")
        
        self.pdf.set_font("Arial", "", 12)
        self.pdf.cell(0, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True, align="C")
        self.pdf.ln(10)
        
        # Table of Contents
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "Table of Contents", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.cell(0, 10, "1. Introduction", ln=True)
        self.pdf.cell(0, 10, "2. System Overview", ln=True)
        self.pdf.cell(0, 10, "3. Architecture Components", ln=True)
        self.pdf.cell(0, 10, "4. Data Flow", ln=True)
        self.pdf.cell(0, 10, "5. API Documentation", ln=True)
        self.pdf.cell(0, 10, "6. Deployment Architecture", ln=True)
        self.pdf.ln(10)
        
        # Introduction
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "1. Introduction", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 10, """
        The Aeronautical Schedule Converter is an application designed to convert natural language descriptions of aeronautical service schedules into structured AIXM 5.1.1 XML format. This document provides a comprehensive overview of the system architecture, components, and data flow.
        
        The application addresses a critical need in the aeronautical information management domain, where service schedules are often provided in varied natural language formats that need to be converted to standardized AIXM format for integration with aeronautical information systems.
        """)
        
        # System Overview
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "2. System Overview", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 10, """
        The Aeronautical Schedule Converter is built using a modern web application architecture with the following key components:
        
        - Frontend: React/Next.js application providing a user-friendly interface
        - Backend: Python FastAPI service for processing and conversion
        - AI Integration: Google Gemini 1.5 Pro for natural language understanding
        - API Layer: RESTful API for communication between components
        
        The application follows a client-server architecture with clear separation of concerns between the presentation layer, business logic, and data processing.
        """)
        
        # Architecture Components
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "3. Architecture Components", ln=True)
        
        # Frontend
        self.pdf.set_font("Arial", "B", 12)
        self.pdf.cell(0, 10, "3.1 Frontend Components", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 10, """
        The frontend is built with Next.js and React, providing a responsive and interactive user interface. Key components include:
        
        - Page Components: Main application pages (home, about, documentation)
        - UI Components: Reusable interface elements (buttons, cards, textareas)
        - State Management: React hooks for managing application state
        - API Integration: Server actions for secure communication with backend
        """)
        
        # Backend
        self.pdf.set_font("Arial", "B", 12)
        self.pdf.cell(0, 10, "3.2 Backend Components", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 10, """
        The backend is built with Python FastAPI, providing high-performance API endpoints. Key components include:
        
        - API Endpoints: RESTful endpoints for schedule conversion
        - AI Integration: Interface with Google Gemini 1.5 Pro
        - Error Handling: Comprehensive error management
        - Logging: Detailed logging for monitoring and debugging
        """)
        
        # AI Integration
        self.pdf.set_font("Arial", "B", 12)
        self.pdf.cell(0, 10, "3.3 AI Integration", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 10, """
        The application integrates with Google Gemini 1.5 Pro for natural language processing:
        
        - Model Configuration: Optimized settings for schedule conversion
        - Prompt Engineering: Carefully crafted prompts for accurate AIXM generation
        - Safety Settings: Appropriate safety thresholds for technical content
        - Error Handling: Robust handling of API errors and fallbacks
        """)
        
        # Data Flow
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "4. Data Flow", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 10, """
        The data flow through the system follows these steps:
        
        1. User inputs natural language schedule text in the frontend interface
        2. Frontend sends the text to the backend via server action
        3. Backend prepares the prompt and sends it to Google Gemini 1.5 Pro
        4. Gemini processes the text and generates AIXM 5.1.1 XML
        5. Backend receives the XML, validates it, and returns it to the frontend
        6. Frontend displays the XML to the user with options to copy or download
        
        This flow ensures efficient processing while maintaining separation of concerns between components.
        """)
        
        # API Documentation
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "5. API Documentation", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 10, """
        The application exposes the following API endpoints:
        
        POST /api/convert
        - Description: Converts natural language schedule text to AIXM 5.1.1 XML
        - Request Body: { "text": "schedule text" }
        - Response: { "aixm_xml": "converted XML" }
        - Error Responses: 400 (Invalid Input), 500 (Server Error)
        
        GET /api/download-architecture-doc
        - Description: Downloads this architecture document
        - Response: PDF file
        """)
        
        # Deployment Architecture
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "6. Deployment Architecture", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 10, """
        The application is designed for deployment in a cloud environment with the following components:
        
        - Frontend: Deployed on Vercel for optimal Next.js performance
        - Backend: Deployed as containerized service on cloud platform
        - API Gateway: Manages API requests and authentication
        - Environment Variables: Securely stored in cloud provider
        - Monitoring: Application performance monitoring and logging
        
        This architecture ensures scalability, reliability, and security while maintaining high performance.
        """)
        
        output_dir = "/tmp"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "architecture_document.pdf")
        
        logger.info(f"Attempting to save PDF to: {output_path}")
        try:
            self.pdf.output(output_path)
            if os.path.exists(output_path):
                logger.info(f"Successfully created PDF file at: {output_path}")
            else:
                logger.error(f"CRITICAL: pdf.output completed BUT file not found at {output_path}")
        except Exception as e:
            logger.error(f"EXCEPTION during pdf.output: {e}", exc_info=True)
            raise 
        return output_path 

if __name__ == "__main__":
    generator = ArchitectureDocGenerator()
    pdf_path = generator.generate_architecture_doc()
    print(f"Architecture document generated at: {pdf_path}")
