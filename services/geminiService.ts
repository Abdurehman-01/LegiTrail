import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API Key missing. Please add VITE_GEMINI_API_KEY to your .env.local file and restart your server.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const fetchLawData = async (country: string) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { temperature: 0.4 } 
  });

  const prompt = `
    Generate a legal safety guide for travelers in ${country}.
    FORMAT RULES:
    1. Use ## for section titles.
    2. Every bullet point MUST start with exactly [DO], [DONT], [WARNING], or [INFO].
    3. Keep points short and high-impact.
    
    Example:
    ## Local Customs
    - [DO] Dress modestly when visiting temples.
    - [DONT] Take photos of military installations.
    - [WARNING] Public displays of affection can lead to fines.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return {
      text: response.text(),
      sources: response.candidates?.[0]?.citationMetadata?.citationSources || []
    };
  } catch (error: any) {
    console.error("Gemini Fetch Error:", error);
    throw new Error(error.message || "Failed to reach Safety Servers.");
  }
};
