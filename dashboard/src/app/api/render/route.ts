import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { profile, enableAvatar, avatarImagePath } = await request.json();
    const cwd = path.join(process.cwd(), '..');
    
    let cmd = `python execution/moviepy_renderer.py --profile ${profile || 'FastViral'}`;
    
    if (enableAvatar && avatarImagePath) {
        // If the path is absolute from the API, we need to map it properly or assume the script knows how to handle it.
        // Wait, filePath from /api/upload returns the absolute path to the asset.
        cmd = `python execution/generate_avatar_ai.py --image "${avatarImagePath}" --audio ./scratch/narration.mp3 --outdir ./scratch --stem avatar_output && python execution/moviepy_renderer.py --profile ${profile || 'FastViral'} --avatar ./scratch/avatar_output.mp4`;
    }
    
    return new Promise<Response>((resolve) => {
      exec(cmd, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Render Error: ${error.message}`);
          resolve(NextResponse.json({ error: error.message, details: stderr }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true, logs: stdout }));
        }
      });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Render invocation failed' }, { status: 500 });
  }
}
