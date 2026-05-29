import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const audioPath = path.join(process.cwd(), '..', 'scratch', 'narration.mp3');
    if (!fs.existsSync(audioPath)) {
      return new NextResponse('Audio not found', { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(audioPath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fileBuffer.length.toString()
      }
    });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
