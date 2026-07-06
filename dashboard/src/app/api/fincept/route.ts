import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';

const PYTHON_BIN = process.env.PYTHON_BIN || 'C:\\Users\\swaya\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
const BRIDGE_PATH = path.resolve(process.cwd(), '..', 'execution', 'fincept_bridge.py');

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'full';
  const ticker = searchParams.get('ticker') || 'SPY';

  return new Promise<Response>((resolve) => {
    execFile(PYTHON_BIN, [BRIDGE_PATH, '--action', action, '--ticker', ticker], { timeout: 15000 }, (err, stdout, stderr) => {
      if (err) {
        return resolve(NextResponse.json({ error: err.message, details: stderr }, { status: 500 }));
      }
      try {
        const payload = JSON.parse(stdout);
        resolve(NextResponse.json(payload));
      } catch (e) {
        resolve(NextResponse.json({ error: 'Parse failed', raw: stdout.slice(0, 500) }, { status: 500 }));
      }
    });
  });
}
