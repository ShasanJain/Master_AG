import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const { provider, apiKey, modelId, baseUrl, langsmithKey, update, prompt } = await request.json();
    const cwd = path.join(process.cwd(), '..');

    const logPath = path.join(cwd, 'scratch', 'openwiki_live.log');
    const statusPath = path.join(cwd, 'scratch', 'openwiki_status.json');

    // Write initial status and empty log file
    fs.writeFileSync(statusPath, JSON.stringify({ status: 'running' }));
    fs.writeFileSync(logPath, '');

    const args = [
      '-u',
      'execution/run_openwiki.py',
      '--provider', provider || 'openai',
      '--api-key', apiKey || '',
    ];

    if (modelId) {
      args.push('--model-id', modelId);
    }
    if (baseUrl) {
      args.push('--base-url', baseUrl);
    }
    if (langsmithKey) {
      args.push('--langsmith-key', langsmithKey);
    }
    if (update) {
      args.push('--update');
    }
    if (prompt) {
      args.push('--prompt', prompt);
    }

    const child = spawn('python', args, {
      cwd,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    child.stdout.on('data', (data) => {
      fs.appendFileSync(logPath, data.toString());
    });

    child.stderr.on('data', (data) => {
      fs.appendFileSync(logPath, data.toString());
    });

    child.on('close', (code) => {
      fs.writeFileSync(statusPath, JSON.stringify({
        status: code === 0 ? 'completed' : 'error',
        code
      }));
    });

    return NextResponse.json({
      success: true,
      message: 'OpenWiki task initiated successfully.'
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
