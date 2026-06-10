// tests/gemini.test.ts
// Mocked Gemini tests — validates our wrapper logic without API calls

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => '["Suggestion 1","Suggestion 2","Suggestion 3"]',
        },
      }),
    }),
  })),
}));

import { generateInsight, generateSuggestions, summarize } from "@/lib/gemini";

describe("Gemini: generateInsight", () => {
  it("returns text from the model", async () => {
    const result = await generateInsight("test input", "system prompt");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns empty string for empty input", async () => {
    const result = await generateInsight("   ", "system prompt");
    expect(result).toBe("");
  });
});

describe("Gemini: generateSuggestions", () => {
  it("parses JSON array from response", async () => {
    const suggestions = await generateSuggestions("some input", "health");
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBe(3);
  });
});

describe("Gemini: summarize", () => {
  it("calls generateInsight with summarize prompt", async () => {
    const result = await summarize("long text here");
    expect(typeof result).toBe("string");
  });
});
