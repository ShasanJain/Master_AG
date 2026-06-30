"use client";

import React, { useState, useEffect } from "react";

type DiagnosticResult = {
  status: "OK" | "NOT_CONFIGURED" | "UNKNOWN" | "ERROR";
  message: string;
  guide: string;
};

type DiagnosticsResponse = {
  acestep: DiagnosticResult;
  runpod: DiagnosticResult;
  ltx2: DiagnosticResult;
  moviepy: DiagnosticResult;
  playwright: DiagnosticResult;
};

export default function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/diagnostics");
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to run diagnostics", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OK": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "NOT_CONFIGURED": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "ERROR": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const skillNames: Record<keyof DiagnosticsResponse, string> = {
    acestep: "ACE-Step 1.5 (Music Generation)",
    runpod: "RunPod (Cloud GPU Integration)",
    ltx2: "LTX-2.3 (Video Generation)",
    moviepy: "MoviePy (Video Composition)",
    playwright: "Playwright (Browser Automation)",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Capabilities</h1>
            <p className="text-slate-400 mt-2">Diagnostic suite for Master_AG's generalized skills.</p>
          </div>
          <button 
            onClick={runDiagnostics} 
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Running..." : "Run Diagnostics"}
          </button>
        </header>

        {loading && !results ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-lg w-full"></div>
            ))}
          </div>
        ) : results ? (
          <div className="grid gap-4">
            {(Object.keys(results) as Array<keyof DiagnosticsResponse>).map((key) => {
              const res = results[key];
              return (
                <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-6 transition-all hover:bg-white/[0.07]">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">{skillNames[key]}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                      {res.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-3">{res.message}</p>
                  
                  {res.guide && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-md p-3 mt-4">
                      <p className="text-indigo-200 text-sm">
                        <strong className="text-indigo-400">Next Steps:</strong> {res.guide}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
