// Shared utility: resolves the Python executable reliably regardless of PATH
import { execFile } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Hardcoded absolute path — fallback to 'python' for cross-machine portability
const PYTHON_BIN = process.env.PYTHON_BIN || 'C:\\Users\\swaya\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
const SCRIPT_PATH = path.resolve(process.cwd(), '../execution/skill_studio_engine.py');

export function runEngine(
  subcommand: string,
  inputData: Record<string, unknown>,
  timeoutMs = 90000
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const tmpFile = path.join(os.tmpdir(), `ss_${subcommand}_${Date.now()}.json`);
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(inputData), 'utf-8');
    } catch (e) {
      return reject(new Error(`Failed to write temp file: ${e}`));
    }

    execFile(
      PYTHON_BIN,
      [SCRIPT_PATH, subcommand, '--input-file', tmpFile],
      { maxBuffer: 1024 * 1024 * 20, timeout: timeoutMs },
      (err, stdout, stderr) => {
        try { fs.unlinkSync(tmpFile); } catch {}

        if (err) {
          const detail = stderr?.slice(0, 500) || err.message;
          return reject(new Error(`Engine error (${subcommand}): ${detail}`));
        }

        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error(`Parse error: ${stdout.slice(0, 300)}`));
        }
      }
    );
  });
}
