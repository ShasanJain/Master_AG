// lib/gemini.ts
// Swapped to Groq (Llama-3) for immediate testing. 
// Function signatures are identical, so the rest of the app doesn't know we swapped.

/**
 * Generate AI insight from user input using Groq
 */
export async function generateInsight(
  userInput: string,
  systemPrompt: string
): Promise<string> {
  if (!userInput.trim()) return "";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192", // Fast and free
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput }
      ],
      temperature: 0.4,
      max_tokens: 512
    })
  });

  if (!response.ok) {
    console.error("Groq API Error:", await response.text());
    return "Error generating response.";
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Summarize a block of text
 */
export async function summarize(text: string, context: string = ""): Promise<string> {
  return generateInsight(
    text,
    `Summarize the following concisely in 2-4 sentences.${context ? ` Context: ${context}` : ""}`
  );
}

/**
 * Generate structured suggestions from freeform input
 */
export async function generateSuggestions(
  input: string,
  domain: string
): Promise<string[]> {
  const raw = await generateInsight(
    input,
    `You are a helpful ${domain} assistant. Return exactly 3 short, actionable suggestions as a JSON array of strings. No other text.`
  );

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return [raw];
  }
}
