import { GoogleGenerativeAI } from "@google/generative-ai";
import { GroundingChunk, LawResponse } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(
    "API Key missing. Add VITE_GEMINI_API_KEY to your .env.local file."
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const fetchLawData = async (
  country: string
): Promise<LawResponse> => {
  const model = genAI.getGenerativeModel(
    { model: "gemini-2.5-flash" },
    { apiVersion: "v1beta" }
  );

  const prompt = `
Generate a legal safety guide for travelers in ${country} using current laws and regulations. 
Include common, important laws as well as unusual, surprising, or lesser-known laws.

STRICT FORMAT:

Create exactly these sections:

## Overview
- Short general advice about the country.
- Include travel safety tips.

## Prohibited Actions
- [DO], [DONT], [WARNING], or [INFO] bullets about actions forbidden by law.

## Social Conduct
- Rules about interacting with locals, culture, and etiquette.

## Driving Rules
- Road laws, driving habits, speed limits, and license requirements.

## Unusual or Lesser-Known Laws
- Rare or surprising laws tourists often overlook.
- [DO], [DONT], [WARNING], or [INFO] bullets only.

RULES:
1. Each bullet MUST start with exactly [DO], [DONT], [WARNING], or [INFO].
2. Max 5 bullets per section.
3. Keep bullets short, high-impact, and actionable.
4. Use clear, traveler-friendly language.

EXAMPLE:

## Social Conduct
- [DO] Greet people with a bow in temples.
- [DONT] Point your feet at people when sitting.
- [WARNING] Public displays of affection may result in fines.

## Unusual or Lesser-Known Laws
- [DONT] Chew gum in public transport areas.
- [WARNING] Stepping on currency may be treated as disrespect to the monarchy.
`;


  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [
        {
          google_search: {}, // Correct tool
        },
      ],
    });

    const response = await result.response;
    const candidate = response.candidates?.[0];

    const sources: GroundingChunk[] =
      candidate?.groundingMetadata?.groundingChunks || [];

    return {
      text: response.text(),
      sources,
    };
  } catch (error: any) {
    console.error("Gemini Fetch Error:", error);
    throw new Error(
      error.message || "Failed to reach Safety Servers."
    );
  }
};
