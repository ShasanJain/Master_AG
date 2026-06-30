import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const scriptPath = path.resolve(process.cwd(), '../execution/get_neural_map.py');
    const { stdout } = await execAsync(`python "${scriptPath}"`, { maxBuffer: 10 * 1024 * 1024 });
    const jsonStr = stdout.substring(stdout.indexOf('{'));
    const graph = JSON.parse(jsonStr);
    return NextResponse.json(graph);
  } catch (error: any) {
    console.error("Failed to generate neural map:", error);
    return NextResponse.json({ error: 'Failed to generate neural map', details: error.message }, { status: 500 });
  }
}
