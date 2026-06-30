import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Promise<Response>((resolve) => {
    const scriptPath = path.resolve(process.cwd(), '../execution/token_tracker.py');
    exec(`python "${scriptPath}" --json`, (error, stdout, stderr) => {
      if (error) {
        console.error("Token Tracker Engine Error:", error);
        resolve(NextResponse.json({ today: [], total: [], history: [] }, { status: 500 }));
        return;
      }
      
      try {
        const data = JSON.parse(stdout);
        resolve(NextResponse.json(data));
      } catch (parseErr) {
        console.error("Token API Error:", parseErr);
        resolve(NextResponse.json({ error: 'Failed to parse token usage.' }, { status: 500 }));
      }
    });
  });
}
