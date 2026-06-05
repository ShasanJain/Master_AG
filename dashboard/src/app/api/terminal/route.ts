import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logsPath = path.resolve(process.cwd(), 'data', 'mission_logs.json');
    const logsData = JSON.parse(fs.readFileSync(logsPath, 'utf-8'));
    
    // Simulate raw terminal trace from JSON data
    let terminalOutput = "Jack-Prime OS v2.0.4 [Terminal Emulation]\n==============================================\n";
    
    logsData.slice(0, 15).forEach((log: any) => {
      terminalOutput += `[${log.timestamp}] [${log.agent}] EXEC ${log.skill} -> ${log.status}\n`;
      if (log.details) {
        try {
          const det = JSON.parse(log.details);
          for (const [k, v] of Object.entries(det)) {
            terminalOutput += `  ├─ ${k}: ${v}\n`;
          }
        } catch {
          terminalOutput += `  ├─ ${log.details}\n`;
        }
      }
    });
    terminalOutput += "\n[Awaiting next instruction...]\n";
    
    return NextResponse.json({ output: terminalOutput });
  } catch (err: any) {
    return NextResponse.json({ output: `Error connecting to terminal socket: ${err.message}` });
  }
}
