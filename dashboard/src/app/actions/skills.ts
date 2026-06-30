'use server';

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SkillMetrics {
  size: string;
  modifiedAt: string;
  type: string;
}

export interface Skill {
  title: string;
  status: 'OPTIMAL' | 'ACTIVE' | 'ERROR';
  desc: string;
  category: string;
  path?: string;
  href?: string;
  metrics?: SkillMetrics;
}

export async function openInEditor(filePath: string): Promise<boolean> {
  try {
    await execAsync(`code "${filePath}"`);
    return true;
  } catch (error) {
    console.error("Failed to open editor:", error);
    return false;
  }
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (date: Date) => {
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export async function fetchSkills(): Promise<Skill[]> {
  const skills: Skill[] = [];

  const coreTools: Skill[] = [
    { title: "chat", status: "OPTIMAL", desc: "Neural conversation and thought exploration hub.", category: "NEURAL", href: "/chat", metrics: { size: "System", modifiedAt: "Native", type: "Core Hub" } },
    { title: "memory", status: "ACTIVE", desc: "Persistent vector memory engine. Stores episodic, semantic, and procedural facts.", category: "NEURAL", href: "/memory", metrics: { size: "Database", modifiedAt: "Live", type: "Core Hub" } },
    { title: "reel-studio", status: "OPTIMAL", desc: "AI-powered timeline sequence editor with live preview.", category: "MEDIA", href: "/reel-studio", metrics: { size: "Engine", modifiedAt: "Native", type: "Core Hub" } },
    { title: "audio-studio", status: "OPTIMAL", desc: "Professional DSP engine for mixing, equalization.", category: "PRODUCTION", href: "/audio-studio", metrics: { size: "Engine", modifiedAt: "Native", type: "Core Hub" } },
    { title: "seo-analyzer", status: "OPTIMAL", desc: "Live page auditing, semantic structure mapping.", category: "MARKETING", href: "/seo-analyzer", metrics: { size: "Crawler", modifiedAt: "Native", type: "Core Hub" } },
    { title: "incubator", status: "ACTIVE", desc: "Experimental core. Staging area for sovereign heuristics.", category: "CORE", href: "/incubator", metrics: { size: "Sandbox", modifiedAt: "Live", type: "Core Hub" } },
    { title: "journalist", status: "OPTIMAL", desc: "Autonomous LLM orchestrator linked to Ghost CMS.", category: "CONTENT", href: "/journalist", metrics: { size: "Engine", modifiedAt: "Native", type: "Core Hub" } },
    { title: "ui-master", status: "OPTIMAL", desc: "Visual Sandbox and Dynamic Design System Studio.", category: "STUDIO", href: "/ui-master", metrics: { size: "Studio", modifiedAt: "Native", type: "Core Hub" } },
    { title: "browser-bot", status: "OPTIMAL", desc: "E2E playwright web automation and scraping console.", category: "COMMAND", href: "/browser-bot", metrics: { size: "Agent", modifiedAt: "Native", type: "Core Hub" } },
    { title: "app-sandbox", status: "OPTIMAL", desc: "Interactive staging environment for draft templates.", category: "STUDIO", href: "/incubator/sandbox", metrics: { size: "Sandbox", modifiedAt: "Native", type: "Core Hub" } },
    { title: "scheduler", status: "OPTIMAL", desc: "Autonomous task engine and cron loop schedule coordinator.", category: "COMMAND", href: "/scheduler", metrics: { size: "Loop", modifiedAt: "Native", type: "Core Hub" } },
    { title: "council-room", status: "OPTIMAL", desc: "Karpathy war-room model. Auto-debate decision trade-offs.", category: "COMMAND", href: "/incubator/council", metrics: { size: "Room", modifiedAt: "Native", type: "Core Hub" } }
  ];
  
  skills.push(...coreTools);

  const homeDir = process.env.USERPROFILE || process.env.HOME || '';
  
  const directoriesToScan = [
    path.join(homeDir, '.gemini', 'skills'),
    path.join(process.cwd(), '..', '.agent', 'skills'),
    path.join(process.cwd(), '..', 'skills')
  ];

  const findSkillFiles = (dir: string, fileList: string[] = []) => {
    try {
      if (!fs.existsSync(dir)) return fileList;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          findSkillFiles(filePath, fileList);
        } else if (file === 'SKILL.md' || file.endsWith('_skill.md')) {
          fileList.push(filePath);
        }
      }
    } catch(e) {
      // ignore
    }
    return fileList;
  };

  const skillFiles: string[] = [];
  for (const dir of directoriesToScan) {
    findSkillFiles(dir, skillFiles);
  }

  const parseYamlFrontmatter = (content: string) => {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    
    const yaml = match[1];
    const data: any = {};
    yaml.split('\n').forEach(line => {
      const [key, ...values] = line.split(':');
      if (key && values.length > 0) {
        data[key.trim()] = values.join(':').trim().replace(/^['"]|['"]$/g, '');
      }
    });
    return data;
  };

  const processedTitles = new Set(skills.map(s => s.title));

  for (const file of skillFiles) {
    try {
      const stat = fs.statSync(file);
      const content = fs.readFileSync(file, 'utf8');
      const meta = parseYamlFrontmatter(content);
      
      let title = meta?.name || path.basename(path.dirname(file));
      if (processedTitles.has(title)) continue;
      
      let category = 'CORE';
      const fileLower = file.toLowerCase();
      if (meta?.category) category = meta.category.toUpperCase();
      else if (fileLower.includes('design') || fileLower.includes('ui')) category = 'DESIGN';
      else if (fileLower.includes('execution') || fileLower.includes('dev') || fileLower.includes('code')) category = 'DEV';
      else if (fileLower.includes('planning')) category = 'PLANNING';
      else if (fileLower.includes('review') || fileLower.includes('security') || fileLower.includes('ops')) category = 'SRE';
      else if (fileLower.includes('automation')) category = 'AUTOMATION';

      const type = file.includes('.gemini') ? 'Global' : 'Local';

      skills.push({
        title: title,
        status: 'OPTIMAL',
        desc: meta?.description || "Dynamically loaded external skill module.",
        category: category,
        path: file,
        metrics: {
          size: formatBytes(stat.size),
          modifiedAt: formatDate(stat.mtime),
          type: type
        }
      });
      processedTitles.add(title);
    } catch(e) {
      console.error("Error parsing skill file", file, e);
    }
  }

  return skills;
}
