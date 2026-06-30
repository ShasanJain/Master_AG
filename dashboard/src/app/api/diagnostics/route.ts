import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const scriptPath = path.resolve(process.cwd(), '../execution/run_diagnostics.py');
    const { stdout, stderr } = await execAsync(`python "${scriptPath}"`);
    
    if (stderr && !stdout) {
      console.error("Diagnostics stderr:", stderr);
      return NextResponse.json({ error: "Failed to run diagnostics" }, { status: 500 });
    }
    
    const results = JSON.parse(stdout);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Diagnostics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
