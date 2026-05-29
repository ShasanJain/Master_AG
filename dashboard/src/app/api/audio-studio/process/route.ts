import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { inputFile, volumeChange } = body;

    if (!inputFile) {
      return NextResponse.json({ error: 'Input file is required' }, { status: 400 });
    }

    const cwd = path.join(process.cwd(), '..');
    const scratchDir = path.join(cwd, 'scratch');
    if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
    }

    if (inputFile.startsWith('http://') || inputFile.startsWith('https://')) {
      const tempFilename = `download_${Date.now()}.mp3`;
      const tempPath = path.join(scratchDir, tempFilename);
      const res = await fetch(inputFile);
      if (!res.ok) throw new Error(`Failed to download URL: ${res.statusText}`);
      const arrayBuffer = await res.arrayBuffer();
      fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));
      inputFile = `scratch/${tempFilename}`;
    }

    const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(cwd, inputFile);
    

    
    const outputFile = path.join(scratchDir, `processed_${Date.now()}.wav`);
    
    return new Promise<Response>((resolve) => {
      const cmd = `python execution/audio_engine.py --input "${inputPath}" --output "${outputFile}" --volume ${volumeChange || 0}`;
      exec(cmd, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Audio Studio Error: ${error.message}`);
          
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
          // Return relative path to scratch for frontend mapping
          resolve(NextResponse.json({ success: true, result: { ...result, output_file: outputFile } }));
        } catch (parseError) {
          resolve(NextResponse.json({ error: 'Invalid response from audio engine', details: stdout }, { status: 500 }));
        }
      });
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
