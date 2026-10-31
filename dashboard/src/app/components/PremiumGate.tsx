'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PremiumGateProps {
  children: React.ReactNode;
  allowedTiers?: string[]; // e.g., ['pro', 'enterprise']
  moduleName: string;
}

export default function PremiumGate({ children, allowedTiers = ['pro', 'enterprise'], moduleName }: PremiumGateProps) {
  const [tier, setTier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTier = () => {
      try {
        const storedTier = localStorage.getItem('jack-subscription-tier');
        setTier(storedTier || 'free');
      } catch (e) {
        setTier('free');
      } finally {
        setIsLoading(false);
      }
    };

    checkTier();

    // Listen for custom event or storage updates
    window.addEventListener('storage', checkTier);
    window.addEventListener('jack-tier-updated', checkTier);

    return () => {
      window.removeEventListener('storage', checkTier);
      window.removeEventListener('jack-tier-updated', checkTier);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center bg-[var(--background)] font-mono text-xs text-[var(--muted)] animate-pulse">
        VERIFYING METADATA & PERMISSIONS...
      </div>
    );
  }

  const isAllowed = allowedTiers.includes(tier || 'free');

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-[600px] min-h-[500px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center justify-center p-8 text-center">
      {/* Dynamic Matrix Background effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg flex flex-col items-center"
      >
        {/* Glowy Premium Badge */}
        <div className="mb-6 relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/20 text-white">
          <Sparkles className="w-8 h-8 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-white/20 blur opacity-40 animate-ping pointer-events-none" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-2">
          {moduleName} is a Premium Module
        </h2>
        
        <p className="text-sm text-[var(--muted)] mb-8 max-w-sm">
          Unlock high-fidelity capabilities, dedicated compute slots, and advanced workflows by upgrading your license.
        </p>

        {/* Feature List Preview */}
        <div className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-lg p-4 mb-8 text-left space-y-3 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[var(--muted)]">
              <strong className="text-[var(--foreground)]">Unlimited Parallel Execution:</strong> No API speed caps or concurrency throttle.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[var(--muted)]">
              <strong className="text-[var(--foreground)]">Production Ready Build Pipeline:</strong> Full access to UI Master, Studio suites, and automation runbooks.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[var(--muted)]">
              <strong className="text-[var(--foreground)]">Fractal Memory Synthesis:</strong> High density long-term neural DB retrieval.
            </div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/billing"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-indigo-500/10 hover:shadow-lg hover:scale-[1.02]"
          >
            Upgrade to Premium
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--faint)] text-[var(--muted)] text-sm font-semibold transition-all duration-200"
          >
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
