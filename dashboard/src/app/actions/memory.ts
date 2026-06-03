'use server';

import { execSync } from "child_process";
import path from "path";
import { revalidatePath } from "next/cache";

export async function purgeMemory(action: 'all' | 'short' | 'long' | 'id', id?: string | FormData, formData?: FormData) {
  // If no id was provided via bind, the first trailing arg is formData
  const targetId = typeof id === 'string' ? id : undefined;
  
  try {
    const scriptPath = path.resolve(process.cwd(), "../execution/vector_memory.py");
    let cmd = '';

    if (action === 'all') {
      cmd = `python ${scriptPath} purge --all`;
    } else if (action === 'short') {
      cmd = `python ${scriptPath} purge --sector episodic`;
    } else if (action === 'long') {
      cmd = `python ${scriptPath} purge --sector semantic`;
    } else if (action === 'id' && targetId) {
      cmd = `python ${scriptPath} forget ${targetId}`;
    }

    if (cmd) {
      execSync(cmd, { encoding: 'utf-8' });
    }

    revalidatePath('/memory');
  } catch (error) {
    console.error("Purge error:", error);
  }
}

export async function syncSystemMemory() {
  try {
    const scriptPath = path.resolve(process.cwd(), "../execution/sync_neural_memory.py");
    const { execFileSync } = require('child_process');
    // Using execFileSync blocks the Node thread during sync, but we want it to wait and return results
    const output = execFileSync('python', [scriptPath], { encoding: 'utf-8' });
    revalidatePath('/memory');
    revalidatePath('/neural');
    return { success: true, message: output.trim() };
  } catch (error: any) {
    console.error("Sync error:", error);
    return { success: false, message: error.message || "Failed to synchronize memory." };
  }
}
