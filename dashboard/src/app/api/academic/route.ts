import { NextRequest, NextResponse } from 'next/server';
import { spawn, execFile } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

const PYTHON_BIN = 'C:\\Users\\swaya\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'search';
  const query = searchParams.get('query') || '';
  const source = searchParams.get('source') || 'all';
  const maxResults = searchParams.get('max_results') || '10';
  const id = searchParams.get('id') || '';
  const db = searchParams.get('db') || 'PMC';

  const scriptPath = path.join(process.cwd(), '..', 'execution', 'academic_search.py');

  // Handle citations, references, fulltext directly (non-streaming)
  if (action !== 'search') {
    return new Promise<NextResponse>((resolve) => {
      const args = [scriptPath, '--action', action, '--id', id, '--db', db];
      execFile(PYTHON_BIN, args, (err, stdout, stderr) => {
        if (err) {
          return resolve(NextResponse.json({ error: err.message, details: stderr }, { status: 500 }));
        }
        if (action === 'fulltext') {
          return resolve(new NextResponse(stdout, { headers: { 'Content-Type': 'text/plain' } }));
        }
        try {
          return resolve(NextResponse.json(JSON.parse(stdout)));
        } catch {
          return resolve(NextResponse.json({ error: 'Failed to parse JSON response', raw: stdout }, { status: 500 }));
        }
      });
    });
  }

  // Handle search (streaming SSE)
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const proc = spawn(PYTHON_BIN, [
        scriptPath,
        '--action', 'search',
        '--query', query,
        '--source', source,
        '--max_results', maxResults,
      ]);

      let buffer = '';

      proc.stdout.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('RESULT:')) {
            send(trimmed);
          } else if (trimmed === 'SEARCH_COMPLETE') {
            send('SEARCH_COMPLETE');
          } else {
            send(`LOG:${trimmed}`);
          }
        }
      });

      proc.stderr.on('data', (chunk: Buffer) => {
        send(`LOG:[stderr] ${chunk.toString().trim()}`);
      });

      proc.on('close', (code: number | null) => {
        send(`LOG:Process exited with code ${code}`);
        send('DONE');
        controller.close();
      });

      proc.on('error', (err: Error) => {
        send(`LOG:[ERROR] Failed to start process: ${err.message}`);
        send('DONE');
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
