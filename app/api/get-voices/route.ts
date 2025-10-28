import { NextResponse } from "next/server";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

export async function GET() {
  try {
    if (!HEYGEN_API_KEY) throw new Error("API key is missing");

    const res = await fetch(`${BASE_API_URL}/v2/voices`, {
      headers: {
        "x-api-key": HEYGEN_API_KEY,
      },
    });

    if (!res.ok) {
      throw new Error(`Heygen API error: ${res.status}`);
    }

    const voicesData = await res.json();

    // ✅ voices are inside voicesData.data.voices
    const voicesArray = voicesData?.data?.voices ?? [];

    if (!Array.isArray(voicesArray)) {
      throw new Error("Voices is not an array");
    }

    return NextResponse.json(voicesArray);
  } catch (err: unknown) {
    let errorMessage = "Unknown error";
    if (err instanceof Error) errorMessage = err.message;

    console.error("Error fetching voices:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
