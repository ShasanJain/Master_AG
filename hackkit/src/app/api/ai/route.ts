// app/api/ai/route.ts
// Generic Gemini endpoint — change systemPrompt at call site
import { NextRequest, NextResponse } from "next/server";
import { generateInsight } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, systemPrompt } = body;

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'input' field" },
        { status: 400 }
      );
    }

    if (!systemPrompt || typeof systemPrompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'systemPrompt' field" },
        { status: 400 }
      );
    }

    // Sanitize: strip HTML tags from user input
    const sanitized = input.replace(/<[^>]*>/g, "").slice(0, 2000);

    const result = await generateInsight(sanitized, systemPrompt);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[AI Route Error]", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
