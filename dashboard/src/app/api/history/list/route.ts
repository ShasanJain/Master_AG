import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const historyDir = path.join(process.cwd(), '..', 'scratch', 'history');
    
    if (!fs.existsSync(historyDir)) {
      return NextResponse.json({ versions: [] });
    }

    const dirs = fs.readdirSync(historyDir);
    const versions = [];
    
    for (const dirName of dirs) {
      const dirPath = path.join(historyDir, dirName);
      if (fs.statSync(dirPath).isDirectory()) {
        const metaPath = path.join(dirPath, 'meta.json');
        if (fs.existsSync(metaPath)) {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          versions.push(meta);
        }
      }
    }
    
    // Sort by timestamp descending
    versions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('History list error:', error);
    return NextResponse.json({ error: 'Failed to list history' }, { status: 500 });
  }
}
