import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';

function getOpenWikiEnvPath() {
  return path.join(os.homedir(), '.openwiki', '.env');
}

export async function GET() {
  try {
    const envPath = getOpenWikiEnvPath();
    const config: Record<string, string> = {
      OPENWIKI_PROVIDER: 'openai',
      OPENWIKI_MODEL_ID: '',
      OPENAI_API_KEY: '',
      ANTHROPIC_API_KEY: '',
      OPENROUTER_API_KEY: '',
      FIREWORKS_API_KEY: '',
      OPENAI_COMPATIBLE_API_KEY: '',
      ANTHROPIC_BASE_URL: '',
      OPENAI_COMPATIBLE_BASE_URL: '',
      LANGCHAIN_API_KEY: '',
    };

    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const index = trimmed.indexOf('=');
          const k = trimmed.substring(0, index).trim();
          const v = trimmed.substring(index + 1).trim();
          config[k] = v;
        }
      }
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const envPath = getOpenWikiEnvPath();
    const dir = path.dirname(envPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Load existing
    const config: Record<string, string> = {};
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const index = trimmed.indexOf('=');
          const k = trimmed.substring(0, index).trim();
          const v = trimmed.substring(index + 1).trim();
          config[k] = v;
        }
      }
    }

    // Merge new body properties
    Object.assign(config, body);

    // Save
    const lines = Object.entries(config).map(([k, v]) => `${k}=${v}`);
    fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf-8');

    return NextResponse.json({ success: true, message: 'Configuration saved successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
