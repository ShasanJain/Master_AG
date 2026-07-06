import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const cwd = path.join(process.cwd(), '..');
    const logPath = path.join(cwd, 'scratch', 'trading_agents_live.log');
    const statusPath = path.join(cwd, 'scratch', 'trading_agents_status.json');

    let logs = '';
    if (fs.existsSync(logPath)) {
      logs = fs.readFileSync(logPath, 'utf8');
    }

    let status = 'idle';
    let decision = null;
    if (fs.existsSync(statusPath)) {
      try {
        const statusData = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        status = statusData.status;
        decision = statusData.decision;
      } catch (e) {
        status = 'running';
      }
    }

    return NextResponse.json({
      success: true,
      logs,
      status,
      decision
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
