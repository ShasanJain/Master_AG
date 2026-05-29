import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { profile } = await request.json();
    const scriptPath = path.join(process.cwd(), '..', 'execution', 'moviepy_renderer.py');
    const cwd = path.join(process.cwd(), '..');
    
    return new Promise<Response>((resolve) => {
      exec(`python execution/moviepy_renderer.py --profile ${profile || 'FastViral'}`, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Render Error: ${error.message}`);
          resolve(NextResponse.json({ error: error.message, details: stderr }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true, logs: stdout }));
        }
      });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Render invocation failed' }, { status: 500 });
  }
}
