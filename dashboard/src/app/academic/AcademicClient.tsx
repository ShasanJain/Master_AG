'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search, BookOpen, ExternalLink, Download, Users,
  Calendar, Tag, Layers, RefreshCw, ChevronDown, ChevronUp,
  FileText, Zap, Database, GitCommit, FileCode, Check, Copy
} from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  pdf_url: string;
  abs_url: string;
  source: 'arXiv' | 'OpenAlex' | 'EuropePMC' | 'bioRxiv' | 'medRxiv';
  categories: string[];
  cited_by_count: number | null;
}

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources', color: 'text-cyan-400', icon: '🌐' },
  { value: 'arxiv', label: 'arXiv', color: 'text-rose-400', icon: '⚛️' },
  { value: 'openalex', label: 'OpenAlex', color: 'text-blue-400', icon: '🔭' },
  { value: 'europepmc', label: 'Europe PMC', color: 'text-amber-400', icon: '🧬' },
  { value: 'biorxiv', label: 'bioRxiv', color: 'text-emerald-400', icon: '🌱' },
  { value: 'medrxiv', label: 'medRxiv', color: 'text-purple-400', icon: '🏥' },
];

const MAX_RESULTS_OPTIONS = [5, 10, 20, 30];

interface PaperCardProps {
  paper: Paper;
  isSelected: boolean;
  onSelect: () => void;
}

function PaperCard({ paper, isSelected, onSelect }: PaperCardProps) {
  const getSourceStyle = () => {
    switch (paper.source) {
      case 'arXiv': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'OpenAlex': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'EuropePMC': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'bioRxiv': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'medRxiv': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`border rounded-lg p-4 space-y-2.5 transition-all cursor-pointer group hover:bg-white/5 ${
        isSelected
          ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]'
          : 'border-[var(--border)] bg-[var(--surface)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xs font-bold text-[var(--foreground)] leading-snug group-hover:text-[var(--primary)] transition-colors line-clamp-2">
          {paper.title}
        </h3>
        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border shrink-0 ${getSourceStyle()}`}>
          {paper.source}
        </span>
      </div>

      {paper.authors.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-[var(--muted)] font-mono">
          <Users className="w-3 h-3 shrink-0" />
          <span className="truncate">{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}</span>
        </div>
      )}

      <div className="flex items-center gap-3 text-[9px] text-[var(--muted)] font-mono flex-wrap">
        {paper.published && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />{paper.published}
          </span>
        )}
        {paper.cited_by_count !== null && paper.cited_by_count !== undefined && (
          <span className="flex items-center gap-0.5 text-amber-400">
            <Zap className="w-3 h-3" />{paper.cited_by_count} citation{paper.cited_by_count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AcademicClient() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [maxResults, setMaxResults] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  // Detail viewer state
  const [detailTab, setDetailTab] = useState<'overview' | 'fulltext' | 'citations' | 'pdf'>('overview');
  const [fulltext, setFulltext] = useState('');
  const [loadingFulltext, setLoadingFulltext] = useState(false);
  const [citations, setCitations] = useState<any[]>([]);
  const [references, setReferences] = useState<any[]>([]);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  const handleSearch = useCallback((searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim() || isSearching) return;

    setPapers([]);
    setLogs([]);
    setIsSearching(true);
    setHasSearched(true);
    setSelectedPaper(null);

    const params = new URLSearchParams({
      query: q.trim(),
      source,
      max_results: String(maxResults),
    });

    const sse = new EventSource(`/api/academic?${params}`);
    eventSourceRef.current = sse;

    sse.onmessage = (event) => {
      const raw = event.data;

      if (raw.startsWith('RESULT:')) {
        try {
          const paper: Paper = JSON.parse(raw.slice(7));
          setPapers((prev) => [...prev, paper]);
        } catch {
          // skip malformed
        }
      } else if (raw.startsWith('LOG:')) {
        setLogs((prev) => [...prev, raw.slice(4)]);
      } else if (raw === 'SEARCH_COMPLETE' || raw === 'DONE') {
        setIsSearching(false);
        sse.close();
      }
    };

    sse.onerror = () => {
      setLogs((prev) => [...prev, '[ERROR] Search stream interrupted.']);
      setIsSearching(false);
      sse.close();
    };
  }, [query, source, maxResults, isSearching]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Fetch full text when selected tab changes
  useEffect(() => {
    if (!selectedPaper) return;
    
    if (detailTab === 'fulltext') {
      const pmcid = selectedPaper.id.startsWith('PMC') ? selectedPaper.id : '';
      if (!pmcid) {
        setFulltext('Full text extraction is only available for open access PMC publications.');
        return;
      }
      setLoadingFulltext(true);
      setFulltext('');
      fetch(`/api/academic?action=fulltext&id=${pmcid}`)
        .then((res) => res.text())
        .then((data) => {
          setFulltext(data || 'No full text body found.');
          setLoadingFulltext(false);
        })
        .catch(() => {
          setFulltext('Failed to fetch full text document.');
          setLoadingFulltext(false);
        });
    }

    if (detailTab === 'citations') {
      setLoadingGraph(true);
      const dbType = selectedPaper.id.startsWith('PMC') ? 'PMC' : 'MED';
      
      // Fetch references and citations in parallel
      Promise.all([
        fetch(`/api/academic?action=references&id=${selectedPaper.id}&db=${dbType}`).then(r => r.json()),
        fetch(`/api/academic?action=citations&id=${selectedPaper.id}&db=${dbType}`).then(r => r.json())
      ]).then(([refData, citData]) => {
        setReferences(refData.references || []);
        setCitations(citData.citations || []);
        setLoadingGraph(false);
      }).catch(() => {
        setReferences([]);
        setCitations([]);
        setLoadingGraph(false);
      });
    }
  }, [selectedPaper, detailTab]);

  const copyBibtex = () => {
    if (!selectedPaper) return;
    const authorKey = selectedPaper.authors[0] ? selectedPaper.authors[0].split(' ')[0].toLowerCase() : 'unknown';
    const yearKey = selectedPaper.published ? selectedPaper.published.slice(0, 4) : '2026';
    const cleanTitle = selectedPaper.title.replace(/[^a-zA-Z0-9\s]/g, '').split(' ').slice(0, 3).join('').toLowerCase();
    
    const bibtex = `@article{${authorKey}${yearKey}${cleanTitle},
  title={${selectedPaper.title}},
  author={${selectedPaper.authors.join(' and ')}},
  journal={${selectedPaper.source} Literature Database},
  year={${yearKey}},
  url={${selectedPaper.abs_url}}
}`;

    navigator.clipboard.writeText(bibtex);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const handleHopNode = (title: string) => {
    setQuery(title);
    handleSearch(title);
  };

  const selectedSource = SOURCE_OPTIONS.find((s) => s.value === source) || SOURCE_OPTIONS[0];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-rose-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-mono">
          🔬 ACADEMIC SEARCH COCKPIT
        </h1>
        <p className="text-[10px] text-[var(--muted)] font-mono mt-0.5">
          Federated scientific pipeline crossing arXiv · OpenAlex · Europe PMC · bioRxiv · medRxiv.
        </p>
      </div>

      {/* Control panel */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
          {/* Query input */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono">Search Pipeline</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search literature, keywords, DOIs..."
                disabled={isSearching}
                className="w-full bg-[var(--background)] border border-[var(--border)] pl-9 pr-4 py-2 rounded text-xs text-white placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--primary)] transition-colors font-mono"
              />
            </div>
          </div>

          {/* Source options selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono">Source</label>
            <div className="flex flex-wrap gap-1">
              {SOURCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSource(opt.value)}
                  disabled={isSearching}
                  className={`px-2.5 py-1.5 rounded border text-[9px] font-bold font-mono transition-all whitespace-nowrap ${
                    source === opt.value
                      ? `bg-[var(--primary)]/15 border-[var(--primary)] ${opt.color}`
                      : 'border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border)]/80'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max results selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono">Limit</label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              disabled={isSearching}
              className="bg-[var(--background)] border border-[var(--border)] text-white text-[10px] font-mono px-2.5 py-1.5 rounded focus:outline-none focus:border-[var(--primary)] transition-colors h-[28px] lg:h-[30px]"
            >
              {MAX_RESULTS_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} items</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="space-y-1">
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[var(--primary)] text-black font-bold text-xs rounded hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] transition-all disabled:opacity-40 font-mono h-[30px]"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              {isSearching ? 'SEARCHING...' : 'DISPATCH'}
            </button>
          </div>
        </div>

        {/* Real-time telemetry log feed */}
        {logs.length > 0 && (
          <div className="bg-black/45 rounded border border-[var(--border)] px-3 py-2 font-mono text-[9px] text-[var(--muted)] space-y-0.5 max-h-20 overflow-y-auto">
            {logs.map((l, i) => (
              <div key={i} className={l.includes('[ERROR]') ? 'text-rose-400' : 'text-cyan-400/80'}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main split-pane workflow workspace */}
      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4 min-h-[500px]">
          {/* Left panel: papers list */}
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted)] px-1 shrink-0">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" /> {papers.length} matches discovered
              </span>
              {isSearching && (
                <span className="text-[var(--primary)] animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> pipeline active
                </span>
              )}
            </div>

            <div className="overflow-y-auto max-h-[600px] space-y-2 pr-1 flex-1">
              {papers.map((paper) => (
                <PaperCard
                  key={`${paper.source}-${paper.id}`}
                  paper={paper}
                  isSelected={selectedPaper?.id === paper.id}
                  onSelect={() => {
                    setSelectedPaper(paper);
                    setDetailTab('overview');
                  }}
                />
              ))}

              {!isSearching && papers.length === 0 && (
                <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-10 text-center space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-[var(--muted)] opacity-35" />
                  <p className="text-xs font-mono text-[var(--muted)]">No papers match this query criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Detail Cockpit Reader */}
          <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg flex flex-col overflow-hidden max-h-[630px]">
            {selectedPaper ? (
              <>
                {/* Cockpit header */}
                <div className="p-4 border-b border-[var(--border)] space-y-2 shrink-0 bg-white/2">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xs font-bold text-white leading-normal">
                      {selectedPaper.title}
                    </h2>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                      {selectedPaper.source}
                    </span>
                  </div>

                  {selectedPaper.authors.length > 0 && (
                    <div className="text-[10px] font-mono text-[var(--muted)]">
                      {selectedPaper.authors.join(', ')}
                    </div>
                  )}

                  {/* Document utility toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                    {selectedPaper.pdf_url && (
                      <a
                        href={selectedPaper.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[9px] font-mono font-bold px-2.5 py-1 bg-[var(--primary)] text-black rounded hover:opacity-90 transition-all"
                      >
                        <Download className="w-3 h-3" /> PDF DOCUMENT
                      </a>
                    )}
                    <a
                      href={selectedPaper.abs_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] font-mono font-bold px-2.5 py-1 border border-[var(--border)] text-white rounded hover:bg-white/5 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> EXTERNAL GATEWAY
                    </a>
                    <button
                      onClick={copyBibtex}
                      className="flex items-center gap-1 text-[9px] font-mono font-bold px-2.5 py-1 border border-[var(--border)] text-white rounded hover:bg-white/5 transition-all"
                    >
                      {copiedBibtex ? <Check className="w-3 h-3 text-emerald-400" /> : <FileCode className="w-3 h-3" />}
                      {copiedBibtex ? 'COPIED BIBTEX' : 'GENERATE BIBTEX'}
                    </button>
                  </div>
                </div>

                {/* Tabs bar */}
                <div className="flex border-b border-[var(--border)] bg-black/20 shrink-0">
                  {[
                    { id: 'overview', label: 'OVERVIEW' },
                    { id: 'fulltext', label: 'FULL TEXT' },
                    { id: 'citations', label: 'LITERATURE GRAPH' },
                    { id: 'pdf', label: 'PDF VIEW' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDetailTab(t.id as any)}
                      className={`px-4 py-2 text-[9px] font-mono font-bold transition-all border-b-2 ${
                        detailTab === t.id
                          ? 'border-[var(--primary)] text-[var(--primary)]'
                          : 'border-transparent text-[var(--muted)] hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Pane Content body */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0 text-xs leading-relaxed font-mono">
                  {detailTab === 'overview' && (
                    <div className="space-y-4">
                      {/* Meta block */}
                      <div className="grid grid-cols-2 gap-2 bg-black/20 p-3 border border-[var(--border)] rounded">
                        <div>
                          <span className="text-[8px] text-[var(--muted)] uppercase block font-bold">Published Date</span>
                          <span className="text-[10px] text-white">{selectedPaper.published || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-[var(--muted)] uppercase block font-bold">Citations</span>
                          <span className="text-[10px] text-amber-400">
                            {selectedPaper.cited_by_count !== null ? selectedPaper.cited_by_count.toLocaleString() : 'Not Tracked'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[8px] text-[var(--muted)] uppercase block font-bold">Mapped Concepts</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedPaper.categories.length > 0 ? (
                              selectedPaper.categories.map((c) => (
                                <span key={c} className="text-[8px] px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-white/80">
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-[var(--muted)]">No category concepts parsed</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Abstract summary */}
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">Document Abstract</h4>
                        <p className="text-[11px] text-white/90 leading-relaxed font-sans">
                          {selectedPaper.abstract || 'No abstract content available.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailTab === 'fulltext' && (
                    <div className="space-y-2">
                      {loadingFulltext ? (
                        <div className="flex items-center justify-center p-20 gap-2 text-[var(--muted)]">
                          <RefreshCw className="w-4 h-4 animate-spin text-[var(--primary)]" />
                          <span>FETCHING FULL-TEXT DOCUMENT BODY...</span>
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-[10px] bg-black/30 p-3 rounded border border-[var(--border)] leading-relaxed">
                          {fulltext}
                        </pre>
                      )}
                    </div>
                  )}

                  {detailTab === 'citations' && (
                    <div className="space-y-4">
                      {loadingGraph ? (
                        <div className="flex items-center justify-center p-20 gap-2 text-[var(--muted)]">
                          <RefreshCw className="w-4 h-4 animate-spin text-[var(--primary)]" />
                          <span>RETRIEVING CITATION NETWORK NODES...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* References */}
                          <div className="space-y-2">
                            <h4 className="text-[9px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 border-b border-[var(--border)] pb-1">
                              <GitCommit className="w-3.5 h-3.5" /> Outgoing References ({references.length})
                            </h4>
                            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                              {references.map((ref, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleHopNode(ref.title)}
                                  className="p-2 border border-[var(--border)] rounded bg-black/10 hover:border-[var(--primary)] cursor-pointer text-[10px] space-y-1 group"
                                >
                                  <div className="text-[10px] text-white font-bold group-hover:text-[var(--primary)] transition-all line-clamp-2">
                                    {ref.title}
                                  </div>
                                  <div className="text-[8px] text-[var(--muted)] flex justify-between font-mono">
                                    <span>{ref.authors?.[0]?.slice(0, 15) || 'Unknown'}</span>
                                    <span>{ref.published}</span>
                                  </div>
                                </div>
                              ))}
                              {references.length === 0 && (
                                <div className="text-[9px] text-[var(--muted)] py-4 text-center">No references matched.</div>
                              )}
                            </div>
                          </div>

                          {/* Citations */}
                          <div className="space-y-2">
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 border-b border-[var(--border)] pb-1">
                              <Layers className="w-3.5 h-3.5" /> Incoming Citations ({citations.length})
                            </h4>
                            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                              {citations.map((cit, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleHopNode(cit.title)}
                                  className="p-2 border border-[var(--border)] rounded bg-black/10 hover:border-[var(--primary)] cursor-pointer text-[10px] space-y-1 group"
                                >
                                  <div className="text-[10px] text-white font-bold group-hover:text-[var(--primary)] transition-all line-clamp-2">
                                    {cit.title}
                                  </div>
                                  <div className="text-[8px] text-[var(--muted)] flex justify-between font-mono">
                                    <span>{cit.authors?.[0]?.slice(0, 15) || 'Unknown'}</span>
                                    <span>{cit.published}</span>
                                  </div>
                                </div>
                              ))}
                              {citations.length === 0 && (
                                <div className="text-[9px] text-[var(--muted)] py-4 text-center">No citations discovered.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'pdf' && (
                    <div className="w-full h-full min-h-[400px] border border-[var(--border)] rounded overflow-hidden relative bg-black/20">
                      {selectedPaper.pdf_url ? (
                        <iframe
                          src={selectedPaper.pdf_url}
                          className="w-full h-[450px]"
                          title="Scientific PDF Document Viewer"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full p-20 text-[var(--muted)] font-mono text-center">
                          Direct PDF preview is unavailable for this record.
                          <br />
                          Please use the EXTERNAL GATEWAY link.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3 text-[var(--muted)]">
                <BookOpen className="w-12 h-12 opacity-20 text-[var(--primary)]" />
                <div>
                  <h3 className="text-xs font-bold text-white font-mono">No Document Selected</h3>
                  <p className="text-[10px] opacity-60 mt-1 max-w-[280px] mx-auto font-mono">
                    Select a paper card from the search pipeline list to initialize the cockpit reader pane.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Landing state */}
      {!hasSearched && (
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-10 text-center space-y-4">
          <FileText className="w-10 h-10 mx-auto text-[var(--muted)] opacity-25 text-[var(--primary)]" />
          <div className="space-y-1">
            <p className="text-xs font-mono text-[var(--muted)]">Deploy search queries across federated repositories.</p>
            <p className="text-[9px] text-[var(--muted)] opacity-50 font-mono">
              Powered by arXiv · OpenAlex · Europe PMC · bioRxiv · medRxiv
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 pt-1.5 max-w-xl mx-auto">
            {['transformer attention mechanism', 'CRISPR gene therapy', 'quantum error correction', 'bioinformatics pathway analysis'].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  handleSearch(q);
                }}
                className="text-[9px] font-mono px-2.5 py-1.5 border border-[var(--border)] rounded hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all text-[var(--muted)] bg-black/10"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
