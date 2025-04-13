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
import time 

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
    logger.error("FATAL: GEMINI_API_KEY environment variable is not set")
    raise ValueError("GEMINI_API_KEY environment variable is not set")
try:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini API configured successfully.")
except Exception as config_error:
    logger.error(f"FATAL: Error configuring Gemini API: {config_error}")
    raise

# --- NEW Detailed Prompt Template ---
prompt_template = """
You are an expert aeronautical information specialist system. Your task is to convert natural language descriptions of aeronautical service operational schedules into strictly formatted AIXM 5.1.1 XML snippets.

## CONVERSION TASK
Analyze the provided 'Input Schedule Text' and generate one or more corresponding AIXM 5.1.1 <aixm:timeInterval> elements based on the rules and examples below.

## AIXM 5.1.1 TARGET STRUCTURE
Each distinct operational period MUST be represented as a separate `<aixm:timeInterval>` element.
Each `<aixm:timeInterval>` MUST contain exactly one `<aixm:Timesheet>` element.
Each `<aixm:Timesheet>` MUST contain the following elements IN THIS ORDER, where applicable:
- `<aixm:timeReference>`: Always output "UTC".
- `<aixm:startDate>`: Start date (DD-MM format). Default to "01-01" if not specified or year-round.
- `<aixm:endDate>`: End date (DD-MM format). Default to "31-12" if not specified or year-round.
- `<aixm:day>`: Day of the week code (See Standardized Day Values). Use separate `timeInterval` elements for each distinct day or day-group applicable to a specific time range.
- `<aixm:dayTil>`: (Optional) Use only if `<aixm:day>` represents the start of a standard range (e.g., MON) and the end day is specified or implied (e.g., FRI for WORK_DAY). Not generally preferred; separate elements per day group are safer.
- `<aixm:startTime>`: Start time (HH:MM format, 24-hour clock). Required unless it's an annotation-only entry or a full-day exclusion.
- `<aixm:endTime>`: End time (HH:MM format, 24-hour clock). Use "24:00" for end-of-day/H24 service. Required unless it's an annotation-only entry or a full-day exclusion.
- `<aixm:startTimeRelative>` / `<aixm:endTimeRelative>`: (Not typically needed based on examples, avoid unless specifically requested).
- `<aixm:excluded>`: Output "YES" only if this specific timesheet represents a period when the service is explicitly NOT available (e.g., specific holiday dates mentioned as exceptions).
- `<aixm:annotation>`: Use this to capture supplementary textual information. MUST contain a child `<aixm:Note>` element holding the text. Example: `<aixm:annotation><aixm:Note>PPR 2 HR PN.</aixm:Note></aixm:annotation>`.

## STANDARDIZED VALUES & INTERPRETATION RULES
- **Day Values:**
    - "MON-FRI", "Weekdays": Map to `<aixm:day>WORK_DAY</aixm:day>`.
    - "SAT-SUN", "Weekends": Map to `<aixm:day>WEEKEND</aixm:day>`. (Alternatively, separate SAT and SUN elements).
    - "Daily", "MON-SUN", "Every day": Map to `<aixm:day>ANY</aixm:day>`.
    - Specific days ("MON", "TUE", etc.): Use the three-letter code (e.g., `<aixm:day>TUE</aixm:day>`).
    - Ranges like "MON-THU": Generate separate `<aixm:timeInterval>` for each day (MON, TUE, WED, THU) applicable to the time range.
    - "HOL", "Public HOL": Map to `<aixm:day>HOL</aixm:day>`.
- **Time:**
    - Always use HH:MM format (e.g., convert "0800" to "08:00").
    - "H24", "24 hours": Map to `<aixm:startTime>00:00</aixm:startTime>`, `<aixm:endTime>24:00</aixm:endTime>`, and `<aixm:day>ANY</aixm:day>`.
    - Multiple time slots for the same day(s) (e.g., "0700-1300, 1400-1800"): Generate a separate `<aixm:timeInterval>` for each time slot.
- **Dates & Seasons:**
    - Use DD-MM format (e.g., "Nov 1st" -> "01-11", "Mar 31" -> "31-03").
    - "WIN" or "Winter": Assume Nov 1st to Mar 31st (`<aixm:startDate>01-11</aixm:startDate>`, `<aixm:endDate>31-03</aixm:endDate>`).
    - "SUM" or "Summer": Assume Apr 1st to Oct 31st (`<aixm:startDate>01-04</aixm:startDate>`, `<aixm:endDate>31-10</aixm:endDate>`).
    - "SDLST" (Start Daylight Saving Time): Interpret as the start of the Summer period (`<aixm:startDate>01-04</aixm:startDate>`).
    - "EDLST" (End Daylight Saving Time): Interpret as the end of the Summer period (`<aixm:endDate>31-10</aixm:endDate>`). Adjust interpretation if local rules differ significantly, but use these standard dates otherwise. Handle date ranges like EDLST-SDLST accordingly (Winter).
- **Exclusions:**
    - "except HOL": Add a separate timesheet `<aixm:timeInterval><aixm:Timesheet>...<aixm:day>HOL</aixm:day><aixm:excluded>YES</aixm:excluded></aixm:Timesheet></aixm:timeInterval>`.
    - "except 01 JAN and 25 DEC": Add separate excluded timesheets for these specific dates, e.g., `<aixm:timeInterval><aixm:Timesheet>...<aixm:startDate>01-01</aixm:startDate><aixm:endDate>01-01</aixm:endDate><aixm:day>ANY</aixm:day><aixm:excluded>YES</aixm:excluded></aixm:Timesheet></aixm:timeInterval>`.
- **Annotations:** Capture free text like "PPR PN 2 HR", "See NOTAM", "O/R...", "Service de contrôle..." within `<aixm:annotation><aixm:Note>...</aixm:Note></aixm:annotation>` inside the relevant `Timesheet`. If an input is ONLY an annotation (e.g., "ATS SKED"), create a timesheet with only the annotation and timeReference. If annotation applies to specific times, include it in those timesheets.

## OUTPUT REQUIREMENTS
- **STRICTLY** output ONLY the `<aixm:timeInterval>` elements.
- **NO** XML declaration (`<?xml ...?>`).
- **NO** root elements (like `<Schedules>` or `<aixm:PropertiesWithSchedule>`).
- **NO** namespace declarations (`xmlns:aixm=...`).
- Use **exactly 2 spaces** for indentation per level.
- Ensure all times are in valid HH:MM format.
- Generate multiple `<aixm:timeInterval>` elements if the input describes multiple distinct periods (different days, times, date ranges, or conditions).

## EXAMPLES

Input Schedule Text:
MON-FRI: 0900-1700

Output:
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>WORK_DAY</aixm:day>
    <aixm:startTime>09:00</aixm:startTime>
    <aixm:endTime>17:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>

---
Input Schedule Text:
MON-THU: 0700-1300, 1400-1800

Output:
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>MON</aixm:day>
    <aixm:startTime>07:00</aixm:startTime>
    <aixm:endTime>13:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>MON</aixm:day>
    <aixm:startTime>14:00</aixm:startTime>
    <aixm:endTime>18:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>TUE</aixm:day>
    <aixm:startTime>07:00</aixm:startTime>
    <aixm:endTime>13:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>TUE</aixm:day>
    <aixm:startTime>14:00</aixm:startTime>
    <aixm:endTime>18:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>WED</aixm:day>
    <aixm:startTime>07:00</aixm:startTime>
    <aixm:endTime>13:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>WED</aixm:day>
    <aixm:startTime>14:00</aixm:startTime>
    <aixm:endTime>18:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>THU</aixm:day>
    <aixm:startTime>07:00</aixm:startTime>
    <aixm:endTime>13:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>THU</aixm:day>
    <aixm:startTime>14:00</aixm:startTime>
    <aixm:endTime>18:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>

---
Input Schedule Text:
MON-FRI except HOL : SUM : 0600 - 2145 - WIN : 0700 - 2100.

Output:
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-04</aixm:startDate>
    <aixm:endDate>31-10</aixm:endDate>
    <aixm:day>WORK_DAY</aixm:day>
    <aixm:startTime>06:00</aixm:startTime>
    <aixm:endTime>21:45</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-11</aixm:startDate>
    <aixm:endDate>31-03</aixm:endDate>
    <aixm:day>WORK_DAY</aixm:day>
    <aixm:startTime>07:00</aixm:startTime>
    <aixm:endTime>21:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>HOL</aixm:day>
    <aixm:excluded>YES</aixm:excluded>
  </aixm:Timesheet>
</aixm:timeInterval>

---
Input Schedule Text:
MON-SUN : 0800-1700. Extension possible: PPR PN 24 HR .

Output:
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>ANY</aixm:day>
    <aixm:startTime>08:00</aixm:startTime>
    <aixm:endTime>17:00</aixm:endTime>
    <aixm:annotation>
      <aixm:Note>Extension possible: PPR PN 24 HR .</aixm:Note>
    </aixm:annotation>
  </aixm:Timesheet>
</aixm:timeInterval>

---
Input Schedule Text:
ATS SKED

Output:
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>ANY</aixm:day>
    <aixm:annotation>
      <aixm:Note>ATS SKED</aixm:Note>
    </aixm:annotation>
  </aixm:Timesheet>
</aixm:timeInterval>

---

Input Schedule Text: {text_input}

Output:
"""
# --- End of Prompt Template Definition ---


@app.post("/api/convert", response_model=ScheduleResponse)
async def convert_schedule(request: ScheduleRequest):
    try:
        # Configure the model
        generation_config = {
            "temperature": 0.2,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 4096, # Increased max tokens slightly for complex outputs
        }

        try:
            # primary model
            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash", #changed the model for faster req , it hits vercel runtime : error504
                generation_config=generation_config
            )

            # Format the template with the user's input text
            prompt = prompt_template.format(text_input=request.text)

            logger.info("Calling Gemini model (gemini-1.5-pro)...")
            start_time = time.time()
            response = model.generate_content(prompt)
            end_time = time.time()
            logger.info(f"Gemini call (gemini-1.5-pro) finished. Duration: {end_time - start_time:.2f} seconds")

            # Extract the XML from the response
            aixm_xml = response.text.strip()

            # Post-processing to ensure correct format
            aixm_xml = re.sub(r'<\?xml[^>]*\?>|<aixm:PropertiesWithSchedule[^>]*>|</aixm:PropertiesWithSchedule>', '', aixm_xml)
            aixm_xml = re.sub(r'```xml|```', '', aixm_xml).strip()
            aixm_xml = re.sub(r'<aixm:startTime>(\d{2})(\d{2})</aixm:startTime>', r'<aixm:startTime>\1:\2</aixm:startTime>', aixm_xml)
            aixm_xml = re.sub(r'<aixm:endTime>(\d{2})(\d{2})</aixm:endTime>', r'<aixm:endTime>\1:\2</aixm:endTime>', aixm_xml)

            logger.info("Successfully processed /api/convert request with primary model.")
            return ScheduleResponse(aixm_xml=aixm_xml)

        except Exception as model_error:
            logger.warning(f"Error with primary model: {str(model_error)}")
            logger.info("Attempting fallback to gemini-2.0-flash-lite model") 

            fallback_model = genai.GenerativeModel(
                model_name="gemini-2.0-flash-lite", # Switched to flash for fallback
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 4096, # Keep max tokens consistent
                }
            )

            prompt_fallback = prompt_template.format(text_input=request.text)

            # --- Add Timing Log for Fallback ---
            logger.info("Calling Gemini model (gemini-1.5-flash fallback)...")
            start_time_fb = time.time()
            fallback_response = fallback_model.generate_content(prompt_fallback)
            end_time_fb = time.time()
            logger.info(f"Gemini call (gemini-1.5-flash fallback) finished. Duration: {end_time_fb - start_time_fb:.2f} seconds")

            # Extract the XML from the response
            fallback_aixm_xml = fallback_response.text.strip()

            # Apply the same post-processing
            fallback_aixm_xml = re.sub(r'<\?xml[^>]*\?>|<aixm:PropertiesWithSchedule[^>]*>|</aixm:PropertiesWithSchedule>', '', fallback_aixm_xml)
            fallback_aixm_xml = re.sub(r'```xml|```', '', fallback_aixm_xml).strip()
            fallback_aixm_xml = re.sub(r'<aixm:startTime>(\d{2})(\d{2})</aixm:startTime>', r'<aixm:startTime>\1:\2</aixm:startTime>', fallback_aixm_xml)
            fallback_aixm_xml = re.sub(r'<aixm:endTime>(\d{2})(\d{2})</aixm:endTime>', r'<aixm:endTime>\1:\2</aixm:endTime>', fallback_aixm_xml)

            logger.info("Successfully processed /api/convert request with fallback model.")
            return ScheduleResponse(
                aixm_xml=fallback_aixm_xml,
                note="Generated using fallback model (gemini-1.5-flash)" # Updated note
            )

    except Exception as e:
        logger.exception("Error processing schedule conversion request in /api/convert")
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

# the __main__ block needed for local testing
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)