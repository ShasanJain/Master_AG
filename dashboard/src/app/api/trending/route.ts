import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function GET() {
  const cwd = path.join(process.cwd(), '..');
  return new Promise<Response>((resolve) => {
    exec('python ops/viral_scraper.py --json', { cwd }, (error, stdout, stderr) => {
      if (error) {
        resolve(NextResponse.json({ error: stderr }, { status: 500 }));
      } else {
        try {
          // The script prints RuntimeWarning before the JSON, so grab the last line that is valid JSON
          const lines = stdout.trim().split('\n');
          const jsonLine = lines.findLast((l: string) => l.trim().startsWith('['));
          const topics = jsonLine ? JSON.parse(jsonLine) : [];
          resolve(NextResponse.json({ topics }));
        } catch {
          resolve(NextResponse.json({ error: 'Failed to parse topics', raw: stdout }, { status: 500 }));
        }
      }
    });
  });
}
