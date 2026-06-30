import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const cwd = path.join(process.cwd(), '..');
    
    return new Promise<Response>((resolve) => {
      exec(`python execution/seo_analyzer.py --url "${url}"`, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`SEO Analyzer Error: ${error.message}`);
          
          try {
            const errorJson = JSON.parse(stdout);
            if (errorJson.error) {
               return resolve(NextResponse.json({ error: errorJson.error }, { status: 500 }));
            }
          } catch(e) {}
          
          resolve(NextResponse.json({ error: error.message, details: stderr }, { status: 500 }));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(NextResponse.json({ success: true, result }));
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError, stdout);
          resolve(NextResponse.json({ error: 'Invalid response from execution engine', details: stdout }, { status: 500 }));
        }
      });
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
