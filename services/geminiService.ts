
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.40.0";
import { Villa } from "../types";

export const generateMarketingCaption = async (villa: Partial<Villa>): Promise<string> => {
  // Always initialize within the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Act as a luxury real estate marketing expert. 
    Generate a compelling, high-end marketing caption for a villa with the following details:
    Name: ${villa.name}
    Category: ${villa.category}
    Price: $${villa.price}/night
    Facilities: ${villa.facilities?.join(', ')}
    Description: ${villa.description}
    
    The caption should be elegant, persuasive, and highlight the unique lifestyle this villa offers. 
    Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });

    return response.text?.trim() || "Experience unparalleled luxury in this stunning property.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Experience the height of luxury and comfort in our hand-picked selection of premium villas.";
  }
};
