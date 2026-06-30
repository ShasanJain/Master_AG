export const dynamic = 'force-dynamic';

import MemoryStats from "../incubator/MemoryStats";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { purgeMemory } from "../actions/memory";
import { getConfig } from "../actions/config";
import { Suspense } from "react";
import { SyncButton, ConfirmForm } from "./MemoryActions";
import MemoryMatrix from "./MemoryMatrix";

const execAsync = promisify(exec);

// MemoryList removed, replaced by MemoryMatrix Client Component

export default async function MemoryPage() {
  const config = await getConfig(['OLLAMA_MODEL', 'LOCAL_INFERENCE']);
  const activeModel = config['OLLAMA_MODEL'] || 'llama3.2';
  const isLocal = config['LOCAL_INFERENCE'] === 'true';

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="max-w-6xl mx-auto space-y-12 relative z-10 p-6">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-3">
            <h2 className="text-5xl font-bold tracking-tighter text-[var(--foreground)]">Cognitive Memory</h2>
            <div className="flex gap-2">
              <div className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[10px] font-bold tracking-widest uppercase">
                v2.0 Active
              </div>
              <div className={`px-2 py-0.5 rounded border ${isLocal ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-amber-500/20 bg-amber-500/10 text-amber-500'} text-[10px] font-bold tracking-widest uppercase`}>
                {isLocal ? `LOCAL: ${activeModel}` : 'HYBRID MODE'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[var(--muted)] max-w-xl text-sm leading-relaxed">
              Persistent vector memory engine. Stores episodic, semantic, and procedural facts using Ollama embeddings and local SQLite.
            </p>
            <ConfirmForm 
              action={async () => {
                'use server';
                const { syncSystemMemory } = await import('../actions/memory');
                await syncSystemMemory();
              }}
              confirmMessage="This will parse the AST and DeepLake skills and embed them. It may take some time. Proceed?"
            >
              <SyncButton />
            </ConfirmForm>
          </div>
        </div>

        {/* Memory Legend */}
        <div className="glass-card p-4 md:px-6 flex flex-wrap gap-x-6 gap-y-4 border-dashed shrink-0 w-full md:w-auto overflow-hidden">
          <LegendItem 
            label="Episodic" 
            desc="Short-term / Events" 
            color="bg-blue-500" 
          />
          <LegendItem 
            label="Semantic" 
            desc="Long-term / Facts" 
            color="bg-purple-500" 
          />
          <LegendItem 
            label="Procedural" 
            desc="Action / Skills" 
            color="bg-emerald-500" 
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Suspense fallback={<MemoryStatsSkeleton />}>
            <MemoryStats />
          </Suspense>
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tighter">Neural Access Matrix</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Real-time Stream</span>
            </div>
          </div>
          <Suspense fallback={<MemoryListSkeleton />}>
            <MemoryMatrix />
          </Suspense>
        </div>
      </section>
    </div>
    </>
  );
}

function LegendItem({ label, desc, color }: { label: string; desc: string; color: string }) {
  return (
    <div className="flex items-start gap-3 shrink-0">
      <div className={`w-1 h-8 rounded-full ${color}`}></div>
      <div>
        <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">{label}</p>
        <p className="text-[10px] text-[var(--faint)] whitespace-nowrap">{desc}</p>
      </div>
    </div>
  );
}

function MemoryStatsSkeleton() {
  return (
    <div className="glass-card p-8 flex flex-col min-h-[250px] animate-pulse">
      <div className="w-24 h-4 bg-[var(--border)] rounded mb-8"></div>
      <div className="w-48 h-8 bg-[var(--border)] rounded mb-4"></div>
      <div className="w-full h-4 bg-[var(--border)] rounded mb-8"></div>
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="w-full h-12 bg-[var(--border)] rounded"></div>
        <div className="w-full h-12 bg-[var(--border)] rounded"></div>
        <div className="w-full h-12 bg-[var(--border)] rounded"></div>
      </div>
    </div>
  );
}

function MemoryListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="glass-card p-6 flex flex-col min-h-[180px] animate-pulse">
          <div className="flex justify-between w-full mb-4">
            <div className="w-16 h-4 bg-[var(--border)] rounded"></div>
            <div className="w-20 h-4 bg-[var(--border)] rounded"></div>
          </div>
          <div className="w-full h-16 bg-[var(--border)] rounded mb-4 flex-1"></div>
          <div className="w-full h-4 bg-[var(--border)] rounded mt-auto"></div>
        </div>
      ))}
    </div>
  );
}
