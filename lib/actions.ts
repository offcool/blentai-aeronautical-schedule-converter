"use server";

export async function convertSchedule(scheduleText: string): Promise<string> {
  try {
    const vercelDeploymentUrl = process.env.VERCEL_URL;
    let apiUrl: string;
    if (vercelDeploymentUrl) {
      apiUrl = `https://${vercelDeploymentUrl}/api/convert`;
    } else {
      console.error("VERCEL_URL environment variable is not set!");
      throw new Error("Cannot determine API endpoint URL in this environment.");
    }

    console.log(`Calling backend API at (absolute): ${apiUrl}`); 
    const response = await fetch(apiUrl, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: scheduleText }),
      cache: "no-store",
    });

    if (!response.ok) {
      let errorDetail = `Backend responded with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (e) { /* Ignore if response not JSON */ }
      console.error(`Backend API Error (${response.status}): ${errorDetail}`);
      throw new Error(`Conversion failed: ${errorDetail}`);
    }

    const data = await response.json();
    if (!data.aixm_xml) {
      throw new Error("Backend response missing 'aixm_xml'.");
    }
    return data.aixm_xml;

  } catch (error) {
    console.error("Error calling convertSchedule backend:", error);
    throw new Error(
      `Failed to process schedule: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}