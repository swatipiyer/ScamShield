
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
    { text: `Analyze this ${isImage ? 'screenshot' : 'message'} for scam indicators. 
    The user's preferred language for the response is ${lang === 'hi' ? 'Hindi' : 'English'}.
    
    Structure your response in JSON format.
    Guidelines:
    - Categorize the scam type (e.g., Banking Fraud, Job Scam).
    - Be calm and non-alarmist.
    - If risk is High, safeReply should be null.
    - Identify psychological tactics (urgency, authority, etc.).
    - Provide 3-5 red flags and actions.
    - If it's an image, OCR the text first then analyze it deeply.` }
  ];

  if (isImage) {
    promptParts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: content // base64 string
      }
    });
  } else {
    promptParts.push({ text: `Message to analyze: "${content}"` });
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
    throw new Error(lang === 'hi' ? "विश्लेषण विफल रहा। कृपया नेटवर्क जांचें।" : "Analysis failed. Please check your connection.");
  }
};
