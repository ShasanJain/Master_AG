"use client";

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Globe, Shield, AlertTriangle, CheckCircle, BarChart3, 
  Bot, Clock, ListChecks, ArrowLeft, ArrowUpRight, Palette, Activity, FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ExtractedTheme {
  primary: string;
  dark: string;
  light: string;
  fonts: string[];
  radius: string;
}

interface SeoResult {
  url: string;
  title: string | null;
  meta_description: string | null;
  h1: string[];
  h2: string[];
  word_count: number;
  images: { total: number; without_alt: number };
  links: { total: number; internal: number; external: number; broken_count: number; broken_links: { url: string; status: number }[] };
  schema_types: string[];
  schema_audit: { valid: boolean; deprecated_types: string[]; total_detected: number };
  ai_crawlers: { blocked: string[]; allowed: string[] };
  security_headers: Record<string, boolean>;
  performance: { PerformanceScore: number | null; LCP: string; INP: string; CLS: string };
  score: number;
  extracted_theme: ExtractedTheme;
  sitemap: { detected: boolean; url: string };
  ssl: { is_ssl: boolean; redirect_chain: string[] };
}

type Tab = 'overview' | 'technical' | 'content' | 'theme' | 'action';

export default function SeoAnalyzer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const exportToPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    // Header Style
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("JACK INDUSTRIAL — SEO AUDIT REPORT", 14, 18);
    
    // Target details
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Target URL: ${result.url}`, 14, 40);
    doc.text(`SEO Grade Score: ${result.score}/100`, 14, 46);
    
    // Core parameters table
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 55, 182, 38, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("AUDIT PARAMETERS METRICS", 18, 62);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Word count: ${result.word_count}`, 18, 70);
    doc.text(`Images missing alt text: ${result.images.without_alt} / ${result.images.total}`, 18, 76);
    doc.text(`Link verification (internal/external): ${result.links.internal} / ${result.links.external}`, 18, 82);
    doc.text(`Sitemap.xml detected: ${result.sitemap.detected ? 'Yes' : 'No'}`, 18, 88);

    // Meta Data checks
    doc.setFont("helvetica", "bold");
    doc.text("METADATA PARAMETERS", 14, 105);
    doc.setFont("helvetica", "normal");
    doc.text(`Title Tag: ${result.title || 'Missing title'}`, 14, 112);
    doc.text(`Meta Description: ${result.meta_description || 'Missing description'}`, 14, 118);

    // Action plan
    doc.setFont("helvetica", "bold");
    doc.text("PRIORITY TROUBLESHOOTING CHECKLIST", 14, 132);
    doc.setFont("helvetica", "normal");
    const actions = generateActionPlan(result);
    let y = 140;
    actions.forEach((act, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${i + 1}. [${act.priority}] ${act.title}: ${act.desc}`, 14, y);
      y += 8;
    });

    doc.save(`seo-audit-${new URL(result.url).hostname}.pdf`);
  };

  const analyzeUrl = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/seo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      
      if (data.success) {
        setResult(data.result);
        setActiveTab('overview');
      } else {
        setError(data.error || 'Failed to analyze URL');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
    setLoading(false);
  };

  // Dynamic Action Plan builder based on SEO results
  const generateActionPlan = (res: SeoResult) => {
    const actions: { title: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; desc: string }[] = [];

    if (!res.title) {
      actions.push({ title: 'Add missing title tag', priority: 'HIGH', desc: 'Critical for search engine indexation and browser tab labels.' });
    } else if (res.title.length < 30 || res.title.length > 60) {
      actions.push({ title: 'Optimize Title length', priority: 'MEDIUM', desc: `Current length (${res.title.length} characters) is outside the optimal 30-60 character range.` });
    }

    if (!res.meta_description) {
      actions.push({ title: 'Add missing meta description', priority: 'HIGH', desc: 'Crucial for SERP snippet CTR. Target 120-160 characters.' });
    } else if (res.meta_description.length < 50 || res.meta_description.length > 160) {
      actions.push({ title: 'Tune meta description length', priority: 'LOW', desc: `Current length (${res.meta_description.length} characters) is outside the optimal 50-160 character range.` });
    }

    if (res.h1.length === 0) {
      actions.push({ title: 'Add H1 heading tag', priority: 'HIGH', desc: 'The page must have exactly one main semantic H1 heading.' });
    } else if (res.h1.length > 1) {
      actions.push({ title: 'Consolidate multiple H1 tags', priority: 'MEDIUM', desc: 'Found multiple H1 headings. Consolidate into a single H1 for correct HTML structure.' });
    }

    if (res.images.without_alt > 0) {
      actions.push({ title: `Add alt text to ${res.images.without_alt} images`, priority: 'MEDIUM', desc: 'Improves accessibility and ranks images in Google Image Search.' });
    }

    if (res.word_count < 300) {
      actions.push({ title: 'Expand content length', priority: 'HIGH', desc: 'Content is under 300 words. Search engines prefer deeper, more comprehensive resources.' });
    }

    if (res.schema_audit.total_detected === 0) {
      actions.push({ title: 'Inject structured JSON-LD schema', priority: 'MEDIUM', desc: 'Add Organization, Article, or WebSite schema to stand out with rich search results.' });
    }

    if (res.schema_audit.deprecated_types.length > 0) {
      actions.push({ title: 'Replace restricted schema types', priority: 'HIGH', desc: `Replace deprecated schema patterns (${res.schema_audit.deprecated_types.join(', ')}) with standard JSON-LD structures.` });
    }

    const missingHeaders = Object.keys(res.security_headers).filter(k => !res.security_headers[k]);
    if (missingHeaders.length > 0) {
      actions.push({ title: `Configure missing security headers`, priority: 'MEDIUM', desc: `Implement headers for server safety: ${missingHeaders.join(', ')}.` });
    }

    if (res.ai_crawlers.allowed.length > 0) {
      actions.push({ title: 'Tune AI crawler rules in robots.txt', priority: 'LOW', desc: `Assess whether you want to block or rate-limit AI bots like GPTBot or ClaudeBot.` });
    }

    return actions;
  };

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="min-h-screen bg-transparent text-[var(--foreground)] font-sans tracking-tight relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        
          {/* Header */}
          <header className="flex justify-between items-center pb-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </Link>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] uppercase font-mono">
                  SEO & Marketing Auditor
                </h1>
                <p className="text-xs text-[var(--muted)] mt-1">Audit technical parameters, sitemaps, structured schema markup, and AI indexing guidelines.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {result && (
                <button 
                  onClick={exportToPDF}
                  className="flex items-center gap-1.5 text-[10px] font-bold font-mono px-3 py-2 bg-[var(--primary)]/15 border border-[var(--primary)]/40 text-[var(--primary)] rounded hover:bg-[var(--primary)]/25 transition-all cursor-pointer"
                  title="Export PDF Report"
                >
                  <FileDown className="w-3.5 h-3.5" /> Export PDF
                </button>
              )}
              <StatusBadge status="OPTIMAL" />
            </div>
          </header>

          {/* Search Card */}
          <section className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4 hover:border-[var(--primary)] transition-all">
            <div className="flex gap-4">
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to audit (e.g., https://example.com)" 
                className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && analyzeUrl()}
              />
              <button 
                onClick={analyzeUrl}
                disabled={loading || !url}
                className="px-8 py-3 rounded-lg font-bold text-xs disabled:opacity-50 shiny-button cursor-pointer"
              >
                {loading ? 'AUDITING NODE…' : 'RUN AUDIT'}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2 bg-red-400/10 p-3 rounded border border-red-500/20 font-mono">{error}</p>}
          </section>

          {result && (
            <div className="space-y-6">
                           {/* Tab Navigation */}
              <div className="flex gap-1 border border-[var(--border)] bg-[var(--surface)] p-1 rounded-lg w-fit">
                {([
                  { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-3.5 h-3.5" /> },
                  { id: 'technical', label: 'Technical & Security', icon: <Shield className="w-3.5 h-3.5" /> },
                  { id: 'content', label: 'Content & Schema', icon: <Globe className="w-3.5 h-3.5" /> },
                  { id: 'theme', label: 'Visual Palette', icon: <Palette className="w-3.5 h-3.5" /> },
                  { id: 'action', label: 'Action Plan', icon: <ListChecks className="w-3.5 h-3.5" /> }
                ] as const).map((t) => (
                  <button 
                    key={t.id} 
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase tracking-wider px-4 py-2 rounded transition-all cursor-pointer ${
                      activeTab === t.id ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[var(--primary)] transition-all">
                      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${result.score >= 80 ? 'bg-green-500' : result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2 relative z-10 font-mono">SEO Score</span>
                      <span className={`text-4xl font-black tracking-tight relative z-10 ${result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {result.score}/100
                      </span>
                    </div>
                    <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl flex flex-col justify-between hover:border-[var(--primary)] transition-all">
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2 font-mono">Word Count</span>
                      <span className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{result.word_count}</span>
                    </div>
                    <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl flex flex-col justify-between hover:border-[var(--primary)] transition-all">
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2 font-mono">Image Alt Missing</span>
                      <span className={`text-3xl font-bold tracking-tight ${result.images.without_alt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {result.images.without_alt} / {result.images.total}
                      </span>
                    </div>
                    <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl flex flex-col justify-between hover:border-[var(--primary)] transition-all">
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2 font-mono">Internal / External Links</span>
                      <span className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
                        {result.links.internal} / {result.links.external}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Meta */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                      <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2">Meta Tags</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[9px] font-bold font-mono text-[var(--muted)] uppercase block mb-1">Title</span>
                          <p className="text-xs text-[var(--foreground)] bg-[var(--background)] p-3 border border-[var(--border)] rounded font-mono">{result.title || 'Missing'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold font-mono text-[var(--muted)] uppercase block mb-1">Meta Description</span>
                          <p className="text-xs text-[var(--foreground)] bg-[var(--background)] p-3 border border-[var(--border)] rounded leading-relaxed">{result.meta_description || 'Missing'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Performance Indicators */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                      <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2">Vitals & Crawlability</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-[var(--background)] border border-[var(--border)] p-3 rounded">
                            <div className="text-[9px] font-mono text-[var(--muted)] uppercase mb-1">LCP</div>
                            <div className="text-xs font-bold text-[var(--foreground)]">{result.performance.LCP}</div>
                          </div>
                          <div className="bg-[var(--background)] border border-[var(--border)] p-3 rounded">
                            <div className="text-[9px] font-mono text-[var(--muted)] uppercase mb-1">Interactive</div>
                            <div className="text-xs font-bold text-[var(--foreground)]">{result.performance.INP}</div>
                          </div>
                          <div className="bg-[var(--background)] border border-[var(--border)] p-3 rounded">
                            <div className="text-[9px] font-mono text-[var(--muted)] uppercase mb-1">CLS</div>
                            <div className="text-xs font-bold text-[var(--foreground)]">{result.performance.CLS}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-[var(--background)] p-3 border border-[var(--border)] rounded text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-[var(--primary)]" />
                            <span>AI bot access status</span>
                          </div>
                          <span className={result.ai_crawlers.allowed.length > 0 ? 'text-yellow-500' : 'text-green-500'}>
                            {result.ai_crawlers.allowed.length} Crawlers allowed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TECHNICAL & SECURITY */}
              {activeTab === 'technical' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                  {/* Security Headers */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[var(--primary)]" /> Security Headers Audit
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(result.security_headers).map(([header, present]) => (
                        <div key={header} className="flex justify-between items-center bg-[var(--background)] p-3 border border-[var(--border)] rounded text-xs font-mono">
                          <span>{header}</span>
                          <span className={present ? 'text-green-500 flex items-center gap-1' : 'text-red-500 flex items-center gap-1'}>
                            {present ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                            {present ? 'CONFIGURED' : 'MISSING'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Robots.txt */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-sky-500" /> AI Crawler Management
                    </h3>
                    <div className="space-y-4">
                      {result.ai_crawlers.blocked.length > 0 && (
                        <div>
                          <span className="text-[9px] font-mono text-green-500 block mb-1">Blocked Crawlers</span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.ai_crawlers.blocked.map(c => (
                              <span key={c} className="text-[10px] bg-green-500/10 border border-green-500/30 text-green-400 font-mono px-2 py-1 rounded">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-mono text-yellow-500 block mb-1">Allowed Crawlers</span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.ai_crawlers.allowed.map(c => (
                            <span key={c} className="text-[10px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono px-2 py-1 rounded">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sitemap & SSL Redirects */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" /> Indexing & Redirection
                    </h3>
                    <div className="space-y-3 text-xs font-mono">
                      <div className="flex justify-between items-center bg-[var(--background)] p-3 border border-[var(--border)] rounded">
                        <span>sitemap.xml Detected</span>
                        <span className={result.sitemap.detected ? 'text-green-400' : 'text-red-400'}>
                          {result.sitemap.detected ? 'YES' : 'NO'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-[var(--background)] p-3 border border-[var(--border)] rounded">
                        <span>SSL Enabled</span>
                        <span className={result.ssl.is_ssl ? 'text-green-400' : 'text-red-400'}>
                          {result.ssl.is_ssl ? 'YES' : 'NO'}
                        </span>
                      </div>
                      {result.ssl.redirect_chain.length > 1 && (
                        <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded space-y-1.5">
                          <span className="text-[9px] text-[var(--muted)] block">Redirect Chain</span>
                          {result.ssl.redirect_chain.map((url, i) => (
                            <div key={i} className="truncate text-[10px] max-w-full text-[var(--foreground)]">{i + 1}. {url}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Link Quality & Broken Links */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" /> Link Verification Health
                    </h3>
                    <div className="space-y-3 text-xs font-mono">
                      <div className="flex justify-between items-center bg-[var(--background)] p-3 border border-[var(--border)] rounded">
                        <span>Tested Outbound Links</span>
                        <span>{result.links.total} total</span>
                      </div>
                      <div className="flex justify-between items-center bg-[var(--background)] p-3 border border-[var(--border)] rounded">
                        <span>Broken Links Found</span>
                        <span className={result.links.broken_count > 0 ? 'text-red-400' : 'text-green-400'}>
                          {result.links.broken_count} broken
                        </span>
                      </div>
                      {result.links.broken_count > 0 && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded space-y-1">
                          <div className="font-bold">Broken Link Log:</div>
                          {result.links.broken_links.map((link, idx) => (
                            <div key={idx} className="truncate text-[10px]">- {link.url} ({link.status})</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT & SCHEMA */}
              {activeTab === 'content' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                  {/* Semantic Heading Tree */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2">Heading Tree Structure</h3>
                    <div className="space-y-3 font-mono text-xs max-h-[300px] overflow-y-auto">
                      <div>
                        <span className="text-[9px] text-[var(--muted)] block mb-1">H1 Tags ({result.h1.length})</span>
                        {result.h1.length === 0 ? (
                          <div className="text-red-500 bg-red-500/10 p-2 border border-red-500/20 rounded">No H1 tag detected. Add one H1.</div>
                        ) : (
                          result.h1.map((h, i) => (
                            <div key={i} className="text-[var(--foreground)] bg-[var(--background)] p-2 border border-[var(--border)] rounded mb-1">{h}</div>
                          ))
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] text-[var(--muted)] block mb-1">H2 Tags ({result.h2.length})</span>
                        {result.h2.length === 0 ? (
                          <div className="text-[var(--muted)] p-2 bg-[var(--background)] rounded">No H2 tags.</div>
                        ) : (
                          result.h2.map((h, i) => (
                            <div key={i} className="text-[var(--muted)] pl-4 border-l border-[var(--border)] py-1 mb-1">{h}</div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Schema validation */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" /> JSON-LD Schema Registry
                    </h3>
                    <div className="space-y-4 text-xs font-mono">
                      <div className="flex justify-between items-center bg-[var(--background)] p-3 border border-[var(--border)] rounded">
                        <span>Total Detected Blocks</span>
                        <span className="text-[var(--foreground)]">{result.schema_audit.total_detected}</span>
                      </div>

                      {result.schema_types.length > 0 ? (
                        <div>
                          <span className="text-[9px] text-[var(--muted)] block mb-1.5">Detected Schema Types</span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.schema_types.map((s, i) => (
                              <span key={i} className="text-[10px] bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-2 py-1 rounded">{s}</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[var(--muted)] bg-[var(--background)] p-3 border border-[var(--border)] rounded">No Schema detected.</div>
                      )}

                      {result.schema_audit.deprecated_types.length > 0 && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded space-y-1">
                          <div className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Restricted Schemas Found:</div>
                          <div className="pl-4">
                            {result.schema_audit.deprecated_types.map(t => (
                              <div key={t}>- {t} (limited context or deprecated rich results)</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VISUAL PALETTE */}
              {activeTab === 'theme' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                  {/* Synthesized Brand Card Preview */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-pink-400" /> Synthesized Brand Card
                    </h3>
                    
                    <div className="bg-white text-slate-800 p-6 rounded-lg border border-slate-200 font-sans shadow-lg space-y-4">
                      {/* Brand Header */}
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded" 
                            style={{ 
                              background: `linear-gradient(135deg, ${result.extracted_theme.primary}, ${result.extracted_theme.dark})`,
                              borderRadius: result.extracted_theme.radius
                            }} 
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 font-mono truncate max-w-[200px]">
                              {result.title ? result.title.split(' ')[0] : 'Synthesized'}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{new URL(result.url).hostname}</p>
                          </div>
                        </div>
                        <span className="text-[8px] bg-slate-100 text-slate-500 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          Extracted UI
                        </span>
                      </div>

                      {/* Color Palette strips */}
                      <div className="space-y-2">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Primary Palette</div>
                        <div className="flex h-8 rounded overflow-hidden">
                          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s, i) => (
                            <div 
                              key={s} 
                              className="flex-1" 
                              style={{ 
                                backgroundColor: result.extracted_theme.primary,
                                opacity: 1 - (i * 0.08)
                              }} 
                              title={`Shade ${s}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Base Palette cards */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-mono">
                        <div className="border border-slate-100 p-2 rounded bg-slate-50">
                          <div className="text-slate-400 uppercase text-[8px] mb-1">Primary</div>
                          <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: result.extracted_theme.primary }} />
                          <span className="text-slate-600 font-bold">{result.extracted_theme.primary}</span>
                        </div>
                        <div className="border border-slate-100 p-2 rounded bg-slate-50">
                          <div className="text-slate-400 uppercase text-[8px] mb-1">Light</div>
                          <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: result.extracted_theme.light, border: '1px solid #e2e8f0' }} />
                          <span className="text-slate-600 font-bold">{result.extracted_theme.light}</span>
                        </div>
                        <div className="border border-slate-100 p-2 rounded bg-slate-50">
                          <div className="text-slate-400 uppercase text-[8px] mb-1">Dark</div>
                          <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: result.extracted_theme.dark }} />
                          <span className="text-slate-600 font-bold">{result.extracted_theme.dark}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Export Settings */}
                  <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2">Theme Metadata</h3>
                    
                    <div className="space-y-4 text-xs font-mono">
                      <div className="flex justify-between items-center bg-[var(--background)] p-3 border border-[var(--border)] rounded">
                        <span>Extracted Fonts</span>
                        <span className="text-[var(--foreground)]">{result.extracted_theme.fonts.join(', ')}</span>
                      </div>
                      <div className="flex justify-between items-center bg-[var(--background)] p-3 border border-[var(--border)] rounded">
                        <span>Border Radius</span>
                        <span className="text-[var(--foreground)]">{result.extracted_theme.radius}</span>
                      </div>

                      <div className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl space-y-3">
                        <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Dashboard Integration</span>
                        <p className="text-[11px] text-[var(--muted)] leading-relaxed">You can copy the extracted color codes directly, or launch the Design System Studio page to generate full variables templates from these parameters.</p>
                        <Link 
                          href={`/ui-master?primary=${encodeURIComponent(result.extracted_theme.primary)}&dark=${encodeURIComponent(result.extracted_theme.dark)}&light=${encodeURIComponent(result.extracted_theme.light)}`}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--primary)] hover:opacity-80 transition-opacity uppercase tracking-wider mt-1"
                        >
                          Load in UI Master Studio <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION PLAN */}
              {activeTab === 'action' && (
                <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4 animate-in fade-in duration-200">
                  <h3 className="text-xs font-bold font-mono text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2">Prioritized Recommendations Checklist</h3>
                  <div className="space-y-3">
                    {generateActionPlan(result).map((act, i) => (
                      <div key={i} className="flex gap-4 items-start bg-[var(--background)] p-4 border border-[var(--border)] rounded-xl group hover:border-[var(--primary)] transition-all">
                        <span className={`text-[8px] font-bold font-mono px-2 py-1 border rounded shrink-0 ${
                          act.priority === 'HIGH' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                          act.priority === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                          'bg-sky-500/10 border-sky-500/30 text-sky-500'
                        }`}>
                          {act.priority}
                        </span>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-[var(--foreground)] font-mono flex items-center gap-2">
                            {act.title}
                          </h4>
                          <p className="text-[11px] text-[var(--muted)] leading-relaxed">{act.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </>
  );
}
