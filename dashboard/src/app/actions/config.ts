'use server';

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export async function updateConfig(key: string, value: string) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf-8');
    }
    
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
    
    fs.writeFileSync(envPath, content);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error("Config update error:", error);
    return { success: false };
  }
}

export async function getConfig(keys: string[]) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return {};
    
    const content = fs.readFileSync(envPath, 'utf-8');
    const result: Record<string, string> = {};
    
    keys.forEach(key => {
      const regex = new RegExp(`^${key}=(.*)$`, 'm');
      const match = content.match(regex);
      if (match) {
        result[key] = match[1].trim();
      }
    });
    
    return result;
  } catch (error) {
    console.error("Config fetch error:", error);
    return {};
  }
}
