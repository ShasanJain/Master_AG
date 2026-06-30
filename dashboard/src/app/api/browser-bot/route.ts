import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url') || 'https://news.ycombinator.com';
  const scriptType = req.nextUrl.searchParams.get('script') || 'generic';

  const encoder = new TextEncoder();

  // Re-define stream correctly
  const mainStream = new ReadableStream({
    start(controller) {
      let pythonProcess;
      const cwd = path.join(process.cwd(), '..');

      if (scriptType === 'e2e') {
        const executionPath = path.join(cwd, 'execution', 'e2e_integration_test.py');
        pythonProcess = spawn('python', ['-u', executionPath], { cwd });
      } else {
        const executionPath = path.join(cwd, 'execution', 'browser_capture.py');
        pythonProcess = spawn('python', ['-u', executionPath, urlParam], { cwd });
      }

      controller.enqueue(encoder.encode(`data: [SYSTEM] Initiating Browser Bot Session... (Script: ${scriptType})\n\n`));

      pythonProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: ${line}\n\n`));
          }
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: [WARN] ${line}\n\n`));
          }
        }
      });

      pythonProcess.on('close', (code) => {
        controller.enqueue(encoder.encode(`data: [SYSTEM] Session complete. (Exit Code: ${code})\n\n`));
        controller.close();
      });

      pythonProcess.on('error', (err) => {
        controller.enqueue(encoder.encode(`data: [ERROR] Spawn failed: ${err.message}\n\n`));
        controller.close();
      });

      req.signal.addEventListener('abort', () => {
        pythonProcess.kill();
        controller.close();
      });
    }
  });

  return new Response(mainStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
