import React from 'react';

interface StatusBadgeProps {
  status: 'SUCCESS' | 'ACTIVE' | 'ERROR' | 'OPTIMAL' | 'SYNCED' | 'PLATINUM-DENSITY';
  label?: string;
  className?: string;
}

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const getTheme = () => {
    switch (status) {
      case 'SUCCESS':
      case 'OPTIMAL':
      case 'SYNCED':
      case 'PLATINUM-DENSITY':
        return 'bg-[var(--status-emerald-bg)] text-[var(--status-emerald)] border-[var(--status-emerald)]/20';
      case 'ACTIVE':
        return 'bg-[var(--status-blue-bg)] text-[var(--status-blue)] border-[var(--status-blue)]/20';
      case 'ERROR':
        return 'bg-[var(--status-rose-bg)] text-[var(--status-rose)] border-[var(--status-rose)]/20';
      default:
        return 'bg-[var(--faint)] text-[var(--muted)] border-[var(--faint)]';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-0.5 rounded border text-[10px] font-bold tracking-widest uppercase ${getTheme()} ${className}`}>
      <div className={`w-1 h-1 rounded-full bg-current ${status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
      {label || status}
    </div>
  );
};
