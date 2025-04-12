from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import re
from typing import Optional, List, Dict, Any
import logging
from dotenv import load_dotenv
import httpx
import google.generativeai as genai
from .architecture_doc_generator import ArchitectureDocGenerator

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aeronautical Schedule Converter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScheduleRequest(BaseModel):
    text: str

class ScheduleResponse(BaseModel):
    aixm_xml: str
    note: Optional[str] = None

# Configure Google Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")
genai.configure(api_key=GEMINI_API_KEY)

@app.post("/api/convert", response_model=ScheduleResponse)
async def convert_schedule(request: ScheduleRequest):

    try:
        # Configure the model
        generation_config = {
            "temperature": 0.2,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        try:
            #primary model
            model = genai.GenerativeModel(
                model_name="gemini-1.5-pro",
                generation_config=generation_config
            )
            
            #prompt created using the exact template provided
            prompt = f"""
            You are an expert aeronautical information specialist tasked with converting natural language schedule descriptions into standardized AIXM 5.1.1 XML format.

        ## CONVERSION TASK
        Convert the provided aeronautical service schedule text into properly formatted AIXM 5.1.1 XML timeInterval elements.

        ## AIXM 5.1.1 STRUCTURE
        Each distinct schedule period must be represented as a separate <aixm:timeInterval> element containing a <aixm:Timesheet> with the following components:
        - <aixm:timeReference>: Always use "UTC"
        - <aixm:startDate>: Beginning date in DD-MM format (e.g., "01-01" for January 1)
        - <aixm:endDate>: Ending date in DD-MM format (e.g., "31-12" for December 31)
        - <aixm:day>: Day specification (see standardized values below)
        - <aixm:startTime>: Start time in 24-hour format with colon (e.g., "08:00")
        - <aixm:endTime>: End time in 24-hour format with colon (e.g., "18:00")

        ## STANDARDIZED DAY VALUES
        - Use "WORK_DAY" for Monday through Friday (MON-FRI)
        - Use "WEEKEND" for Saturday and Sunday (SAT-SUN)
        - Use "EVERY_DAY" for all days of the week
        - Use individual day codes (MON, TUE, WED, THU, FRI, SAT, SUN) for specific days
        - For multiple individual days, create separate timeInterval elements for each day

        ## TIME FORMAT RULES
        - Always use 24-hour format with a colon separator (e.g., "08:00" not "0800")
        - For 24-hour service, use startTime="00:00" and endTime="24:00"
        - Convert any time without a colon (e.g., "0800") to the proper format ("08:00")

        ## SEASONAL VARIATIONS
        - For seasonal schedules, set appropriate startDate and endDate values
        - Winter season typically spans NOV-MAR (startDate="01-11", endDate="31-03")
        - Summer season typically spans APR-OCT (startDate="01-04", endDate="31-10")
        - Create separate timeInterval elements for each season and schedule combination

        ## HOLIDAYS AND EXCEPTIONS
        - For schedules with holiday exceptions, create separate timeInterval elements for regular days and holidays
        - If specific holidays are mentioned, use the appropriate dates
        - For "except holidays" notation, assume standard national holidays

        ## OUTPUT REQUIREMENTS
        - Do NOT include XML declaration (<?xml version="1.0"?>)
        - Do NOT include namespace declarations or root elements
        - Do NOT include <aixm:PropertiesWithSchedule> elements
        - ONLY output the raw <aixm:timeInterval> elements
        - Ensure proper indentation with 2 spaces per level
        - Maintain consistent formatting across all elements
            
            Convert this schedule to AIXM 5.1.1 XML format: {request.text}
    """
            
            # Generate response
            response = model.generate_content(prompt)
            
            # Extract the XML from the response
            aixm_xml = response.text.strip()
            
            aixm_xml = re.sub(r'<\?xml[^>]*\?>|<aixm:PropertiesWithSchedule[^>]*>|</aixm:PropertiesWithSchedule>', '', aixm_xml)
            aixm_xml = re.sub(r'```xml|```', '', aixm_xml).strip()
            
            aixm_xml = re.sub(r'<aixm:startTime>(\d{2})(\d{2})</aixm:startTime>', r'<aixm:startTime>\1:\2</aixm:startTime>', aixm_xml)
            aixm_xml = re.sub(r'<aixm:endTime>(\d{2})(\d{2})</aixm:endTime>', r'<aixm:endTime>\1:\2</aixm:endTime>', aixm_xml)
            
            return ScheduleResponse(aixm_xml=aixm_xml)
                
        except Exception as model_error:
            logger.warning(f"Error with primary model: {str(model_error)}")
            logger.info("Attempting fallback to gemini-2.0-flash-lite model")
            
            #fallback model
            fallback_model = genai.GenerativeModel(
                model_name="gemini-2.0-flash-lite",
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 2048,
                }
            )
            
            prompt = f"""
    You are an expert system that converts aeronautical service schedules from natural language text into structured AIXM 5.1.1 XML format.
    
    In AIXM 5.1.1, service schedules are represented using the PropertiesWithSchedule object, which contains timeInterval elements.
    Each timeInterval contains a Timesheet that defines a portion of the schedule.
    
    A Timesheet includes:
    - timeReference (usually "UTC")
    - startDate and endDate (in DD-MM format, default to 01-01 and 31-12 for year-round schedules)
    - day (can be specific days like MON, TUE, etc., or WORK_DAY, WEEKEND, or EVERY_DAY)
    - startTime and endTime (in HH:MM format)
    
    Your task is to analyze the input text and generate the correct AIXM 5.1.1 XML representation.
    Only output the XML, nothing else.
    
    Convert this schedule to AIXM 5.1.1 XML format: {request.text}
    """
            
            # Generate response with fallback model
            fallback_response = fallback_model.generate_content(prompt)
            
            # Extract the XML from the response
            fallback_aixm_xml = fallback_response.text.strip()
            
            # Apply the same post-processing
            fallback_aixm_xml = re.sub(r'<\?xml[^>]*\?>|<aixm:PropertiesWithSchedule[^>]*>|</aixm:PropertiesWithSchedule>', '', fallback_aixm_xml)
            fallback_aixm_xml = re.sub(r'```xml|```', '', fallback_aixm_xml).strip()
            fallback_aixm_xml = re.sub(r'<aixm:startTime>(\d{2})(\d{2})</aixm:startTime>', r'<aixm:startTime>\1:\2</aixm:startTime>', fallback_aixm_xml)
            fallback_aixm_xml = re.sub(r'<aixm:endTime>(\d{2})(\d{2})</aixm:endTime>', r'<aixm:endTime>\1:\2</aixm:endTime>', fallback_aixm_xml)
            
            return ScheduleResponse(
                aixm_xml=fallback_aixm_xml,
                note="Generated using fallback model (gemini-2.0-flash-lite)"
            )
            
    except Exception as e:
        logger.exception("Error processing schedule conversion")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/api/download-architecture-doc")
async def download_architecture_doc():
    """Generates and downloads the architecture document PDF."""
    try:
        logger.info("Received request for architecture document.")
        generator = ArchitectureDocGenerator()
        pdf_file_path = generator.generate_architecture_doc()

        if not os.path.exists(pdf_file_path):
            logger.error(f"Generated PDF file not found after generation attempt: {pdf_file_path}")
            raise HTTPException(status_code=500, detail="Failed to generate or locate architecture document.")

        logger.info(f"Sending PDF file: {pdf_file_path}")
        return FileResponse(
            path=pdf_file_path,
            filename="aeronautical_converter_architecture.pdf",
            media_type='application/pdf'
        )
    except Exception as e:
        logger.exception("Error generating or serving architecture document")
        raise HTTPException(status_code=500, detail=f"Error creating PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
