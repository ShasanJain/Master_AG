import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const cwd = path.join(process.cwd(), '..');
    const logPath = path.join(cwd, 'scratch', 'openwiki_live.log');
    const statusPath = path.join(cwd, 'scratch', 'openwiki_status.json');

    let logs = '';
    if (fs.existsSync(logPath)) {
      logs = fs.readFileSync(logPath, 'utf8');
    }

    let status = 'idle';
    if (fs.existsSync(statusPath)) {
      try {
        const statusData = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        status = statusData.status;
      } catch (e) {
        status = 'running';
      }
    }

    // Check if openwiki dir exists and get its files
    const openwikiDir = path.join(cwd, 'openwiki');
    let generatedFiles: { name: string; content: string }[] = [];

    if (fs.existsSync(openwikiDir)) {
      try {
        const files = fs.readdirSync(openwikiDir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const filePath = path.join(openwikiDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            generatedFiles.push({ name: file, content });
          }
        }
      } catch (e) {
        console.error('Error listing openwiki files:', e);
      }
    }

    return NextResponse.json({
      success: true,
      logs,
      status,
      files: generatedFiles
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
