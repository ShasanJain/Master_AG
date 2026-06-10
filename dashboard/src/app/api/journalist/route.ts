import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Force Node.js runtime instead of Edge to support child_process
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get('topic');
  if (!topic) {
    return new Response('Missing topic', { status: 400 });
  }

  // Set up Server-Sent Events stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Find the absolute path to the execution folder which is up one level from the dashboard
      const executionPath = path.join(process.cwd(), '..', 'execution', 'hackathon_pipeline.py');
      
      // Use -u to force unbuffered output so we get live logs instantly
      const pythonProcess = spawn('python', ['-u', executionPath, topic], {
        cwd: path.join(process.cwd(), '..')
      });

      // Send initial connection event
      controller.enqueue(encoder.encode(`data: [SYSTEM] Telemetry link established for topic: ${topic}\n\n`));

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
        controller.enqueue(encoder.encode(`data: [SYSTEM] Process exited with code ${code}\n\n`));
        controller.close();
      });

      pythonProcess.on('error', (err) => {
        controller.enqueue(encoder.encode(`data: [ERROR] Failed to start Python process: ${err.message}\n\n`));
        controller.close();
      });
      
      // Handle client disconnects to kill the python process
      req.signal.addEventListener('abort', () => {
        pythonProcess.kill();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
