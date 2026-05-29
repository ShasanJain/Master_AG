import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { filePath, rotate, brightness } = await request.json();
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), '..', 'execution', 'process_media.py');
    const cwd = path.join(process.cwd(), '..');
    
    return new Promise<Response>((resolve) => {
      exec(`python execution/process_media.py --file "${filePath}" --rotate ${rotate || 0} --brightness ${brightness || 1.0}`, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Process Media Error: ${error.message}`);
          resolve(NextResponse.json({ error: error.message, details: stderr }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true, logs: stdout }));
        }
      });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Media processing failed' }, { status: 500 });
  }
}
