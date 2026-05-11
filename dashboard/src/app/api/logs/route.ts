import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOGS_FILE = path.join(process.cwd(), 'data', 'mission_logs.json');

export async function GET() {
  try {
    if (!fs.existsSync(LOGS_FILE)) {
      return NextResponse.json([]);
    }
    const data = fs.readFileSync(LOGS_FILE, 'utf8');
    const logs = JSON.parse(data);
    return NextResponse.json(logs.reverse()); // Show newest first
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newLog = await request.json();
    let logs = [];
    
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, 'utf8');
      logs = JSON.parse(data);
    }
    
    const logEntry = {
      id: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      ...newLog
    };
    
    logs.push(logEntry);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
    
    return NextResponse.json(logEntry);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 });
  }
}
