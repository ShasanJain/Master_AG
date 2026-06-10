import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Promise<Response>((resolve) => {
    const scriptPath = path.resolve(process.cwd(), '../execution/stats_engine.py');
    exec(`python "${scriptPath}" --json`, (error, stdout, stderr) => {
      if (error) {
        console.error("Stats Engine Error:", error);
        resolve(NextResponse.json({
          registry: 0,
          missions: 0,
          efficiency: 0,
          uptime: "0",
          topSkills: []
        }, { status: 500 }));
        return;
      }
      
      try {
        const stats = JSON.parse(stdout);
        resolve(NextResponse.json(stats));
      } catch (parseErr) {
        console.error("Stats parse error:", parseErr, stdout);
        resolve(NextResponse.json({
          registry: 0,
          missions: 0,
          efficiency: 0,
          uptime: "0",
          topSkills: []
        }, { status: 500 }));
      }
    });
  });
}
