import { NextResponse } from 'next/server';
import { getConfig } from '@/app/actions/config';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const ADVISOR_TIMEOUT_MS = 60000;
const SYNTHESIS_TIMEOUT_MS = 90000;

const ADVISOR_PROMPTS: Record<string, string> = {
  contrarian:      `You are The Contrarian. Look at the original mission and the user's new pivot/notes. What is the architectural weakness in this new direction? What new risks were just introduced? Be specific. 2-3 sentences max.`,
  firstPrinciples: `You are The First Principles Thinker. Does this pivot solve the root problem better than the original idea, or is it a distraction? What is the core truth here? 2-3 sentences max.`,
  expansionist:    `You are The Expansionist. How does this pivot unlock a 10x bigger opportunity? Where should the user push this new idea even further? 2-3 sentences max.`,
  outsider:        `You are The Outsider. What part of these brainstorming notes makes zero sense? What is the user assuming that they haven't explicitly stated? 2-3 sentences max.`,
  builder:        `You are The Builder. Given this pivot, what are the first 3 concrete engineering steps required to build it? Are the required skills changing? 2-3 sentences max.`,
};

async function askAdvisor(advisorModel: string, advisor: string, title: string, desc: string, notes: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADVISOR_TIMEOUT_MS);
  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: advisorModel,
        prompt: `${ADVISOR_PROMPTS[advisor]}\n\nOriginal Mission: "${title}"\nOriginal Description: "${desc}"\n\nUser's Pivot / Brainstorm Notes:\n"${notes}"\n\nYour analysis of the pivot:`,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Ollama error');
    const data = await res.json();
    return (data.response || '').trim();
  } catch {
    clearTimeout(timeoutId);
    throw new Error(`Advisor ${advisor} failed`);
  }
}

async function synthesizePivot(synthesisModel: string, 
  title: string,
  desc: string,
  notes: string,
  advisorOutputs: Record<string, string>
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SYNTHESIS_TIMEOUT_MS);

  const combined = Object.entries(advisorOutputs)
    .filter(([, v]) => !v.startsWith('[Ollama offline'))
    .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
    .join('\n\n');

  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: synthesisModel,
        prompt: `You are a Chairman synthesizing a pivot for a software mission.
Return ONLY valid JSON with no markdown or extra text.

{
  "pivotSummary": "1-2 sentences summarizing how the idea evolved and the council verdict.",
  "pivotSeverity": "MINOR",
  "newDesc": "A polished 1-2 sentence technical summary of the new mission.",
  "newSkills": ["REDIS", "NODEJS"],
  "newDifficulty": "MEDIUM",
  "newMiniPRD": {
    "problem": "1-2 sentences on the exact problem solved (updated)",
    "audience": "Target user or system (updated)",
    "solution": "What the final product looks like and does (updated)"
  }
}

Original Mission: "${title}" — "${desc}"
User Brainstorming Notes: "${notes}"

Council Opinions:
${combined}

Respond ONLY with valid JSON:`,
        stream: false,
        format: 'json',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Chairman synthesis failed');
    const data = await res.json();
    let parsed;
    try {
      parsed = JSON.parse(data.response);
    } catch {
      const match = data.response.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('JSON parse failed');
    }
    return parsed;
  } catch {
    clearTimeout(timeoutId);
    throw new Error('Synthesis failed');
  }
}

// Helper: encode an SSE event
function sseEvent(payload: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(req: Request) {
  const config = await getConfig(['OLLAMA_MODEL_ADVISOR', 'OLLAMA_MODEL_SYNTHESIS']);
  const advisorModel = config['OLLAMA_MODEL_ADVISOR'] || 'dolphin-llama3';
  const synthesisModel = config['OLLAMA_MODEL_SYNTHESIS'] || 'dolphin-llama3';

  try {
    const { title, desc, notes } = await req.json();
    if (!title || !desc || !notes) {
      return NextResponse.json({ error: 'Missing title, desc, or notes' }, { status: 400 });
    }

    const advisorNames = Object.keys(ADVISOR_PROMPTS);
    const advisorOutputs: Record<string, string> = {};

    // Streaming response via ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const enqueue = (payload: object) => controller.enqueue(sseEvent(payload));

        // ── Wave 1: first 3 advisors in parallel ──────────────────────────
        enqueue({ type: 'status', wave: 1, message: 'Wave 1 running — Contrarian, First Principles, Expansionist' });

        const wave1Names = advisorNames.slice(0, 3);
        const wave1Results = await Promise.allSettled(
          wave1Names.map(name => askAdvisor(advisorModel, name, title, desc, notes))
        );

        wave1Names.forEach((name, i) => {
          const r = wave1Results[i];
          const text = r.status === 'fulfilled'
            ? r.value
            : `[Ollama offline — heuristic fallback for ${name}]*`;
          advisorOutputs[name] = text;
          enqueue({ type: 'advisor', name, text, wave: 1 });
        });

        // ── Wave 2: remaining 2 advisors in parallel ──────────────────────
        enqueue({ type: 'status', wave: 2, message: 'Wave 2 running — Outsider, Executor' });

        const wave2Names = advisorNames.slice(3);
        const wave2Results = await Promise.allSettled(
          wave2Names.map(name => askAdvisor(advisorModel, name, title, desc, notes))
        );

        wave2Names.forEach((name, i) => {
          const r = wave2Results[i];
          const text = r.status === 'fulfilled'
            ? r.value
            : `[Ollama offline — heuristic fallback for ${name}]*`;
          advisorOutputs[name] = text;
          enqueue({ type: 'advisor', name, text, wave: 2 });
        });

        // ── Chairman synthesis ─────────────────────────────────────────────
        enqueue({ type: 'status', wave: 3, message: 'Chairman synthesizing verdict...' });

        const successCount = Object.values(advisorOutputs).filter(v => !v.startsWith('[Ollama offline')).length;
        const ollamaAvailable = successCount >= Math.ceil(advisorNames.length / 2);

        let pivot: any = null;
        if (ollamaAvailable) {
          try {
            pivot = await synthesizePivot(synthesisModel, title, desc, notes, advisorOutputs);
          } catch {
            // synthesis failed — use fallback below
          }
        }

        if (!pivot) {
          pivot = {
            pivotSummary: 'Council offline. Automatically applied notes to description.*',
            pivotSeverity: 'MINOR',
            newDesc: desc + ' | Notes: ' + notes.substring(0, 80) + '...',
            newSkills: ['CORE', 'UPDATED'],
            newDifficulty: 'MEDIUM',
            newMiniPRD: {
              problem: 'Undefined problem space.',
              audience: 'Unknown',
              solution: 'Heuristic fallback representation of the pivoted idea.*',
            },
          };
        }

        enqueue({ type: 'pivot', pivot, ollamaAvailable });
        enqueue({ type: 'done' });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
