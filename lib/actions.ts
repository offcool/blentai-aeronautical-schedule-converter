"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

export async function convertSchedule(scheduleText: string): Promise<string> {
  try {
    // Try to call the backend API first
    try {
      const response = await fetch("http://0.0.0.0:8000/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: scheduleText }),
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        return data.aixm_xml
      }

      // If we get here, the backend call failed but didn't throw an error
      console.warn("Backend API returned an error status, falling back to client-side implementation")
    } catch (fetchError) {
      // If fetch fails (e.g., backend not running), log and continue to fallback
      console.warn("Failed to connect to backend API, falling back to client-side implementation:", fetchError)
    }

    // Fallback: Implement the conversion directly in the server action
    console.log("Using fallback implementation with Gemini API directly")

    // Initialize the Google Generative AI with your API key
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error("API key is missing. Please check your environment variables.")
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // Configure the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })

    // Using the exact prompt template provided
    // Using the enhanced prompt template
const prompt = `
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

## EXAMPLES

Example 1: Basic weekday and Saturday schedule
Input: "MON-FRI: 0800-1800, SAT: 0800-1200"
Output:
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>WORK_DAY</aixm:day>
    <aixm:startTime>08:00</aixm:startTime>
    <aixm:endTime>18:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>SAT</aixm:day>
    <aixm:startTime>08:00</aixm:startTime>
    <aixm:endTime>12:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>

Example 2: 24-hour service
Input: "H24" or "24 hours"
Output:
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>EVERY_DAY</aixm:day>
    <aixm:startTime>00:00</aixm:startTime>
    <aixm:endTime>24:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>

Example 3: Seasonal variation
Input: "Winter (NOV-MAR): MON-FRI 0700-1900, SAT-SUN 0900-1700, Summer (APR-OCT): H24"
Output:
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-11</aixm:startDate>
    <aixm:endDate>31-03</aixm:endDate>
    <aixm:day>WORK_DAY</aixm:day>
    <aixm:startTime>07:00</aixm:startTime>
    <aixm:endTime>19:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-11</aixm:startDate>
    <aixm:endDate>31-03</aixm:endDate>
    <aixm:day>WEEKEND</aixm:day>
    <aixm:startTime>09:00</aixm:startTime>
    <aixm:endTime>17:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-04</aixm:startDate>
    <aixm:endDate>31-10</aixm:endDate>
    <aixm:day>EVERY_DAY</aixm:day>
    <aixm:startTime>00:00</aixm:startTime>
    <aixm:endTime>24:00</aixm:endTime>
  </aixm:Timesheet>
</aixm:timeInterval>

Example 4: Holiday exceptions
Input: "Daily: 0900-1700 except holidays"
Output:
<aixm:timeInterval>
  <aixm:Timesheet>
    <aixm:timeReference>UTC</aixm:timeReference>
    <aixm:startDate>01-01</aixm:startDate>
    <aixm:endDate>31-12</aixm:endDate>
    <aixm:day>EVERY_DAY</aixm:day>
    <aixm:startTime>09:00</aixm:startTime>
    <aixm:endTime>17:00</aixm:endTime>
    <aixm:excluded>HOLIDAY</aixm:excluded>
  </aixm:Timesheet>
</aixm:timeInterval>

Now convert the following schedule to AIXM 5.1.1 XML format:
${scheduleText}
`

    try {
      // Generate content with the model
      const result = await model.generateContent(prompt)
      const response = result.response
      let output = response.text().trim()

      // Post-processing to ensure correct format
      // Remove any XML declaration or root elements
      output = output.replace(/<\?xml[^>]*\?>|<aixm:PropertiesWithSchedule[^>]*>|<\/aixm:PropertiesWithSchedule>/g, "")

      // Remove any code block markers that might be included
      output = output.replace(/```xml|```/g, "").trim()

      // Format times with a colon if needed (e.g., 0800 to 08:00)
      output = output.replace(
        /<aixm:startTime>(\d{2})(\d{2})<\/aixm:startTime>/g,
        "<aixm:startTime>$1:$2</aixm:startTime>",
      )
      output = output.replace(/<aixm:endTime>(\d{2})(\d{2})<\/aixm:endTime>/g, "<aixm:endTime>$1:$2</aixm:endTime>")

      return output
    } catch (modelError) {
      console.error("Error generating content with gemini-1.5-pro:", modelError)

      // Fallback to gemini-2.0-flash-lite model if gemini-1.5-pro fails
      try {
        console.log("Attempting fallback to gemini-2.0-flash-lite model")
        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-lite",
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        })

        const fallbackResult = await fallbackModel.generateContent(prompt)
        const fallbackResponse = fallbackResult.response
        let output = fallbackResponse.text().trim()

        // Apply the same post-processing
        output = output.replace(
          /<\?xml[^>]*\?>|<aixm:PropertiesWithSchedule[^>]*>|<\/aixm:PropertiesWithSchedule>/g,
          "",
        )
        output = output.replace(/```xml|```/g, "").trim()
        output = output.replace(
          /<aixm:startTime>(\d{2})(\d{2})<\/aixm:startTime>/g,
          "<aixm:startTime>$1:$2</aixm:startTime>",
        )
        output = output.replace(/<aixm:endTime>(\d{2})(\d{2})<\/aixm:endTime>/g, "<aixm:endTime>$1:$2</aixm:endTime>")

        return output
      } catch (fallbackError) {
        console.error("Error with fallback model:", fallbackError)
        throw new Error(`Failed to generate content with both primary and fallback models. Please try again later.`)
      }
    }
  } catch (error) {
    console.error("Error converting schedule:", error)
    throw new Error(
      `Failed to convert schedule to AIXM format: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
