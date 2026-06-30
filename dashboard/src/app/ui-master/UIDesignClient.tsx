'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Palette, Sliders, Copy, Check, Download, Printer,
  Layers, Type, Box, Zap, Info, Package,
} from 'lucide-react';

// ─── COLOR UTILITIES ──────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  if (c.length !== 6) return [0, 0, 50];
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100, ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

function generatePalette(hex: string): Record<string, string> {
  try {
    const [h, s, l] = hexToHsl(hex);
    const lightnesses = [97, 94, 86, 74, 62, l, Math.max(l - 12, 8), Math.max(l - 25, 4), Math.max(l - 38, 2), Math.max(l - 48, 1)];
    const saturations = [
      s * 0.3, s * 0.45, s * 0.6, s * 0.8, s * 0.95,
      s, Math.min(s * 1.05, 100), Math.min(s * 1.08, 100), Math.min(s * 1.1, 100), Math.min(s * 1.12, 100),
    ].map((v) => Math.max(v, 6));
    const p: Record<string, string> = {};
    SHADE_KEYS.forEach((k, i) => { p[k] = hslToHex(h, saturations[i], lightnesses[i]); });
    p['DEFAULT'] = hex;
    return p;
  } catch {
    return Object.fromEntries(SHADE_KEYS.map((k) => [k, hex]));
  }
}

function generateNeutrals(primaryHex: string): Record<string, string> {
  const [h] = hexToHsl(primaryHex);
  const ls = [98, 95, 88, 77, 62, 47, 33, 22, 13, 6];
  const p: Record<string, string> = {};
  SHADE_KEYS.forEach((k, i) => { p[k] = hslToHex(h, 8, ls[i]); });
  return p;
}

function contrast(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#000000' : '#ffffff';
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Meta { name: string; version: string; description: string; author: string; }

interface Colors {
  primaryBase: string; secondaryBase: string; accentBase: string;
  semantic: { success: string; warning: string; error: string; info: string; };
  dark: string; light: string;
}

interface Typo {
  headingFont: string; bodyFont: string; monoFont: string;
  baseSize: number; scaleRatio: number;
  headingWeight: number; bodyWeight: number;
  letterSpacing: string; lineHeightBase: number;
}

interface Shape { radius: string; borderWidth: string; cardPadding: string; }
interface Shadows { sm: string; md: string; lg: string; color: string; }

interface DS { meta: Meta; colors: Colors; typography: Typo; shape: Shape; shadows: Shadows; }

// ─── TYPE SCALE ───────────────────────────────────────────────────────────────

function typeScale(base: number, ratio: number) {
  return {
    xs: Math.round(base / ratio / ratio),
    sm: Math.round(base / ratio),
    base,
    lg: Math.round(base * ratio),
    xl: Math.round(base * ratio ** 2),
    '2xl': Math.round(base * ratio ** 3),
    '3xl': Math.round(base * ratio ** 4),
    '4xl': Math.round(base * ratio ** 5),
  };
}

// ─── FONTS ────────────────────────────────────────────────────────────────────

const H_FONTS = ['Outfit', 'Inter', 'Playfair Display', 'Space Grotesk', 'DM Sans', 'Syne', 'Manrope', 'Plus Jakarta Sans', 'Raleway', 'Cormorant'];
const B_FONTS = ['Inter', 'DM Sans', 'Nunito', 'Source Sans 3', 'Lato', 'Work Sans', 'Open Sans', 'Poppins', 'Mulish', 'Noto Sans'];
const M_FONTS = ['Fira Code', 'JetBrains Mono', 'Space Mono', 'IBM Plex Mono', 'Source Code Pro', 'Roboto Mono', 'Inconsolata'];
const RATIOS = [
  { label: 'Major Third (1.25)', v: 1.25 }, { label: 'Perfect Fourth (1.333)', v: 1.333 },
  { label: 'Aug. Fourth (1.414)', v: 1.414 }, { label: 'Perfect Fifth (1.5)', v: 1.5 },
  { label: 'Golden Ratio (1.618)', v: 1.618 },
];

function useFonts(fonts: string[]) {
  useEffect(() => {
    [...new Set(fonts)].forEach((f) => {
      const id = `gf-${f.replace(/\s+/g, '-').toLowerCase()}`;
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id; link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800;900&display=swap`;
      document.head.appendChild(link);
    });
  }, [fonts]);
}

// ─── PRESETS ─────────────────────────────────────────────────────────────────

const PRESETS: { label: string; desc: string; ds: DS }[] = [
  {
    label: 'Industrial Dark', desc: 'OLED deep blues, green accent, high-density monospace.',
    ds: {
      meta: { name: 'Industrial Dark', version: '1.0.0', description: 'High-density industrial dashboard system.', author: 'Jack' },
      colors: { primaryBase: '#22c55e', secondaryBase: '#0ea5e9', accentBase: '#a855f7', semantic: { success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#0ea5e9' }, dark: '#020617', light: '#f8fafc' },
      typography: { headingFont: 'Fira Code', bodyFont: 'Inter', monoFont: 'Fira Code', baseSize: 14, scaleRatio: 1.25, headingWeight: 700, bodyWeight: 400, letterSpacing: '-0.02em', lineHeightBase: 1.5 },
      shape: { radius: '6px', borderWidth: '1px', cardPadding: '20px' },
      shadows: { sm: '0 1px 4px', md: '0 4px 16px', lg: '0 8px 40px', color: 'rgba(0,0,0,0.6)' },
    },
  },
  {
    label: 'Soft UI', desc: 'Warm ivory, neumorphic surfaces, purple primary.',
    ds: {
      meta: { name: 'Soft UI', version: '1.0.0', description: 'Neumorphic warmth for consumer apps.', author: 'Jack' },
      colors: { primaryBase: '#7c3aed', secondaryBase: '#ec4899', accentBase: '#f59e0b', semantic: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#6366f1' }, dark: '#1a1a2e', light: '#f5f5f0' },
      typography: { headingFont: 'Plus Jakarta Sans', bodyFont: 'DM Sans', monoFont: 'JetBrains Mono', baseSize: 15, scaleRatio: 1.25, headingWeight: 600, bodyWeight: 400, letterSpacing: '-0.01em', lineHeightBase: 1.6 },
      shape: { radius: '16px', borderWidth: '1px', cardPadding: '24px' },
      shadows: { sm: '2px 2px 6px rgba(0,0,0,0.08), -2px -2px 6px rgba(255,255,255,0.7)', md: '4px 4px 12px rgba(0,0,0,0.12), -4px -4px 12px rgba(255,255,255,0.8)', lg: '8px 8px 24px rgba(0,0,0,0.15)', color: 'rgba(0,0,0,0.12)' },
    },
  },
  {
    label: 'Brutalist', desc: 'Hard edges, maximum contrast, yellow fire.',
    ds: {
      meta: { name: 'Brutalist', version: '1.0.0', description: 'Raw, aggressive, typographic-first design.', author: 'Jack' },
      colors: { primaryBase: '#facc15', secondaryBase: '#ef4444', accentBase: '#000000', semantic: { success: '#22c55e', warning: '#f97316', error: '#dc2626', info: '#3b82f6' }, dark: '#000000', light: '#ffffff' },
      typography: { headingFont: 'Syne', bodyFont: 'Work Sans', monoFont: 'Space Mono', baseSize: 14, scaleRatio: 1.333, headingWeight: 900, bodyWeight: 400, letterSpacing: '0.04em', lineHeightBase: 1.4 },
      shape: { radius: '0px', borderWidth: '2px', cardPadding: '16px' },
      shadows: { sm: '2px 2px 0px', md: '4px 4px 0px', lg: '6px 6px 0px', color: '#000000' },
    },
  },
  {
    label: 'Minimalist', desc: 'Breathable white space, razor borders, indigo.',
    ds: {
      meta: { name: 'Minimalist', version: '1.0.0', description: 'Clarity and focus. Less is more.', author: 'Jack' },
      colors: { primaryBase: '#6366f1', secondaryBase: '#64748b', accentBase: '#0ea5e9', semantic: { success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#0ea5e9' }, dark: '#0f172a', light: '#fafafa' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', monoFont: 'Fira Code', baseSize: 14, scaleRatio: 1.25, headingWeight: 500, bodyWeight: 400, letterSpacing: '0em', lineHeightBase: 1.7 },
      shape: { radius: '8px', borderWidth: '1px', cardPadding: '28px' },
      shadows: { sm: '0 1px 3px', md: '0 2px 8px', lg: '0 4px 20px', color: 'rgba(0,0,0,0.06)' },
    },
  },
  {
    label: 'Retro Terminal', desc: 'Green phosphor on CRT black. Pure atmosphere.',
    ds: {
      meta: { name: 'Retro Terminal', version: '1.0.0', description: 'CRT monitor aesthetic for maximum vibes.', author: 'Jack' },
      colors: { primaryBase: '#00ff41', secondaryBase: '#00d4aa', accentBase: '#ff6b00', semantic: { success: '#00ff41', warning: '#ff9900', error: '#ff0033', info: '#00d4aa' }, dark: '#0d0d0d', light: '#141414' },
      typography: { headingFont: 'Space Mono', bodyFont: 'Source Sans 3', monoFont: 'Space Mono', baseSize: 13, scaleRatio: 1.25, headingWeight: 700, bodyWeight: 400, letterSpacing: '0.06em', lineHeightBase: 1.5 },
      shape: { radius: '2px', borderWidth: '1px', cardPadding: '16px' },
      shadows: { sm: '0 0 8px', md: '0 0 16px', lg: '0 0 32px', color: 'rgba(0,255,65,0.2)' },
    },
  },
];

// ─── BRAND CARD ───────────────────────────────────────────────────────────────

function BrandCard({ ds, cardRef }: { ds: DS; cardRef: React.RefObject<HTMLDivElement | null> }) {
  const p = generatePalette(ds.colors.primaryBase);
  const s2 = generatePalette(ds.colors.secondaryBase);
  const acc = generatePalette(ds.colors.accentBase);
  const neu = generateNeutrals(ds.colors.primaryBase);
  const ts = typeScale(ds.typography.baseSize, ds.typography.scaleRatio);
  const div = '#e2e8f0';
  const bg = '#ffffff', fg = '#0f172a', mu = '#64748b', fa = '#f8fafc';
  const sec: React.CSSProperties = { borderBottom: `1px solid ${div}`, paddingBottom: '22px', marginBottom: '22px' };

  return (
    <div ref={cardRef} id="brand-card" style={{ backgroundColor: bg, color: fg, fontFamily: `'${ds.typography.bodyFont}', sans-serif`, width: '840px', padding: '52px', boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <div style={{ ...sec, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: ds.shape.radius, background: `linear-gradient(135deg, ${ds.colors.primaryBase}, ${ds.colors.secondaryBase})` }} />
          <div>
            <h1 style={{ fontFamily: `'${ds.typography.headingFont}', sans-serif`, fontSize: '30px', fontWeight: ds.typography.headingWeight, margin: 0, letterSpacing: ds.typography.letterSpacing, lineHeight: 1 }}>{ds.meta.name}</h1>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: mu }}>{ds.meta.description}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right', paddingTop: '4px' }}>
          <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Design System</div>
          <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: ds.colors.primaryBase }}>v{ds.meta.version}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>by {ds.meta.author}</div>
        </div>
      </div>

      {/* ── Color System ── */}
      <div style={sec}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '16px' }}>Color System</div>

        {/* Primary + Secondary + Accent palettes */}
        {[
          { label: 'Primary', pal: p, h: 40 },
          { label: 'Secondary', pal: s2, h: 30 },
          { label: 'Accent', pal: acc, h: 24 },
          { label: 'Neutral', pal: neu, h: 24 },
        ].map(({ label, pal, h }) => (
          <div key={label} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', color: mu, fontWeight: 600, marginBottom: '5px', letterSpacing: '0.05em' }}>{label.toUpperCase()}</div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {SHADE_KEYS.map((shade) => (
                <div key={shade} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: `${h}px`, backgroundColor: pal[shade], borderRadius: '3px', border: shade === '50' && label === 'Neutral' ? `1px solid ${div}` : 'none' }} />
                  <div style={{ fontSize: '7px', color: '#94a3b8', marginTop: '3px', fontFamily: 'monospace' }}>{shade}</div>
                  <div style={{ fontSize: '6.5px', color: '#cbd5e1', fontFamily: 'monospace' }}>{pal[shade]}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Semantic + Base */}
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontSize: '9px', color: mu, fontWeight: 600, marginBottom: '5px', letterSpacing: '0.05em' }}>SEMANTIC & BASE</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'Success', c: ds.colors.semantic.success },
              { label: 'Warning', c: ds.colors.semantic.warning },
              { label: 'Error', c: ds.colors.semantic.error },
              { label: 'Info', c: ds.colors.semantic.info },
              { label: 'Dark', c: ds.colors.dark },
              { label: 'Light', c: ds.colors.light },
            ].map(({ label, c }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: '36px', backgroundColor: c, borderRadius: '4px', border: label === 'Light' ? `1px solid ${div}` : 'none' }} />
                <div style={{ fontSize: '8px', color: mu, fontWeight: 600, marginTop: '4px' }}>{label}</div>
                <div style={{ fontSize: '7px', color: '#94a3b8', fontFamily: 'monospace' }}>{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Typography ── */}
      <div style={sec}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '16px' }}>Typography</div>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
          {[
            { role: 'Heading', font: ds.typography.headingFont, w: ds.typography.headingWeight, sample: 'The quick brown fox' },
            { role: 'Body', font: ds.typography.bodyFont, w: ds.typography.bodyWeight, sample: 'Readable. Clear. Clean.' },
            { role: 'Mono', font: ds.typography.monoFont, w: 400, sample: 'const api = 42;' },
          ].map(({ role, font, w, sample }) => (
            <div key={role} style={{ flex: 1, backgroundColor: fa, borderRadius: '6px', padding: '14px' }}>
              <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '7px' }}>{role}</div>
              <div style={{ fontFamily: `'${font}', sans-serif`, fontWeight: w, fontSize: '15px', color: fg, marginBottom: '5px', letterSpacing: ds.typography.letterSpacing }}>{sample}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>{font} · {w}</div>
            </div>
          ))}
        </div>

        {/* Type scale table */}
        <div style={{ backgroundColor: fa, borderRadius: '6px', padding: '16px' }}>
          <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px', letterSpacing: '0.08em' }}>
            Scale · ×{ds.typography.scaleRatio} ratio · {ds.typography.baseSize}px base
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
            {(Object.entries(ts) as [string, number][]).reverse().map(([step, size]) => (
              <div key={step} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '8px', fontFamily: 'monospace', color: '#94a3b8', minWidth: '24px' }}>{step}</span>
                <span style={{ fontFamily: `'${ds.typography.headingFont}', sans-serif`, fontWeight: ['4xl', '3xl', '2xl'].includes(step) ? ds.typography.headingWeight : ds.typography.bodyWeight, fontSize: `${size}px`, color: fg, lineHeight: 1.1 }}>
                  Ag — {size}px
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Shape & Effects ── */}
      <div style={sec}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '16px' }}>Shape, Spacing & Shadows</div>
        <div style={{ display: 'flex', gap: '20px' }}>

          {/* Radius */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>Border Radius</div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              {(['0px', ds.shape.radius, `calc(${ds.shape.radius} * 2)`, '9999px'] as const).map((r, i) => (
                <div key={r} style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: p[400], borderRadius: r }} />
                  <div style={{ fontSize: '7px', color: '#94a3b8', marginTop: '5px', fontFamily: 'monospace' }}>{['0', 'base', '2×', 'full'][i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Spacing */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>4px Grid</div>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
              {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div style={{ width: `${n * 4}px`, height: `${n * 4}px`, backgroundColor: s2[300], borderRadius: '2px' }} />
                  <div style={{ fontSize: '7px', color: '#94a3b8', marginTop: '4px', fontFamily: 'monospace' }}>{n * 4}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Shadows */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>Shadows</div>
            {(['sm', 'md', 'lg'] as const).map((lv) => (
              <div key={lv} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '48px', height: '28px', backgroundColor: '#fff', borderRadius: ds.shape.radius, boxShadow: `${ds.shadows[lv]} ${ds.shadows.color}`, border: `1px solid ${div}` }} />
                <div>
                  <div style={{ fontSize: '8px', fontFamily: 'monospace', color: fg, fontWeight: 600 }}>{lv.toUpperCase()}</div>
                  <div style={{ fontSize: '7px', fontFamily: 'monospace', color: '#94a3b8' }}>{ds.shadows[lv]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Component Gallery ── */}
      <div style={{ ...sec, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '16px' }}>Component Gallery</div>
        <div style={{ display: 'flex', gap: '16px' }}>

          {/* Buttons */}
          <div style={{ minWidth: '130px' }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>Buttons</div>
            {[
              { label: 'Primary', bg: ds.colors.primaryBase, c: contrast(ds.colors.primaryBase), bd: 'none' },
              { label: 'Secondary', bg: ds.colors.secondaryBase, c: contrast(ds.colors.secondaryBase), bd: 'none' },
              { label: 'Outline', bg: 'transparent', c: ds.colors.primaryBase, bd: `${ds.shape.borderWidth} solid ${ds.colors.primaryBase}` },
              { label: 'Ghost', bg: `${ds.colors.primaryBase}20`, c: ds.colors.primaryBase, bd: 'none' },
              { label: 'Destructive', bg: ds.colors.semantic.error, c: contrast(ds.colors.semantic.error), bd: 'none' },
            ].map(({ label, bg, c, bd }) => (
              <div key={label} style={{ fontFamily: `'${ds.typography.bodyFont}', sans-serif`, fontSize: '10px', fontWeight: 600, backgroundColor: bg, color: c, border: bd, borderRadius: ds.shape.radius, padding: '5px 12px', display: 'inline-block', marginBottom: '6px', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>{label}</div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ minWidth: '100px' }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>Badges</div>
            {([['Success', ds.colors.semantic.success], ['Warning', ds.colors.semantic.warning], ['Error', ds.colors.semantic.error], ['Info', ds.colors.semantic.info], ['Neutral', neu[400]]] as [string, string][]).map(([label, c]) => (
              <div key={label} style={{ marginBottom: '7px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '8px', fontWeight: 700, backgroundColor: `${c}20`, color: c, border: `1px solid ${c}40`, borderRadius: ds.shape.radius === '0px' ? '0' : '4px', padding: '2px 7px' }}>{label.toUpperCase()}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ minWidth: '140px' }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>Input</div>
            <div style={{ border: `${ds.shape.borderWidth} solid ${div}`, borderRadius: ds.shape.radius, padding: '8px 12px', backgroundColor: fa, fontFamily: `'${ds.typography.bodyFont}', sans-serif`, fontSize: '11px', color: mu, marginBottom: '8px' }}>Placeholder text...</div>
            <div style={{ border: `${ds.shape.borderWidth} solid ${ds.colors.primaryBase}`, borderRadius: ds.shape.radius, padding: '8px 12px', backgroundColor: fa, fontFamily: `'${ds.typography.bodyFont}', sans-serif`, fontSize: '11px', color: fg, boxShadow: `0 0 0 3px ${ds.colors.primaryBase}20` }}>Focused value</div>
          </div>

          {/* Card */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>Card</div>
            <div style={{ backgroundColor: fa, border: `${ds.shape.borderWidth} solid ${div}`, borderRadius: ds.shape.radius, padding: ds.shape.cardPadding, boxShadow: `${ds.shadows.md} ${ds.shadows.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontFamily: `'${ds.typography.headingFont}', sans-serif`, fontWeight: ds.typography.headingWeight, fontSize: '13px', letterSpacing: ds.typography.letterSpacing }}>Dashboard Metric</span>
                <span style={{ fontFamily: 'monospace', fontSize: '8px', fontWeight: 700, backgroundColor: `${ds.colors.primaryBase}20`, color: ds.colors.primaryBase, border: `1px solid ${ds.colors.primaryBase}40`, borderRadius: '3px', padding: '2px 6px' }}>LIVE</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: 700, color: ds.colors.primaryBase, marginBottom: '4px', letterSpacing: '-0.02em' }}>14,823</div>
              <div style={{ fontSize: '10px', color: mu }}>↑ 12.4% vs last period</div>
              <div style={{ marginTop: '12px', height: '2px', backgroundColor: div, borderRadius: '1px' }}>
                <div style={{ height: '2px', width: '72%', backgroundColor: ds.colors.primaryBase, borderRadius: '1px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '36px', paddingTop: '16px', borderTop: `1px solid ${div}`, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'monospace' }}>Generated by UI Master · Jack Industrial Dashboard</div>
        <div style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'monospace' }}>{new Date().toISOString().split('T')[0]}</div>
      </div>
    </div>
  );
}

// ─── EXPORT GENERATORS ────────────────────────────────────────────────────────

function makeCSSVars(ds: DS): string {
  const p = generatePalette(ds.colors.primaryBase);
  const s2 = generatePalette(ds.colors.secondaryBase);
  const acc = generatePalette(ds.colors.accentBase);
  const neu = generateNeutrals(ds.colors.primaryBase);
  const ts = typeScale(ds.typography.baseSize, ds.typography.scaleRatio);
  return `:root {
  /* ─ Primary ─ */
${SHADE_KEYS.map((k) => `  --color-primary-${k}: ${p[k]};`).join('\n')}
  --color-primary: ${ds.colors.primaryBase};

  /* ─ Secondary ─ */
${SHADE_KEYS.map((k) => `  --color-secondary-${k}: ${s2[k]};`).join('\n')}
  --color-secondary: ${ds.colors.secondaryBase};

  /* ─ Accent ─ */
${SHADE_KEYS.map((k) => `  --color-accent-${k}: ${acc[k]};`).join('\n')}
  --color-accent: ${ds.colors.accentBase};

  /* ─ Neutral ─ */
${SHADE_KEYS.map((k) => `  --color-neutral-${k}: ${neu[k]};`).join('\n')}

  /* ─ Semantic ─ */
  --color-success: ${ds.colors.semantic.success};
  --color-warning: ${ds.colors.semantic.warning};
  --color-error:   ${ds.colors.semantic.error};
  --color-info:    ${ds.colors.semantic.info};
  --color-dark:    ${ds.colors.dark};
  --color-light:   ${ds.colors.light};

  /* ─ Typography ─ */
  --font-heading: '${ds.typography.headingFont}', sans-serif;
  --font-body:    '${ds.typography.bodyFont}', sans-serif;
  --font-mono:    '${ds.typography.monoFont}', monospace;
  --font-size-xs:   ${ts.xs}px;
  --font-size-sm:   ${ts.sm}px;
  --font-size-base: ${ts.base}px;
  --font-size-lg:   ${ts.lg}px;
  --font-size-xl:   ${ts.xl}px;
  --font-size-2xl:  ${ts['2xl']}px;
  --font-size-3xl:  ${ts['3xl']}px;
  --font-size-4xl:  ${ts['4xl']}px;
  --font-weight-heading: ${ds.typography.headingWeight};
  --font-weight-body:    ${ds.typography.bodyWeight};
  --letter-spacing:  ${ds.typography.letterSpacing};
  --line-height:     ${ds.typography.lineHeightBase};

  /* ─ Shape ─ */
  --radius:       ${ds.shape.radius};
  --border-width: ${ds.shape.borderWidth};
  --card-padding: ${ds.shape.cardPadding};

  /* ─ Shadows ─ */
  --shadow-sm: ${ds.shadows.sm} ${ds.shadows.color};
  --shadow-md: ${ds.shadows.md} ${ds.shadows.color};
  --shadow-lg: ${ds.shadows.lg} ${ds.shadows.color};
}`;
}

function makeTailwind(ds: DS): string {
  const p = generatePalette(ds.colors.primaryBase);
  const s2 = generatePalette(ds.colors.secondaryBase);
  const acc = generatePalette(ds.colors.accentBase);
  const neu = generateNeutrals(ds.colors.primaryBase);
  const ts = typeScale(ds.typography.baseSize, ds.typography.scaleRatio);
  const pal = (obj: Record<string, string>) => '{\n' + SHADE_KEYS.map((k) => `          ${k}: '${obj[k]}'`).join(',\n') + ',\n        }';
  return `// tailwind.config.ts — ${ds.meta.name} v${ds.meta.version}
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary:   ${pal(p)},
        secondary: ${pal(s2)},
        accent:    ${pal(acc)},
        neutral:   ${pal(neu)},
        success: '${ds.colors.semantic.success}',
        warning: '${ds.colors.semantic.warning}',
        error:   '${ds.colors.semantic.error}',
        info:    '${ds.colors.semantic.info}',
      },
      fontFamily: {
        heading: ['${ds.typography.headingFont}', 'sans-serif'],
        body:    ['${ds.typography.bodyFont}', 'sans-serif'],
        mono:    ['${ds.typography.monoFont}', 'monospace'],
      },
      fontSize: {
        xs:    '${ts.xs}px',
        sm:    '${ts.sm}px',
        base:  '${ts.base}px',
        lg:    '${ts.lg}px',
        xl:    '${ts.xl}px',
        '2xl': '${ts['2xl']}px',
        '3xl': '${ts['3xl']}px',
        '4xl': '${ts['4xl']}px',
      },
      borderRadius: {
        DEFAULT: '${ds.shape.radius}',
      },
      boxShadow: {
        sm: '${ds.shadows.sm} ${ds.shadows.color}',
        md: '${ds.shadows.md} ${ds.shadows.color}',
        lg: '${ds.shadows.lg} ${ds.shadows.color}',
      },
    },
  },
};

export default config;`;
}

function makeJSON(ds: DS): string {
  const p = generatePalette(ds.colors.primaryBase);
  const s2 = generatePalette(ds.colors.secondaryBase);
  const acc = generatePalette(ds.colors.accentBase);
  const neu = generateNeutrals(ds.colors.primaryBase);
  const ts = typeScale(ds.typography.baseSize, ds.typography.scaleRatio);
  const tok: Record<string, unknown> = {
    '$metadata': { tokenSetOrder: ['color', 'typography', 'shape'] },
    color: {
      primary: Object.fromEntries(SHADE_KEYS.map((k) => [k, { $value: p[k], $type: 'color' }])),
      secondary: Object.fromEntries(SHADE_KEYS.map((k) => [k, { $value: s2[k], $type: 'color' }])),
      accent: Object.fromEntries(SHADE_KEYS.map((k) => [k, { $value: acc[k], $type: 'color' }])),
      neutral: Object.fromEntries(SHADE_KEYS.map((k) => [k, { $value: neu[k], $type: 'color' }])),
      semantic: {
        success: { $value: ds.colors.semantic.success, $type: 'color' },
        warning: { $value: ds.colors.semantic.warning, $type: 'color' },
        error:   { $value: ds.colors.semantic.error, $type: 'color' },
        info:    { $value: ds.colors.semantic.info, $type: 'color' },
      },
    },
    typography: {
      fontFamily: {
        heading: { $value: ds.typography.headingFont, $type: 'fontFamily' },
        body:    { $value: ds.typography.bodyFont, $type: 'fontFamily' },
        mono:    { $value: ds.typography.monoFont, $type: 'fontFamily' },
      },
      fontSize: Object.fromEntries(Object.entries(ts).map(([k, v]) => [k, { $value: `${v}px`, $type: 'dimension' }])),
      fontWeight: {
        heading: { $value: ds.typography.headingWeight, $type: 'fontWeight' },
        body:    { $value: ds.typography.bodyWeight, $type: 'fontWeight' },
      },
      letterSpacing: { $value: ds.typography.letterSpacing, $type: 'letterSpacing' },
      lineHeight:    { $value: ds.typography.lineHeightBase, $type: 'lineHeight' },
    },
    shape: {
      radius:       { $value: ds.shape.radius, $type: 'borderRadius' },
      borderWidth:  { $value: ds.shape.borderWidth, $type: 'borderWidth' },
      cardPadding:  { $value: ds.shape.cardPadding, $type: 'spacing' },
    },
    shadow: {
      sm: { $value: `${ds.shadows.sm} ${ds.shadows.color}`, $type: 'boxShadow' },
      md: { $value: `${ds.shadows.md} ${ds.shadows.color}`, $type: 'boxShadow' },
      lg: { $value: `${ds.shadows.lg} ${ds.shadows.color}`, $type: 'boxShadow' },
    },
  };
  return JSON.stringify(tok, null, 2);
}

function makeReactTheme(ds: DS): string {
  const p = generatePalette(ds.colors.primaryBase);
  const s2 = generatePalette(ds.colors.secondaryBase);
  const ts = typeScale(ds.typography.baseSize, ds.typography.scaleRatio);
  return `// theme.ts — ${ds.meta.name} v${ds.meta.version}
// Generated by UI Master · Jack Industrial Dashboard

export const theme = {
  meta: {
    name: '${ds.meta.name}',
    version: '${ds.meta.version}',
    description: '${ds.meta.description}',
    author: '${ds.meta.author}',
  },
  colors: {
    primary: {
${SHADE_KEYS.map((k) => `      '${k}': '${p[k]}',`).join('\n')}
      DEFAULT: '${ds.colors.primaryBase}',
    },
    secondary: {
${SHADE_KEYS.map((k) => `      '${k}': '${s2[k]}',`).join('\n')}
      DEFAULT: '${ds.colors.secondaryBase}',
    },
    accent:  '${ds.colors.accentBase}',
    semantic: {
      success: '${ds.colors.semantic.success}',
      warning: '${ds.colors.semantic.warning}',
      error:   '${ds.colors.semantic.error}',
      info:    '${ds.colors.semantic.info}',
    },
    dark:  '${ds.colors.dark}',
    light: '${ds.colors.light}',
  },
  typography: {
    fonts:  { heading: '${ds.typography.headingFont}', body: '${ds.typography.bodyFont}', mono: '${ds.typography.monoFont}' },
    scale:  {
${Object.entries(ts).map(([k, v]) => `      ${k}: ${v},`).join('\n')}
    },
    weights:       { heading: ${ds.typography.headingWeight}, body: ${ds.typography.bodyWeight} },
    letterSpacing: '${ds.typography.letterSpacing}',
    lineHeight:    ${ds.typography.lineHeightBase},
  },
  shape: {
    radius:      '${ds.shape.radius}',
    borderWidth: '${ds.shape.borderWidth}',
    cardPadding: '${ds.shape.cardPadding}',
  },
  shadows: {
    sm: '${ds.shadows.sm} ${ds.shadows.color}',
    md: '${ds.shadows.md} ${ds.shadows.color}',
    lg: '${ds.shadows.lg} ${ds.shadows.color}',
  },
} as const;

export type Theme = typeof theme;
export default theme;
`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

type Tab = 'configure' | 'brandcard' | 'presets' | 'export';
type ExportFmt = 'css' | 'tailwind' | 'json' | 'react';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'configure', label: 'Configure', icon: <Sliders className="w-3.5 h-3.5" /> },
  { id: 'brandcard', label: 'Brand Card', icon: <Package className="w-3.5 h-3.5" /> },
  { id: 'presets', label: 'Presets Manager', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'export', label: 'Export', icon: <Zap className="w-3.5 h-3.5" /> },
];

const EXPORT_FMTS: { id: ExportFmt; label: string; hint: string }[] = [
  { id: 'css', label: 'CSS Variables', hint: 'Paste into globals.css :root block' },
  { id: 'tailwind', label: 'Tailwind Config', hint: 'Merge into tailwind.config.ts' },
  { id: 'json', label: 'JSON Tokens (W3C)', hint: 'For Tokens Studio, Style Dictionary, Theo' },
  { id: 'react', label: 'React theme.ts', hint: 'Import as typed constant in any React/Next.js project' },
];

import { useSearchParams } from 'next/navigation';

export default function UIDesignClient() {
  const searchParams = useSearchParams();
  const [customPresets, setCustomPresets] = useState<{ label: string; desc: string; ds: DS; pinned?: boolean; group?: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ui-master-custom-presets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    // Set standard preset groups by default
    return PRESETS.map((p, idx) => ({
      ...p,
      group: idx < 3 ? 'System Defaults' : 'Jack Archives',
      pinned: idx === 0
    }));
  });

  const [activePreset, setActivePreset] = useState(0);
  const [ds, setDs] = useState<DS>(customPresets[0]?.ds || PRESETS[0].ds);
  const [tab, setTab] = useState<Tab>('configure');
  const [fmt, setFmt] = useState<ExportFmt>('css');
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSavePreset = () => {
    const name = prompt('Enter preset name:', ds.meta.name || 'My Preset');
    if (!name) return;
    const groupName = prompt('Enter group name (e.g. System, Clients, Custom):', 'Custom');
    if (!groupName) return;
    const newPreset = {
      label: name,
      desc: ds.meta.description || 'Custom generated theme preset.',
      group: groupName,
      pinned: false,
      ds: {
        ...ds,
        meta: {
          ...ds.meta,
          name: name
        }
      }
    };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem('ui-master-custom-presets', JSON.stringify(updated));
    setActivePreset(updated.length - 1);
  };

  // Initialize and load parameters from search query (SEO Analyzer redirect logic)
  useEffect(() => {
    const primary = searchParams.get('primary');
    const dark = searchParams.get('dark');
    const light = searchParams.get('light');

    if (primary || dark || light) {
      setDs(prev => ({
        ...prev,
        meta: {
          ...prev.meta,
          name: 'Extracted Theme',
          description: 'Styling parameters extracted from analyzed target site.'
        },
        colors: {
          ...prev.colors,
          primaryBase: primary || prev.colors.primaryBase,
          dark: dark || prev.colors.dark,
          light: light || prev.colors.light,
        }
      }));
    }
  }, [searchParams]);

  const loadWebsiteTheme = async () => {
    if (!targetUrl) return;
    setAnalyzingUrl(true);
    setAnalyzeError(null);
    try {
      const res = await fetch('/api/seo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      if (data.success && data.result?.extracted_theme) {
        const theme = data.result.extracted_theme;
        setDs(prev => ({
          ...prev,
          meta: {
            ...prev.meta,
            name: data.result.title ? data.result.title.split(' ')[0] : 'Extracted Brand',
            description: `Design presets analyzed and parsed from ${targetUrl}`
          },
          colors: {
            ...prev.colors,
            primaryBase: theme.primary,
            dark: theme.dark,
            light: theme.light
          },
          typography: {
            ...prev.typography,
            headingFont: theme.fonts[0] || prev.typography.headingFont,
            bodyFont: theme.fonts[0] || prev.typography.bodyFont,
          },
          shape: {
            ...prev.shape,
            radius: theme.radius || prev.shape.radius
          }
        }));
      } else {
        setAnalyzeError(data.error || 'Failed to parse styling from website');
      }
    } catch (e: any) {
      setAnalyzeError(e.message || 'An error occurred during extraction');
    }
    setAnalyzingUrl(false);
  };

  useFonts([ds.typography.headingFont, ds.typography.bodyFont, ds.typography.monoFont]);

  const setMeta = (k: keyof Meta, v: string) => setDs((d) => ({ ...d, meta: { ...d.meta, [k]: v } }));
  const setColor = (k: keyof Colors, v: string) => setDs((d) => ({ ...d, colors: { ...d.colors, [k]: v } }));
  const setSemantic = (k: keyof Colors['semantic'], v: string) => setDs((d) => ({ ...d, colors: { ...d.colors, semantic: { ...d.colors.semantic, [k]: v } } }));
  const setTypo = (k: keyof Typo, v: string | number) => setDs((d) => ({ ...d, typography: { ...d.typography, [k]: v } }));
  const setShape = (k: keyof Shape, v: string) => setDs((d) => ({ ...d, shape: { ...d.shape, [k]: v } }));
  const setShadow = (k: keyof Shadows, v: string) => setDs((d) => ({ ...d, shadows: { ...d.shadows, [k]: v } }));

  const exportText = useCallback(() => {
    if (fmt === 'css') return makeCSSVars(ds);
    if (fmt === 'tailwind') return makeTailwind(ds);
    if (fmt === 'json') return makeJSON(ds);
    return makeReactTheme(ds);
  }, [ds, fmt]);

  const handleCopy = () => { navigator.clipboard.writeText(exportText()); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handlePNG = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const h2c = (await import('html2canvas')).default;
      const canvas = await h2c(cardRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const a = document.createElement('a');
      a.download = `${ds.meta.name.replace(/\s+/g, '-').toLowerCase()}-brand-card.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (e) { console.error(e); }
    setCapturing(false);
  };

  const handlePrint = () => {
    if (!cardRef.current) return;
    const html = cardRef.current.outerHTML;
    const w = window.open('', '_blank');
    if (!w) return;
    const gfFonts = [ds.typography.headingFont, ds.typography.bodyFont, ds.typography.monoFont]
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700;900`).join('&');
    w.document.write(`<!DOCTYPE html><html><head><title>${ds.meta.name} — Brand Card</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?${gfFonts}&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff;display:flex;justify-content:center;padding:24px}@media print{body{padding:0}@page{margin:0;size:A3 landscape}}</style>
</head><body>${html}</body></html>`.replace('${gFonts}', gfFonts));
    w.document.close();
    w.onload = () => setTimeout(() => w.print(), 800);
  };

  const mini4 = (hex: string) => [0, 2, 5, 8].map((i) => generatePalette(hex)[SHADE_KEYS[i]]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent font-mono">
            UI MASTER — DESIGN SYSTEM STUDIO
          </h1>
          <p className="text-xs text-[var(--muted)] font-mono mt-1">
            Define a complete design language · Generate a Brand Card · Export to CSS, Tailwind, JSON, or TypeScript.
          </p>
        </div>
        {tab === 'brandcard' && (
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 border border-[var(--border)] rounded hover:border-[var(--muted)] transition-all text-[var(--muted)] hover:text-white cursor-pointer">
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
            <button onClick={handlePNG} disabled={capturing} className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 bg-[var(--primary)]/15 border border-[var(--primary)]/40 text-[var(--primary)] rounded hover:bg-[var(--primary)]/25 transition-all cursor-pointer disabled:opacity-50">
              <Download className="w-3.5 h-3.5" />{capturing ? 'Capturing…' : 'Download PNG'}
            </button>
          </div>
        )}
        {tab === 'export' && (
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 bg-[var(--primary)]/15 border border-[var(--primary)]/40 text-[var(--primary)] rounded hover:bg-[var(--primary)]/25 transition-all cursor-pointer">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border border-[var(--border)] bg-[var(--surface)] p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase tracking-wider px-4 py-2 rounded transition-all cursor-pointer ${tab === t.id ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30' : 'text-[var(--muted)] hover:text-white'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── CONFIGURE TAB ── */}
      {tab === 'configure' && (
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">

          {/* Left Sidebar Column */}
          <div className="space-y-4">
            {/* Presets */}
            <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-4 space-y-2 h-fit">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono flex items-center gap-1.5 mb-3">
                <Layers className="w-3.5 h-3.5" />Presets
              </h2>
              {customPresets.map((p, i) => (
                <button key={i} onClick={() => { setActivePreset(i); setDs(p.ds); }}
                  className={`w-full text-left border rounded-lg p-3 transition-all cursor-pointer ${activePreset === i ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-[var(--border)] hover:border-[var(--primary)]/40'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {mini4(p.ds.colors.primaryBase).map((c, j) => <div key={j} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />)}
                    </div>
                    <span className={`text-[11px] font-bold font-mono truncate max-w-[140px] ${activePreset === i ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{p.label}</span>
                    {activePreset === i && <Check className="w-3 h-3 text-[var(--primary)] ml-auto" />}
                  </div>
                  <p className="text-[9px] text-[var(--muted)] truncate max-w-[240px]">{p.desc}</p>
                </button>
              ))}

              <button 
                onClick={handleSavePreset}
                className="w-full mt-2 py-2 bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/25 text-[10px] font-bold font-mono uppercase tracking-wider rounded cursor-pointer transition-all"
              >
                + Save Current Preset
              </button>

              {/* Extract from website */}
              <div className="border-t border-[var(--border)] pt-4 mt-2 space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono block">Extract Site Theme</span>
                <div className="flex gap-1.5">
                  <input 
                    type="url" 
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1.5 text-[10px] font-mono text-[var(--foreground)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <button 
                    onClick={loadWebsiteTheme}
                    disabled={analyzingUrl || !targetUrl}
                    className="px-3 bg-[var(--primary)]/15 border border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/25 transition-all text-[9px] font-bold font-mono rounded cursor-pointer disabled:opacity-50"
                  >
                    {analyzingUrl ? 'PARSING…' : 'EXTRACT'}
                  </button>
                </div>
                {analyzeError && <p className="text-[9px] text-red-400 font-mono mt-1">{analyzeError}</p>}
              </div>
            </div>

            {/* Import Utility */}
            <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-4 space-y-3 h-fit">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />Import Colors
              </h2>
              <p className="text-[9px] text-[var(--muted)]">Paste Hex codes (comma/space/newline separated), CSS variables block, JSON, or Coolors URL.</p>
              <textarea 
                placeholder="#ff0055, #00ffcc, #223344..." 
                className="w-full h-24 bg-[var(--background)] border border-[var(--border)] text-white text-[10px] font-mono p-2 rounded focus:outline-none focus:border-[var(--primary)] resize-none"
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val.trim()) return;
                  
                  // Extract colors matching hex pattern
                  const hexes = val.match(/#[0-9a-fA-F]{6}\b/g) || [];
                  if (hexes.length > 0) {
                    setDs(d => ({
                      ...d,
                      colors: {
                        ...d.colors,
                        primaryBase: hexes[0] || d.colors.primaryBase,
                        secondaryBase: hexes[1] || hexes[0] || d.colors.secondaryBase,
                        accentBase: hexes[2] || hexes[1] || hexes[0] || d.colors.accentBase,
                      }
                    }));
                  }
                }}
              />
              <div className="flex justify-between items-center text-[8px] text-[var(--muted)] font-mono">
                <span>Auto-detects hex codes</span>
                <span className="text-[var(--primary)]">Dynamic shade generation active</span>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="space-y-4">

            {/* Identity */}
            <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-5 space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />System Identity</h2>
              <div className="grid grid-cols-2 gap-4">
                {(['name', 'version', 'author'] as (keyof Meta)[]).map((k) => (
                  <div key={k}><label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block mb-1">{k}</label>
                    <input value={ds.meta[k]} onChange={(e) => setMeta(k, e.target.value)} className="w-full bg-[var(--background)] border border-[var(--border)] text-white text-xs font-mono px-3 py-2 rounded focus:outline-none focus:border-[var(--primary)] transition-colors" /></div>
                ))}
                <div className="col-span-2"><label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block mb-1">description</label>
                  <input value={ds.meta.description} onChange={(e) => setMeta('description', e.target.value)} className="w-full bg-[var(--background)] border border-[var(--border)] text-white text-xs font-mono px-3 py-2 rounded focus:outline-none focus:border-[var(--primary)] transition-colors" /></div>
              </div>
            </div>

            {/* Colors */}
            <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-5 space-y-5">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" />Color System</h2>

              {/* Primary / Secondary / Accent */}
              <div className="grid grid-cols-3 gap-5">
                {([['primaryBase', 'Primary'], ['secondaryBase', 'Secondary'], ['accentBase', 'Accent']] as [keyof Colors, string][]).map(([k, label]) => (
                  <div key={k} className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block">{label} Base</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={ds.colors[k] as string} onChange={(e) => setColor(k, e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-[var(--border)] bg-transparent" />
                      <input type="text" value={ds.colors[k] as string} onChange={(e) => setColor(k, e.target.value)} className="flex-1 bg-[var(--background)] border border-[var(--border)] text-white text-[11px] font-mono px-2 py-1.5 rounded focus:outline-none focus:border-[var(--primary)] transition-colors" />
                    </div>
                    <div className="flex gap-0.5">
                      {SHADE_KEYS.map((s) => <div key={s} className="flex-1 h-3 rounded-sm" style={{ backgroundColor: generatePalette(ds.colors[k] as string)[s] }} />)}
                    </div>
                    <div className="flex gap-0.5">
                      {SHADE_KEYS.map((s, i) => <div key={s} className="flex-1 text-center" style={{ fontSize: '7px', color: 'var(--muted)', fontFamily: 'monospace' }}>{SHADE_KEYS[i]}</div>)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Semantic */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block mb-3">Semantic Colors</label>
                <div className="grid grid-cols-4 gap-3">
                  {(Object.entries(ds.colors.semantic) as [keyof Colors['semantic'], string][]).map(([k, v]) => (
                    <div key={k} className="space-y-1">
                      <label className="text-[9px] font-mono text-[var(--muted)] capitalize">{k}</label>
                      <div className="flex gap-1.5 items-center">
                        <input type="color" value={v} onChange={(e) => setSemantic(k, e.target.value)} className="w-6 h-6 rounded cursor-pointer border border-[var(--border)]" />
                        <input type="text" value={v} onChange={(e) => setSemantic(k, e.target.value)} className="flex-1 bg-[var(--background)] border border-[var(--border)] text-white text-[10px] font-mono px-2 py-1 rounded focus:outline-none focus:border-[var(--primary)] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dark / Light */}
              <div className="grid grid-cols-2 gap-4">
                {([['dark', 'Dark Base'], ['light', 'Light Base']] as [keyof Colors, string][]).map(([k, label]) => (
                  <div key={k} className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block">{label}</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={ds.colors[k] as string} onChange={(e) => setColor(k, e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-[var(--border)]" />
                      <input type="text" value={ds.colors[k] as string} onChange={(e) => setColor(k, e.target.value)} className="flex-1 bg-[var(--background)] border border-[var(--border)] text-white text-[11px] font-mono px-2 py-1.5 rounded focus:outline-none focus:border-[var(--primary)] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-5 space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono flex items-center gap-1.5"><Type className="w-3.5 h-3.5" />Typography</h2>
              <div className="grid grid-cols-3 gap-4">
                {([['headingFont', 'Heading Font', H_FONTS], ['bodyFont', 'Body Font', B_FONTS], ['monoFont', 'Mono Font', M_FONTS]] as [keyof Typo, string, string[]][]).map(([k, label, list]) => (
                  <div key={k} className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block">{label}</label>
                    <select value={ds.typography[k] as string} onChange={(e) => setTypo(k, e.target.value)} className="w-full bg-[var(--background)] border border-[var(--border)] text-white text-[11px] font-mono px-2 py-2 rounded focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer">
                      {list.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <div style={{ fontFamily: `'${ds.typography[k] as string}', sans-serif`, fontSize: '14px', color: 'var(--foreground)' }} className="pt-1 truncate">Aa Bb Cc 123</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block">Base Size</label>
                  <input type="number" min={10} max={20} value={ds.typography.baseSize} onChange={(e) => setTypo('baseSize', +e.target.value)} className="w-full bg-[var(--background)] border border-[var(--border)] text-white text-xs font-mono px-3 py-2 rounded focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block">Scale Ratio</label>
                  <select value={ds.typography.scaleRatio} onChange={(e) => setTypo('scaleRatio', +e.target.value)} className="w-full bg-[var(--background)] border border-[var(--border)] text-white text-[11px] font-mono px-2 py-2 rounded focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer">
                    {RATIOS.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block">Letter Spacing</label>
                  <input type="text" value={ds.typography.letterSpacing} onChange={(e) => setTypo('letterSpacing', e.target.value)} className="w-full bg-[var(--background)] border border-[var(--border)] text-white text-xs font-mono px-3 py-2 rounded focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
              </div>
              {/* Scale preview */}
              <div className="bg-[var(--background)] rounded border border-[var(--border)] p-4 space-y-2">
                {(Object.entries(typeScale(ds.typography.baseSize, ds.typography.scaleRatio)) as [string, number][]).reverse().map(([step, size]) => (
                  <div key={step} className="flex items-baseline gap-3">
                    <span className="text-[9px] font-mono text-[var(--muted)] w-8 text-right shrink-0">{step}</span>
                    <span style={{ fontFamily: `'${ds.typography.headingFont}', sans-serif`, fontSize: `${size}px`, fontWeight: ds.typography.headingWeight, color: 'var(--foreground)', lineHeight: 1.15 }}>{size}px</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shape & Shadow */}
            <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-5 space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono flex items-center gap-1.5"><Box className="w-3.5 h-3.5" />Shape & Shadows</h2>
              <div className="grid grid-cols-3 gap-4">
                {([['radius', 'Border Radius'], ['borderWidth', 'Border Width'], ['cardPadding', 'Card Padding']] as [keyof Shape, string][]).map(([k, label]) => (
                  <div key={k} className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block">{label}</label>
                    <input type="text" value={ds.shape[k]} onChange={(e) => setShape(k, e.target.value)} className="w-full bg-[var(--background)] border border-[var(--border)] text-white text-xs font-mono px-3 py-2 rounded focus:outline-none focus:border-[var(--primary)] transition-colors" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {([['sm', 'Shadow SM'], ['md', 'Shadow MD'], ['lg', 'Shadow LG'], ['color', 'Shadow Color']] as [keyof Shadows, string][]).map(([k, label]) => (
                  <div key={k} className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-[var(--muted)] block">{label}</label>
                    <input type="text" value={ds.shadows[k]} onChange={(e) => setShadow(k, e.target.value)} className="w-full bg-[var(--background)] border border-[var(--border)] text-white text-[10px] font-mono px-2 py-2 rounded focus:outline-none focus:border-[var(--primary)] transition-colors" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── PRESETS MANAGER TAB ── */}
      {tab === 'presets' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl space-y-4">
            <div>
              <h2 className="text-sm font-bold font-mono text-[var(--foreground)] uppercase">Presets Manager Studio</h2>
              <p className="text-xs text-[var(--muted)] mt-1 font-mono">Pin, delete, categorize presets, and customize metadata scopes across active themes.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customPresets.map((preset, index) => (
                <div 
                  key={index} 
                  className={`border rounded-xl p-4 bg-[var(--background)] flex flex-col justify-between space-y-3 transition-all ${
                    activePreset === index ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary-glow)]' : 'border-[var(--border)]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[8px] bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 font-mono px-2 py-0.5 rounded uppercase">
                          {preset.group || 'Custom'}
                        </span>
                        <h4 className="text-xs font-bold text-[var(--foreground)] font-mono truncate max-w-[160px]">{preset.label}</h4>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = [...customPresets];
                          updated[index].pinned = !updated[index].pinned;
                          setCustomPresets(updated);
                          localStorage.setItem('ui-master-custom-presets', JSON.stringify(updated));
                        }}
                        className={`p-1.5 border rounded cursor-pointer transition-all ${
                          preset.pinned ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' : 'border-[var(--border)] text-[var(--muted)] hover:text-white'
                        }`}
                        title={preset.pinned ? 'Unpin theme' : 'Pin theme'}
                      >
                        ★
                      </button>
                    </div>
                    <p className="text-[10px] text-[var(--muted)] leading-relaxed h-12 overflow-hidden">{preset.desc}</p>
                    
                    {/* Visual Color Previews */}
                    <div className="flex gap-1 pt-1">
                      {mini4(preset.ds.colors.primaryBase).map((c, j) => (
                        <div key={j} className="w-4 h-4 rounded-sm border border-black/10" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                    <button 
                      onClick={() => {
                        setActivePreset(index);
                        setDs(preset.ds);
                        setTab('configure');
                      }}
                      className="flex-1 py-1.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/30 text-[var(--primary)] text-[9px] font-bold font-mono uppercase tracking-wider rounded cursor-pointer transition-all"
                    >
                      Load
                    </button>
                    <button 
                      onClick={() => {
                        const newGrp = prompt('Enter new group name:', preset.group || 'Custom');
                        if (newGrp !== null) {
                          const updated = [...customPresets];
                          updated[index].group = newGrp;
                          setCustomPresets(updated);
                          localStorage.setItem('ui-master-custom-presets', JSON.stringify(updated));
                        }
                      }}
                      className="px-2 py-1.5 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] text-[9px] font-mono rounded cursor-pointer"
                    >
                      Group
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete preset "${preset.label}"?`)) {
                          const updated = customPresets.filter((_, idx) => idx !== index);
                          setCustomPresets(updated);
                          localStorage.setItem('ui-master-custom-presets', JSON.stringify(updated));
                          if (activePreset === index) {
                            setActivePreset(0);
                            setDs(updated[0]?.ds || PRESETS[0].ds);
                          } else if (activePreset > index) {
                            setActivePreset(prev => prev - 1);
                          }
                        }
                      }}
                      disabled={customPresets.length <= 1}
                      className="px-2 py-1.5 border border-red-500/20 hover:border-red-500/50 text-red-400 text-[9px] font-mono rounded cursor-pointer disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BRAND CARD TAB ── */}
      {tab === 'brandcard' && (
        <div className="space-y-4">
          <p className="text-xs text-[var(--muted)] font-mono">Your complete design system card. Use <strong className="text-white">Print / PDF</strong> for A3 print export or <strong className="text-white">Download PNG</strong> for a 2× image asset.</p>
          <div className="border border-[var(--border)] rounded-lg overflow-auto bg-[var(--surface)] p-6 flex justify-center">
            <div className="shadow-2xl">
              <BrandCard ds={ds} cardRef={cardRef} />
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT TAB ── */}
      {tab === 'export' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {EXPORT_FMTS.map((f) => (
              <button key={f.id} onClick={() => setFmt(f.id)}
                className={`text-[10px] font-bold font-mono px-4 py-2 border rounded transition-all cursor-pointer ${fmt === f.id ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--muted)]'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-4">
            <pre className="bg-black/50 rounded border border-[var(--border)] p-4 text-[11px] font-mono text-emerald-400 overflow-auto max-h-[60vh] leading-relaxed whitespace-pre">
              {exportText()}
            </pre>
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-4 text-[11px] font-mono text-[var(--muted)]">
            {EXPORT_FMTS.find((f) => f.id === fmt)?.hint}
          </div>
        </div>
      )}

    </div>
  );
}
