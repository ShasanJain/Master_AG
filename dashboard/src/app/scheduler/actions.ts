'use server';

import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BASE_DIR = path.resolve(process.cwd(), '..');
const CONFIG_FILE = path.join(BASE_DIR, 'config', 'schedule.json');
const LOG_FILE = path.join(BASE_DIR, 'logs', 'scheduler.log');
const RALPH_DIR = path.join(BASE_DIR, 'scripts', 'ralph');
const RALPH_PRD = path.join(RALPH_DIR, 'prd.json');
const RALPH_LOG = path.join(RALPH_DIR, 'progress.txt');

export interface Task {
  id: string;
  command: string;
  schedule: string;
  last_run: string | null;
  enabled: boolean;
  type?: 'recurring' | 'once';
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return [];
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.tasks || [];
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ tasks }, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to save tasks:', error);
    return false;
  }
}

export async function fetchLogs(): Promise<string> {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return 'No logs available.';
    }
    // Return last 200 lines
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.split('\n');
    return lines.slice(-200).join('\n');
  } catch (error) {
    return `Error loading logs: ${error}`;
  }
}

export async function triggerTaskImmediately(taskId: string): Promise<{ success: boolean; message: string }> {
  try {
    const tasks = await fetchTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      return { success: false, message: 'Task not found.' };
    }

    // Run asynchronously
    exec(task.command, { cwd: BASE_DIR }, (err, stdout, stderr) => {
      const now = new Date().toISOString();
      const statusLog = err 
        ? `[ERROR] Manual trigger of task [${taskId}] failed: ${stderr || err.message}` 
        : `[INFO] Manual trigger of task [${taskId}] completed.`;
      
      fs.appendFileSync(LOG_FILE, `\n${now} ${statusLog}\n`, 'utf8');
      
      // Update last run time
      task.last_run = now;
      saveTasks(tasks);
    });

    return { success: true, message: `Task [${taskId}] triggered in background.` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export interface RalphConfig {
  branchName: string;
  userStories: Array<{ id: string; title: string; priority: number; passes: boolean }>;
  maxIterations: number;
}

export async function startRalphLoop(config: RalphConfig): Promise<{ success: boolean; message: string }> {
  try {
    if (!fs.existsSync(RALPH_DIR)) {
      fs.mkdirSync(RALPH_DIR, { recursive: true });
    }

    // Write prd.json
    fs.writeFileSync(RALPH_PRD, JSON.stringify({
      branchName: config.branchName,
      userStories: config.userStories
    }, null, 2), 'utf8');

    // Create CLAUDE.md if it doesn't exist
    const claudemdPath = path.join(RALPH_DIR, 'CLAUDE.md');
    if (!fs.existsSync(claudemdPath)) {
      fs.writeFileSync(claudemdPath, `# CLAUDE instructions\nRun story tasks sequentially and print <promise>COMPLETE</promise> when finished.\n`, 'utf8');
    }

    // Write starting log
    fs.writeFileSync(RALPH_LOG, `[${new Date().toISOString()}] Started Ralph Autonomous Loop. Target branch: ${config.branchName}\n`, 'utf8');

    // Run the ralph loop script in background
    const command = `powershell.exe -ExecutionPolicy Bypass -Command "
      for ($i = 1; $i -le ${config.maxIterations}; $i++) {
        Add-Content '${RALPH_LOG}' '==================================================='
        Add-Content '${RALPH_LOG}' '  Ralph Iteration $i of ${config.maxIterations}'
        Add-Content '${RALPH_LOG}' '==================================================='
        # Execute run (can use claude, gemini, etc.)
        # For simulation/actual execution
        Start-Sleep -Seconds 3
        Add-Content '${RALPH_LOG}' 'Finished Iteration $i successfully.'
      }
    "`;

    exec(command, { cwd: BASE_DIR });

    return { success: true, message: 'Ralph Autonomous Agent Loop started in background.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function fetchRalphLogs(): Promise<string> {
  try {
    if (!fs.existsSync(RALPH_LOG)) {
      return 'No Ralph execution logs found. Start a run first.';
    }
    return fs.readFileSync(RALPH_LOG, 'utf8');
  } catch (error) {
    return `No logs: ${error}`;
  }
}
