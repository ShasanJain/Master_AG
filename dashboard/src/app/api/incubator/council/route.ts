import { NextResponse } from 'next/server';
import { getConfig } from '@/app/actions/config';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const TIMEOUT_MS = 90000;

const ADVISOR_PROMPTS: Record<string, string> = {
  contrarian: `You are The Contrarian. Assume this mission has an architectural weakness. Find it. What will fall short? What's missing? What assumption is incorrect? Be specific, not pessimistic. 2-3 sentences max.`,
  firstPrinciples: `You are The First Principles Thinker. Strip away all assumptions. What problem is this ACTUALLY solving? Is this the right question? Rebuild from ground zero. 2-3 sentences max.`,
  expansionist: `You are The Expansionist. Ignore risk. What upside is being missed? What could be 10x bigger? What adjacent opportunity is hiding in this idea? 2-3 sentences max.`,
  outsider: `You are The Outsider. You have zero context about this project. What is confusing? What would a fresh person misunderstand? What's the curse of knowledge here? 2-3 sentences max.`,
  builder: `You are The Builder. Ignore theory. What are the first 3 concrete steps to actually build this? What skills and tools are required? How hard is it to ship? 2-3 sentences max.`,
};

async function askAdvisor(activeModel: string, advisor: string, title: string, desc: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: activeModel,
        prompt: `${ADVISOR_PROMPTS[advisor]}\n\nMission Title: "${title}"\nMission Description: "${desc}"\n\nYour analysis:`,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Ollama error');
    const data = await res.json();
    return (data.response || '').trim();
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`Advisor ${advisor} failed:`, err);
    throw new Error(`Advisor ${advisor} failed: ${err}`);
  }
}

async function synthesizeEnrichment(activeModel: string, title: string, desc: string, advisorOutputs: Record<string, string>): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const combined = Object.entries(advisorOutputs)
    .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
    .join('\n\n');

  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: activeModel,
        prompt: `You are a Chairman synthesizing a council's analysis of a software mission.
Based on these 5 advisor opinions, return ONLY valid JSON with no markdown or extra text:

{
  "refinedDesc": "A polished 1-2 sentence technical summary of the mission that incorporates the council's insights. Must be a direct description, not a meta-commentary.",
  "skills": ["REACT", "PYTHON", "OLLAMA"], // Max 4 concrete technical skills. DO NOT use generic phrases. Only single-word or short uppercase technologies/domains.
  "difficulty": "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
  "confidence": <integer 0-100 representing how well-defined this mission is>,
  "scopeEstimate": "e.g. 1 day / 1 week / 2-3 weeks",
  "miniPRD": {
    "problem": "1-2 sentences on the exact problem solved",
    "audience": "Target user or system",
    "solution": "What the final product looks like and does"
  },
  "verdict": "One sentence chairman verdict on this mission"
}

Mission: "${title}" — "${desc}"

Council Opinions:
${combined}`,
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
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Synthesis failed:', err);
    throw new Error('Synthesis failed');
  }
}

export async function POST(req: Request) {
  const config = await getConfig(['OLLAMA_MODEL_ADVISOR']);
  const activeModel = config['OLLAMA_MODEL_ADVISOR'] || 'dolphin-llama3';

  try {
    const { title, desc } = await req.json();
    if (!title || !desc) {
      return NextResponse.json({ error: 'Missing title or desc' }, { status: 400 });
    }

    const advisorNames = Object.keys(ADVISOR_PROMPTS);
    const advisorOutputs: Record<string, string> = {};

    // Run advisors in parallel for much faster responses
    let ollamaAvailable = true;
    
    const advisorPromises = advisorNames.map(async (advisor) => {
      try {
        const output = await askAdvisor(activeModel, advisor, title, desc);
        return { advisor, output };
      } catch {
        ollamaAvailable = false;
        return { advisor, output: `[Ollama offline — heuristic fallback for ${advisor}]*` };
      }
    });

    const results = await Promise.all(advisorPromises);
    for (const { advisor, output } of results) {
      advisorOutputs[advisor] = output;
    }

    let enrichment: any = null;

    if (ollamaAvailable) {
      try {
        enrichment = await synthesizeEnrichment(activeModel, title, desc, advisorOutputs);
      } catch {
        ollamaAvailable = false;
      }
    }

    // Heuristic fallback for enrichment if Ollama failed
    if (!enrichment) {
      const d = desc.toLowerCase();
      const skills: string[] = [];
      if (d.includes('python') || d.includes('script')) skills.push('PYTHON');
      if (d.includes('ui') || d.includes('interface') || d.includes('dashboard')) skills.push('UI/UX');
      if (d.includes('ai') || d.includes('llm') || d.includes('model')) skills.push('AI/ML');
      if (d.includes('api') || d.includes('endpoint')) skills.push('API');
      if (d.includes('data') || d.includes('database')) skills.push('DATA');
      if (skills.length === 0) skills.push('CORE');

      enrichment = {
        refinedDesc: desc + " [Heuristic fallback]*",
        skills,
        difficulty: desc.length > 100 ? 'HIGH' : 'MEDIUM',
        confidence: 40,
        scopeEstimate: '1–2 weeks',
        miniPRD: {
          problem: "Undefined problem space.",
          audience: "Unknown",
          solution: "Heuristic fallback representation of the idea.*"
        },
        verdict: 'Council unavailable (Ollama offline). Heuristic enrichment applied.*',
      };
    }

    return NextResponse.json({
      advisors: advisorOutputs,
      enrichment,
      ollamaAvailable,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
