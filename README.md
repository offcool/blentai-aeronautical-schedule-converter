**Version:** 1.0.0
**Date:** Sunday, April 13, 2025

## Description

a full-stack web application designed to parse and translate natural language descriptions of aeronautical service operational times into the standardized AIXM 5.1.1 XML format.

In the aeronautical domain, service schedules are often provided in varied textual formats, making manual conversion to the required AIXM 5.1.1 standard time-consuming and prone to errors[cite: 17]. Previous automation attempts struggled with the inherent variability of natural language[cite: 18]. This application utilizes a Large Language Model (Google Gemini) via sophisticated prompt engineering to understand the input text and generate compliant AIXM `<aixm:timeInterval>` XML snippets, significantly streamlining the workflow for aeronautical information specialists[cite: 19].

## Features

* **Natural Language Input:** Accepts free-form text describing schedules (days, times, seasons, exceptions, annotations).
* **AI-Powered Conversion:** Employs Google Gemini Flash (via API) with detailed prompt engineering to interpret the input and generate AIXM 5.1.1 `<aixm:timeInterval>` XML.
* **Web Interface:** User-friendly interface built with Next.js for easy input and output visualization.
* **Architecture Documentation Download:** Provides an endpoint to download a dynamically generated PDF outlining the system architecture.
* **API Backend:** Robust Python FastAPI backend handling the core conversion logic.

## Tech Stack

* **Frontend:** Next.js 15+, React 18+, TypeScript, Tailwind CSS (Assumed)
* **Backend:** Python 3.12, FastAPI, Pydantic
* **AI Model:** Google Gemini 2.0 Flash (via `google-generativeai` SDK)
* **PDF Generation:** fpdf2 (Python library)
* **Package Manager:** pnpm
* **Deployment:** Vercel

## Project Structure

/
├── app/                  # Next.js App Router (Frontend Pages & API Handlers)
│   ├── api/              # Next.js API route handlers (e.g., potentially for non-Python tasks)
│   └── ...               # Page routes (/, /about, /documentation)
├── backend/              # Python FastAPI Backend
│   ├── app.py            # FastAPI application, API endpoints (/api/convert, /api/download...)
│   ├── architecture_doc_generator.py # Logic for generating PDF doc
│   └── requirements.txt  # Python dependencies
├── components/           # Shared React components (UI)
├── lib/                  # Frontend helper functions/libs (e.g., actions.ts)
├── public/               # Static assets for Next.js
├── styles/               # Global CSS / Tailwind base
├── .env.local            # Local environment variables (GITIGNORED!)
├── .env.local.example    # Example environment file
├── vercel.json           # Vercel deployment configuration (builds, routes)
├── package.json          # Node.js dependencies and scripts (pnpm)
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration


## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone (url)
    cd aeronautical-schedule-converter
    ```
2.  **Install Frontend Dependencies:**
    ```bash
    pnpm install
    ```
3.  **Setup Python Backend Environment:**
    * It's recommended to use a virtual environment:
        ```bash
        python -m venv .venv
        # Activate (Windows Powershell/cmd):
        .\.venv\Scripts\activate
        # Activate (Linux/macOS bash):
        source .venv/bin/activate
        ```
    * Install Python dependencies:
        ```bash
        pip install -r backend/requirements.txt
        ```
4.  **Configure Environment Variables:**
    * Create a `.env.local` file in the project root by copying `.env.local.example`.
    * Add your Google Gemini API Key to `.env.local`:
        ```dotenv
        # .env.local
        GEMINI_API_KEY=AIzaSy............YourActualApiKey............
        ```

## Running Locally

Due to complexities observed with `vercel dev` for mixed runtimes, the recommended local development approach is to run the frontend and backend separately:

1.  **Run Python Backend:**
    ```bash
    # Ensure your Python virtual environment is active
    cd backend
    uvicorn app:app --reload --port 8001
    # (Backend will run on http://localhost:8001)
    cd ..
    ```
2.  **Run Next.js Frontend:**
    ```bash
    # In the project root directory
    pnpm run dev
    # (Frontend will run on http://localhost:3000)
    ```
3.  **Note:** For this separate local setup, you might need to temporarily modify the `Workspace` URL in `lib/action.ts` to point to `http://localhost:8001/api/convert` instead of using the `VERCEL_URL` logic, perhaps guarded by `if (process.env.NODE_ENV === 'development')`. Remember to revert this before committing/deploying.

## Deployment

* This application is configured for deployment on **Vercel**.
* Ensure the `GEMINI_API_KEY` is added as an Environment Variable in your Vercel project settings for the Production (and Preview) environments.
* Deployment is typically done via the Vercel CLI (`vercel --prod`) or Git integration.
* The `vercel.json` file defines the build process and routing rules for Vercel.

## API Endpoints

* **`POST /api/convert`**
    * Description: Converts natural language schedule text to AIXM 5.1.1 XML.
    * Request Body: `{ "text": "schedule string" }`
    * Response Body: `{ "aixm_xml": "<aixm:timeInterval>...</aixm:timeInterval>..." }`
* **`GET /api/download-architecture-doc`**
    * Description: Generates and returns the system architecture document as a PDF file.
    * Response: `application/pdf`
* **`GET /health`** (Handled by Python backend)
    * Description: Simple health check endpoint for the backend service.
    * Response Body: `{ "status": "healthy" }`

## Challenges & Key Learnings (Optional Section)

* Successfully integrated Next.js frontend with a Python/FastAPI backend on Vercel.
* Developed sophisticated prompt engineering techniques to guide Gemini LLM for complex, structured XML generation (AIXM 5.1.1).
* Addressed serverless function timeouts (`504` errors) on complex inputs by optimizing LLM choice (switching from `gemini-1.5-pro` to `gemini-2.0-flash`), balancing capability with performance and cost within platform limits.
* Resolved deployment issues related to Vercel configuration (`vercel.json` routing), server-side `Workspace` URL requirements (`VERCEL_URL`), and platform features (Vercel Authentication conflicts).
* Diagnosed issues using Vercel Runtime Logs effectively.
