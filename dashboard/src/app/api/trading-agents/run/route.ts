import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const { ticker, provider, rounds } = await request.json();
    const cwd = path.join(process.cwd(), '..');

    const cmd = `python execution/run_trading_agents.py --ticker ${ticker || 'AAPL'} --provider ${provider || 'ollama'} --rounds ${rounds || 2}`;

    return new Promise<Response>((resolve) => {
      exec(cmd, { cwd }, (error, stdout, stderr) => {
        // Read output JSON
        const outputPath = path.join(cwd, 'scratch', 'trading_agents_output.json');
        let decision = { action: 'HOLD', confidence: '50%', details: 'Fallback. Swarm default.' };
        
        try {
          if (fs.existsSync(outputPath)) {
            const fileData = fs.readFileSync(outputPath, 'utf8');
            const data = JSON.parse(fileData);
            if (data.success) {
              decision = {
                action: data.action,
                confidence: data.confidence,
                details: data.details
              };
            }
          }
        } catch (e) {
          console.error('Error reading simulation output:', e);
        }

        if (error) {
          resolve(NextResponse.json({ 
            success: false, 
            error: error.message, 
            logs: stdout + '\n' + stderr,
            decision
          }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ 
            success: true, 
            logs: stdout,
            decision
          }));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
