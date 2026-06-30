import { NextResponse } from 'next/server';
import { getConfig } from '@/app/actions/config';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const TIMEOUT_MS = 60000;

export async function POST(req: Request) {
  const config = await getConfig(['OLLAMA_MODEL_SYNTHESIS']);
  const activeModel = config['OLLAMA_MODEL_SYNTHESIS'] || 'dolphin-llama3';

  try {
    const { title, desc, tags } = await req.json();
    if (!title || !desc) {
      return NextResponse.json({ error: 'Missing title or desc' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const prompt = `You are a competitive intelligence analyst. Given a software project idea, identify 3 real competing tools or products that solve a similar problem. Return ONLY valid JSON.

Project: "${title}"
Description: "${desc}"
Current Skills/Stack: ${(tags || []).join(', ')}

Return this exact JSON structure:
{
  "competitors": [
    {
      "name": "Tool or Product Name",
      "category": "Open Source | SaaS | Framework | Library",
      "similarity": 85,
      "gap": "One sentence: what our idea does that this tool doesn't",
      "url": "example.com"
    }
  ]
}

Only include 3 competitors. Respond ONLY with valid JSON:`;

    try {
      const res = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: activeModel, prompt, stream: false, format: 'json' }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Ollama error');
      const data = await res.json();

      let parsed;
      try {
        parsed = JSON.parse(data.response);
      } catch {
        const match = data.response.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error('JSON parse failed');
      }

      return NextResponse.json({ competitors: parsed.competitors || [], ollamaAvailable: true });
    } catch {
      clearTimeout(timeoutId);
      // Heuristic fallback
      return NextResponse.json({
        ollamaAvailable: false,
        competitors: [
          { name: 'GitHub Copilot*', category: 'SaaS', similarity: 60, gap: 'We focus on local-first execution with full context awareness, not cloud-dependent completions.', url: 'github.com/features/copilot' },
          { name: 'LangChain*', category: 'Open Source', similarity: 50, gap: 'We operate at the mission/agent orchestration layer, not just LLM chaining.', url: 'langchain.com' },
          { name: 'AutoGPT*', category: 'Open Source', similarity: 45, gap: 'We integrate directly with the developer\'s IDE context and version history.', url: 'agpt.co' },
        ]
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
