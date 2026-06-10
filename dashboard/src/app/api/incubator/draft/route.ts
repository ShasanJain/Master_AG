import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    return new Promise<Response>((resolve) => {
      const scriptPath = path.resolve(process.cwd(), '../execution/council_engine.py');
      // Escape prompt for shell
      const safePrompt = prompt.replace(/"/g, '\\"');
      
      exec(`python "${scriptPath}" --draft "${safePrompt}"`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          console.error("Draft Engine Error:", error);
          resolve(NextResponse.json({ error: "Failed to draft mission" }, { status: 500 }));
          return;
        }
        
        try {
          const missionData = JSON.parse(stdout);
          resolve(NextResponse.json(missionData));
        } catch (parseErr) {
          console.error("Draft parse error:", parseErr, stdout);
          resolve(NextResponse.json({ error: "Failed to parse draft" }, { status: 500 }));
        }
      });
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
