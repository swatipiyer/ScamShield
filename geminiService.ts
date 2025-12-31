
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "./types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMessage = async (
  content: string, 
  isImage: boolean = false,
  lang: Language = 'en'
): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const promptParts: any[] = [
    { text: `You are ScamShield Pro, a fraud prevention specialist for users in India.
    Analyze the following ${isImage ? 'screenshot' : 'text'} and determine the risk.
    
    The response must be in ${lang === 'hi' ? 'Hindi' : 'English'}.
    
    Structure your response as a valid JSON object.
    Required logic for Indian context:
    - If it's a message about "Digital Arrest", "Electricity Bill disconnection", or "Job Task likes", mark as High Risk.
    - Mention specific Indian context like "Cyber Cell", "Aadhaar safety", or "UPI PIN".
    - Confidence should be between 0 and 100.
    
    If it's an image, perform OCR first and include the analysis of the visual elements (fake logos, suspicious fonts).` }
  ];

  if (isImage) {
    promptParts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: content // base64 string
      }
    });
  } else {
    promptParts.push({ text: `Content to audit: "${content}"` });
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: promptParts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING },
          category: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          psychologicalTactics: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          safeReply: { type: Type.STRING, nullable: true },
          doNotDo: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["riskLevel", "category", "confidence", "summary", "redFlags", "psychologicalTactics", "recommendedActions", "doNotDo"],
      },
    },
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse response:", error);
    throw new Error(lang === 'hi' ? "ऑडिट विफल रहा। कृपया पुनः प्रयास करें।" : "Audit failed. Please try again.");
  }
};
