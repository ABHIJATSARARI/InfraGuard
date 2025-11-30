import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, description: "Type of infrastructure damage (e.g., Pothole, Broken Streetlight, Cracked Sidewalk, Graffiti, Flooding)" },
    severity: { type: Type.INTEGER, description: "Severity score from 1 (minor) to 5 (critical)" },
    urgency: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
    description: { type: Type.STRING, description: "Short, technical description of the visual damage" },
    recommended_fix: { type: Type.STRING, description: "Standard civil engineering suggested repair method" },
    estimated_cost: { type: Type.STRING, description: "Estimated cost range in USD (e.g. $100-$200)" },
    hazard_risk: { type: Type.STRING, description: "Potential safety risk to pedestrians or vehicles" },
  },
  required: ["type", "severity", "urgency", "description", "recommended_fix", "estimated_cost", "hazard_risk"],
};

export async function analyzeInfrastructureImage(base64Image: string): Promise<AnalysisResult> {
  try {
    // Remove data URL prefix if present for the API call logic if manually constructing, 
    // but the SDK handles parts well. We will extract the base64 data.
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          {
            text: "Analyze this image for infrastructure maintenance. Identify damage, rate severity (1-5), determine urgency, suggest repairs, and estimate costs. Be professional and precise."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Lower temperature for more deterministic/factual output
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}