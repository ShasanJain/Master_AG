import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const { ticker, provider, rounds, model } = await request.json();
    const cwd = path.join(process.cwd(), '..');

    const logPath = path.join(cwd, 'scratch', 'trading_agents_live.log');
    const statusPath = path.join(cwd, 'scratch', 'trading_agents_status.json');
    const outputPath = path.join(cwd, 'scratch', 'trading_agents_output.json');

    // Clean up old artifacts
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch(e) {}
    }

    // Write initial status and empty log file
    fs.writeFileSync(statusPath, JSON.stringify({ status: 'running' }));
    fs.writeFileSync(logPath, '');

    const args = [
      '-u',
      'execution/run_trading_agents.py',
      '--ticker', ticker || 'AAPL',
      '--provider', provider || 'ollama',
      '--rounds', String(rounds || 1),
    ];

    if (model) {
      args.push('--model', model);
    }

    // Run with only the selected active analyst (market) for fast dashboard execution
    args.push('--analysts', 'market');

    const child = spawn('python', args, {
      cwd,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    child.stdout.on('data', (data) => {
      fs.appendFileSync(logPath, data.toString());
    });

    child.stderr.on('data', (data) => {
      fs.appendFileSync(logPath, data.toString());
    });

    child.on('close', (code) => {
      let decision = null;
      if (fs.existsSync(outputPath)) {
        try {
          const raw = fs.readFileSync(outputPath, 'utf8');
          const data = JSON.parse(raw);
          if (data.success) {
            decision = {
              action: data.action,
              confidence: data.confidence,
              details: data.details
            };
          }
        } catch (e) {
          console.error('Error reading simulation output:', e);
        }
      }

      fs.writeFileSync(statusPath, JSON.stringify({
        status: code === 0 ? 'completed' : 'error',
        code,
        decision
      }));
    });

    return NextResponse.json({
      success: true,
      message: 'Swarm simulation launched successfully.'
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
