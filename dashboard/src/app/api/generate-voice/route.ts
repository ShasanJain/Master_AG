import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { engine, mode, topic, viralTopic, script } = await request.json();
    
    const cwd = path.join(process.cwd(), '..');
    
    let scriptGenCmd = 'python execution/script_generator.py';
    let brollTopic = 'technology';

    if (mode === 'script' && script) {
      // User provided exact script - pass it verbatim
      scriptGenCmd += ` --script "${script.replace(/"/g, '\\"')}"`;
      brollTopic = script.substring(0, 50).replace(/"/g, '\\"');
    } else if (mode === 'topic' && topic) {
      // User entered a custom topic - social search + hook wrapping
      scriptGenCmd += ` --topic "${topic.replace(/"/g, '\\"')}"`;
      brollTopic = topic.replace(/"/g, '\\"');
    } else if (mode === 'auto' && viralTopic) {
      // User selected a trending Reddit post title - use it directly, skip social search
      scriptGenCmd += ` --viral-topic "${viralTopic.replace(/"/g, '\\"')}"`;
      brollTopic = viralTopic.split(' ').slice(0, 3).join(' ').replace(/"/g, '\\"');
    }
    // else: auto with no selection - script_generator falls back to scraping itself
    
    const cmd = `${scriptGenCmd} && python ops/broll_fetcher.py --topic "${brollTopic}" && python execution/video_brain_tts.py --file ./scratch/viral_script.txt --engine ${engine || 'edge'} && python execution/video_brain_semantic.py --timings ./scratch/timings.json --outdir ./scratch`;
    
    return new Promise<Response>((resolve) => {
      exec(cmd, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Voice Gen Error: ${error.message}`);
          resolve(NextResponse.json({ error: error.message, details: stderr }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true, logs: stdout }));
        }
      });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Voice generation failed' }, { status: 500 });
  }
}
