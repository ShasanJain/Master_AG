import { Suspense } from 'react';
import { Metadata } from 'next';
import UIDesignClient from './UIDesignClient';

export const metadata: Metadata = {
  title: 'UI Master — Visual Sandbox | Jack Industrial',
  description: 'Live UI design configurator. Select presets (Soft UI, Brutalist, Minimalist), adjust design tokens, preview components, and export CSS variables.',
};

export default function UIDesignPage() {
  return (
    <main className="p-8">
      <Suspense fallback={<div className="text-xs font-mono text-[var(--muted)]">Initializing Design Studio…</div>}>
        <UIDesignClient />
      </Suspense>
    </main>
  );
}
