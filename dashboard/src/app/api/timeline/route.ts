import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Assuming the scratch directory is at the root of the project (Master_AG)
const TIMELINE_PATH = path.join(process.cwd(), '..', 'scratch', 'semantic_timeline.json');

export async function GET() {
  try {
    if (fs.existsSync(TIMELINE_PATH)) {
      const data = fs.readFileSync(TIMELINE_PATH, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ segments: [] }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read timeline' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    fs.writeFileSync(TIMELINE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write timeline' }, { status: 500 });
  }
}
