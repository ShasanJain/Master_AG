import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, name } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'GitHub URL is required' }, { status: 400 });
    }

    const coreRoot = path.resolve(process.cwd(), '..');
    const scriptPath = path.join(coreRoot, 'execution', 'import_git_skill.py');
    const embedScript = path.join(coreRoot, 'execution', 'embed_local_skills.py');

    let cmd = `python "${scriptPath}" "${url}"`;
    if (name) {
      cmd += ` --name "${name}"`;
    }

    console.log(`[GIT-IMPORT] Running: ${cmd}`);
    const { stdout, stderr } = await execAsync(cmd, { cwd: coreRoot });

    let parsedResult;
    try {
      parsedResult = JSON.parse(stdout.trim());
    } catch {
      parsedResult = { status: 'output', raw: stdout, stderr };
    }

    // Auto-embed into neural memory
    try {
      await execAsync(`python "${embedScript}"`, { cwd: coreRoot });
      console.log(`[GIT-IMPORT] Neural vector memory auto-synced.`);
    } catch (embErr) {
      console.warn(`[GIT-IMPORT] Vector sync warning:`, embErr);
    }

    return NextResponse.json(parsedResult);
  } catch (err: any) {
    console.error('[GIT-IMPORT-ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to import skill from git' },
      { status: 500 }
    );
  }
}

