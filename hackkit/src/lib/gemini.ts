// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateInsight(
  userInput: string,
  systemPrompt: string,
  base64Image?: string,
  base64Audio?: string
): Promise<string> {
  if (!userInput.trim() && !base64Image && !base64Audio) return "";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `System Instructions: ${systemPrompt}\n\nUser Input: ${userInput}`;
    const content: any[] = [prompt];

    if (base64Image) {
      const mimeType = base64Image.split(";")[0].split(":")[1];
      const data = base64Image.split(",")[1];
      content.push({
        inlineData: {
          data,
          mimeType
        }
      });
    }

    if (base64Audio) {
      const mimeType = base64Audio.split(";")[0].split(":")[1];
      const data = base64Audio.split(",")[1];
      content.push({
        inlineData: {
          data,
          mimeType
        }
      });
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Error generating response.";
  }
}
