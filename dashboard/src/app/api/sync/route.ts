import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST() {
  const scriptPath = path.join(process.cwd(), '..', 'execution', 'sync_neural_memory.py');
  
  return new Promise<NextResponse>((resolve) => {
    // Fire and forget, or wait for completion. Since it's a long job, we should ideally stream or return immediately.
    // However, for 1-click sync, returning a triggered status is fine, or we can await it if it's fast. 
    // Wait, since we are directly reading the filesystem now (not using DeepLake), it might be faster if skills are already embedded.
    // We will execute and return immediately so the UI doesn't hang for 5 minutes.
    
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing sync: ${error.message}`);
      }
      console.log(`Sync stdout: ${stdout}`);
      console.error(`Sync stderr: ${stderr}`);
    });

    resolve(NextResponse.json({ status: 'SUCCESS', message: 'Synchronization sequence initiated.' }));
  });
}
