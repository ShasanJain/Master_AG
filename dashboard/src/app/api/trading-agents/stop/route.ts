import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST() {
  try {
    // Kill any running python process executing run_trading_agents.py
    const cmd = 'wmic process where "CommandLine like \'%run_trading_agents.py%\'" call terminate';
    
    return new Promise<Response>((resolve) => {
      exec(cmd, (error, stdout, stderr) => {
        resolve(NextResponse.json({ 
          success: true, 
          message: 'Termination command sent.',
          logs: stdout + '\n' + stderr
        }));
      });
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
