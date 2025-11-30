import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisResult } from "../types";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || process.env.GEMINI_API_KEY || "");

const analysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    type: { type: SchemaType.STRING, description: "Type of infrastructure damage (e.g., Pothole, Broken Streetlight, Cracked Sidewalk, Graffiti, Flooding)" },
    severity: { type: SchemaType.INTEGER, description: "Severity score from 1 (minor) to 5 (critical)" },
    urgency: { type: SchemaType.STRING, enum: ["Low", "Medium", "High", "Critical"] },
    description: { type: SchemaType.STRING, description: "Short, technical description of the visual damage" },
    recommended_fix: { type: SchemaType.STRING, description: "Standard civil engineering suggested repair method" },
    estimated_cost: { type: SchemaType.STRING, description: "Estimated cost range in USD (e.g. $100-$200)" },
    hazard_risk: { type: SchemaType.STRING, description: "Potential safety risk to pedestrians or vehicles" },
  },
  required: ["type", "severity", "urgency", "description", "recommended_fix", "estimated_cost", "hazard_risk"],
};

export async function analyzeInfrastructureImage(base64Image: string): Promise<AnalysisResult> {
  try {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      }
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      },
      {
        text: "Analyze this image for infrastructure maintenance. Identify damage, rate severity (1-5), determine urgency, suggest repairs, and estimate costs. Be professional and precise."
      }
    ]);

    const response = await result.response;
    const text = response.text();
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}