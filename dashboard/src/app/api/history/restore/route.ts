import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Version ID is required' }, { status: 400 });

    const scratchDir = path.join(process.cwd(), '..', 'scratch');
    const versionDir = path.join(scratchDir, 'history', id);
    
    if (!fs.existsSync(versionDir)) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    const filesToCopy = ['semantic_timeline.json', 'timings.json', 'narration.mp3'];
    for (const file of filesToCopy) {
      const src = path.join(versionDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(scratchDir, file));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('History restore error:', error);
    return NextResponse.json({ error: 'Failed to restore history' }, { status: 500 });
  }
}
