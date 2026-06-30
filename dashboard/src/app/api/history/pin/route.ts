import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Version ID is required' }, { status: 400 });

    const metaPath = path.join(process.cwd(), '..', 'scratch', 'history', id, 'meta.json');
    
    if (!fs.existsSync(metaPath)) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    meta.pinned = !meta.pinned; // Toggle pin state
    
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

    return NextResponse.json({ success: true, pinned: meta.pinned });
  } catch (error) {
    console.error('History pin error:', error);
    return NextResponse.json({ error: 'Failed to pin history' }, { status: 500 });
  }
}
