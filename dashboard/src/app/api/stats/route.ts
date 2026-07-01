import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

let cachedStats: any = null;
let lastFetchedTime = 0;
const CACHE_TTL_MS = 5000; // Cache telemetry for 5 seconds

export async function GET() {
  const now = Date.now();
  if (cachedStats && (now - lastFetchedTime < CACHE_TTL_MS)) {
    return NextResponse.json(cachedStats);
  }

  return new Promise<Response>((resolve) => {
    const scriptPath = path.resolve(process.cwd(), '../execution/stats_engine.py');
    const PYTHON_BIN = 'C:\\Users\\swaya\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
    
    exec(`"${PYTHON_BIN}" "${scriptPath}" --json`, (error, stdout, stderr) => {
      if (error) {
        console.error("Stats Engine Error:", error);
        resolve(NextResponse.json({
          registry: 0,
          missions: 0,
          efficiency: 0,
          uptime: "0",
          topSkills: [],
          memoryNodes: 0
        }, { status: 500 }));
        return;
      }
      
      try {
        const stats = JSON.parse(stdout);
        cachedStats = stats;
        lastFetchedTime = now;
        resolve(NextResponse.json(stats));
      } catch (parseErr) {
        console.error("Stats parse error:", parseErr, stdout);
        resolve(NextResponse.json({
          registry: 0,
          missions: 0,
          efficiency: 0,
          uptime: "0",
          topSkills: [],
          memoryNodes: 0
        }, { status: 500 }));
      }
    });
  });
}
