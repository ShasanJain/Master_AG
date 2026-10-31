import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { server, x, y, radius, type } = await request.json();

    const serverVal = server || 'ts31.x3.international.travian.com';
    const xVal = typeof x === 'number' ? x : parseInt(x) || 0;
    const yVal = typeof y === 'number' ? y : parseInt(y) || 0;
    const radiusVal = typeof radius === 'number' ? radius : parseInt(radius) || 40;
    const typeVal = type || 'both';

    const workspaceRoot = 'c:\\Users\\swaya\\OneDrive\\Desktop\\Master_AG';
    const pythonScript = path.join(workspaceRoot, 'execution', 'find_croppers.py');

    const cmd = `python "${pythonScript}" --server "${serverVal}" --x ${xVal} --y ${yVal} --radius ${radiusVal} --type "${typeVal}"`;
    
    await execPromise(cmd, { cwd: workspaceRoot });

    const jsonPath = path.join(workspaceRoot, '.tmp', 'croppers_ranked.json');
    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, 'utf8');
      const data = JSON.parse(content);
      return NextResponse.json({ success: true, croppers: data });
    } else {
      return NextResponse.json({ success: false, error: 'Output JSON file not generated' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in find-croppers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
