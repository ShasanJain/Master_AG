"use client";

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '../components/StatusBadge';

interface SeoResult {
  url: string;
  title: string | null;
  meta_description: string | null;
  h1: string[];
  h2: string[];
  word_count: number;
  images: { total: number; without_alt: number };
  links: { internal: number; external: number };
  schema_types: string[];
  score: number;
}

export default function SeoAnalyzer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        setError(data.error || 'Failed to analyze URL');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans tracking-tight">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/">
                <button className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              </Link>
              <h1 className="text-2xl font-semibold tracking-tighter text-white">
                SEO & Marketing Analyzer
              </h1>
            </div>
            <div className="flex items-center gap-3 ml-8">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Engine Status:</span>
              <StatusBadge status="OPTIMAL" />
            </div>
          </div>
        </header>

        {/* Input Section */}
        <section className="bg-[#111] border border-white/10 p-8 rounded-xl space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Target URL</label>
            <div className="flex gap-4">
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com" 
                className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/50 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && analyzeUrl()}
              />
              <button 
                onClick={analyzeUrl}
                disabled={loading || !url}
                className="bg-white text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Audit Target'}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#111] border border-white/10 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden group">
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${result.score > 80 ? 'bg-green-500' : result.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">SEO Score</span>
                <span className={`text-5xl font-black tracking-tighter relative z-10 ${result.score > 80 ? 'text-green-400' : result.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {result.score}/100
                </span>
              </div>
              <div className="bg-[#111] border border-white/10 p-6 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Word Count</span>
                <span className="text-3xl font-bold tracking-tighter text-white">{result.word_count}</span>
              </div>
              <div className="bg-[#111] border border-white/10 p-6 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Internal Links</span>
                <span className="text-3xl font-bold tracking-tighter text-white">{result.links.internal}</span>
              </div>
              <div className="bg-[#111] border border-white/10 p-6 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Images w/o Alt</span>
                <span className={`text-3xl font-bold tracking-tighter ${result.images.without_alt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {result.images.without_alt} / {result.images.total}
                </span>
              </div>
            </div>

            {/* Detailed Audit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Meta Data */}
              <div className="bg-[#111] border border-white/10 p-8 rounded-xl space-y-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-4">Meta Data</h3>
                
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Title Tag</span>
                  {result.title ? (
                    <p className="text-sm text-gray-200">{result.title}</p>
                  ) : (
                    <p className="text-sm text-red-400 font-mono">Missing Title Tag</p>
                  )}
                  {result.title && (
                     <p className="text-[10px] text-gray-600 mt-1">{result.title.length} characters</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Meta Description</span>
                  {result.meta_description ? (
                    <p className="text-sm text-gray-200 leading-relaxed">{result.meta_description}</p>
                  ) : (
                    <p className="text-sm text-red-400 font-mono">Missing Meta Description</p>
                  )}
                  {result.meta_description && (
                     <p className="text-[10px] text-gray-600 mt-1">{result.meta_description.length} characters</p>
                  )}
                </div>
              </div>

              {/* Semantic Structure */}
              <div className="bg-[#111] border border-white/10 p-8 rounded-xl space-y-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-4">Semantic Structure</h3>
                
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">H1 Tag(s) ({result.h1.length})</span>
                  {result.h1.length === 0 ? (
                    <p className="text-sm text-red-400 font-mono">Missing H1</p>
                  ) : result.h1.length > 1 ? (
                    <div className="space-y-2">
                       <p className="text-[10px] text-yellow-400 uppercase">Warning: Multiple H1s</p>
                       {result.h1.map((h, i) => <p key={i} className="text-sm text-gray-300 font-mono bg-black p-2 rounded border border-white/5">{h}</p>)}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 font-mono bg-black p-2 rounded border border-white/5">{result.h1[0]}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Schema JSON-LD</span>
                  {result.schema_types.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.schema_types.map((t, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-1 rounded bg-white/10 text-gray-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 font-mono">No structured data found</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
