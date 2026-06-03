import { NextResponse } from 'next/server';
import { getConfig } from '@/app/actions/config';

export async function POST(req: Request) {
  const config = await getConfig(['OLLAMA_MODEL_ADVISOR']);
  const activeModel = config['OLLAMA_MODEL_ADVISOR'] || 'dolphin-llama3';

  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    let missionData = null;

    // 1. Try Ollama Local LLM
    try {
      // Abort controller for a 10s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const ollamaRes = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel, // Updated to uncensored model
          prompt: `You are an AI mission control system. Convert the following idea into a structured JSON mission brief. 
Return ONLY valid JSON with no markdown formatting or extra text.
{
  "title": "Short 2-4 word punchy technical title",
  "desc": "A 1-2 sentence technical summary",
  "tags": ["SKILL1", "SKILL2", "CATEGORY"],
  "difficulty": "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
  "progress": <number between 10 and 90 representing stability/confidence>
}

Idea: "${prompt}"`,
          stream: false,
          format: 'json'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const parsed = JSON.parse(data.response);
        missionData = {
          id: Date.now().toString(),
          title: parsed.title || "Unknown Mission",
          desc: parsed.desc || prompt,
          tags: parsed.tags || ["INCUBATOR"],
          difficulty: parsed.difficulty || "MEDIUM",
          progress: parsed.progress || 50,
          status: 'DRAFT'
        };
      }
    } catch (e) {
      console.warn("Ollama failed or offline, falling back to heuristics.");
    }

    // 2. Fallback Heuristics (if Ollama isn't running)
    if (!missionData) {
      const pLower = prompt.toLowerCase();
      const tags = [];
      if (pLower.includes('seo') || pLower.includes('rank')) tags.push('MARKETING');
      if (pLower.includes('ui') || pLower.includes('design')) tags.push('DESIGN');
      if (pLower.includes('fast') || pLower.includes('speed') || pLower.includes('optimize')) tags.push('PERFORMANCE');
      if (pLower.includes('data') || pLower.includes('memory')) tags.push('NEURAL');
      if (tags.length === 0) tags.push('CORE');

      let diff = "MEDIUM";
      let prog = 50;
      if (prompt.length > 100) { diff = "HIGH"; prog = 25; }
      if (pLower.includes('simple') || pLower.includes('easy')) { diff = "LOW"; prog = 85; }

      missionData = {
        id: Date.now().toString(),
        title: prompt.split(' ').slice(0, 3).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + " Protocol*",
        desc: (prompt.length > 80 ? prompt.substring(0, 80) + "..." : prompt) + " [Heuristic]*",
        tags,
        difficulty: diff,
        progress: prog,
        status: 'DRAFT'
      };
    }

    return NextResponse.json(missionData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
