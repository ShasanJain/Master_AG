import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Promise<Response>((resolve) => {
    const scriptPath = path.resolve(process.cwd(), '../execution/log_manager.py');
    exec(`python "${scriptPath}" --mode terminal`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error("Terminal Manager Error:", error);
        resolve(NextResponse.json({ output: `Error executing Python terminal manager: ${error.message}` }));
        return;
      }
      try {
        const result = JSON.parse(stdout);
        resolve(NextResponse.json(result));
      } catch (parseErr) {
        resolve(NextResponse.json({ output: `Error parsing terminal output: ${parseErr}\n\nRaw: ${stdout}` }));
      }
    });
  });
}
