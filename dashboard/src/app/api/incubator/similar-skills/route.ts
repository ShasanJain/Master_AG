import { NextResponse } from 'next/server';
import { getConfig } from '@/app/actions/config';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const TIMEOUT_MS = 60000;

const VAULT_SKILLS = [
  { title: "writing-skills", desc: "High-Density BLUF Communication for executive reports.", category: "CORE" },
  { title: "find-skills", desc: "Deep semantic search across the industrial module registry.", category: "CORE" },
  { title: "organize-skills", desc: "Structural categorization of cognitive modules.", category: "CORE" },
  { title: "caveman-protocol", desc: "Ultra-compressed token-saving communication protocol.", category: "CORE" },
  { title: "using-superpowers", desc: "Industrial agentic tool-use heuristics.", category: "CORE" },
  { title: "security-review", desc: "Hardened audit trail for vulnerability detection in mission code.", category: "SRE" },
  { title: "systematic-debugging", desc: "Scientific method approach to resolving complex state bugs.", category: "SRE" },
  { title: "qa-protocol", desc: "CI/CD Verification: LINT + BUILD + TEST industrial audit.", category: "SRE" },
  { title: "task-scheduler", desc: "Industrial background cron engine for persistent missions.", category: "AUTOMATION" },
  { title: "doc-coauthoring", desc: "Real-time collaborative documentation generation.", category: "AUTOMATION" },
  { title: "postgres-dba", desc: "Deep Postgres management and performance tuning.", category: "AUTOMATION" },
  { title: "design-audit", desc: "UX & Accessibility verification using premium design tokens.", category: "DESIGN" },
  { title: "figma-connect", desc: "Direct synchronization between Figma designs and code components.", category: "DESIGN" },
  { title: "canvas-design", desc: "Interactive canvas-based layout generation engine.", category: "DESIGN" },
  { title: "prd-to-plan", desc: "Transform business requirements into technical implementation plans.", category: "PLANNING" },
  { title: "brainstorming", desc: "Divergent thinking engine for architectural creative sessions.", category: "PLANNING" },
  { title: "writing-plans", desc: "High-fidelity technical planning and SOP generation.", category: "PLANNING" },
  { title: "deploy-vercel", desc: "Production-ready deployment orchestrator for Vercel.", category: "DEV" },
  { title: "scaffold-exercises", desc: "Automatic generation of unit and integration test suites.", category: "DEV" },
  { title: "triage-issue", desc: "High-speed GitHub issue categorization and prioritization.", category: "DEV" },
  { title: "seo-analyzer", desc: "Live page auditing, semantic structure mapping, and AI search (GEO) optimization engine.", category: "MARKETING" },
];

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

    const vaultContext = VAULT_SKILLS.map(s => `- ${s.title} (${s.category}): ${s.desc}`).join('\n');

    const prompt = `You are a cognitive architecture analyst managing a local skills vault. 
Given the user's new mission idea, identify the top 3 most similar or overlapping skills ALREADY in our vault.

New Mission: "${title}"
Description: "${desc}"
Current Skills/Tags: ${(tags || []).join(', ')}

Available Skills in Vault:
${vaultContext}

Analyze the overlap. If we need a new skill, or if an existing skill just needs modification, explain that.
Return this exact JSON structure:
{
  "matches": [
    {
      "name": "Skill Title from Vault",
      "category": "Category from Vault",
      "similarity": 85,
      "gap": "One sentence: how it overlaps and what is missing.",
      "action": "USE | MODIFY | CREATE_NEW"
    }
  ]
}

Only include up to 3 matches. Respond ONLY with valid JSON:`;

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

      return NextResponse.json({ matches: parsed.matches || [], ollamaAvailable: true });
    } catch {
      clearTimeout(timeoutId);
      // Heuristic fallback
      return NextResponse.json({
        ollamaAvailable: false,
        matches: [
          { name: 'brainstorming*', category: 'PLANNING', similarity: 60, gap: 'Shares divergent thinking features, could be extended.', action: 'MODIFY' },
          { name: 'writing-plans*', category: 'PLANNING', similarity: 50, gap: 'Has overlap in text generation, but lacks the specific context.', action: 'USE' },
        ]
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
