import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { title, desc } = await req.json();
    if (!title || !desc) {
      return NextResponse.json({ error: 'Missing title or desc' }, { status: 400 });
    }

    return new Promise<Response>((resolve) => {
      const scriptPath = path.resolve(process.cwd(), '../execution/council_engine.py');
      const safeTitle = title.replace(/"/g, '\\"');
      const safeDesc = desc.replace(/"/g, '\\"');
      
      exec(`python "${scriptPath}" --council-title "${safeTitle}" --council-desc "${safeDesc}"`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          console.error("Council Engine Error:", error);
          resolve(NextResponse.json({ error: "Failed to run council" }, { status: 500 }));
          return;
        }
        
        try {
          const councilData = JSON.parse(stdout);
          resolve(NextResponse.json(councilData));
        } catch (parseErr) {
          console.error("Council parse error:", parseErr, stdout);
          resolve(NextResponse.json({ error: "Failed to parse council data" }, { status: 500 }));
        }
      });
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
