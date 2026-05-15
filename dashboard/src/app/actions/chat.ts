'use server';

import { execSync } from "child_process";
import path from "path";
import { getConfig } from "./config";

const VM_PATH = path.resolve(process.cwd(), "../execution/vector_memory.py");

export async function getChatHistory() {
  try {
    const cmd = `python ${VM_PATH} search "chat_history" --limit 20`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    const results = JSON.parse(output);

    return results.map((r: any) => ({
      id: r.id,
      content: r.content,
      timestamp: r.metadata?.stored_at || Date.now()
    }));
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
}

export async function sendLocalMessage(message: string, history: { role: string, content: string }[]) {
  try {
    const scriptPath = path.resolve(process.cwd(), "../execution/ollama_inference.py");
    const config = await getConfig(['OLLAMA_MODEL']);
    const model = config['OLLAMA_MODEL'] || 'llama3.2';

    const messages = [...history, { role: 'user', content: message }];
    const messagesJson = JSON.stringify(messages);
    
    // 1. Get LLM Response
    const output = execSync(`python ${scriptPath}`, { 
      encoding: 'utf-8',
      input: messagesJson
    });

    const responseText = output.trim();

    // 2. Store in Vector Memory (Background-ish)
    try {
      const storeCmd = `python ${VM_PATH} store "${message.substring(0, 100)}..." --sector episodic`;
      execSync(storeCmd);
    } catch (e) {
      console.error("Memory Storage Error:", e);
    }

    // 3. Trigger Neural Lattice Ping (Real-time Growth)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await fetch(`${appUrl}/api/neural/ping`, { method: 'POST' });
    } catch (e) {
      // Ignore
    }

    return { role: 'assistant', content: responseText };
  } catch (error) {
    console.error("Chat error:", error);
    return { role: 'assistant', content: "Error: Failed to connect to local neural engine." };
  }
}
