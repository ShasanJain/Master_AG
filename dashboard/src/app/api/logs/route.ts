import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

let cachedLogs: any = null;
let lastFetchedLogsTime = 0;
const CACHE_LOGS_TTL_MS = 3000;
const PYTHON_BIN = 'C:\\Users\\swaya\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';

export async function GET() {
  const now = Date.now();
  if (cachedLogs && (now - lastFetchedLogsTime < CACHE_LOGS_TTL_MS)) {
    return NextResponse.json(cachedLogs);
  }

  return new Promise<Response>((resolve) => {
    const scriptPath = path.resolve(process.cwd(), '../execution/log_manager.py');
    exec(`"${PYTHON_BIN}" "${scriptPath}" --mode read`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error("Log Manager Read Error:", error);
        resolve(NextResponse.json({ error: 'Failed to read logs via Python' }, { status: 500 }));
        return;
      }
      try {
        const logs = JSON.parse(stdout);
        cachedLogs = logs;
        lastFetchedLogsTime = now;
        resolve(NextResponse.json(logs));
      } catch (parseErr) {
        resolve(NextResponse.json({ error: 'Failed to parse python logs' }, { status: 500 }));
      }
    });
  });
}

export async function POST(request: Request) {
  try {
    const newLog = await request.json();
    return new Promise<Response>((resolve) => {
      const scriptPath = path.resolve(process.cwd(), '../execution/log_manager.py');
      const safePayload = JSON.stringify(newLog).replace(/"/g, '\\"');
      
      exec(`"${PYTHON_BIN}" "${scriptPath}" --mode write --payload "${safePayload}"`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          console.error("Log Manager Write Error:", error);
          resolve(NextResponse.json({ error: 'Failed to write log via Python' }, { status: 500 }));
          return;
        }
        try {
          const logEntry = JSON.parse(stdout);
          if (logEntry.error) {
            resolve(NextResponse.json({ error: logEntry.error }, { status: 500 }));
          } else {
            // Invalidate read cache
            cachedLogs = null;
            resolve(NextResponse.json(logEntry));
          }
        } catch (parseErr) {
          resolve(NextResponse.json({ error: 'Failed to parse write response' }, { status: 500 }));
        }
      });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
