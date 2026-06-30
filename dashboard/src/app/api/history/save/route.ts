import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { engine, profile } = await request.json();
    
    const scratchDir = path.join(process.cwd(), '..', 'scratch');
    const historyDir = path.join(scratchDir, 'history');
    
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    // Auto-cleanup unpinned old versions (older than 7 days)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const existingDirs = fs.readdirSync(historyDir);
    
    for (const dirName of existingDirs) {
      const dirPath = path.join(historyDir, dirName);
      const stat = fs.statSync(dirPath);
      
      if (stat.isDirectory()) {
        const metaPath = path.join(dirPath, 'meta.json');
        let pinned = false;
        
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            pinned = meta.pinned === true;
          } catch (e) {}
        }
        
        if (!pinned && (now - stat.mtimeMs > SEVEN_DAYS)) {
          // Delete old unpinned folder
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      }
    }

    // Create new version
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const versionDir = path.join(historyDir, `v_${timestamp}`);
    fs.mkdirSync(versionDir);

    // Copy files
    const filesToCopy = ['semantic_timeline.json', 'timings.json', 'narration.mp3'];
    for (const file of filesToCopy) {
      const src = path.join(scratchDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(versionDir, file));
      }
    }

    // Write meta.json
    const meta = {
      id: `v_${timestamp}`,
      timestamp: new Date().toISOString(),
      engine: engine || 'Unknown',
      profile: profile || 'Unknown',
      pinned: false
    };
    
    fs.writeFileSync(path.join(versionDir, 'meta.json'), JSON.stringify(meta, null, 2));

    return NextResponse.json({ success: true, version: meta });
  } catch (error) {
    console.error('History save error:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}
