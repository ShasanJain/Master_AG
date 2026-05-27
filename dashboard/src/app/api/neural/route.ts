import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    const scriptPath = path.resolve(process.cwd(), '../execution/get_neural_map.py');
    const output = execSync(`python ${scriptPath}`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    const graph = JSON.parse(output.trim());
    return NextResponse.json(graph);
  } catch (error: any) {
    console.error("Failed to generate neural map:", error);
    return NextResponse.json({ error: 'Failed to generate neural map', details: error.message }, { status: 500 });
  }
}
