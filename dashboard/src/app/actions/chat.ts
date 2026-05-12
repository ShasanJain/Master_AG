'use server';

import { execSync } from "child_process";
import path from "path";
import { getConfig } from "./config";

export async function getChatHistory() {
  try {
    const { get_stats, get_memory } = require("../../../../execution/vector_memory");
    const mem = get_memory();
    // We search for 'chat_history' tag
    const results = await mem.search("chat_history", limit=20);
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

    // We'll pass the message as a simple prompt for now.
    // In a real industrial app, we'd pass the full JSON history to the script.
    // For now, let's just do a simple completion to test.
    
    const messages = [...history, { role: 'user', content: message }];
    const messagesJson = JSON.stringify(messages);
    
    const cmd = `python ${scriptPath}`;
    const output = execSync(cmd, { 
      encoding: 'utf-8',
      input: messagesJson
    });

    return { role: 'assistant', content: output.trim() };
  } catch (error) {
    console.error("Chat error:", error);
    return { role: 'assistant', content: "Error: Failed to connect to local neural engine." };
  }
}
