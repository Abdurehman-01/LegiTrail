
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LawResponse, GroundingChunk } from "../types";

export const fetchLawData = async (country: string): Promise<LawResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a Global Safety Officer. Provide a high-impact, short legal guide for travelers in ${country}.
    
    CRITICAL: Use Google Search to find real, specific laws.
    
    FORMAT RULES:
    - Use EXACTLY these section headers starting with ##.
    - Each point MUST be a single, punchy line.
    - Start each point with one of these tags: [DO], [DON'T], or [WARNING].
    - Follow the tag with a short description and the specific penalty/consequence.
    
    Example:
    [DON'T] Chewing gum in public. Penalty: Heavy fines or arrest.
    
    REQUIRED SECTIONS:
    ## 🚨 High Risk (Arrest/Deportation)
    ## 📵 Public Conduct & Restricted Areas
    ## 🚗 Transit & Transport Rules
    ## 💡 Cultural Etiquette & Local Norms
    ## 🧐 Unusual & Lesser Known Laws
    
    Keep text short. No long paragraphs. Use Search Grounding for accuracy.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const text = response.text || "No data found.";
    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

    return {
      text,
      sources,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Safety database offline. Try again shortly.");
  }
};
