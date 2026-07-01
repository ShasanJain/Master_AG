'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Cell, PieChart, Pie, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, ComposedChart,
} from 'recharts';
import {
  TrendingUp, TrendingDown, RefreshCw, Activity, BarChart2, DollarSign,
  Globe, Zap, Shield, BookOpen, Brain, Cpu, Search, Bell, Settings,
  ChevronUp, ChevronDown, Minus, ArrowUpRight, ArrowDownRight,
  Plus, Trash2, Edit3, Eye, Download, Filter, Clock, AlertCircle,
  Layers, Target, PieChart as PieChartIcon, BarChart as BarChartIcon,
  TrendingUp as TrendUp, Wallet, Database, Server, Radio,
  Bookmark, Star, Play, RotateCcw, Trophy, Crosshair, CheckCircle, XCircle, Flame, X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MarketItem {
  ticker: string; name: string; price: number;
  change: number; change_pct: number; volume: string; sector: string;
}

interface Holding {
  symbol: string; sector: string; quantity: number;
  avg_buy_price: number; current_price: number; market_value: number;
  cost_basis: number; unrealized_pnl: number; unrealized_pnl_percent: number;
  day_change: number; day_change_pct: number; weight: number;
}

interface Transaction {
  date: string; type: string; symbol: string;
  quantity: number; price: number; total: number;
}

interface PortfolioData {
  total_market_value: number; total_cost_basis: number;
  total_unrealized_pnl: number; total_unrealized_pnl_percent: number;
  total_day_change: number; total_day_change_pct: number;
  holdings: Holding[]; transactions: Transaction[];
  sector_allocation: Record<string, number>;
  metrics: {
    sharpe: number; sortino: number; volatility: number;
    beta: number; alpha: number; max_drawdown: number;
    var_95: number; var_99: number; risk_score: number;
  };
}

interface OptionRow {
  strike: number; iv: number;
  call_price: number; call_delta: number; call_gamma: number;
  call_theta: number; call_vega: number; call_oi: number; call_vol: number; call_itm: boolean;
  put_price: number; put_delta: number; put_gamma: number;
  put_theta: number; put_vega: number; put_oi: number; put_vol: number; put_itm: boolean;
}

interface OptionsData {
  ticker: string; spot: number; expiry: string;
  chain: OptionRow[]; skew_chart: { strike: number; iv: number }[];
  atm_iv: number; put_call_ratio: number;
  term_structure: { days: number; iv: number }[];
}

interface BondRow {
  name: string; coupon: number; ytm: number; price: number;
  duration: number; maturity: number; rating: string; spread_bps: number;
}

interface BondsData {
  yield_curve: { maturity: string; tenor: number; yield: number }[];
  bonds: BondRow[];
  spreads: { hy_ig_spread: number; ig_treasury_spread: number; tips_breakeven_10y: number };
}

interface FXPair {
  pair: string; rate: number; bid: number; ask: number;
  change: number; change_pct: number; session_high: number; session_low: number;
}

interface FXData {
  pairs: FXPair[];
  eurusd_intraday: { time: number; open: number; close: number; high: number; low: number }[];
  central_bank_rates: { bank: string; rate: number; last_change: string }[];
}

interface MacroItem {
  indicator: string; value: string; period: string; trend: string;
}

interface AIAgent {
  name: string; style: string; sentiment: string; confidence: number;
  thesis: string; top_picks: string[]; risk_level: string;
}

interface FullData {
  status: string; timestamp: string;
  market_overview: MarketItem[];
  portfolio: PortfolioData;
  options: OptionsData;
  bonds: BondsData;
  fx: FXData;
  macro: MacroItem[];
  ai_agents: AIAgent[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = ['DASHBOARD', 'MARKETS', 'PORTFOLIO', 'EQUITY OPTIONS', 'FIXED INCOME', 'FX', 'NEWS', 'AI AGENTS', 'MACRO', 'WATCHLIST', 'DRILL', 'LEARN'] as const;
type TabType = typeof TABS[number];

const SECTOR_COLORS: Record<string, string> = {
  Technology: '#00f5ff', Financial: '#f59e0b', Healthcare: '#34d399',
  Communication: '#a78bfa', 'Consumer Cyclical': '#fb7185', Energy: '#fbbf24',
  Industrials: '#60a5fa', 'Consumer Defensive': '#86efac',
};

const SENTIMENT_COLOR: Record<string, string> = {
  BULLISH: '#34d399', BEARISH: '#fb7185', NEUTRAL: '#94a3b8',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const PctBadge = ({ val, suffix = '%' }: { val: number; suffix?: string }) => (
  <span className={`flex items-center gap-0.5 font-mono font-bold text-xs ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
    {val >= 0 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
    {Math.abs(val).toFixed(2)}{suffix}
  </span>
);

const StatBox = ({ label, value, sub, color = 'white' }: { label: string; value: string; sub?: string; color?: string }) => (
  <div className="bg-[#11131a] border border-[#1e293b] p-4 rounded-sm">
    <p className="text-[9px] text-[#64748b] uppercase font-mono tracking-widest">{label}</p>
    <p className={`text-base font-bold font-mono mt-1`} style={{ color }}>{value}</p>
    {sub && <p className="text-[10px] text-[#64748b] mt-0.5 font-mono">{sub}</p>}
  </div>
);

// ─── Dashboard Tab ─────────────────────────────────────────────────────────

function DashboardTab({ data }: { data: FullData }) {
  const { market_overview, portfolio, macro, fx } = data;
  const indices = market_overview.filter(m => m.sector === 'Index');
  const commodities = market_overview.filter(m => m.sector === 'Commodity');
  const crypto = market_overview.filter(m => m.sector === 'Crypto');
  const vix = market_overview.find(m => m.ticker === 'VIX');

  const mockNews = [
    { time: '09:42', src: 'REUTERS', headline: 'Fed signals patience on rate cuts amid sticky inflation data', sentiment: 'BEARISH', impact: 'HIGH' },
    { time: '09:31', src: 'BLOOMBERG', headline: 'NVIDIA beats estimates, guides higher on AI infrastructure demand', sentiment: 'BULLISH', impact: 'HIGH' },
    { time: '09:18', src: 'CNBC', headline: 'Treasury yields edge lower as jobs data comes in below expectations', sentiment: 'NEUTRAL', impact: 'MED' },
    { time: '08:55', src: 'WSJ', headline: 'Apple considers launching its own AI model to reduce OpenAI dependency', sentiment: 'BULLISH', impact: 'MED' },
    { time: '08:33', src: 'FT', headline: 'ECB holds rates, signals two more cuts before year-end', sentiment: 'BULLISH', impact: 'MED' },
    { time: '08:10', src: 'MARKETWATCH', headline: 'Oil slides 2% on demand concerns as OPEC+ signals output increase', sentiment: 'BEARISH', impact: 'MED' },
    { time: '07:44', src: 'BARRONS', headline: 'Small-cap stocks outperform as dollar weakens on rate cut bets', sentiment: 'BULLISH', impact: 'LOW' },
    { time: '07:22', src: 'FXSTREET', headline: 'USD/JPY tests 157 as carry trade unwind accelerates', sentiment: 'BEARISH', impact: 'HIGH' },
  ];

  return (
    <div className="grid grid-cols-12 gap-3 h-full">
      {/* Left column: Indices + FX + Commodities */}
      <div className="col-span-3 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)]">
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm">
          <div className="px-3 py-2 border-b border-[#1e293b] flex items-center gap-2">
            <Globe size={10} className="text-amber-500" />
            <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">GLOBAL INDICES</span>
          </div>
          {indices.map(item => (
            <div key={item.ticker} className="flex justify-between items-center px-3 py-2 border-b border-[#0d0e12] hover:bg-[#15171f] transition-colors">
              <div>
                <p className="text-xs font-bold text-white font-mono">{item.ticker}</p>
                <p className="text-[9px] text-[#64748b]">{item.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-white">{item.price.toLocaleString()}</p>
                <PctBadge val={item.change_pct} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm">
          <div className="px-3 py-2 border-b border-[#1e293b] flex items-center gap-2">
            <DollarSign size={10} className="text-amber-500" />
            <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">FX RATES</span>
          </div>
          {fx.pairs.slice(0, 5).map(p => (
            <div key={p.pair} className="flex justify-between items-center px-3 py-2 border-b border-[#0d0e12] hover:bg-[#15171f]">
              <p className="text-xs font-bold text-white font-mono">{p.pair}</p>
              <div className="text-right">
                <p className="text-xs font-mono text-white">{p.rate.toFixed(4)}</p>
                <PctBadge val={p.change_pct} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm">
          <div className="px-3 py-2 border-b border-[#1e293b] flex items-center gap-2">
            <Activity size={10} className="text-amber-500" />
            <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">COMMODITIES & CRYPTO</span>
          </div>
          {[...commodities, ...crypto].map(item => (
            <div key={item.ticker} className="flex justify-between items-center px-3 py-2 border-b border-[#0d0e12] hover:bg-[#15171f]">
              <div>
                <p className="text-xs font-bold text-white font-mono">{item.ticker}</p>
                <p className="text-[9px] text-[#64748b]">{item.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-white">{item.ticker === 'BTC' || item.ticker === 'ETH' ? item.price.toLocaleString() : item.price.toFixed(2)}</p>
                <PctBadge val={item.change_pct} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Portfolio Snapshot + Chart */}
      <div className="col-span-6 space-y-3">
        {/* Portfolio KPIs */}
        <div className="grid grid-cols-4 gap-2">
          <StatBox label="Portfolio Value" value={`$${(portfolio.total_market_value / 1000).toFixed(1)}K`} sub={`+$${(portfolio.total_day_change / 1000).toFixed(1)}K today`} color="#f59e0b" />
          <StatBox label="Unrealized P&L" value={`+$${(portfolio.total_unrealized_pnl / 1000).toFixed(1)}K`} sub={`${portfolio.total_unrealized_pnl_percent}%`} color="#34d399" />
          <StatBox label="VIX Index" value={vix?.price.toFixed(2) || '--'} sub={`${vix && vix.change_pct >= 0 ? '+' : ''}${vix?.change_pct.toFixed(2)}% today`} color={vix && vix.price > 20 ? '#fb7185' : '#94a3b8'} />
          <StatBox label="Sharpe Ratio" value={portfolio.metrics.sharpe.toFixed(2)} sub={`Sortino: ${portfolio.metrics.sortino.toFixed(2)}`} color="#a78bfa" />
        </div>

        {/* Market Heatmap - Holdings grid */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
              <BarChart2 size={10} className="text-amber-500" /> PORTFOLIO HOLDINGS MAP
            </span>
            <span className="text-[9px] text-[#64748b] font-mono">{portfolio.holdings.length} positions</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {portfolio.holdings.map(h => {
              const pnl = h.day_change_pct;
              const intensity = Math.min(Math.abs(pnl) / 3, 1);
              const bg = pnl >= 0
                ? `rgba(52, 211, 153, ${0.08 + intensity * 0.25})`
                : `rgba(251, 113, 133, ${0.08 + intensity * 0.25})`;
              const border = pnl >= 0 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(251, 113, 133, 0.3)';
              return (
                <div key={h.symbol} className="rounded-sm p-2 cursor-pointer" style={{ background: bg, border: `1px solid ${border}` }}>
                  <p className="text-xs font-bold text-white font-mono">{h.symbol}</p>
                  <p className="text-[9px] text-[#94a3b8]">{h.weight}%</p>
                  <PctBadge val={h.day_change_pct} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Allocation Bar */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-3">
          <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase block mb-3">SECTOR ALLOCATION</span>
          <div className="space-y-2">
            {Object.entries(portfolio.sector_allocation).sort((a, b) => b[1] - a[1]).map(([sector, pct]) => (
              <div key={sector} className="flex items-center gap-2">
                <span className="text-[10px] text-[#94a3b8] w-28 truncate font-mono">{sector}</span>
                <div className="flex-1 bg-[#0d0e12] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: SECTOR_COLORS[sector] || '#64748b' }} />
                </div>
                <span className="text-[10px] font-mono text-white w-10 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: News Feed */}
      <div className="col-span-3 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)]">
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm">
          <div className="px-3 py-2 border-b border-[#1e293b] flex items-center gap-2">
            <Radio size={10} className="text-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">LIVE NEWS</span>
            <span className="ml-auto text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded font-mono">FEED</span>
          </div>
          {mockNews.map((n, i) => (
            <div key={i} className="px-3 py-2.5 border-b border-[#0d0e12] hover:bg-[#15171f] cursor-pointer transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] font-mono text-[#64748b]">{n.time}</span>
                <span className="text-[8px] font-bold text-amber-500 font-mono">{n.src}</span>
                <span className="ml-auto text-[8px] font-bold" style={{ color: SENTIMENT_COLOR[n.sentiment] || '#94a3b8' }}>{n.sentiment}</span>
              </div>
              <p className="text-[10px] text-[#e2e8f0] leading-tight">{n.headline}</p>
            </div>
          ))}
        </div>

        {/* Risk Metrics */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-3">
          <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase block mb-3">RISK SNAPSHOT</span>
          <div className="space-y-2 text-[10px] font-mono">
            {[
              { label: 'Beta', val: portfolio.metrics.beta.toFixed(2), color: '#94a3b8' },
              { label: 'Alpha (ann.)', val: `+${portfolio.metrics.alpha}%`, color: '#34d399' },
              { label: 'Max Drawdown', val: `${portfolio.metrics.max_drawdown}%`, color: '#fb7185' },
              { label: 'VaR 95% (1D)', val: `$${portfolio.metrics.var_95.toLocaleString()}`, color: '#fb7185' },
              { label: 'VaR 99% (1D)', val: `$${portfolio.metrics.var_99.toLocaleString()}`, color: '#fb7185' },
              { label: 'Annual Vol', val: `${portfolio.metrics.volatility}%`, color: '#94a3b8' },
            ].map(item => (
              <div key={item.label} className="flex justify-between border-b border-[#0d0e12] pb-1.5">
                <span className="text-[#64748b]">{item.label}</span>
                <span style={{ color: item.color }} className="font-bold">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Markets Tab ──────────────────────────────────────────────────────────────

function MarketsTab({ data }: { data: FullData }) {
  const all = data.market_overview;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        {all.map(item => (
          <div key={item.ticker} className={`bg-[#11131a] border rounded-sm p-4 transition-all hover:border-amber-500/50 cursor-pointer ${item.change_pct >= 0 ? 'border-emerald-900/50' : 'border-red-900/50'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-white font-mono">{item.ticker}</p>
                <p className="text-[9px] text-[#64748b] mt-0.5">{item.name}</p>
              </div>
              {item.change_pct >= 0 ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
            </div>
            <p className="text-base font-bold font-mono text-white mt-2">
              {item.price > 1000 ? item.price.toLocaleString() : item.price.toFixed(item.price > 10 ? 2 : 4)}
            </p>
            <div className="flex justify-between items-center mt-1">
              <PctBadge val={item.change_pct} />
              <span className="text-[9px] text-[#64748b] font-mono">{item.volume}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Macro indicators */}
      <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
        <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">MACROECONOMIC INDICATORS (BLS / FRED)</p>
        <div className="grid grid-cols-5 gap-3">
          {data.macro.map((m, i) => (
            <div key={i} className="border-b border-[#1e293b] pb-3">
              <p className="text-[9px] text-[#64748b] font-mono">{m.indicator}</p>
              <p className="text-sm font-bold font-mono text-[#00f5ff] mt-1">{m.value}</p>
              <p className="text-[9px] text-[#64748b]">{m.period}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Tab ────────────────────────────────────────────────────────────

function PortfolioTab({ data }: { data: FullData }) {
  const { portfolio } = data;
  const [subTab, setSubTab] = useState<'HOLDINGS' | 'PERF/RISK' | 'SECTORS' | 'TRANSACTIONS'>('HOLDINGS');
  const [newSymbol, setNewSymbol] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const sectorPieData = Object.entries(portfolio.sector_allocation).map(([name, value]) => ({ name, value }));

  const perfData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    pnl: parseFloat((portfolio.total_market_value * 0.95 + (Math.random() * 0.08 - 0.02) * portfolio.total_market_value * i / 30).toFixed(0)),
  }));

  return (
    <div className="space-y-3">
      {/* Top KPIs */}
      <div className="grid grid-cols-6 gap-3">
        <StatBox label="Portfolio Value" value={`$${portfolio.total_market_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} sub="Market Value" color="#f59e0b" />
        <StatBox label="Cost Basis" value={`$${portfolio.total_cost_basis.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="#94a3b8" />
        <StatBox label="Unrealized P&L" value={`+$${portfolio.total_unrealized_pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} sub={`${portfolio.total_unrealized_pnl_percent}%`} color="#34d399" />
        <StatBox label="Today's Change" value={`${portfolio.total_day_change >= 0 ? '+' : ''}$${portfolio.total_day_change.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} sub={`${portfolio.total_day_change_pct}%`} color={portfolio.total_day_change >= 0 ? '#34d399' : '#fb7185'} />
        <StatBox label="Sharpe / Sortino" value={`${portfolio.metrics.sharpe} / ${portfolio.metrics.sortino}`} color="#a78bfa" />
        <StatBox label="Risk Score" value={`${portfolio.metrics.risk_score}/100`} sub="Composite" color="#00f5ff" />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-[#0d0e12] p-1 rounded-sm border border-[#1e293b]">
        {(['HOLDINGS', 'PERF/RISK', 'SECTORS', 'TRANSACTIONS'] as const).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded-sm transition-all cursor-pointer ${subTab === t ? 'bg-amber-500 text-[#0d0e12]' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {subTab === 'HOLDINGS' && (
        <div className="space-y-3">
          {/* Holdings Table */}
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e293b] flex items-center gap-2">
              <Wallet size={12} className="text-amber-500" />
              <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">POSITIONS BLOTTER — {portfolio.holdings.length} POSITIONS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] font-mono border-collapse">
                <thead>
                  <tr className="border-b border-[#1e293b] text-[#64748b]">
                    <th className="py-2 px-4">SYMBOL</th>
                    <th className="py-2">SECTOR</th>
                    <th className="py-2 text-right">QTY</th>
                    <th className="py-2 text-right">AVG COST</th>
                    <th className="py-2 text-right">LAST</th>
                    <th className="py-2 text-right">MKT VAL</th>
                    <th className="py-2 text-right">P&L</th>
                    <th className="py-2 text-right">P&L%</th>
                    <th className="py-2 text-right">DAY CHG%</th>
                    <th className="py-2 text-right">WT%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0d0e12]">
                  {portfolio.holdings.map(h => (
                    <tr key={h.symbol} className="hover:bg-[#15171f] transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{h.symbol}</td>
                      <td className="py-3">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm" style={{ background: `${SECTOR_COLORS[h.sector] || '#64748b'}20`, color: SECTOR_COLORS[h.sector] || '#64748b' }}>
                          {h.sector}
                        </span>
                      </td>
                      <td className="py-3 text-right text-white">{h.quantity.toLocaleString()}</td>
                      <td className="py-3 text-right text-[#94a3b8]">${h.avg_buy_price.toFixed(2)}</td>
                      <td className="py-3 text-right text-white">${h.current_price.toFixed(2)}</td>
                      <td className="py-3 text-right text-amber-500 font-bold">${h.market_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className={`py-3 text-right font-bold ${h.unrealized_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.unrealized_pnl >= 0 ? '+' : ''}${h.unrealized_pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 text-right ${h.unrealized_pnl_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.unrealized_pnl_percent >= 0 ? '+' : ''}{h.unrealized_pnl_percent}%
                      </td>
                      <td className={`py-3 text-right ${h.day_change_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.day_change_pct >= 0 ? '+' : ''}{h.day_change_pct}%
                      </td>
                      <td className="py-3 text-right text-[#00f5ff] font-bold">{h.weight}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Position */}
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plus size={12} className="text-amber-500" />
              <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">BOOK NEW TRANSACTION</span>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-[9px] text-[#64748b] uppercase font-mono block mb-1">Symbol</label>
                <input type="text" placeholder="AAPL" value={newSymbol} onChange={e => setNewSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-[#0d0e12] border border-[#334155] rounded-sm p-2 text-xs text-white uppercase focus:border-amber-500 outline-none font-mono" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-[#64748b] uppercase font-mono block mb-1">Quantity</label>
                <input type="number" placeholder="100" value={newQty} onChange={e => setNewQty(e.target.value)}
                  className="w-full bg-[#0d0e12] border border-[#334155] rounded-sm p-2 text-xs text-white focus:border-amber-500 outline-none font-mono" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-[#64748b] uppercase font-mono block mb-1">Buy Price ($)</label>
                <input type="number" placeholder="150.00" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  className="w-full bg-[#0d0e12] border border-[#334155] rounded-sm p-2 text-xs text-white focus:border-amber-500 outline-none font-mono" />
              </div>
              <button onClick={() => { setNewSymbol(''); setNewQty(''); setNewPrice(''); }}
                className="bg-amber-500 text-[#0d0e12] font-bold text-xs px-6 py-2 rounded-sm hover:bg-amber-400 transition-all cursor-pointer">
                BUY
              </button>
              <button className="bg-red-600/80 text-white font-bold text-xs px-6 py-2 rounded-sm hover:bg-red-500 transition-all cursor-pointer">
                SELL
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'PERF/RISK' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">PORTFOLIO PERFORMANCE (30D)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perfData}>
                  <defs>
                    <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#334155" fontSize={9} />
                  <YAxis stroke="#334155" fontSize={9} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: '#11131a', borderColor: '#1e293b', fontSize: 10 }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Value']} />
                  <Area type="monotone" dataKey="pnl" stroke="#f59e0b" fillOpacity={1} fill="url(#perfGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
              <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">RISK METRICS</p>
              <div className="space-y-2 text-[10px] font-mono">
                {[
                  ['Sharpe', portfolio.metrics.sharpe.toFixed(2), '#34d399'],
                  ['Sortino', portfolio.metrics.sortino.toFixed(2), '#34d399'],
                  ['Beta (vs SPY)', portfolio.metrics.beta.toFixed(2), '#94a3b8'],
                  ['Alpha (ann.)', `+${portfolio.metrics.alpha}%`, '#34d399'],
                  ['Max Drawdown', `${portfolio.metrics.max_drawdown}%`, '#fb7185'],
                  ['Ann. Volatility', `${portfolio.metrics.volatility}%`, '#94a3b8'],
                  ['VaR 95% (1D)', `$${portfolio.metrics.var_95.toLocaleString()}`, '#fb7185'],
                  ['VaR 99% (1D)', `$${portfolio.metrics.var_99.toLocaleString()}`, '#fb7185'],
                ].map(([label, val, color]) => (
                  <div key={label as string} className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#64748b]">{label}</span>
                    <span style={{ color: color as string }} className="font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'SECTORS' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">SECTOR BREAKDOWN (PIE)</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sectorPieData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}%`} labelLine={false} fontSize={9}>
                    {sectorPieData.map((entry, idx) => (
                      <Cell key={idx} fill={SECTOR_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#11131a', borderColor: '#1e293b', fontSize: 10 }} formatter={(v: any) => [`${v}%`, 'Allocation']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">SECTOR ALLOCATION (BAR)</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorPieData} layout="vertical">
                  <XAxis type="number" stroke="#334155" fontSize={9} unit="%" />
                  <YAxis type="category" dataKey="name" stroke="#334155" fontSize={9} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#11131a', borderColor: '#1e293b', fontSize: 10 }} />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                    {sectorPieData.map((entry, idx) => (
                      <Cell key={idx} fill={SECTOR_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {subTab === 'TRANSACTIONS' && (
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e293b] flex items-center gap-2">
            <Clock size={12} className="text-amber-500" />
            <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">TRANSACTION HISTORY — {portfolio.transactions.length} RECORDS</span>
          </div>
          <table className="w-full text-left text-[10px] font-mono">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#64748b]">
                <th className="py-2 px-4">DATE</th>
                <th className="py-2">TYPE</th>
                <th className="py-2">SYMBOL</th>
                <th className="py-2 text-right">QTY</th>
                <th className="py-2 text-right">PRICE</th>
                <th className="py-2 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d0e12]">
              {portfolio.transactions.map((t, i) => (
                <tr key={i} className="hover:bg-[#15171f]">
                  <td className="py-3 px-4 text-[#94a3b8]">{t.date}</td>
                  <td className="py-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-white">{t.symbol}</td>
                  <td className="py-3 text-right">{t.quantity}</td>
                  <td className="py-3 text-right">${t.price.toFixed(2)}</td>
                  <td className={`py-3 text-right font-bold ${t.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'SELL' ? '+' : '-'}${t.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Options Tab ──────────────────────────────────────────────────────────────

function OptionsTab({ data }: { data: FullData }) {
  const { options } = data;
  const [showGreeks, setShowGreeks] = useState(false);
  const atm = options.chain.find(r => Math.abs(r.strike - options.spot) < 5);

  return (
    <div className="space-y-4">
      {/* Header metrics */}
      <div className="grid grid-cols-5 gap-3">
        <StatBox label="Ticker / Spot" value={`${options.ticker} @ $${options.spot}`} color="#f59e0b" />
        <StatBox label="ATM Implied Vol" value={`${options.atm_iv}%`} color="#00f5ff" />
        <StatBox label="Put/Call Ratio" value={options.put_call_ratio.toFixed(2)} sub={options.put_call_ratio > 1 ? 'Bearish' : 'Bullish'} color={options.put_call_ratio > 1 ? '#fb7185' : '#34d399'} />
        <StatBox label="ATM Delta" value={atm?.call_delta.toFixed(3) || '--'} color="#a78bfa" />
        <StatBox label="ATM Theta/d" value={atm ? `${atm.call_theta.toFixed(4)}` : '--'} color="#fb7185" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Vol skew chart */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">VOLATILITY SKEW</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={options.skew_chart}>
                <defs>
                  <linearGradient id="skewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="strike" stroke="#334155" fontSize={8} />
                <YAxis stroke="#334155" fontSize={8} unit="%" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#11131a', borderColor: '#1e293b', fontSize: 10 }} formatter={(v: any) => [`${v}%`, 'IV']} />
                <Area type="monotone" dataKey="iv" stroke="#f59e0b" fillOpacity={1} fill="url(#skewGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Term structure */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">IV TERM STRUCTURE</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={options.term_structure}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="days" stroke="#334155" fontSize={8} unit="d" />
                <YAxis stroke="#334155" fontSize={8} unit="%" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#11131a', borderColor: '#1e293b', fontSize: 10 }} />
                <Line type="monotone" dataKey="iv" stroke="#00f5ff" strokeWidth={2} dot={{ fill: '#00f5ff', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Greeks summary */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">ATM GREEKS ({options.expiry})</p>
          <div className="space-y-3 font-mono text-[10px]">
            {atm && [
              { greek: 'Δ Delta (Call)', val: atm.call_delta.toFixed(4), color: '#34d399' },
              { greek: 'Δ Delta (Put)', val: atm.put_delta.toFixed(4), color: '#fb7185' },
              { greek: 'Γ Gamma', val: atm.call_gamma.toFixed(6), color: '#a78bfa' },
              { greek: 'Θ Theta/day', val: atm.call_theta.toFixed(4), color: '#fb7185' },
              { greek: 'ν Vega/1%IV', val: atm.call_vega.toFixed(4), color: '#f59e0b' },
              { greek: 'ATM IV', val: `${atm.iv}%`, color: '#00f5ff' },
            ].map(item => (
              <div key={item.greek} className="flex justify-between border-b border-[#0d0e12] pb-2">
                <span className="text-[#64748b]">{item.greek}</span>
                <span style={{ color: item.color }} className="font-bold">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Option Chain Table */}
      <div className="bg-[#11131a] border border-[#1e293b] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
          <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">OPTION CHAIN — EXPIRY: {options.expiry}</span>
          <button onClick={() => setShowGreeks(!showGreeks)}
            className="text-[9px] px-2 py-1 border border-[#334155] rounded-sm text-[#94a3b8] hover:border-amber-500 transition-all cursor-pointer">
            {showGreeks ? 'HIDE GREEKS' : 'SHOW GREEKS'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[9px] font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th colSpan={showGreeks ? 6 : 3} className="py-2 text-emerald-400 border-r border-[#1e293b] bg-emerald-950/20">— CALLS —</th>
                <th className="py-2 text-amber-500 bg-[#15171f]">STRIKE</th>
                <th className="py-2 text-[#64748b] bg-[#15171f]">IV%</th>
                <th colSpan={showGreeks ? 6 : 3} className="py-2 text-red-400 border-l border-[#1e293b] bg-red-950/20">— PUTS —</th>
              </tr>
              <tr className="border-b border-[#1e293b] text-[#64748b]">
                <th className="py-1.5 px-2">BID</th>
                <th className="py-1.5">ASK</th>
                <th className="py-1.5">OI</th>
                {showGreeks && <><th className="py-1.5">Δ</th><th className="py-1.5">Γ</th><th className="py-1.5">Θ</th></>}
                <th className="py-1.5 bg-[#15171f] text-amber-500">STRIKE</th>
                <th className="py-1.5 bg-[#15171f]">IV%</th>
                <th className="py-1.5">BID</th>
                <th className="py-1.5">ASK</th>
                <th className="py-1.5">OI</th>
                {showGreeks && <><th className="py-1.5">Δ</th><th className="py-1.5">Γ</th><th className="py-1.5">Θ</th></>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d0e12]">
              {options.chain.map(row => {
                const isAtm = Math.abs(row.strike - options.spot) < 3;
                return (
                  <tr key={row.strike} className={`hover:bg-[#15171f] transition-colors ${isAtm ? 'bg-amber-500/5' : ''}`}>
                    {/* Call side */}
                    <td className={`py-2 px-2 ${row.call_itm ? 'bg-emerald-950/30' : ''}`}>{row.call_price.toFixed(2)}</td>
                    <td className={`py-2 ${row.call_itm ? 'bg-emerald-950/30' : ''}`}>{(row.call_price + 0.05).toFixed(2)}</td>
                    <td className={`py-2 ${row.call_itm ? 'bg-emerald-950/30' : ''} text-[#64748b]`}>{row.call_oi.toLocaleString()}</td>
                    {showGreeks && (
                      <>
                        <td className="py-2 text-emerald-400">{row.call_delta.toFixed(3)}</td>
                        <td className="py-2 text-[#94a3b8]">{row.call_gamma.toFixed(4)}</td>
                        <td className="py-2 text-red-400">{row.call_theta.toFixed(3)}</td>
                      </>
                    )}
                    {/* Strike */}
                    <td className={`py-2 font-bold text-amber-500 bg-[#15171f] ${isAtm ? 'text-white bg-amber-500/10' : ''}`}>{row.strike}</td>
                    <td className="py-2 text-[#00f5ff] bg-[#15171f]">{row.iv}</td>
                    {/* Put side */}
                    <td className={`py-2 ${row.put_itm ? 'bg-red-950/30' : ''}`}>{row.put_price.toFixed(2)}</td>
                    <td className={`py-2 ${row.put_itm ? 'bg-red-950/30' : ''}`}>{(row.put_price + 0.05).toFixed(2)}</td>
                    <td className={`py-2 ${row.put_itm ? 'bg-red-950/30' : ''} text-[#64748b]`}>{row.put_oi.toLocaleString()}</td>
                    {showGreeks && (
                      <>
                        <td className="py-2 text-red-400">{row.put_delta.toFixed(3)}</td>
                        <td className="py-2 text-[#94a3b8]">{row.put_gamma.toFixed(4)}</td>
                        <td className="py-2 text-red-400">{row.put_theta.toFixed(3)}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Fixed Income Tab ─────────────────────────────────────────────────────────

function FixedIncomeTab({ data }: { data: FullData }) {
  const { bonds } = data;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="HY-IG Spread" value={`${bonds.spreads.hy_ig_spread}%`} sub="High Yield vs Inv. Grade" color="#fb7185" />
        <StatBox label="IG-Treasury Spread" value={`${bonds.spreads.ig_treasury_spread}%`} color="#f59e0b" />
        <StatBox label="10Y TIPS Breakeven" value={`${bonds.spreads.tips_breakeven_10y}%`} sub="Market inflation expectation" color="#00f5ff" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Yield Curve */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">US TREASURY YIELD CURVE</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bonds.yield_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="maturity" stroke="#334155" fontSize={8} />
                <YAxis stroke="#334155" fontSize={8} domain={[3.5, 6]} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#11131a', borderColor: '#1e293b', fontSize: 10 }} formatter={(v: any) => [`${Number(v).toFixed(3)}%`, 'Yield']} />
                <Line type="monotone" dataKey="yield" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bond Screener */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e293b]">
            <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">BOND SCREENER</span>
          </div>
          <table className="w-full text-left text-[9px] font-mono">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#64748b]">
                <th className="py-2 px-4">NAME</th>
                <th className="py-2">CPN%</th>
                <th className="py-2">YTM%</th>
                <th className="py-2">PRICE</th>
                <th className="py-2">DUR</th>
                <th className="py-2">RATING</th>
                <th className="py-2 text-right">SPREAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d0e12]">
              {bonds.bonds.map((b, i) => (
                <tr key={i} className="hover:bg-[#15171f]">
                  <td className="py-2.5 px-4 text-white">{b.name}</td>
                  <td className="py-2.5 text-[#94a3b8]">{b.coupon}%</td>
                  <td className="py-2.5 text-amber-500 font-bold">{b.ytm}%</td>
                  <td className="py-2.5 text-white">{b.price.toFixed(2)}</td>
                  <td className="py-2.5 text-[#94a3b8]">{b.duration}yr</td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold ${b.rating.startsWith('A') || b.rating === 'AAA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {b.rating}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={`font-bold ${b.spread_bps > 100 ? 'text-red-400' : 'text-[#94a3b8]'}`}>{b.spread_bps} bps</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── FX Tab ───────────────────────────────────────────────────────────────────

function FXTab({ data }: { data: FullData }) {
  const { fx } = data;
  return (
    <div className="space-y-4">
      {/* FX Pairs Grid */}
      <div className="grid grid-cols-4 gap-3">
        {fx.pairs.map(p => (
          <div key={p.pair} className={`bg-[#11131a] border rounded-sm p-4 hover:border-amber-500/50 cursor-pointer transition-all ${p.change_pct >= 0 ? 'border-emerald-900/50' : 'border-red-900/50'}`}>
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold text-white font-mono">{p.pair}</p>
              {p.change_pct >= 0 ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
            </div>
            <p className="text-xl font-bold font-mono text-white mt-2">{p.rate.toFixed(4)}</p>
            <div className="flex justify-between mt-1 text-[9px] font-mono">
              <span className="text-[#64748b]">Bid: {p.bid.toFixed(4)}</span>
              <span className="text-[#64748b]">Ask: {p.ask.toFixed(4)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <PctBadge val={p.change_pct} />
              <span className="text-[9px] text-[#64748b] font-mono">{p.session_low.toFixed(4)} – {p.session_high.toFixed(4)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* EUR/USD Intraday */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">EUR/USD INTRADAY (5-MIN)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fx.eurusd_intraday}>
                <defs>
                  <linearGradient id="fxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#334155" fontSize={8} />
                <YAxis stroke="#334155" fontSize={8} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#11131a', borderColor: '#1e293b', fontSize: 10 }} />
                <Area type="monotone" dataKey="close" stroke="#00f5ff" fillOpacity={1} fill="url(#fxGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Central Bank Rates */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">CENTRAL BANK POLICY RATES</p>
          <div className="space-y-2">
            {fx.central_bank_rates.map((cb, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-[#0d0e12] pb-2.5">
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{cb.bank}</p>
                  <p className="text-[9px] text-[#64748b]">Last changed: {cb.last_change}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold font-mono text-[#f59e0b]">{cb.rate}%</p>
                </div>
                <div className="w-24 bg-[#0d0e12] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${(cb.rate / 6) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Agents Tab ────────────────────────────────────────────────────────────

function AIAgentsTab({ data }: { data: FullData }) {
  const { ai_agents } = data;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {ai_agents.map(agent => (
          <div key={agent.name} className="bg-[#11131a] border border-[#1e293b] rounded-sm p-5 hover:border-amber-500/30 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-bold text-white">{agent.name}</p>
                <p className="text-[10px] text-[#64748b] mt-0.5">{agent.style}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="block text-xs font-bold px-2 py-0.5 rounded-sm font-mono" style={{ background: `${SENTIMENT_COLOR[agent.sentiment]}20`, color: SENTIMENT_COLOR[agent.sentiment] }}>
                  {agent.sentiment}
                </span>
                <span className="text-[9px] text-[#64748b] font-mono">Confidence: {agent.confidence}%</span>
              </div>
            </div>
            {/* Confidence bar */}
            <div className="w-full bg-[#0d0e12] rounded-full h-1 mb-3">
              <div className="h-1 rounded-full" style={{ width: `${agent.confidence}%`, backgroundColor: SENTIMENT_COLOR[agent.sentiment] }} />
            </div>
            <p className="text-[10px] text-[#94a3b8] leading-relaxed mb-3">{agent.thesis}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] text-[#64748b] font-mono">TOP PICKS:</span>
              {agent.top_picks.map(pick => (
                <span key={pick} className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-sm font-mono font-bold">{pick}</span>
              ))}
              <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-sm font-mono"
                style={{ background: agent.risk_level === 'AGGRESSIVE' ? '#fb718520' : agent.risk_level === 'CONSERVATIVE' ? '#34d39920' : '#f59e0b20', color: agent.risk_level === 'AGGRESSIVE' ? '#fb7185' : agent.risk_level === 'CONSERVATIVE' ? '#34d399' : '#f59e0b' }}>
                {agent.risk_level}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Consensus */}
      <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
        <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3 flex items-center gap-2">
          <Brain size={10} className="text-amber-500" /> AGENT CONSENSUS SUMMARY
        </p>
        <div className="grid grid-cols-3 gap-4 text-[10px] font-mono">
          <div className="text-center">
            <p className="text-emerald-400 text-2xl font-bold">{ai_agents.filter(a => a.sentiment === 'BULLISH').length}</p>
            <p className="text-[#64748b] mt-1">BULLISH</p>
          </div>
          <div className="text-center">
            <p className="text-[#94a3b8] text-2xl font-bold">{ai_agents.filter(a => a.sentiment === 'NEUTRAL').length}</p>
            <p className="text-[#64748b] mt-1">NEUTRAL</p>
          </div>
          <div className="text-center">
            <p className="text-red-400 text-2xl font-bold">{ai_agents.filter(a => a.sentiment === 'BEARISH').length}</p>
            <p className="text-[#64748b] mt-1">BEARISH</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Macro Tab ────────────────────────────────────────────────────────────────

function MacroTab({ data }: { data: FullData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e293b] flex items-center gap-2">
            <Database size={12} className="text-amber-500" />
            <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">BLS / FRED INDICATORS</span>
          </div>
          <table className="w-full text-left text-[10px] font-mono">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#64748b]">
                <th className="py-2 px-4">INDICATOR</th>
                <th className="py-2 text-right">VALUE</th>
                <th className="py-2 text-right">PERIOD</th>
                <th className="py-2 text-right">TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d0e12]">
              {data.macro.map((m, i) => (
                <tr key={i} className="hover:bg-[#15171f]">
                  <td className="py-3 px-4 text-white font-bold">{m.indicator}</td>
                  <td className="py-3 text-right text-[#00f5ff] font-bold">{m.value}</td>
                  <td className="py-3 text-right text-[#64748b]">{m.period}</td>
                  <td className="py-3 text-right">
                    {m.trend === 'up' && <ChevronUp size={12} className="text-emerald-400 ml-auto" />}
                    {m.trend === 'down' && <ChevronDown size={12} className="text-red-400 ml-auto" />}
                    {m.trend === 'stable' && <Minus size={12} className="text-[#64748b] ml-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          {/* Central Bank Rates */}
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">CENTRAL BANK RATES</p>
            <div className="grid grid-cols-2 gap-2">
              {data.fx.central_bank_rates.map((cb, i) => (
                <div key={i} className="bg-[#0d0e12] rounded-sm p-2.5">
                  <p className="text-[9px] text-[#64748b]">{cb.bank}</p>
                  <p className="text-base font-bold font-mono text-amber-500 mt-0.5">{cb.rate}%</p>
                </div>
              ))}
            </div>
          </div>
          {/* Bond Spreads */}
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">CREDIT SPREADS</p>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex justify-between border-b border-[#0d0e12] pb-2">
                <span className="text-[#64748b]">HY-IG Spread</span>
                <span className="text-red-400 font-bold">{data.bonds.spreads.hy_ig_spread}%</span>
              </div>
              <div className="flex justify-between border-b border-[#0d0e12] pb-2">
                <span className="text-[#64748b]">IG-Treasury Spread</span>
                <span className="text-amber-500 font-bold">{data.bonds.spreads.ig_treasury_spread}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">10Y TIPS Breakeven</span>
                <span className="text-[#00f5ff] font-bold">{data.bonds.spreads.tips_breakeven_10y}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── News Tab ─────────────────────────────────────────────────────────────────

function NewsTab() {
  const [selected, setSelected] = useState(0);
  const news = [
    { time: '09:42', src: 'REUTERS', headline: 'Fed signals patience on rate cuts amid sticky inflation data', sentiment: 'BEARISH', impact: 'HIGH', body: 'Federal Reserve officials signaled Tuesday they are in no rush to cut interest rates, citing continued stickiness in inflation measures. Minutes from the latest FOMC meeting show broad agreement that policy needs to remain restrictive until sustained progress toward the 2% inflation target is demonstrated. Markets pared back rate cut expectations following the release, with the 2-year Treasury yield rising 8 basis points.', tags: ['$FED', '$RATES', '$TLT'] },
    { time: '09:31', src: 'BLOOMBERG', headline: 'NVIDIA beats estimates, guides higher on AI infrastructure demand', sentiment: 'BULLISH', impact: 'HIGH', body: 'NVIDIA Corporation reported quarterly revenue of $26.0 billion, surpassing analyst expectations of $24.6 billion, driven by insatiable demand from hyperscalers and enterprise AI deployments. Data Center revenue reached $22.6 billion, up 427% YoY. Management guided next quarter above consensus citing strong order visibility through fiscal 2026. Shares surged over 9% in pre-market trading.', tags: ['$NVDA', '$AI', '$SOX'] },
    { time: '09:18', src: 'CNBC', headline: 'Treasury yields edge lower as jobs data misses expectations', sentiment: 'NEUTRAL', impact: 'MED', body: 'US Treasury yields declined across the curve after the ADP National Employment Report showed private payrolls grew by 150,000 in May, below the 175,000 consensus estimate. The softer data reinforced expectations that the labor market is cooling gradually, potentially giving the Fed room to consider rate cuts in the second half of 2026.', tags: ['$TNX', '$TLT', '$DXY'] },
    { time: '08:55', src: 'WSJ', headline: 'Apple considers launching its own AI model to reduce OpenAI dependency', sentiment: 'BULLISH', impact: 'MED', body: 'Apple Inc. is exploring the development of a proprietary large language model to power advanced Siri features and reduce reliance on OpenAI, according to people familiar with the matter. The initiative, codenamed "Ajax-2", aims to run natively on-device for privacy-preserving inference. Analysts viewed the news positively, noting it could eliminate significant licensing costs over time.', tags: ['$AAPL', '$MSFT', '$OPENAI'] },
    { time: '08:33', src: 'FT', headline: 'ECB holds rates, signals two more cuts before year-end', sentiment: 'BULLISH', impact: 'MED', body: 'The European Central Bank kept its key deposit rate at 4.00% at its June meeting but President Christine Lagarde signaled that two additional 25 basis-point cuts remain on the table for 2026 as euro-area inflation converges toward the 2% target. EUR/USD initially rose on the news before paring gains.', tags: ['$EUR', '$EURUSD', '$ECB'] },
    { time: '08:10', src: 'MARKETWATCH', headline: 'Oil slides on demand concerns as OPEC+ signals output increase', sentiment: 'BEARISH', impact: 'MED', body: 'Crude oil futures fell nearly 2% Tuesday after OPEC+ indicated it could raise production by 500,000 barrels per day in August, compounding existing concerns about slowing demand growth from China. WTI settled at $74.20 per barrel, its lowest level in three weeks. Energy equities underperformed, with the XLE ETF down 1.4%.', tags: ['$OIL', '$USO', '$XLE'] },
  ];

  return (
    <div className="grid grid-cols-12 gap-3 h-full">
      {/* Feed */}
      <div className="col-span-5 overflow-y-auto max-h-[calc(100vh-260px)] bg-[#11131a] border border-[#1e293b] rounded-sm">
        <div className="px-3 py-2 border-b border-[#1e293b] flex items-center gap-2 sticky top-0 bg-[#11131a] z-10">
          <Radio size={10} className="text-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">LIVE WIRE</span>
          <span className="ml-auto text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">{news.length} NEW</span>
        </div>
        {news.map((n, i) => (
          <button key={i} onClick={() => setSelected(i)} className={`w-full text-left px-3 py-3 border-b border-[#0d0e12] hover:bg-[#15171f] transition-colors cursor-pointer ${selected === i ? 'bg-[#15171f] border-l-2 border-l-amber-500' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-mono text-[#64748b]">{n.time}</span>
              <span className="text-[9px] font-bold text-amber-500 font-mono">{n.src}</span>
              <span className={`ml-auto text-[8px] font-bold px-1 rounded`} style={{ color: SENTIMENT_COLOR[n.sentiment] }}>{n.sentiment}</span>
              <span className={`text-[8px] font-bold px-1 rounded ${n.impact === 'HIGH' ? 'text-red-400' : 'text-[#64748b]'}`}>{n.impact}</span>
            </div>
            <p className="text-[10px] text-[#e2e8f0] leading-tight">{n.headline}</p>
          </button>
        ))}
      </div>

      {/* Article Detail */}
      <div className="col-span-7 bg-[#11131a] border border-[#1e293b] rounded-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[8px] font-bold px-2 py-0.5 rounded-sm" style={{ background: `${SENTIMENT_COLOR[news[selected].sentiment]}20`, color: SENTIMENT_COLOR[news[selected].sentiment] }}>
            {news[selected].sentiment}
          </span>
          <span className="text-[8px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-sm">{news[selected].impact} IMPACT</span>
          <span className="text-[9px] text-[#64748b] font-mono ml-auto">{news[selected].src} · {news[selected].time}</span>
        </div>
        <h2 className="text-base font-bold text-white leading-snug mb-4">{news[selected].headline}</h2>
        <p className="text-[11px] text-[#94a3b8] leading-relaxed mb-4">{news[selected].body}</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {news[selected].tags.map(t => (
            <span key={t} className="text-[9px] bg-[#1e293b] text-amber-400 px-2 py-0.5 rounded-sm font-mono font-bold">{t}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-amber-500 text-[#0d0e12] text-[10px] font-bold rounded-sm hover:bg-amber-400 cursor-pointer">ANALYZE WITH AI</button>
          <button className="px-3 py-1.5 border border-[#334155] text-[#94a3b8] text-[10px] rounded-sm hover:border-amber-500 cursor-pointer">SAVE</button>
          <button className="px-3 py-1.5 border border-[#334155] text-[#94a3b8] text-[10px] rounded-sm hover:border-amber-500 cursor-pointer">TRANSLATE</button>
        </div>
      </div>
    </div>
  );
}

// ─── Watchlist Tab ───────────────────────────────────────────────────────────

const WATCHLIST_UNIVERSE: Record<string, { name: string; price: number; sector: string; mktCap: string; pe: number; divYield: number; market: string; currency: string; flag: string }> = {
  // ── US ──
  AAPL:      { name: 'Apple Inc.',        price: 189.30,  sector: 'Technology',    mktCap: '2.97T', pe: 31.2, divYield: 0.51, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  MSFT:      { name: 'Microsoft Corp.',   price: 415.50,  sector: 'Technology',    mktCap: '3.09T', pe: 36.8, divYield: 0.72, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  GOOGL:     { name: 'Alphabet Inc.',     price: 173.50,  sector: 'Communication', mktCap: '2.16T', pe: 24.1, divYield: 0.00, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  AMZN:      { name: 'Amazon.com Inc.',   price: 185.20,  sector: 'Consumer',      mktCap: '1.97T', pe: 52.4, divYield: 0.00, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  NVDA:      { name: 'NVIDIA Corp.',      price: 880.00,  sector: 'Technology',    mktCap: '2.17T', pe: 68.9, divYield: 0.03, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  TSLA:      { name: 'Tesla Inc.',        price: 248.50,  sector: 'Automotive',    mktCap: '790B',  pe: 58.3, divYield: 0.00, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  META:      { name: 'Meta Platforms',    price: 492.00,  sector: 'Communication', mktCap: '1.25T', pe: 28.7, divYield: 0.40, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  JPM:       { name: 'JPMorgan Chase',    price: 218.40,  sector: 'Financial',     mktCap: '630B',  pe: 12.1, divYield: 2.20, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  V:         { name: 'Visa Inc.',         price: 278.60,  sector: 'Financial',     mktCap: '582B',  pe: 31.5, divYield: 0.76, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  JNJ:       { name: 'Johnson & Johnson', price: 163.20,  sector: 'Healthcare',    mktCap: '393B',  pe: 14.8, divYield: 3.10, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  WMT:       { name: 'Walmart Inc.',      price: 72.40,   sector: 'Consumer',      mktCap: '582B',  pe: 38.2, divYield: 1.20, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  XOM:       { name: 'ExxonMobil Corp.',  price: 118.50,  sector: 'Energy',        mktCap: '475B',  pe: 14.6, divYield: 3.40, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  GLD:       { name: 'Gold ETF',          price: 228.90,  sector: 'Commodity',     mktCap: 'ETF',   pe: 0,    divYield: 0.00, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  TLT:       { name: '20yr Treasury ETF', price: 92.10,   sector: 'Fixed Income',  mktCap: 'ETF',   pe: 0,    divYield: 3.80, market: 'US',     currency: 'USD', flag: '🇺🇸' },
  BTC:       { name: 'Bitcoin',           price: 68450,   sector: 'Crypto',        mktCap: '1.35T', pe: 0,    divYield: 0.00, market: 'Crypto', currency: 'USD', flag: '🪙'  },
  // ── India NSE ──
  RELIANCE:  { name: 'Reliance Industries', price: 2945.0,  sector: 'Energy',      mktCap: '19.9L', pe: 24.8, divYield: 0.32, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  TCS:       { name: 'Tata Consultancy',  price: 3820.0,  sector: 'Technology',    mktCap: '13.9L', pe: 29.4, divYield: 1.40, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  HDFCBANK:  { name: 'HDFC Bank Ltd',     price: 1712.0,  sector: 'Financial',     mktCap: '13.1L', pe: 18.2, divYield: 1.08, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  INFY:      { name: 'Infosys Ltd',       price: 1588.0,  sector: 'Technology',    mktCap: '6.6L',  pe: 24.6, divYield: 2.10, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  ICICIBANK: { name: 'ICICI Bank Ltd',    price: 1298.0,  sector: 'Financial',     mktCap: '9.2L',  pe: 17.8, divYield: 0.80, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  WIPRO:     { name: 'Wipro Ltd',         price: 478.0,   sector: 'Technology',    mktCap: '2.5L',  pe: 22.1, divYield: 0.21, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  ITC:       { name: 'ITC Limited',       price: 453.0,   sector: 'Consumer',      mktCap: '5.7L',  pe: 26.3, divYield: 3.40, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  BAJFINANCE:{ name: 'Bajaj Finance',     price: 7124.0,  sector: 'Financial',     mktCap: '4.3L',  pe: 31.8, divYield: 0.18, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  MARUTI:    { name: 'Maruti Suzuki',     price: 12480.0, sector: 'Automotive',    mktCap: '3.8L',  pe: 28.5, divYield: 0.72, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  SBIN:      { name: 'State Bank of India', price: 812.0, sector: 'Financial',     mktCap: '7.3L',  pe: 9.2,  divYield: 1.80, market: 'IN', currency: 'INR', flag: '🇮🇳' },
  // ── Canada TSX ──
  'RY.TO':   { name: 'Royal Bank of Canada', price: 133.80, sector: 'Financial',   mktCap: '190B',  pe: 13.8, divYield: 3.90, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  'TD.TO':   { name: 'TD Bank Group',      price: 82.40,   sector: 'Financial',    mktCap: '147B',  pe: 11.2, divYield: 5.10, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  'SHOP.TO': { name: 'Shopify Inc.',       price: 94.60,   sector: 'Technology',   mktCap: '121B',  pe: 78.4, divYield: 0.00, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  'CNQ.TO':  { name: 'Canadian Nat. Res.', price: 42.10,   sector: 'Energy',       mktCap: '79B',   pe: 13.4, divYield: 4.20, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  'SU.TO':   { name: 'Suncor Energy',      price: 54.80,   sector: 'Energy',       mktCap: '66B',   pe: 10.8, divYield: 4.50, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  'BNS.TO':  { name: 'Bank of Nova Scotia',price: 71.20,   sector: 'Financial',    mktCap: '86B',   pe: 10.6, divYield: 6.20, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  'ABX.TO':  { name: 'Barrick Gold Corp.', price: 24.90,   sector: 'Materials',    mktCap: '43B',   pe: 18.2, divYield: 2.20, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  'CP.TO':   { name: 'Canadian Pacific',   price: 108.40,  sector: 'Industrials',  mktCap: '103B',  pe: 24.6, divYield: 0.80, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  'MFC.TO':  { name: 'Manulife Financial', price: 38.60,   sector: 'Financial',    mktCap: '74B',   pe: 11.4, divYield: 4.40, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  'ENB.TO':  { name: 'Enbridge Inc.',      price: 58.20,   sector: 'Energy',       mktCap: '118B',  pe: 18.1, divYield: 7.20, market: 'CA', currency: 'CAD', flag: '🇨🇦' },
  // ── BSE Sensex 30 & NSE Extras ──
  TITAN:      { name: 'Titan Company',      price: 3468.0,  sector: 'Consumer',      mktCap: '3.8L',  pe: 88.2, divYield: 0.28, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  BHARTIARTL: { name: 'Bharti Airtel',      price: 1628.0,  sector: 'Communication', mktCap: '9.8L',  pe: 62.4, divYield: 0.48, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  LT:         { name: 'Larsen & Toubro',    price: 3892.0,  sector: 'Industrials',   mktCap: '5.5L',  pe: 32.8, divYield: 0.92, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  SUNPHARMA:  { name: 'Sun Pharmaceutical', price: 1742.0,  sector: 'Healthcare',    mktCap: '4.2L',  pe: 34.1, divYield: 0.80, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  HINDUNILVR: { name: 'Hindustan Unilever', price: 2289.0,  sector: 'Consumer',      mktCap: '5.4L',  pe: 52.6, divYield: 1.82, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  ASIANPAINT: { name: 'Asian Paints',       price: 2418.0,  sector: 'Materials',     mktCap: '2.3L',  pe: 48.2, divYield: 1.12, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  KOTAKBANK:  { name: 'Kotak Mahindra Bank',price: 2048.0,  sector: 'Financial',     mktCap: '4.1L',  pe: 19.8, divYield: 0.08, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  HCLTECH:    { name: 'HCL Technologies',   price: 1728.0,  sector: 'Technology',    mktCap: '4.7L',  pe: 26.4, divYield: 4.62, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  POWERGRID:  { name: 'Power Grid Corp',    price: 318.0,   sector: 'Utilities',     mktCap: '2.2L',  pe: 17.4, divYield: 3.82, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  NTPC:       { name: 'NTPC Limited',       price: 362.0,   sector: 'Utilities',     mktCap: '3.5L',  pe: 14.8, divYield: 2.48, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  NTPCGREEN:  { name: 'NTPC Green Energy Ltd', price: 95.1,  sector: 'Utilities',  mktCap: '30k Cr', pe: 42.0, divYield: 0.00, market: 'IN',  currency: 'INR', flag: '🇮🇳' },
  NESTLEIND:  { name: 'Nestle India',       price: 2198.0,  sector: 'Consumer',      mktCap: '2.1L',  pe: 72.8, divYield: 1.64, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
  ULTRACEMCO: { name: 'UltraTech Cement',   price: 11248.0, sector: 'Materials',     mktCap: '3.2L',  pe: 42.1, divYield: 0.40, market: 'BSE', currency: 'INR', flag: '🇮🇳' },
};

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', INR: '₹', CAD: 'C$' };
const MARKET_LABEL: Record<string, string> = { US: 'NYSE/NASDAQ', IN: 'NSE', BSE: 'BSE/SENSEX', CA: 'TSX', Crypto: 'CRYPTO' };


function generateSparkline(basePrice: number, n = 20) {
  const data = [];
  let p = basePrice * 0.97;
  for (let i = 0; i < n; i++) {
    p = p * (1 + (Math.random() - 0.485) * 0.015);
    data.push({ v: parseFloat(p.toFixed(2)) });
  }
  data.push({ v: basePrice });
  return data;
}

function WatchlistTab() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['AAPL', 'NVDA', 'RELIANCE', 'RY.TO'];
    try { return JSON.parse(localStorage.getItem('fincept_watchlist') || '["AAPL","NVDA","RELIANCE","RY.TO"]'); } catch { return ['AAPL', 'NVDA', 'RELIANCE', 'RY.TO']; }
  });

  const [alerts, setAlerts] = useState<Record<string, { above: string; below: string }>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('fincept_alerts') || '{}'); } catch { return {}; }
  });
  const [addInput, setAddInput] = useState('');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [sparklines] = useState<Record<string, { v: number }[]>>(() => {
    const s: Record<string, { v: number }[]> = {};
    Object.keys(WATCHLIST_UNIVERSE).forEach(k => { s[k] = generateSparkline(WATCHLIST_UNIVERSE[k].price); });
    return s;
  });
  const [alertInput, setAlertInput] = useState<Record<string, { above: string; below: string }>>({});
  const [showAlertFor, setShowAlertFor] = useState<string | null>(null);
  const [triggered, setTriggered] = useState<string[]>([]);

  // Jitter prices every 3s
  useEffect(() => {
    const tick = () => {
      const p: Record<string, number> = {};
      Object.entries(WATCHLIST_UNIVERSE).forEach(([k, v]) => {
        p[k] = parseFloat((v.price * (1 + (Math.random() - 0.498) * 0.004)).toFixed(2));
      });
      setPrices(p);
    };
    tick();
    const t = setInterval(tick, 3000);
    return () => clearInterval(t);
  }, []);

  // Check alerts
  useEffect(() => {
    const fired: string[] = [];
    watchlist.forEach(sym => {
      const price = prices[sym];
      const al = alerts[sym];
      if (!price || !al) return;
      if (al.above && parseFloat(al.above) > 0 && price >= parseFloat(al.above)) fired.push(`${sym} ≥ $${al.above}`);
      if (al.below && parseFloat(al.below) > 0 && price <= parseFloat(al.below)) fired.push(`${sym} ≤ $${al.below}`);
    });
    setTriggered(fired);
  }, [prices, watchlist, alerts]);

  const addSymbol = () => {
    const sym = addInput.toUpperCase().trim();
    if (!sym || watchlist.includes(sym) || !WATCHLIST_UNIVERSE[sym]) return;
    const next = [...watchlist, sym];
    setWatchlist(next);
    localStorage.setItem('fincept_watchlist', JSON.stringify(next));
    setAddInput('');
  };

  const removeSymbol = (sym: string) => {
    const next = watchlist.filter(s => s !== sym);
    setWatchlist(next);
    localStorage.setItem('fincept_watchlist', JSON.stringify(next));
  };

  const saveAlert = (sym: string) => {
    const next = { ...alerts, [sym]: alertInput[sym] || { above: '', below: '' } };
    setAlerts(next);
    localStorage.setItem('fincept_alerts', JSON.stringify(next));
    setShowAlertFor(null);
  };

  return (
    <div className="space-y-4">
      {/* Alert Triggers Banner */}
      {triggered.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/40 rounded-sm">
          <Bell size={12} className="text-amber-500 animate-bounce" />
          <span className="text-[10px] font-bold text-amber-400 font-mono">PRICE ALERT TRIGGERED:</span>
          {triggered.map(t => <span key={t} className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-sm font-mono">{t}</span>)}
        </div>
      )}

      {/* Add Symbol Row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex gap-2">
          <input
            value={addInput}
            onChange={e => setAddInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && addSymbol()}
            placeholder="Add symbol… (e.g. TSLA, META, BTC)"
            list="universe-list"
            className="flex-1 bg-[#11131a] border border-[#334155] rounded-sm px-3 py-2 text-xs text-white font-mono focus:border-amber-500 outline-none"
          />
          <datalist id="universe-list">
            {Object.keys(WATCHLIST_UNIVERSE).map(k => <option key={k} value={k} />)}
          </datalist>
          <button onClick={addSymbol} className="px-4 py-2 bg-amber-500 text-[#0d0e12] text-[10px] font-bold rounded-sm hover:bg-amber-400 cursor-pointer flex items-center gap-1.5">
            <Plus size={11} /> ADD TO WATCHLIST
          </button>
        </div>
        <span className="text-[9px] text-[#64748b] font-mono">{watchlist.length} symbols · auto-refresh 3s</span>
      </div>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 gap-2">
        {watchlist.map(sym => {
          const info = WATCHLIST_UNIVERSE[sym];
          if (!info) return null;
          const price = prices[sym] ?? info.price;
          const changePct = parseFloat(((price - info.price) / info.price * 100).toFixed(3));
          const change = parseFloat((price - info.price).toFixed(2));
          const spark = sparklines[sym] || [];
          const al = alerts[sym];
          const isAlerted = triggered.some(t => t.startsWith(sym));
          return (
            <div key={sym} className={`bg-[#11131a] border rounded-sm px-5 py-4 flex items-center gap-4 hover:border-amber-500/40 transition-all ${isAlerted ? 'border-amber-500/60' : 'border-[#1e293b]'}`}>
              {/* Symbol info */}
              <div className="w-44">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{info.flag}</span>
                  <p className="text-sm font-bold text-white font-mono">{sym}</p>
                  {al && (al.above || al.below) && <Bell size={10} className="text-amber-500" />}
                </div>
                <p className="text-[9px] text-[#64748b] mt-0.5">{info.name}</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-[8px] px-1.5 py-0.5 rounded-sm" style={{ background: `${SECTOR_COLORS[info.sector] || '#64748b'}18`, color: SECTOR_COLORS[info.sector] || '#64748b' }}>{info.sector}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-[#1e293b] text-[#64748b]">{MARKET_LABEL[info.market] || info.market}</span>
                </div>
              </div>

              {/* Price */}
              <div className="w-32">
                <p className="text-lg font-bold font-mono text-white">
                  {CURRENCY_SYMBOL[info.currency] || '$'}{price > 1000 ? price.toLocaleString('en-IN') : price.toFixed(price > 10 ? 2 : 4)}
                </p>
                <div className={`flex items-center gap-1 text-[10px] font-mono font-bold ${changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {changePct >= 0 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  {CURRENCY_SYMBOL[info.currency] || '$'}{Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
                </div>
                <p className="text-[8px] text-[#64748b] font-mono mt-0.5">{info.currency}</p>
              </div>

              {/* Sparkline */}
              <div className="flex-1 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spark}>
                    <defs>
                      <linearGradient id={`sg_${sym}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={changePct >= 0 ? '#34d399' : '#fb7185'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={changePct >= 0 ? '#34d399' : '#fb7185'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={changePct >= 0 ? '#34d399' : '#fb7185'} fill={`url(#sg_${sym})`} strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Fundamentals */}
              <div className="w-44 grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-mono">
                <span className="text-[#64748b]">Mkt Cap</span><span className="text-white font-bold">{info.mktCap}</span>
                <span className="text-[#64748b]">P/E</span><span className="text-white font-bold">{info.pe > 0 ? info.pe : '—'}</span>
                <span className="text-[#64748b]">Div Yield</span><span className="text-amber-400 font-bold">{info.divYield > 0 ? `${info.divYield}%` : '—'}</span>
                <span className="text-[#64748b]">Exchange</span><span className="text-[#00f5ff] font-bold">{MARKET_LABEL[info.market] || info.market}</span>
              </div>

              {/* Alert config */}
              <div className="w-36">
                {showAlertFor === sym ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-[#64748b] w-10">Above</span>
                      <input type="number" placeholder="price" value={alertInput[sym]?.above || ''} onChange={e => setAlertInput(p => ({ ...p, [sym]: { ...p[sym], above: e.target.value } }))}
                        className="flex-1 bg-[#0d0e12] border border-[#334155] rounded-sm px-1.5 py-0.5 text-[9px] text-white font-mono focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-[#64748b] w-10">Below</span>
                      <input type="number" placeholder="price" value={alertInput[sym]?.below || ''} onChange={e => setAlertInput(p => ({ ...p, [sym]: { ...p[sym], below: e.target.value } }))}
                        className="flex-1 bg-[#0d0e12] border border-[#334155] rounded-sm px-1.5 py-0.5 text-[9px] text-white font-mono focus:border-red-500 outline-none" />
                    </div>
                    <button onClick={() => saveAlert(sym)} className="w-full bg-amber-500 text-[#0d0e12] text-[8px] font-bold py-0.5 rounded-sm cursor-pointer">SAVE ALERT</button>
                  </div>
                ) : (
                  <div className="text-[9px] font-mono space-y-0.5">
                    {al?.above && <p className="text-emerald-400">▲ Alert: ${al.above}</p>}
                    {al?.below && <p className="text-red-400">▼ Alert: ${al.below}</p>}
                    {!al?.above && !al?.below && <p className="text-[#334155]">No alerts set</p>}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5">
                <button onClick={() => { setShowAlertFor(showAlertFor === sym ? null : sym); setAlertInput(p => ({ ...p, [sym]: alerts[sym] || { above: '', below: '' } })); }}
                  className="p-1.5 border border-[#334155] rounded-sm text-[#94a3b8] hover:border-amber-500 hover:text-amber-400 cursor-pointer transition-all" title="Set Alert">
                  <Bell size={11} />
                </button>
                <button onClick={() => removeSymbol(sym)}
                  className="p-1.5 border border-[#334155] rounded-sm text-[#94a3b8] hover:border-red-500 hover:text-red-400 cursor-pointer transition-all" title="Remove">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {watchlist.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bookmark size={32} className="text-[#334155] mb-4" />
          <p className="text-sm font-bold text-[#64748b]">Your watchlist is empty</p>
          <p className="text-[10px] text-[#334155] mt-1">Type a symbol above and hit ADD</p>
        </div>
      )}
    </div>
  );
}

// ─── Investment Drill Simulator ───────────────────────────────────────────────

const MARKET_GROUPS: Record<string, { label: string; flag: string; symbols: string[] }> = {
  US:     { label: 'US (NYSE/NASDAQ)',  flag: '🇺🇸', symbols: ['AAPL','MSFT','GOOGL','AMZN','NVDA','TSLA','META','JPM','V','JNJ','WMT','XOM','GLD','TLT'] },
  IN:     { label: 'India NSE',        flag: '🇮🇳', symbols: ['RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','WIPRO','ITC','BAJFINANCE','MARUTI','SBIN'] },
  BSE:    { label: 'India BSE/Sensex', flag: '🇮🇳', symbols: ['TITAN','BHARTIARTL','LT','SUNPHARMA','HINDUNILVR','ASIANPAINT','KOTAKBANK','HCLTECH','POWERGRID','NTPC','NESTLEIND','ULTRACEMCO'] },
  CA:     { label: 'Canada (TSX)',     flag: '🇨🇦', symbols: ['RY.TO','TD.TO','SHOP.TO','CNQ.TO','SU.TO','BNS.TO','ABX.TO','CP.TO','MFC.TO','ENB.TO'] },
  Crypto: { label: 'Crypto',          flag: '🪙',  symbols: ['BTC'] },
};

const CAPITAL_PRESETS = [
  { label: '₹5L', value: 500000, currency: 'INR' },
  { label: '₹10L', value: 1000000, currency: 'INR' },
  { label: '$10K', value: 10000, currency: 'USD' },
  { label: '$50K', value: 50000, currency: 'USD' },
  { label: '$100K', value: 100000, currency: 'USD' },
  { label: '$250K', value: 250000, currency: 'USD' },
  { label: '$500K', value: 500000, currency: 'USD' },
  { label: '$1M', value: 1000000, currency: 'USD' },
  { label: 'C$50K', value: 50000, currency: 'CAD' },
  { label: 'C$100K', value: 100000, currency: 'CAD' },
];


const SCENARIOS = [
  {
    id: 'fed_pivot',
    title: 'Fed Pivot Drill',
    description: 'The Fed just announced an emergency 50bps rate cut. Markets are reacting. You have 10 trades and $100K to maximise your P&L in 5 minutes.',
    icon: '🏦',
    difficulty: 'MEDIUM',
    category: 'MACRO',
    hints: ['Rate cuts → long duration bonds (TLT)', 'Rate cuts → bullish for growth stocks', 'USD typically weakens on cuts'],
    priceShocks: { TLT: 1.04, NVDA: 1.06, MSFT: 1.03, JPM: 0.98, XOM: 0.97, GLD: 1.02 },
  },
  {
    id: 'earnings_nvda',
    title: 'NVDA Earnings Beat',
    description: 'NVIDIA just posted a massive earnings beat +40% YoY. You have $100K and 10 trades. Ride the momentum or fade the move?',
    icon: '🚀',
    difficulty: 'HARD',
    category: 'EARNINGS',
    hints: ['Chip sector typically rallies on NVDA beats (AMD, AVGO)', 'Options IV spikes before, collapses after (IV crush)', 'Competitors may sell off on NVDA dominance narrative'],
    priceShocks: { NVDA: 1.12, AMD: 1.06, MSFT: 1.02, GOOGL: 1.01, AAPL: 0.99 },
  },
  {
    id: 'crash_drill',
    title: 'Market Crash Protection',
    description: 'A flash crash: S&P down 7%, circuit breakers triggered. $100K. Protect your capital and/or profit from the panic.',
    icon: '🛡️',
    difficulty: 'EXPERT',
    category: 'RISK',
    hints: ['Gold (GLD) is a classic safe haven', 'VIX spikes in crashes — long volatility instruments', 'Defensive sectors (JNJ, WMT) outperform', 'Cash is a position too'],
    priceShocks: { AAPL: 0.88, MSFT: 0.87, NVDA: 0.82, GLD: 1.05, JNJ: 0.97, WMT: 0.98, BTC: 0.76 },
  },
  {
    id: 'inflation_spike',
    title: 'Inflation Shock',
    description: 'CPI prints 6.2%, way above the 3.4% consensus. Stagflation risk re-emerges. Reposition $100K for the new regime.',
    icon: '📈',
    difficulty: 'MEDIUM',
    category: 'MACRO',
    hints: ['Real assets outperform (GLD, XOM)', 'Long-duration bonds (TLT) get hit hardest', 'Value over growth in high-inflation regimes', 'Commodities and energy are inflation hedges'],
    priceShocks: { GLD: 1.04, XOM: 1.06, TLT: 0.92, NVDA: 0.93, MSFT: 0.94, AAPL: 0.95, META: 0.93 },
  },
];

interface DrillPosition {
  symbol: string; qty: number; avgPrice: number; currentPrice: number;
}

interface DrillTrade {
  id: number; time: string; symbol: string; action: 'BUY' | 'SELL';
  qty: number; price: number; total: number;
}

function DrillTab() {
  const [phase, setPhase] = useState<'SELECT' | 'SETUP' | 'ACTIVE' | 'RESULTS'>('SELECT');
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);
  // Setup config
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['US']);
  const [capitalPreset, setCapitalPreset] = useState(CAPITAL_PRESETS[4]); // $100K default
  const [customCapital, setCustomCapital] = useState('');
  const [drillDuration, setDrillDuration] = useState(300); // seconds
  const [maxTrades, setMaxTrades] = useState(10);
  const [drillCurrency, setDrillCurrency] = useState('USD');
  // Derived
  const startingCash = customCapital ? parseFloat(customCapital) || capitalPreset.value : capitalPreset.value;
  const availableSymbols = selectedMarkets.flatMap(m => MARKET_GROUPS[m]?.symbols || []).filter(s => WATCHLIST_UNIVERSE[s]);
  // Active drill state
  const [cash, setCash] = useState(startingCash);
  const [positions, setPositions] = useState<DrillPosition[]>([]);
  const [trades, setTrades] = useState<DrillTrade[]>([]);
  const [tradeCount, setTradeCount] = useState(0);
  const [drillPrices, setDrillPrices] = useState<Record<string, number>>({});
  const [orderSym, setOrderSym] = useState('AAPL');
  const [orderQty, setOrderQty] = useState('10');
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [timer, setTimer] = useState(drillDuration);
  const [timerActive, setTimerActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const timerRef = useRef<any>(null);

  const toggleMarket = (m: string) => {
    setSelectedMarkets(prev =>
      prev.includes(m) ? (prev.length > 1 ? prev.filter(x => x !== m) : prev) : [...prev, m]
    );
  };

  const startDrill = (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario);
    const p: Record<string, number> = {};
    availableSymbols.forEach(sym => {
      const info = WATCHLIST_UNIVERSE[sym];
      if (!info) return;
      const shock = (scenario.priceShocks as any)[sym] ?? 1;
      p[sym] = parseFloat((info.price * shock * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2));
    });
    setDrillPrices(p);
    const initialCash = customCapital ? parseFloat(customCapital) || capitalPreset.value : capitalPreset.value;
    setCash(initialCash);
    setPositions([]);
    setTrades([]);
    setTradeCount(0);
    setTimer(drillDuration);
    setFeedback('');
    setOrderSym(availableSymbols[0] || 'AAPL');
    setPhase('ACTIVE');
    setTimerActive(true);
  };

  const goToSetup = (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario);
    setPhase('SETUP');
  };


  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setTimerActive(false); setPhase('RESULTS'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  // Live jitter during drill
  useEffect(() => {
    if (phase !== 'ACTIVE') return;
    const t = setInterval(() => {
      setDrillPrices(prev => {
        const next: Record<string, number> = {};
        Object.entries(prev).forEach(([k, v]) => {
          next[k] = parseFloat((v * (1 + (Math.random() - 0.499) * 0.003)).toFixed(2));
        });
        setPositions(pos => pos.map(p => ({ ...p, currentPrice: next[p.symbol] ?? p.currentPrice })));
        return next;
      });
    }, 2000);
    return () => clearInterval(t);
  }, [phase]);

  const placeOrder = () => {
    if (tradeCount >= maxTrades) { setFeedback('❌ Max trades reached'); return; }
    const price = drillPrices[orderSym];
    if (!price) { setFeedback('❌ Unknown symbol'); return; }
    const qty = parseInt(orderQty);
    if (!qty || qty <= 0) { setFeedback('❌ Invalid quantity'); return; }
    const total = price * qty;
    const sym = CURRENCY_SYMBOL[capitalPreset.currency] || '$';

    if (orderSide === 'BUY') {
      if (total > cash) { setFeedback(`❌ Insufficient funds — need ${sym}${total.toLocaleString()}`); return; }
      setCash(c => parseFloat((c - total).toFixed(2)));
      setPositions(prev => {
        const ex = prev.find(p => p.symbol === orderSym);
        if (ex) {
          return prev.map(p => p.symbol === orderSym
            ? { ...p, qty: p.qty + qty, avgPrice: parseFloat(((p.avgPrice * p.qty + price * qty) / (p.qty + qty)).toFixed(2)), currentPrice: price }
            : p
          );
        }
        return [...prev, { symbol: orderSym, qty, avgPrice: price, currentPrice: price }];
      });
      setFeedback(`✅ Bought ${qty} ${orderSym} @ ${sym}${price}`);
    } else {
      const pos = positions.find(p => p.symbol === orderSym);
      if (!pos || pos.qty < qty) { setFeedback(`❌ Not enough ${orderSym} to sell`); return; }
      setCash(c => parseFloat((c + total).toFixed(2)));
      setPositions(prev => prev.map(p => p.symbol === orderSym ? { ...p, qty: p.qty - qty } : p).filter(p => p.qty > 0));
      setFeedback(`✅ Sold ${qty} ${orderSym} @ ${sym}${price}`);
    }
    setTrades(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString('en-US', { hour12: false }), symbol: orderSym, action: orderSide, qty, price, total }, ...prev]);
    setTradeCount(c => c + 1);
  };

  const finishDrill = () => { setTimerActive(false); clearInterval(timerRef.current); setPhase('RESULTS'); };
  const resetDrill = () => { setPhase('SELECT'); setSelectedScenario(null); };

  const positionValue = positions.reduce((s, p) => s + p.qty * p.currentPrice, 0);
  const startingCashFinal = customCapital ? parseFloat(customCapital) || capitalPreset.value : capitalPreset.value;
  const totalValue = cash + positionValue;
  const totalPnL = totalValue - startingCashFinal;
  const totalPnLPct = ((totalPnL / startingCashFinal) * 100).toFixed(2);
  const currSym = CURRENCY_SYMBOL[capitalPreset.currency] || '$';

  const scoreRating = () => {
    const p = parseFloat(totalPnLPct);
    if (p >= 8)  return { stars: 5, label: 'ELITE TRADER' };
    if (p >= 4)  return { stars: 4, label: 'PROFESSIONAL' };
    if (p >= 1)  return { stars: 3, label: 'COMPETENT' };
    if (p >= 0)  return { stars: 2, label: 'BREAK EVEN' };
    if (p >= -3) return { stars: 1, label: 'LOSS TAKEN' };
    return { stars: 0, label: 'BLOWN UP' };
  };

  const DIFF_COLOR: Record<string, string> = { MEDIUM: '#f59e0b', HARD: '#fb7185', EXPERT: '#a78bfa', EASY: '#34d399' };

  if (phase === 'SELECT') return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Crosshair size={16} className="text-amber-500" />
        <div>
          <h2 className="text-sm font-bold text-white">Investment Drill Simulator</h2>
          <p className="text-[10px] text-[#64748b] mt-0.5">Paper-trade through real-world market scenarios. Choose a scenario, configure your setup, then trade.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SCENARIOS.map(s => (
          <div key={s.id} className="bg-[#11131a] border border-[#1e293b] rounded-sm p-5 hover:border-amber-500/50 cursor-pointer transition-all group" onClick={() => goToSetup(s)}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl">{s.icon}</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm font-mono" style={{ background: `${DIFF_COLOR[s.difficulty] || '#64748b'}20`, color: DIFF_COLOR[s.difficulty] || '#64748b' }}>{s.difficulty}</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{s.title}</h3>
            <p className="text-[10px] text-[#94a3b8] leading-relaxed mb-3">{s.description}</p>
            <div className="space-y-1 mb-4">
              {s.hints.map((h, i) => (
                <p key={i} className="text-[9px] text-[#64748b] flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">→</span>{h}</p>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] bg-[#1e293b] text-[#64748b] px-2 py-0.5 rounded-sm font-mono">{s.category}</span>
              <button className="text-[10px] font-bold text-amber-500 flex items-center gap-1.5 cursor-pointer">
                <Settings size={10} /> CONFIGURE & START
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (phase === 'SETUP' && selectedScenario) return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setPhase('SELECT')} className="text-[9px] text-[#64748b] hover:text-white cursor-pointer border border-[#334155] px-2 py-1 rounded-sm">← BACK</button>
        <span className="text-2xl">{selectedScenario.icon}</span>
        <div>
          <h2 className="text-sm font-bold text-white">{selectedScenario.title}</h2>
          <p className="text-[10px] text-[#64748b]">Configure your drill session before starting</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Market Selection */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-5">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">MARKETS TO TRADE</p>
          <div className="space-y-2">
            {Object.entries(MARKET_GROUPS).map(([key, mg]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => toggleMarket(key)}
                  className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center cursor-pointer transition-all ${
                    selectedMarkets.includes(key) ? 'bg-amber-500 border-amber-500' : 'border-[#334155] hover:border-amber-500'
                  }`}>
                  {selectedMarkets.includes(key) && <span className="text-[8px] text-[#0d0e12] font-bold">✓</span>}
                </div>
                <span className="text-sm">{mg.flag}</span>
                <span className="text-[10px] text-white font-mono">{mg.label}</span>
                <span className="ml-auto text-[9px] text-[#64748b]">{mg.symbols.length} stocks</span>
              </label>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#1e293b]">
            <p className="text-[9px] text-[#64748b] font-mono">{availableSymbols.length} symbols available</p>
          </div>
        </div>

        {/* Capital */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-5">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">STARTING CAPITAL</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {CAPITAL_PRESETS.map(cp => (
              <button key={cp.label} onClick={() => { setCapitalPreset(cp); setCustomCapital(''); setDrillCurrency(cp.currency); }}
                className={`py-2 text-[10px] font-bold rounded-sm border cursor-pointer transition-all font-mono ${
                  capitalPreset.label === cp.label && !customCapital ? 'bg-amber-500 border-amber-500 text-[#0d0e12]' : 'border-[#334155] text-[#94a3b8] hover:border-amber-500'
                }`}>
                {cp.label}
              </button>
            ))}
          </div>
          <div>
            <label className="text-[9px] text-[#64748b] font-mono block mb-1">CUSTOM AMOUNT</label>
            <input type="number" placeholder="e.g. 75000" value={customCapital} onChange={e => setCustomCapital(e.target.value)}
              className="w-full bg-[#0d0e12] border border-[#334155] rounded-sm px-2 py-1.5 text-xs text-white font-mono focus:border-amber-500 outline-none" />
          </div>
          <div className="mt-3">
            <label className="text-[9px] text-[#64748b] font-mono block mb-1">ACCOUNT CURRENCY</label>
            <select value={drillCurrency} onChange={e => setDrillCurrency(e.target.value)}
              className="w-full bg-[#0d0e12] border border-[#334155] rounded-sm px-2 py-1.5 text-[10px] text-white font-mono focus:border-amber-500 outline-none">
              <option value="USD">USD — US Dollar ($)</option>
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="CAD">CAD — Canadian Dollar (C$)</option>
            </select>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1e293b] font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#64748b]">Starting Capital</span>
              <span className="text-amber-400 font-bold">{CURRENCY_SYMBOL[drillCurrency]}{(customCapital ? parseFloat(customCapital) || capitalPreset.value : capitalPreset.value).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Duration + Rules */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-5">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">DRILL RULES</p>
          <div className="space-y-4">
            <div>
              <label className="text-[9px] text-[#64748b] font-mono block mb-2">DURATION</label>
              <div className="grid grid-cols-2 gap-2">
                {[{l:'2 min',v:120},{l:'5 min',v:300},{l:'10 min',v:600},{l:'15 min',v:900}].map(d => (
                  <button key={d.v} onClick={() => setDrillDuration(d.v)}
                    className={`py-1.5 text-[10px] font-bold rounded-sm border cursor-pointer transition-all ${
                      drillDuration === d.v ? 'bg-amber-500 border-amber-500 text-[#0d0e12]' : 'border-[#334155] text-[#94a3b8] hover:border-amber-500'
                    }`}>{d.l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] text-[#64748b] font-mono block mb-2">MAX TRADES</label>
              <div className="grid grid-cols-2 gap-2">
                {[5, 10, 20, 50].map(n => (
                  <button key={n} onClick={() => setMaxTrades(n)}
                    className={`py-1.5 text-[10px] font-bold rounded-sm border cursor-pointer transition-all ${
                      maxTrades === n ? 'bg-amber-500 border-amber-500 text-[#0d0e12]' : 'border-[#334155] text-[#94a3b8] hover:border-amber-500'
                    }`}>{n}</button>
                ))}
              </div>
            </div>
            <div className="bg-[#0d0e12] rounded-sm p-3 space-y-1.5 text-[9px] font-mono">
              <div className="flex justify-between"><span className="text-[#64748b]">Markets</span><span className="text-white">{selectedMarkets.map(m => MARKET_GROUPS[m].flag).join(' ')}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Symbols</span><span className="text-white">{availableSymbols.length}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Duration</span><span className="text-white">{drillDuration/60} min</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Max Trades</span><span className="text-white">{maxTrades}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Currency</span><span className="text-amber-400 font-bold">{drillCurrency}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={() => startDrill(selectedScenario)}
          className="flex items-center gap-2 px-10 py-3 bg-amber-500 text-[#0d0e12] text-sm font-bold rounded-sm hover:bg-amber-400 cursor-pointer transition-all">
          <Play size={14} /> LAUNCH DRILL — {selectedScenario.title}
        </button>
      </div>
    </div>
  );

  if (phase === 'ACTIVE' && selectedScenario) return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-[#11131a] border border-amber-500/30 rounded-sm p-4 flex items-center gap-4">
        <span className="text-2xl">{selectedScenario.icon}</span>
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-400">{selectedScenario.title}</p>
          <p className="text-[10px] text-[#94a3b8]">{selectedMarkets.map(m => `${MARKET_GROUPS[m].flag} ${MARKET_GROUPS[m].label}`).join(' · ')} · {availableSymbols.length} symbols · {currSym}{startingCashFinal.toLocaleString()} starting capital</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold font-mono ${timer < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
          </p>
          <p className="text-[8px] text-[#64748b]">REMAINING</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold font-mono ${tradeCount >= maxTrades ? 'text-red-400' : 'text-white'}`}>{maxTrades - tradeCount}</p>
          <p className="text-[8px] text-[#64748b]">TRADES LEFT</p>
        </div>
        <button onClick={finishDrill} className="px-4 py-2 border border-amber-500 text-amber-500 text-[10px] font-bold rounded-sm hover:bg-amber-500 hover:text-[#0d0e12] transition-all cursor-pointer">END DRILL</button>
      </div>

      {/* P&L Banner */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-3">
          <p className="text-[9px] text-[#64748b] font-mono">AVAILABLE CASH</p>
          <p className="text-base font-bold font-mono text-white mt-1">{currSym}{cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-3">
          <p className="text-[9px] text-[#64748b] font-mono">POSITION VALUE</p>
          <p className="text-base font-bold font-mono text-white mt-1">{currSym}{positionValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-3">
          <p className="text-[9px] text-[#64748b] font-mono">TOTAL EQUITY</p>
          <p className="text-base font-bold font-mono text-white mt-1">{currSym}{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className={`bg-[#11131a] border rounded-sm p-3 ${totalPnL >= 0 ? 'border-emerald-900/60' : 'border-red-900/60'}`}>
          <p className="text-[9px] text-[#64748b] font-mono">UNREALIZED P&L</p>
          <p className={`text-base font-bold font-mono mt-1 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}{currSym}{Math.abs(totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({totalPnLPct}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Order Panel */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4 space-y-3">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase">PLACE ORDER</p>
          {feedback && <p className={`text-[9px] font-mono px-2 py-1.5 rounded-sm ${feedback.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{feedback}</p>}
          {/* Side toggle */}
          <div className="flex rounded-sm overflow-hidden border border-[#334155]">
            <button onClick={() => setOrderSide('BUY')} className={`flex-1 py-2 text-[10px] font-bold cursor-pointer transition-all ${orderSide === 'BUY' ? 'bg-emerald-600 text-white' : 'text-[#94a3b8] hover:bg-[#1e293b]'}`}>BUY</button>
            <button onClick={() => setOrderSide('SELL')} className={`flex-1 py-2 text-[10px] font-bold cursor-pointer transition-all ${orderSide === 'SELL' ? 'bg-red-600 text-white' : 'text-[#94a3b8] hover:bg-[#1e293b]'}`}>SELL</button>
          </div>
          {/* Symbol */}
          <div>
            <label className="text-[9px] text-[#64748b] font-mono block mb-1">SYMBOL</label>
            <select value={orderSym} onChange={e => setOrderSym(e.target.value)}
              className="w-full bg-[#0d0e12] border border-[#334155] rounded-sm px-2 py-1.5 text-xs text-white font-mono focus:border-amber-500 outline-none">
              {availableSymbols.map(k => {
                const info = WATCHLIST_UNIVERSE[k];
                return (
                  <option key={k} value={k}>{info?.flag || ''} {k} — {CURRENCY_SYMBOL[info?.currency || 'USD']}{(drillPrices[k] ?? info?.price ?? 0).toFixed(2)}</option>
                );
              })}
            </select>
          </div>
          {/* Qty */}
          <div>
            <label className="text-[9px] text-[#64748b] font-mono block mb-1">QUANTITY</label>
            <input type="number" value={orderQty} onChange={e => setOrderQty(e.target.value)} min="1"
              className="w-full bg-[#0d0e12] border border-[#334155] rounded-sm px-2 py-1.5 text-xs text-white font-mono focus:border-amber-500 outline-none" />
          </div>
          {/* Preview */}
          <div className="bg-[#0d0e12] rounded-sm p-2 text-[9px] font-mono space-y-1">
            <div className="flex justify-between"><span className="text-[#64748b]">Symbol</span><span className="text-white">{orderSym} ({WATCHLIST_UNIVERSE[orderSym]?.currency || 'USD'})</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Price</span><span className="text-white">{CURRENCY_SYMBOL[WATCHLIST_UNIVERSE[orderSym]?.currency || 'USD']}{(drillPrices[orderSym] ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Order Value</span><span className={`font-bold ${orderSide === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{CURRENCY_SYMBOL[WATCHLIST_UNIVERSE[orderSym]?.currency || 'USD']}{((drillPrices[orderSym] ?? 0) * parseInt(orderQty || '0')).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">{drillCurrency} Cash after</span><span className="text-amber-400">{currSym}{(orderSide === 'BUY' ? cash - (drillPrices[orderSym] ?? 0) * parseInt(orderQty || '0') : cash + (drillPrices[orderSym] ?? 0) * parseInt(orderQty || '0')).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
          </div>
          <button onClick={placeOrder} disabled={tradeCount >= maxTrades}
            className={`w-full py-2.5 text-[10px] font-bold rounded-sm transition-all cursor-pointer ${orderSide === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'} disabled:opacity-40 disabled:cursor-not-allowed`}>
            {orderSide === 'BUY' ? '▲ EXECUTE BUY' : '▼ EXECUTE SELL'}
          </button>
        </div>

        {/* Open Positions */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">OPEN POSITIONS ({positions.length})</p>
          {positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Layers size={20} className="text-[#334155] mb-2" />
              <p className="text-[9px] text-[#334155]">No open positions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {positions.map(pos => {
                const pnl = (pos.currentPrice - pos.avgPrice) * pos.qty;
                const pnlPct = ((pos.currentPrice - pos.avgPrice) / pos.avgPrice * 100).toFixed(2);
                return (
                  <div key={pos.symbol} className={`flex items-center justify-between border-b border-[#0d0e12] pb-2 ${pnl >= 0 ? '' : ''}`}>
                    <div>
                      <p className="text-xs font-bold text-white font-mono">{pos.symbol}</p>
                      <p className="text-[9px] text-[#64748b] font-mono">{pos.qty} × ${pos.avgPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-white">${pos.currentPrice.toFixed(2)}</p>
                      <p className={`text-[9px] font-bold font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPct}%)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trade Log */}
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
          <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">TRADE LOG ({trades.length}/{maxTrades})</p>
          <div className="space-y-1.5 overflow-y-auto max-h-64">
            {trades.length === 0 ? (
              <p className="text-[9px] text-[#334155] font-mono text-center py-8">No trades yet</p>
            ) : trades.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-[9px] font-mono border-b border-[#0d0e12] pb-1.5">
                <span className={`font-bold px-1.5 py-0.5 rounded-sm ${t.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{t.action}</span>
                <span className="text-white font-bold">{t.symbol}</span>
                <span className="text-[#64748b]">{t.qty} × ${t.price.toFixed(2)}</span>
                <span className="ml-auto text-[#64748b]">{t.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (phase === 'RESULTS') {
    const score = scoreRating();
    const perfData = [{ name: 'Starting', value: startingCash }, { name: 'Final', value: totalValue }];
    const posResults = positions.map(p => ({ symbol: p.symbol, pnl: (p.currentPrice - p.avgPrice) * p.qty, pct: ((p.currentPrice - p.avgPrice) / p.avgPrice * 100).toFixed(2) }));
    return (
      <div className="space-y-4">
        {/* Score Hero */}
        <div className={`bg-[#11131a] border rounded-sm p-8 text-center ${totalPnL >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
          <p className="text-4xl mb-3">{score.stars >= 4 ? '🏆' : score.stars >= 3 ? '🎯' : score.stars >= 1 ? '📊' : '💥'}</p>
          <h2 className="text-2xl font-bold text-white mb-1">{score.label}</h2>
          <p className={`text-4xl font-bold font-mono ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}{currSym}{Math.abs(totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[#64748b] text-sm mt-1">{totalPnLPct}% return on {currSym}{startingCashFinal.toLocaleString()} capital</p>
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className={i < score.stars ? 'text-amber-400 fill-amber-400' : 'text-[#334155]'} />
            ))}
          </div>
          <p className="text-[10px] text-[#64748b] mt-2 font-mono">{tradeCount} trades · {selectedMarkets.map(m => MARKET_GROUPS[m].flag).join('')} {selectedScenario?.title}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Position P&L Breakdown */}
          <div className="col-span-2 bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">POSITION BREAKDOWN</p>
            {posResults.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={posResults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="symbol" stroke="#334155" fontSize={9} />
                    <YAxis stroke="#334155" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#11131a', borderColor: '#1e293b', fontSize: 10 }} />
                    <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
                      {posResults.map((entry, idx) => (
                        <Cell key={idx} fill={entry.pnl >= 0 ? '#34d399' : '#fb7185'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-[10px] text-[#64748b] text-center py-12">All positions were closed (cash only)</p>
            )}
          </div>

          {/* Trade Summary */}
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">SESSION STATS</p>
            <div className="space-y-2 text-[10px] font-mono">
              {[
                ['Starting Capital', `${currSym}${startingCashFinal.toLocaleString()}`],
                ['Final Equity', `${currSym}${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
                ['Total P&L', `${totalPnL >= 0 ? '+' : ''}${currSym}${Math.abs(totalPnL).toFixed(2)}`],
                ['Return %', `${totalPnLPct}%`],
                ['Trades Placed', `${tradeCount}/${maxTrades}`],
                ['Account Currency', drillCurrency],
                ['Markets Traded', selectedMarkets.map(m => MARKET_GROUPS[m].flag).join(' ')],
                ['Open Positions', String(positions.length)],
                ['Score Rating', score.label],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between border-b border-[#0d0e12] pb-1.5">
                  <span className="text-[#64748b]">{k}</span>
                  <span className="text-white font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario Debrief */}
        {selectedScenario && (
          <div className="bg-[#11131a] border border-amber-500/20 rounded-sm p-4">
            <p className="text-[9px] font-bold tracking-widest text-amber-500 uppercase mb-3 flex items-center gap-2">
              <Brain size={10} /> SCENARIO DEBRIEF — {selectedScenario.title}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-[#64748b] mb-2 font-mono">KEY PRICE SHOCKS IN THIS SCENARIO:</p>
                <div className="space-y-1">
                  {Object.entries(selectedScenario.priceShocks).map(([sym, shock]) => (
                    <div key={sym} className="flex items-center gap-2 text-[9px] font-mono">
                      <span className="text-white font-bold w-12">{sym}</span>
                      <div className="flex-1 bg-[#0d0e12] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${Math.abs((shock as number) - 1) * 500}%`, backgroundColor: (shock as number) >= 1 ? '#34d399' : '#fb7185' }} />
                      </div>
                      <span className={`${(shock as number) >= 1 ? 'text-emerald-400' : 'text-red-400'} font-bold`}>{(shock as number) >= 1 ? '+' : ''}{(((shock as number) - 1) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] text-[#64748b] mb-2 font-mono">OPTIMAL STRATEGY HINTS:</p>
                <div className="space-y-1">
                  {selectedScenario.hints.map((h, i) => (
                    <p key={i} className="text-[9px] text-[#94a3b8] flex items-start gap-1.5"><span className="text-amber-500">→</span>{h}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button onClick={resetDrill} className="flex items-center gap-2 px-6 py-2.5 border border-[#334155] text-[#94a3b8] text-[10px] font-bold rounded-sm hover:border-amber-500 hover:text-white cursor-pointer transition-all">
            <RotateCcw size={12} /> CHOOSE NEW SCENARIO
          </button>
          <button onClick={() => startDrill(selectedScenario!)} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-[#0d0e12] text-[10px] font-bold rounded-sm hover:bg-amber-400 cursor-pointer transition-all">
            <Play size={12} /> RETRY THIS SCENARIO
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Learn Tab ─── Adaptive Financial Education ─────────────────────────────

const LEARN_MODULES = [
  { id: 'foundations', emoji: '🏛️', color: '#f59e0b', title: 'Market Foundations', description: 'Exchanges, order types, market cap, circuit breakers, and the mechanics behind every trade.',
    lessons: [
      { id: 'what-is-exchange', title: 'What Is a Stock Exchange?', duration: '5 min', difficulty: 'BEGINNER',
        points: ['A stock exchange is a regulated marketplace where buyers and sellers trade shares of publicly listed companies.','NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) are India\'s two main exchanges. NSE benchmark: Nifty 50. BSE benchmark: Sensex 30.','NYSE and NASDAQ are the world\'s two largest by market cap. NASDAQ is more tech-heavy (Apple, NVDA, Microsoft).','TSX (Toronto Stock Exchange) is Canada\'s primary exchange — energy and financials dominate it (~55% combined).','SEBI regulates Indian markets. SEC regulates US markets. OSC regulates Ontario/Canada.','Market hours: NSE/BSE: 9:15am–3:30pm IST. NYSE/NASDAQ: 9:30am–4:00pm ET. TSX: 9:30am–4:00pm ET.'],
        formula: 'Market Cap = Share Price × Total Shares Outstanding',
        quiz: [{q:'Which index represents BSE?',opts:['Nifty 50','Sensex 30','S&P 500','TSX Composite'],a:1,exp:'Sensex 30 is the benchmark index of the Bombay Stock Exchange, tracking 30 large-cap companies. Nifty 50 is NSE\'s benchmark.'},{q:'What does SEBI do?',opts:['It is India\'s stock exchange','It sets repo rates','It regulates Indian securities markets','It manages India\'s forex reserves'],a:2,exp:'SEBI (Securities and Exchange Board of India) is the regulatory body for all securities and commodity markets in India, equivalent to the US SEC.'},{q:'TSX is most heavily weighted towards:',opts:['Technology','Healthcare','Energy & Financials','Consumer goods'],a:2,exp:'Energy and financial sectors make up roughly 55% of the S&P/TSX Composite, reflecting Canada\'s resource economy and big bank dominance.'}] },
      { id: 'order-types', title: 'Order Types Explained', duration: '7 min', difficulty: 'BEGINNER',
        points: ['Market Order: executes immediately at the best available price. Fast but price uncertain.','Limit Order: only executes at your specified price or better. More control, may not fill.','Stop Loss: triggers a market order when price hits your set level. Protects against large losses.','Stop Limit: like stop loss but triggers a limit order — no slippage guarantee.','IOC (Immediate or Cancel): fills what it can immediately, cancels the rest.','In India, GTT (Good Till Triggered) orders auto-execute when price hits your level — no daily renewal needed.','AMO (After Market Orders) let you place orders outside trading hours for next-day execution.'],
        formula: 'Slippage = Executed Price − Expected Price',
        quiz: [{q:'Which order guarantees execution but not price?',opts:['Limit Order','Stop Limit','Market Order','GTT Order'],a:2,exp:'Market orders execute immediately at the best available price. Execution is guaranteed but you accept whatever price the market offers.'},{q:'GTT orders in India are useful because:',opts:['They execute faster','They remain active until triggered (up to 1 year)','They have zero brokerage','They bypass SEBI rules'],a:1,exp:'GTT (Good Till Triggered) orders remain active until the trigger price is hit or the order expires (typically 1 year), eliminating the need to monitor markets daily.'},{q:'A stop-loss order, when triggered, becomes:',opts:['A limit order','A market order','A GTT order','An IOC order'],a:1,exp:'A standard stop-loss triggers a market order when the stop price is hit, ensuring execution at prevailing market price.'}] },
      { id: 'market-cap', title: 'Market Cap, Float & Index Construction', duration: '6 min', difficulty: 'BEGINNER',
        points: ['Large Cap (India): >₹20,000 Cr market cap. Nifty 50 stocks. More stable and liquid.','Mid Cap (India): ₹5,000–20,000 Cr. Higher growth potential, more volatile.','Small Cap (India): <₹5,000 Cr. Highest risk/reward. Less liquid.','US: Large Cap >$10B, Mid $2B–10B, Small $300M–2B.','Nifty 50 is free-float market-cap weighted — bigger companies have more index impact.','BSE Sensex uses free-float methodology across 30 select Sensex companies, reviewed every 6 months.','Free float excludes promoter-held and locked-in shares from the weighting calculation.'],
        formula: 'Free Float Market Cap = Price × (Total Shares − Locked-in Shares)',
        quiz: [{q:'In India, Large Cap stocks typically have market cap above:',opts:['₹1,000 Cr','₹10,000 Cr','₹20,000 Cr','₹50,000 Cr'],a:2,exp:'SEBI defines Large Cap as the top 100 companies by market cap, generally above ₹20,000 Crore. These form the universe for Nifty 50 and Sensex.'},{q:'Nifty 50 uses which weighting methodology?',opts:['Price weighted','Equal weighted','Free-float market cap weighted','Dividend weighted'],a:2,exp:'Nifty 50 uses free-float market capitalization weighting, excluding locked-in promoter shares from the weighting formula.'},{q:'Which index has exactly 30 components?',opts:['Nifty 50','Nifty Bank','BSE Sensex','S&P 500'],a:2,exp:'The BSE Sensex tracks 30 well-established, financially sound companies listed on BSE, selected by BSE\'s index committee for liquidity, sector representation, and market cap.'}] },
      { id: 'circuit-breakers', title: 'Circuit Breakers & Upper/Lower Circuits', duration: '5 min', difficulty: 'INTERMEDIATE',
        points: ['Index circuit breakers halt the entire Indian market when indices move too fast: 10% halt = 45 min, 15% halt = 1h45min, 20% = full-day halt.','Individual stocks have price bands: 2%, 5%, 10%, 20% set by exchanges to prevent extreme moves.','Upper circuit: stock hits maximum allowed daily gain — only buyers exist, no sellers. Trading pauses.','Lower circuit: stock hits maximum allowed daily loss — only sellers exist, no buyers. Trading pauses.','Stocks in F&O segment typically have NO individual price bands (their derivatives provide hedging).','US markets use S&P 500 circuit breakers: Level 1 (7%), Level 2 (13%), Level 3 (20%) — progressively longer halts.'],
        formula: 'Upper Circuit = Prev Close × (1 + Limit%) | Lower Circuit = Prev Close × (1 − Limit%)',
        quiz: [{q:'If NIFTY 50 drops 10% intraday, trading halts for:',opts:['15 minutes','30 minutes','45 minutes','The full day'],a:2,exp:'A 10% intraday decline in NSE/BSE indices triggers a 45-minute trading halt before markets resume for the rest of the session.'},{q:'A stock hitting upper circuit means:',opts:['Only sellers, no buyers','Only buyers, no sellers','Both sides active','Stock suspended permanently'],a:1,exp:'Upper circuit means demand is extreme — buyers exist at the limit price but no sellers are willing to sell, so trading halts until the next session or the limit is revised.'},{q:'Which stocks typically have NO individual circuit limits?',opts:['Large cap stocks','Sensex stocks','Stocks in F&O segment','Government companies'],a:2,exp:'Stocks in the F&O (Futures & Options) segment are exempt from individual price band restrictions since they have derivative instruments available for hedging.'}] },
    ]
  },
  { id: 'charts', emoji: '📈', color: '#34d399', title: 'Chart Reading', description: 'Candlesticks, support & resistance, volume, and trend lines — the visual language of every trader.',
    lessons: [
      { id: 'candlesticks', title: 'Candlestick Basics', duration: '8 min', difficulty: 'BEGINNER',
        points: ['A candlestick shows Open, High, Low, Close (OHLC) for a time period. Body = Open to Close. Wicks = High/Low extremes.','Green candle: Close > Open (bullish). Red candle: Close < Open (bearish).','Doji: Open ≈ Close. Very small body. Signals indecision — powerful reversal signal after a strong trend.','Hammer: small body at top, long lower wick. Bullish reversal at support. Shooting Star = inverse (bearish at resistance).','Engulfing pattern: second candle fully engulfs the first body. Bullish Engulfing = strong buy signal.','Marubozu: candle with no wicks at all. Full conviction move — very strong directional signal.'],
        formula: 'Candle Body = |Close − Open| | Upper Wick = High − max(Open, Close)',
        quiz: [{q:'A red candlestick means:',opts:['High > Low','Volume decreased','Open > Close','Close > Open'],a:2,exp:'A red (or black) candlestick forms when the closing price is lower than the opening price — indicating sellers won the session.'},{q:'A Doji candlestick signals:',opts:['Strong uptrend','Strong downtrend','Market indecision','High volume'],a:2,exp:'A Doji has nearly equal open and close, creating a tiny body. It signals that buyers and sellers balanced — indecision that often precedes a reversal.'},{q:'A Hammer at a support level indicates:',opts:['Continuation of downtrend','Bullish reversal potential','Bearish reversal','No significance'],a:1,exp:'A Hammer (small top body, long lower wick) at support means sellers tried to push lower but buyers absorbed all the selling and closed price near the high — a bullish reversal signal.'}] },
      { id: 'support-resistance', title: 'Support & Resistance', duration: '7 min', difficulty: 'BEGINNER',
        points: ['Support: price level where buying consistently stops a decline. Acts as a floor.','Resistance: price level where selling consistently stops a rally. Acts as a ceiling.','Role reversal: when support breaks, it becomes new resistance. When resistance breaks, it becomes new support.','Round numbers (e.g., Nifty 24,000 or AAPL $200) act as psychological S/R due to order concentration.','The more times a level is tested and holds, the stronger it is — but also more likely to break on the next test.','Volume at S/R is critical: high-volume breakout = strong; low-volume breakout = potential false breakout.'],
        formula: 'S/R Strength ∝ (Number of Touches) × (Volume at Level)',
        quiz: [{q:'When support breaks, it typically becomes:',opts:['Stronger support','New resistance','Irrelevant','A buy signal'],a:1,exp:'Role reversal: a broken support level becomes the new resistance. Former buyers are now trapped and will sell when price returns to their entry — creating resistance.'},{q:'Round numbers as S/R is an example of:',opts:['Technical analysis','Fundamental analysis','Psychological levels','Fibonacci levels'],a:2,exp:'Round numbers act as psychological S/R because traders naturally cluster limit orders and stop losses at clean round numbers, creating self-fulfilling zones of order concentration.'},{q:'A breakout on high volume suggests:',opts:['False breakout','Weak momentum','Strong breakout with institutional participation','Distribution by big players'],a:2,exp:'High volume during a breakout confirms institutional buying/selling conviction, dramatically reducing the probability of a false breakout (head-fake).'}] },
      { id: 'volume', title: 'Volume Analysis', duration: '6 min', difficulty: 'INTERMEDIATE',
        points: ['Volume = number of shares traded. It confirms or contradicts price moves.','Price up + Volume up = bullish (strong conviction). Price up + Volume down = weak/suspect rally.','Price down + Volume up = bearish (strong selling). Price down + Volume down = weak selling, potential reversal.','OBV (On-Balance Volume): adds volume on up-days, subtracts on down-days. OBV divergence is a powerful signal.','Volume spike on a breakout day = institutional buying (smart money). The most reliable signal.','India-specific: Delivery % is crucial. High delivery % = investors holding, not just day-trading. Conviction signal.'],
        formula: 'OBV = Previous OBV ± Volume (+ if price up, − if price down)',
        quiz: [{q:'Price rises but volume drops. This signals:',opts:['Strong rally with conviction','Weak rally, potential reversal','Strong breakout','High institutional buying'],a:1,exp:'Price rising on declining volume is a bearish divergence — the move lacks participation and conviction, suggesting it may reverse. Volume must confirm price.'},{q:'High delivery % in Indian stocks indicates:',opts:['High speculation','Investors buying and holding','Heavy short selling','F&O hedging activity'],a:1,exp:'Delivery % shows what fraction of total trades resulted in actual delivery (holding). High delivery % means investors have conviction and are holding positions — a bullish signal.'},{q:'OBV rising while price is flat/declining is:',opts:['A sell signal','Bullish divergence — accumulation in progress','Meaningless noise','Bearish divergence'],a:1,exp:'Rising OBV with flat/falling price means buying volume is secretly accumulating — smart money is loading up. This bullish divergence often precedes a significant price rise.'}] },
      { id: 'trendlines', title: 'Trend Lines & Price Channels', duration: '7 min', difficulty: 'INTERMEDIATE',
        points: ['Uptrend: Higher Highs (HH) + Higher Lows (HL). Draw trendline connecting the lows.','Downtrend: Lower Highs (LH) + Lower Lows (LL). Draw trendline connecting the highs.','Sideways/Range: price oscillates between horizontal support and resistance zones.','A channel = two parallel trendlines. Buy near lower channel line, sell near upper channel line.','A trendline break WITH volume = potential trend reversal. Wait for a retest before entering.','Price target after breakout: measure channel height, project from the breakout point.'],
        formula: 'Breakout Target = Breakout Level + Channel Height',
        quiz: [{q:'An uptrend requires:',opts:['Higher Highs only','Lower Lows only','Higher Highs AND Higher Lows','Flat price with rising volume'],a:2,exp:'A valid uptrend requires BOTH higher highs (new peaks) and higher lows (pullbacks stopping higher than the last). This confirms sustained, progressive buying interest.'},{q:'What validates a trendline break?',opts:['Any candle closing beyond it','High-volume candle closing clearly beyond it','Three touches of the line','Gap up at open'],a:1,exp:'A trendline break is only considered valid when confirmed by above-average volume, reducing the probability of a fake-out. Low-volume breaks are frequently false.'},{q:'The optimal buy zone in a rising channel is:',opts:['Upper channel line','Middle of channel','Lower channel line','Outside the channel'],a:2,exp:'The lower channel line acts as dynamic support in a rising channel. Buying near it gives the best risk/reward with a clear invalidation level just below.'}] },
    ]
  },
  { id: 'indicators', emoji: '⚡', color: '#a78bfa', title: 'Technical Indicators', description: 'Moving averages, RSI, MACD, Bollinger Bands — the quantitative toolkit of every technical trader.',
    lessons: [
      { id: 'moving-averages', title: 'Moving Averages (SMA & EMA)', duration: '8 min', difficulty: 'INTERMEDIATE',
        points: ['SMA: simple average of closing prices over N periods. All days weighted equally. Lagging.','EMA: exponential moving average. Gives more weight to recent prices. Faster to react.','Golden Cross: 50-day MA crosses ABOVE 200-day MA → long-term bullish signal. Used by institutions globally.','Death Cross: 50-day MA crosses BELOW 200-day MA → bearish signal. Often precedes extended downtrends.','In India: 20-day EMA = short-term momentum. 50-day = medium. 200-day = key long-term trend level.','Price above ALL MAs (20, 50, 200) = strong bull structure. Below all = bear market. Simple but powerful filter.'],
        formula: 'EMA = Priceᵗ × k + EMA^(t-1) × (1−k)  |  k = 2/(N+1)',
        quiz: [{q:'Which MA reacts faster to recent price changes?',opts:['SMA','EMA','Both equally fast','SMA during trends'],a:1,exp:'EMA gives exponentially more weight to recent data points, making it more responsive to new price information than an equal-period SMA.'},{q:'A Golden Cross occurs when:',opts:['Price crosses above 200 DMA','50 DMA crosses above 200 DMA','RSI crosses 70','MACD crosses signal line'],a:1,exp:'A Golden Cross is when the 50-day moving average crosses above the 200-day moving average — a classic institutional-grade long-term bullish signal.'},{q:'In Indian markets, 200 DMA serves as:',opts:['Intraday support level','Key long-term trend demarcation','Circuit breaker reference','SEBI regulatory threshold'],a:1,exp:'The 200-day moving average is the most important long-term trend indicator. Stocks/indices above 200 DMA are in bull territory; below is bear territory.'}] },
      { id: 'rsi', title: 'RSI — Relative Strength Index', duration: '7 min', difficulty: 'INTERMEDIATE',
        points: ['RSI measures momentum: speed and magnitude of recent price changes. Scale: 0–100.','RSI > 70 = overbought (potential sell signal). RSI < 30 = oversold (potential buy signal).','In strong trends, RSI can stay overbought/oversold for extended periods — don\'t fight the trend.','Bearish divergence: price makes new high but RSI makes lower high → momentum weakening.','Bullish divergence: price makes new low but RSI makes higher low → downside momentum fading.','RSI < 30 on quality Indian stocks (TCS, HDFC Bank, Reliance) often represents excellent buying opportunities.'],
        formula: 'RSI = 100 − [100 / (1 + RS)]  |  RS = Avg Gain / Avg Loss (14 periods)',
        quiz: [{q:'RSI of 28 on a quality stock typically signals:',opts:['Sell immediately','Potential oversold buying opportunity','Neutral — no action','Guaranteed reversal'],a:1,exp:'RSI below 30 is considered oversold. For fundamentally strong stocks, this often represents a mean-reversion buying opportunity, especially when combined with support levels.'},{q:'Bearish RSI divergence means:',opts:['RSI > 70 while price is low','Price makes new high but RSI makes lower high','RSI drops below 30','Price and RSI both rally'],a:1,exp:'Bearish divergence: price hits a new high while RSI fails to confirm with a new high — momentum is deteriorating despite higher prices. A warning signal.'},{q:'In a strong uptrend, RSI often:',opts:['Oscillates between 30-70','Stays above 70 for extended periods','Always reverses from 70','Drops to 30 first'],a:1,exp:'In strong uptrends, RSI can remain overbought (>70) for weeks or months. Mechanically selling every RSI>70 reading in a trending market is one of the most common and costly mistakes.'}] },
      { id: 'macd', title: 'MACD', duration: '8 min', difficulty: 'INTERMEDIATE',
        points: ['MACD = 12-day EMA minus 26-day EMA. Signal Line = 9-day EMA of MACD. Histogram = MACD − Signal.','Bullish crossover: MACD crosses ABOVE Signal Line → buy signal. Best when below the zero line.','Bearish crossover: MACD crosses BELOW Signal Line → sell signal. Best when above the zero line.','Histogram growing = momentum increasing. Histogram shrinking = momentum fading.','Zero line crossover: MACD above zero = bullish trend. MACD below zero = bearish trend.','MACD divergence with price is the most powerful signal — often precedes major reversals.'],
        formula: 'MACD = EMA(12) − EMA(26) | Signal = EMA(9) of MACD | Histogram = MACD − Signal',
        quiz: [{q:'MACD crossing above Signal Line is:',opts:['A bearish signal','Neutral','A bullish signal','An overbought signal'],a:2,exp:'When MACD crosses above the Signal Line, it indicates bullish momentum is building. The signal is strongest when the crossover happens below the zero line (from oversold territory).'},{q:'A shrinking MACD histogram while price rises suggests:',opts:['Strong trend continuation','Weakening upside momentum','Guaranteed reversal next candle','No significance'],a:1,exp:'A shrinking histogram means MACD and Signal are converging — upside momentum is fading despite continued price gains. An early warning that the rally may be running out of steam.'},{q:'MACD is most reliable combined with:',opts:['Price action and volume analysis','Fundamental analysis alone','News events alone','RSI only'],a:0,exp:'MACD signals are most reliable when confirmed by price action context (pattern, S/R) and volume. A MACD crossover at key support with high volume is far more reliable than the crossover alone.'}] },
      { id: 'bollinger', title: 'Bollinger Bands', duration: '6 min', difficulty: 'INTERMEDIATE',
        points: ['Bollinger Bands: 20-day SMA (middle), upper band = SMA + 2σ, lower band = SMA − 2σ.','Bands EXPAND during high volatility. Bands CONTRACT during low volatility (Bollinger Squeeze).','Bollinger Squeeze: bands very narrow → major move incoming. Direction unknown — watch for breakout.','Price walking the upper band in an uptrend = strong momentum. Not automatically a sell signal.','%B > 1: price above upper band. %B < 0: price below lower band.','W-bottom: price touches lower band, bounces, pulls back to lower band again (higher low) → strong bullish setup.'],
        formula: 'Upper Band = SMA(20) + 2σ | Lower Band = SMA(20) − 2σ | σ = Standard Deviation(20)',
        quiz: [{q:'Bollinger Band Squeeze signals:',opts:['High volatility ending','Major move incoming — direction unknown','Overbought conditions','Guaranteed bullish breakout'],a:1,exp:'A Bollinger Squeeze (narrow bands = low volatility) historically precedes a significant directional move. Watch for the band expansion and price direction after the squeeze resolves.'},{q:'Default Bollinger Band settings are:',opts:['10-day SMA, 1 std dev','20-day SMA, 2 std dev','50-day EMA, 2 std dev','20-day EMA, 3 std dev'],a:1,exp:'Standard Bollinger Bands use a 20-period simple moving average as the middle band with upper and lower bands at 2 standard deviations.'},{q:'Price walking along the upper Bollinger Band means:',opts:['Overbought — sell immediately','Strong uptrend — bands show momentum','Reversal is guaranteed','IV is rising'],a:1,exp:'In strong uptrends, price can "walk" the upper band continuously. The bands will expand to accommodate the move. Only sell when momentum signals deteriorate or price breaks below middle band.'}] },
    ]
  },
  { id: 'fundamentals', emoji: '💰', color: '#fb7185', title: 'Fundamental Analysis', description: 'P/E ratios, balance sheets, DCF, and EV/EBITDA — valuing businesses the professional way.',
    lessons: [
      { id: 'pe-ratio', title: 'P/E Ratio & Valuation Multiples', duration: '8 min', difficulty: 'INTERMEDIATE',
        points: ['P/E (Price-to-Earnings) = Stock Price / EPS. The most widely used valuation metric.','High P/E = market expects high future growth. Low P/E = slower growth or value stock.','Indian IT sector P/E: 25–35x (TCS, Infosys). Banking: 10–18x. FMCG: 40–70x (HUL, Nestle).','US mega-caps: NVDA 60–80x, META 25–30x, AAPL 28–32x. Justified by growth/moat.','PEG Ratio = P/E / EPS Growth Rate. PEG < 1 = potentially undervalued growth.','Forward P/E uses estimated future earnings — more forward-looking than trailing (TTM) P/E.'],
        formula: 'P/E = Market Price / EPS | PEG = P/E / Annual EPS Growth %',
        quiz: [{q:'A stock at ₹500 with EPS of ₹25 has a P/E of:',opts:['10x','15x','20x','25x'],a:2,exp:'₹500 / ₹25 = 20x P/E. The market is paying 20 times the company\'s annual earnings per share — you can compare this to sector peers and history.'},{q:'PEG ratio of 0.7 suggests:',opts:['Overvalued','Fairly valued','Potentially undervalued relative to growth','No useful information'],a:2,exp:'PEG below 1 (especially below 0.8) suggests the stock may be undervalued relative to its earnings growth rate — a potentially attractive entry for growth investors.'},{q:'Indian FMCG stocks (HUL, Nestle) command P/E of:',opts:['5–10x','12–18x','20–30x','40–70x'],a:3,exp:'Indian FMCG giants like Hindustan Unilever and Nestle India trade at 40–70x P/E due to consistent earnings quality, pricing power, and defensive business model.'}] },
      { id: 'balance-sheet', title: 'Reading a Balance Sheet', duration: '10 min', difficulty: 'ADVANCED',
        points: ['Balance Sheet equation: Total Assets = Total Liabilities + Shareholders\' Equity. Always balances.','Current Assets: cash, receivables, inventory (liquid within 1 year). Current Liabilities: payables due within 1 year.','Current Ratio = Current Assets / Current Liabilities. >2 healthy. <1 liquidity risk.','Debt-to-Equity = Total Debt / Equity. Capital-intensive industries (utilities, infrastructure) tolerate high D/E.','ROE (Return on Equity) = Net Income / Shareholders\' Equity. Measures efficiency. >15% is good.','India-specific red flag: High Promoter Pledging % — promoters borrowing against shares signals financial stress.'],
        formula: 'ROE = Net Income / Equity | D/E = Total Debt / Equity | CR = Current Assets / Current Liabilities',
        quiz: [{q:'Current Ratio < 1 signals:',opts:['Very profitable company','Potential liquidity risk','Too much cash','Strong financial health'],a:1,exp:'Current Ratio below 1 means current liabilities exceed current assets, indicating the company may struggle to meet obligations due within 12 months — a liquidity warning.'},{q:'High promoter pledging in Indian companies is:',opts:['A positive signal of confidence','Neutral','A red flag — risk of margin calls','Required by SEBI'],a:2,exp:'When promoters pledge shares to raise loans, falling prices trigger margin calls. Lenders sell pledged shares into the market, causing further declines — a vicious cycle and a serious red flag.'},{q:'ROE of 22% for a bank is considered:',opts:['Below average','Average','Good','Negative indicator'],a:2,exp:'ROE above 15% is generally considered good. For Indian banks, 18-22% ROE signals efficient use of equity capital and strong profitability.'}] },
      { id: 'dcf', title: 'DCF Valuation Basics', duration: '10 min', difficulty: 'ADVANCED',
        points: ['DCF: intrinsic value = sum of ALL future cash flows discounted to today\'s value.','Discount rate (WACC) reflects risk — higher risk → higher discount rate → lower valuation.','Terminal Value: value of all cash flows beyond the projection period. Often 60-80% of total DCF value.','DCF is highly sensitive to assumptions. 1% change in growth rate can shift value by 20-30%.','India risk-free rate: 10-year G-Sec yield (~7%). Add equity risk premium (~5-6%) for Indian market.','Buffett\'s simplified view: value = owner earnings discounted at a conservative rate. Simplicity beats complexity.'],
        formula: 'DCF = Σ [FCFt / (1+WACC)^t] + [TV / (1+WACC)^n] | TV = FCFn(1+g) / (WACC−g)',
        quiz: [{q:'The most impactful assumption in a DCF is typically:',opts:['Current revenue','Terminal growth rate','Current cash balance','Number of employees'],a:1,exp:'Terminal Value often represents 60-80% of total DCF value. The terminal growth rate assumption therefore has the most outsized impact on the final valuation output.'},{q:'India\'s DCF risk-free rate is based on:',opts:['RBI repo rate','10-year G-Sec yield','1-year FD rate','US Treasury yield'],a:1,exp:'The 10-year Government Securities (G-Sec) yield is used as India\'s risk-free rate in DCF models — it represents the return on a zero-default-risk government instrument.'},{q:'WACC stands for:',opts:['Weighted Average Cost of Capital','Working Asset Capital Cost','Weighted Allocation and Cash Cost','None of the above'],a:0,exp:'WACC (Weighted Average Cost of Capital) is the blended rate a company pays to finance its assets, weighted by the proportion of debt and equity used in its capital structure.'}] },
      { id: 'evebitda', title: 'EV/EBITDA & Advanced Multiples', duration: '8 min', difficulty: 'ADVANCED',
        points: ['EV (Enterprise Value) = Market Cap + Net Debt. Total acquisition cost of a business.','EBITDA = Earnings Before Interest, Taxes, Depreciation & Amortization. Operating cash flow proxy.','EV/EBITDA removes capital structure from comparison — better than P/E for leveraged companies.','Typical EV/EBITDA: Indian IT 18–25x, US tech 20–40x, Energy 4–8x, Banks use P/B not EV/EBITDA.','Price-to-Book (P/B) = Market Cap / Book Value. Best metric for banks and financial companies.','Price-to-Sales (P/S): best for loss-making growth companies like Zomato, Swiggy, Paytm.'],
        formula: 'EV = Mkt Cap + Total Debt − Cash | EV/EBITDA = EV / EBITDA | P/B = Price / Book Value per Share',
        quiz: [{q:'EV/EBITDA is better than P/E for cross-company comparison because:',opts:['It is always a lower number','It removes capital structure (debt level) differences','It uses forward earnings','It is easier to calculate'],a:1,exp:'EV/EBITDA is capital structure neutral — it compares companies regardless of how much debt vs equity they use, making it more objective when comparing companies with different leverage.'},{q:'P/B ratio is most useful for:',opts:['Technology companies','E-commerce startups','Banks and financial companies','Consumer goods companies'],a:2,exp:'Price-to-Book is the preferred metric for banks because their assets (loans) and equity are relatively transparent, and book value is a meaningful measure of the business worth.'},{q:'A loss-making startup is best valued using:',opts:['P/E ratio','EV/EBITDA','Price-to-Sales (P/S)','Dividend yield'],a:2,exp:'For companies with no profits yet, P/E is useless (negative EPS). Price-to-Sales (P/S or EV/Sales) compares loss-making growth companies based on revenue traction.'}] },
    ]
  },
  { id: 'india-markets', emoji: '🇮🇳', color: '#f97316', title: 'India Markets Deep Dive', description: 'SEBI, NSE vs BSE, F&O mechanics, circuit breakers, and everything unique to investing in India.',
    lessons: [
      { id: 'nse-bse', title: 'NSE vs BSE — Complete Comparison', duration: '6 min', difficulty: 'BEGINNER',
        points: ['BSE: Founded 1875. Asia\'s oldest exchange. 5,000+ listed companies. Benchmark: Sensex 30.','NSE: Founded 1992. India\'s first fully electronic exchange. ~2,000 companies. Benchmark: Nifty 50.','NSE dominates in trading VOLUME (especially F&O — >95% of India\'s derivative trades).','BSE has MORE listed companies, particularly small/micro caps. Better for discovering smaller companies.','Same stocks listed on both. Prices differ by fractions (arbitrageurs instantly correct any gap).','Nifty 50: top 50 large-caps by free-float market cap, 13 sectors, reviewed semi-annually.'],
        formula: 'Both NSE and BSE use Free-Float Market Cap Weighting for their indices',
        quiz: [{q:'BSE was founded in:',opts:['1875','1947','1992','2000'],a:0,exp:'BSE (Bombay Stock Exchange) was established in 1875, making it Asia\'s oldest stock exchange and among the world\'s oldest still operating today.'},{q:'Which exchange dominates India\'s F&O trading volume?',opts:['BSE','NSE','MCX','NCDEX'],a:1,exp:'NSE dominates India\'s Futures & Options market with over 95% of equity derivatives trading volume, making it one of the world\'s largest derivatives exchanges by contract count.'},{q:'How many companies does Nifty 50 track?',opts:['30','50','100','500'],a:1,exp:'Nifty 50 tracks 50 companies on NSE by free-float market capitalization, covering 13 sectors and representing approximately 65% of NSE\'s total market capitalization.'}] },
      { id: 'sebi', title: 'SEBI — Regulation & Investor Protection', duration: '7 min', difficulty: 'INTERMEDIATE',
        points: ['SEBI (Securities and Exchange Board of India): established 1988, statutory powers from 1992. India\'s SEC equivalent.','SEBI mandates: insider trading prohibition, quarterly results disclosure, DRHP filing for IPOs.','T+1 Settlement: India moved to T+1 (next-day settlement) in January 2023 — among world\'s fastest.','DDPI replaced old PoA system in 2022: more secure, gives investors direct control over demat holdings.','Minimum Public Shareholding (MPS): ≥25% must be held by public (non-promoters). SEBI requirement.','SEBI standardized mutual fund categories: Large Cap, Mid Cap, Small Cap, Flexi Cap, ELSS, etc.'],
        formula: 'Public Shareholding ≥ 25% | Promoter Holding ≤ 75% (SEBI MPS Requirement)',
        quiz: [{q:'India moved to T+1 settlement in:',opts:['2018','2020','2023','2025'],a:2,exp:'India implemented T+1 (Trade + 1 day) settlement from January 2023, making it one of the world\'s fastest settlement systems, ahead of the US (still on T+2 for most securities).'},{q:'SEBI\'s minimum public shareholding requirement is:',opts:['10%','15%','25%','50%'],a:2,exp:'SEBI mandates that all listed companies must have at least 25% of shares held by the public. Companies below this threshold must issue more shares via OFS or QIP.'},{q:'DDPI replaced which system?',opts:['DEMAT accounts','Power of Attorney (PoA)','PAN card requirement','Circuit breakers'],a:1,exp:'DDPI (Demat Debit and Pledge Instruction) replaced the broad Power of Attorney (PoA) system in 2022, giving investors more granular control over which transactions brokers can execute.'}] },
      { id: 'fo-india', title: 'F&O in India — Futures & Options', duration: '10 min', difficulty: 'ADVANCED',
        points: ['India\'s NSE is the world\'s largest derivatives exchange by NUMBER OF CONTRACTS traded.','Futures: obligation to buy/sell at agreed price on future date. Margin-based. Used for hedging or speculation.','Options: RIGHT (not obligation) to buy (Call) or sell (Put) at strike price before/at expiry.','India has WEEKLY expiry: Nifty options expire every Thursday, Bank Nifty on Wednesday.','Lot sizes: Nifty lot = 25 units. Bank Nifty = 15 units. Each F&O contract trades in standardized lots.','F&O Ban: stocks where open interest >95% of MWPL enter ban — no new positions, only squaring off.'],
        formula: 'Nifty Futures P&L = (Exit − Entry Price) × Lot Size (25) | Margin = SPAN + Exposure',
        quiz: [{q:'Nifty 50 options expire every:',opts:['Month end','Tuesday','Thursday','Friday'],a:2,exp:'Nifty 50 index options expire every Thursday (or the preceding trading day if Thursday is a holiday). Bank Nifty expires on Wednesdays.'},{q:'F&O Ban on a stock means:',opts:['Trading is suspended entirely','No NEW positions — only close existing','Stock gets delisted','Circuit breaker triggered'],a:1,exp:'When a stock enters F&O ban (OI > 95% of Market Wide Position Limit), traders can only close or reduce existing positions. No new long or short positions are permitted.'},{q:'One Nifty 50 futures lot equals:',opts:['10 units','15 units','25 units','50 units'],a:2,exp:'One Nifty 50 futures/options contract lot = 25 units. At Nifty 24,000, one lot has a notional value of ₹6,00,000 (24,000 × 25).'}] },
      { id: 'india-algo', title: 'Algo Trading & India-Specific Tools', duration: '8 min', difficulty: 'ADVANCED',
        points: ['SEBI enabled retail algo trading via broker APIs starting 2023, with proper risk management mandates.','Popular platforms: Zerodha Kite Connect, Angel One SmartAPI, Upstox API, Fyers API, Dhan API.','GTT (Good Till Triggered) orders: auto-execute when price hits your target. Available on most brokers.','SIP in stocks: buy fixed rupee amount at regular intervals — rupee cost averaging. Built into many platforms.','NSE co-location: HFT firms rent server space next to NSE\'s matching engine for microsecond advantage.','Basket orders: place simultaneous orders in multiple stocks at once — ideal for index replication strategies.'],
        formula: 'Rupee Cost Averaging: Avg Cost = Total Invested ÷ Total Units Accumulated',
        quiz: [{q:'SEBI enabled retail algo trading via brokers from:',opts:['2015','2019','2021','2023'],a:3,exp:'SEBI issued a comprehensive circular in 2023 enabling brokers to offer algorithmic trading to retail clients through regulated APIs, with mandatory risk controls.'},{q:'GTT orders are useful because:',opts:['Faster execution than market orders','They remain active until triggered (up to 1 year)','Zero brokerage','They bypass NSE rules'],a:1,exp:'GTT (Good Till Triggered) orders eliminate the need to monitor prices daily — they automatically execute when your target price is hit, staying active for up to 1 year.'},{q:'NSE co-location primarily benefits:',opts:['Retail investors','High Frequency Traders (HFT)','Long-term investors','Mutual funds'],a:1,exp:'Co-location allows trading firms to physically place their servers adjacent to NSE\'s matching engine, reducing network latency to microseconds — essential for HFT profitability.'}] },
    ]
  },
  { id: 'canada-markets', emoji: '🇨🇦', color: '#00f5ff', title: 'Canada Markets (TSX)', description: 'Bank of Canada policy, TSX sector breakdown, resource economy, and what makes Canadian markets unique.',
    lessons: [
      { id: 'tsx-overview', title: 'TSX — Structure & Sector Breakdown', duration: '6 min', difficulty: 'BEGINNER',
        points: ['TSX (Toronto Stock Exchange): Canada\'s primary exchange. S&P/TSX Composite tracks ~250 companies.','Energy (~20%) and Financials (~35%) dominate TSX — very different from NASDAQ\'s tech-heavy profile.','Big 5 Banks: RBC (RY), TD, BNS, BMO, CIBC. Combined market cap >$700B CAD. Known for 3-5% dividends.','Canada is a commodity powerhouse: oil sands (Suncor, CNQ), gold (Barrick, Agnico), potash (Nutrien).','Shopify (SHOP.TO): TSX\'s largest tech outlier. IPO in 2015 at $17 CAD, peaked ~$1,700 in 2021.','TSX Venture Exchange (TSXV): for junior mining/exploration companies. Much smaller and highly speculative.'],
        formula: 'TSX Composite: Free-Float Market Cap Weighted across ~250 main board companies',
        quiz: [{q:'The two largest TSX sectors are:',opts:['Tech & Healthcare','Energy & Financials','Materials & Industrials','Consumer & Utilities'],a:1,exp:'Energy (~20%) and Financials (~35%) dominate the S&P/TSX Composite, reflecting Canada\'s resource economy and world-class banking sector. Tech is notably underrepresented vs US indices.'},{q:'Shopify is listed on:',opts:['NYSE only','NASDAQ only','TSX only','Both NYSE and TSX'],a:3,exp:'Shopify is dual-listed on NYSE (SHOP) and TSX (SHOP.TO), allowing investors to trade in USD or CAD respectively. Market cap and fundamentals are identical across both listings.'},{q:'Canada\'s Big 5 banks are known for:',opts:['High-growth tech ventures','Consistent dividends and stability through cycles','Cryptocurrency exchange services','Premium P/E ratios above 30x'],a:1,exp:'Canada\'s Big Five banks are globally recognized for stability, conservative lending practices, and consistent dividends (3-5% yield), performing well even through economic downturns.'}] },
      { id: 'bank-of-canada', title: 'Bank of Canada — Policy & Market Impact', duration: '7 min', difficulty: 'INTERMEDIATE',
        points: ['Bank of Canada (BoC) sets the overnight lending rate — equivalent to US Federal Funds rate.','Rate hikes → CAD strengthens, bond prices fall, mortgages/housing cool (Canada is very rate-sensitive).','Rate cuts → CAD weakens, bond prices rise, housing market stimulated significantly.','BoC meets 8 times per year. Key announcement dates move TSX significantly, especially banks and REITs.','Canada\'s inflation target: 2% midpoint within 1-3% control range.','CAD/USD (the "Loonie") closely correlates with oil prices — Canada is a major oil exporter.'],
        formula: 'CAD Sensitivity: ΔCAD ≈ +0.6 to +0.8 correlation with ΔOil Prices',
        quiz: [{q:'The Bank of Canada sets rates how many times per year?',opts:['4 times','6 times','8 times','12 times'],a:2,exp:'The Bank of Canada has 8 fixed rate announcement dates per year and publishes quarterly Monetary Policy Reports with detailed economic projections.'},{q:'When oil prices rise, the Canadian dollar typically:',opts:['Falls sharply','Stays flat','Strengthens','Becomes highly volatile'],a:2,exp:'Canada is a top oil exporter. Rising oil prices improve Canada\'s trade balance and export revenues, which typically strengthens CAD vs USD.'},{q:'Canada\'s inflation target midpoint is:',opts:['1%','1.5%','2%','3%'],a:2,exp:'The Bank of Canada targets 2% inflation as the midpoint of a 1-3% control band, using the overnight rate as the primary policy tool.'}] },
      { id: 'canadian-resources', title: 'Mining, Energy & Resources on TSX', duration: '7 min', difficulty: 'INTERMEDIATE',
        points: ['Canada has the world\'s 3rd largest proven oil reserves (oil sands in Alberta). Suncor and CNQ are leaders.','Gold mining: Barrick Gold (ABX.TO) and Agnico Eagle are two of the world\'s largest gold producers.','Nutrien: world\'s largest potash producer. Canada controls ~30% of global potash supply.','Enbridge (ENB.TO): North America\'s largest energy infrastructure company. Transports ~30% of North American crude. 7%+ dividend.','Resource stocks are highly cyclical — follow commodity price cycles more than company-specific factors.','ESG considerations and Indigenous land rights add unique regulatory and operational risk to Canadian resources.'],
        formula: 'Resource Stock Return ≈ Commodity Price Change × Operating Leverage Factor',
        quiz: [{q:'Enbridge (ENB.TO) is primarily:',opts:['An oil producer','A pipeline infrastructure company','A gold miner','A bank'],a:1,exp:'Enbridge is North America\'s largest energy infrastructure company, operating pipelines that transport ~30% of North American crude oil and ~20% of US natural gas.'},{q:'Canada controls approximately what % of global potash supply?',opts:['10%','20%','30%','50%'],a:2,exp:'Canada (Saskatchewan specifically) holds about 30% of global potash reserves and is the world\'s largest producer through Nutrien, making it critical to global food security.'},{q:'TSX resource stocks are called cyclical because:',opts:['They have stable earnings','Their fortunes follow commodity price cycles','They pay dividends every cycle','They are government-owned'],a:1,exp:'Resource stocks are cyclical because their revenues track commodity prices (oil, gold, copper) which move in multi-year supply/demand cycles largely independent of individual company management.'}] },
      { id: 'tsx-vs-nse', title: 'TSX vs NASDAQ vs NSE — Global Comparison', duration: '6 min', difficulty: 'INTERMEDIATE',
        points: ['NASDAQ: 3,000+ companies, tech-heavy (~50% tech). Average P/E 25-35x. Dominated by FAANG + NVDA + MSFT.','NSE: 2,000+ companies, diverse with IT, banking, FMCG. Fast-growing economy. Currency risk (INR depreciation).','TSX: ~250 main companies, resources + financials. Lower P/E (~15x avg) but higher average dividend (~3-4%).','Currency: INR depreciated ~30% vs USD in 10 years. CAD ~10% — significantly more stable.','India tax: 10% LTCG (>1 year). 15% STCG. Canada: 50% capital gains inclusion rate.','Diversifying across all three gives excellent correlation reduction (low ρ between markets).'],
        formula: 'Portfolio Diversification: Lower ρ (correlation) between markets = higher diversification benefit',
        quiz: [{q:'India\'s LTCG tax on equity (>1 year holding) is:',opts:['5%','10%','15%','20%'],a:1,exp:'India charges 10% LTCG tax on equity gains above ₹1 lakh per year for holdings over 1 year. Short Term Capital Gains (STCG, <1 year) is taxed at 15%.'},{q:'TSX average dividend yield vs S&P 500:',opts:['About the same','TSX much higher (~3-4% vs ~1.5%)','TSX much lower','S&P 500 yields more'],a:1,exp:'TSX historically yields 3-4% on average vs ~1.5% for S&P 500, reflecting the dominance of dividend-paying banks, energy, and utility companies in Canada\'s index.'},{q:'Over 10 years, CAD has depreciated vs USD approximately:',opts:['40%','30%','10%','It has appreciated'],a:2,exp:'The Canadian dollar has depreciated roughly 10% against the USD over the past decade (from near parity to ~$0.73-0.75 range) — significantly more stable than INR\'s ~30% depreciation.'}] },
    ]
  },
  { id: 'algorithms', emoji: '⚙️', color: '#64748b', title: 'Trading Algorithms', description: 'Momentum, mean reversion, pairs trading, backtesting, and the math of systematic trading.',
    lessons: [
      { id: 'momentum', title: 'Momentum Trading Strategies', duration: '8 min', difficulty: 'ADVANCED',
        points: ['Momentum: assets that performed well recently tend to continue outperforming short-term (Jegadeesh & Titman, 1993).','Simple momentum: buy top N% performers over 3-12 months, short (or avoid) bottom N%. Rebalance monthly.','Rate of Change (ROC) = (Current Price / Price N periods ago − 1) × 100.','Nifty Alpha 50 index captures India\'s momentum factor — tracks top 50 high-alpha stocks vs Nifty 50.','Momentum crashes: occur during sharp reversals (COVID March 2020). Risk management is critical.','Relative Strength (RS): RS = stock return / index return. RS > 1 = outperforming the benchmark.'],
        formula: 'ROC = [(Pt / Pt-n) − 1] × 100 | RS = Stock Return / Index Return',
        quiz: [{q:'Momentum was academically proven by:',opts:['Warren Buffett','Jegadeesh & Titman (1993)','John Bollinger','J. Welles Wilder'],a:1,exp:'Jegadeesh and Titman (1993) published the landmark paper "Returns to Buying Winners and Selling Losers" providing academic proof of the momentum anomaly in equity markets.'},{q:'Momentum strategies suffer most during:',opts:['Slowly rising markets','Sharp trend reversals','Low volatility environments','High dividend seasons'],a:1,exp:'Momentum strategies suffer most during sharp reversals — when recent winners suddenly become losers (like March 2020 COVID crash or dot-com bust). Proper stop losses are essential.'},{q:'India\'s Nifty Alpha 50 captures:',opts:['Dividend yield factor','Momentum factor','Low volatility factor','Value factor'],a:1,exp:'Nifty Alpha 50 is India\'s factor index capturing momentum — it selects the top 50 high-alpha stocks (those outperforming Nifty 50 the most) and rebalances quarterly.'}] },
      { id: 'mean-reversion', title: 'Mean Reversion & Pairs Trading', duration: '8 min', difficulty: 'ADVANCED',
        points: ['Mean reversion: prices that deviate significantly from their historical average tend to revert back.','Z-score = (Current Price − Mean) / Std Dev. |Z| > 2 = statistically unusual, potential reversion trade.','Pairs trading: go LONG the underperformer and SHORT the outperformer of two historically correlated stocks.','Works best in ranging/sideways markets. Fails badly in trending markets.','Indian pairs: HDFCBANK vs ICICIBANK, INFY vs TCS, RELIANCE vs ONGC — highly correlated pairs.','Cointegration test confirms two stocks move together long-term despite short-term divergences.'],
        formula: 'Z-Score = (X − μ) / σ | Enter when |Z| > 2, exit when Z → 0',
        quiz: [{q:'Mean reversion works best when:',opts:['Markets are trending strongly','Markets are ranging sideways','Volatility is extremely high','Breaking news dominates'],a:1,exp:'Mean reversion strategies thrive in ranging, sideways markets where prices oscillate around a stable mean. In trending markets, the mean keeps shifting and reversion bets get destroyed.'},{q:'In pairs trading you:',opts:['Buy both stocks equally','Buy the stronger stock','Buy the weaker, short the stronger','Short both stocks'],a:2,exp:'In pairs trading: go long the underperforming stock and short the outperforming one, betting on spread convergence. You profit when the underperformer catches up to the outperformer.'},{q:'Z-score of −2.5 suggests:',opts:['Strong momentum buy signal','Price 2.5 std devs below mean — potential reversion buy','Overbought conditions','Random noise'],a:1,exp:'Z-score of −2.5 means the price is 2.5 standard deviations below its mean — statistically unusual (< 1.2% probability in normal distribution). A potential mean-reversion buy if the relationship is stable.'}] },
      { id: 'risk-algo', title: 'Risk Management in Systematic Trading', duration: '9 min', difficulty: 'ADVANCED',
        points: ['Position Sizing: Kelly Criterion optimal bet = (edge / odds). In practice, always use Half Kelly.','Max Drawdown: largest peak-to-trough decline of equity curve. Target: <20% for institutional-grade systems.','Sharpe Ratio = (Return − Risk-Free Rate) / Std Dev. >1 acceptable. >2 good. >3 exceptional.','Correlation: never run two strategies with >0.8 correlation — effectively same risk, no diversification.','ATR (Average True Range) based stops: adapt stops to current volatility. 2×ATR = common setting.','India-specific: model SEBI charges, STT (Securities Transaction Tax), stamp duty, and GST in all backtests.'],
        formula: 'Sharpe = (Rp − Rf) / σp | Half Kelly = [(bp − q) / b] × 0.5 | ATR Stop = Entry − 2×ATR(14)',
        quiz: [{q:'A Sharpe ratio of 2.0 is considered:',opts:['Below average','Average','Good — worth trading','Poor — avoid'],a:2,exp:'Sharpe > 1.0 is generally acceptable, >2.0 is good/very good for systematic strategies. Ratios >3.0 are exceptional and very rare at meaningful scale.'},{q:'Half Kelly is used instead of Full Kelly because:',opts:['Full Kelly is illegal','Full Kelly maximizes drawdown volatility; Half Kelly is more practical','Half Kelly earns more','Required by regulators'],a:1,exp:'Full Kelly maximizes long-run geometric growth but creates extreme drawdowns that most traders can\'t sustain psychologically. Half Kelly delivers ~75% of the returns with dramatically less volatility.'},{q:'ATR-based stops are superior to fixed percentage stops because:',opts:['They are more complex','They adapt to current market volatility automatically','They are always wider','Required by SEBI'],a:1,exp:'ATR (Average True Range) based stops automatically widen during high-volatility markets and narrow during low-volatility periods, preventing stop-outs from normal market noise.'}] },
      { id: 'backtest', title: 'Backtesting & Strategy Validation', duration: '8 min', difficulty: 'ADVANCED',
        points: ['Backtesting: applying a strategy to historical data to estimate performance. Necessary but insufficient alone.','Overfitting: strategy is over-optimized to past data — works historically but fails live. #1 backtest trap.','Walk-forward analysis: optimize on in-sample data, validate on out-of-sample. More realistic than pure backtest.','Survivorship bias: testing only stocks that exist today ignores companies that went bankrupt — inflates results.','Transaction costs in India: brokerage + STT + exchange fees + GST + stamp duty + slippage. All must be modeled.','Paper trading: run strategy live without real capital for 3-6 months before actual deployment.'],
        formula: 'Realistic Net Return = Gross Return − Brokerage − STT − Exchange Fees − GST − Slippage − Tax',
        quiz: [{q:'Overfitting in backtesting means:',opts:['Strategy has too many rules fitted to past noise','Strategy is too simple','Not enough data','Strategy is too profitable'],a:0,exp:'Overfitting occurs when a strategy has too many parameters optimized to fit historical patterns that were actually random noise. Such strategies almost always fail in live trading.'},{q:'Survivorship bias makes backtests look:',opts:['More realistic','Better than they would be in reality','Worse than reality','Neutral'],a:1,exp:'Survivorship bias inflates backtest results because you only test on stocks that survived and are still trading today, ignoring the many that went bankrupt or delisted during your test period.'},{q:'Transaction costs in Indian markets include:',opts:['Brokerage only','Brokerage + STT + GST + exchange fees + slippage','Only STT and GST','Only stamp duty'],a:1,exp:'Every trade in India incurs: broker commission, STT (Securities Transaction Tax ~0.1%), GST on brokerage, SEBI turnover fee, exchange transaction charges, stamp duty, and market impact/slippage.'}] },
    ]
  },
  { id: 'options', emoji: '🎯', color: '#ec4899', title: 'Options & Derivatives', description: 'Calls, puts, the Greeks, popular strategies, and the mechanics of options pricing and IV.',
    lessons: [
      { id: 'calls-puts', title: 'Calls & Puts — The Basics', duration: '8 min', difficulty: 'INTERMEDIATE',
        points: ['Call Option: right to BUY at strike price before expiry. Profit when underlying price rises.','Put Option: right to SELL at strike price before expiry. Profit when underlying price falls.','Premium: price paid for the option contract. Maximum loss for buyer = premium paid.','ITM (In-The-Money): Call when Spot > Strike. Put when Spot < Strike. Has intrinsic value.','OTM (Out-of-The-Money): Call when Spot < Strike. Put when Spot > Strike. Only time value.','Indian NSE options are European-style: can only be exercised at expiry, not before. But can be SOLD anytime.'],
        formula: 'Call Payoff = max(0, Spot − Strike) − Premium | Put Payoff = max(0, Strike − Spot) − Premium',
        quiz: [{q:'Nifty 24,000 Call is ITM when Nifty is at:',opts:['23,500','24,000','24,200','23,800'],a:2,exp:'A 24,000 Call is In-The-Money when Nifty spot is above 24,000 — at 24,200 it has ₹200 of intrinsic value (24,200 − 24,000).'},{q:'Maximum loss for an option BUYER is:',opts:['Unlimited','The option premium paid','The stock price','The strike price'],a:1,exp:'Option buyers have defined maximum risk: the premium paid. This limited-risk characteristic is a key advantage over futures trading where losses can be unlimited.'},{q:'NSE index options are:',opts:['American style (exercise anytime)','European style (exercise at expiry only)','Bermudan style','Asian style'],a:1,exp:'NSE Nifty and Bank Nifty index options are European-style — they can only be exercised on the expiry date. However, you can buy or sell the option contract in the market at any time before expiry.'}] },
      { id: 'greeks', title: 'The Greeks — δ, γ, θ, ν Explained', duration: '10 min', difficulty: 'ADVANCED',
        points: ['Delta (δ): price change of option per ₹1 move in underlying. ATM ≈ 0.5. Range: 0–1 for calls, 0 to −1 for puts.','Gamma (γ): rate of change of delta. High for ATM options near expiry. Long gamma = benefits from big moves.','Theta (θ): time decay per calendar day. Options lose value daily (bad for buyers, good for sellers).','Vega (ν): sensitivity to 1% change in Implied Volatility. Long vega = profits when IV rises.','Long options (buying): +Gamma, −Theta (time enemy). Short options (selling): −Gamma, +Theta (time friend).','Nifty weekly options have extreme theta decay near Thursday expiry — sellers love it, buyers must be precise.'],
        formula: 'δ = ∂C/∂S | γ = ∂δ/∂S | θ = ∂C/∂t | ν = ∂C/∂σ',
        quiz: [{q:'An option with Delta 0.7 means:',opts:['Option gains ₹0.70 per ₹1 rise in stock','Option is 70% profitable','70% chance of expiring ITM','Option has 70% intrinsic value'],a:0,exp:'Delta of 0.7 means the option price moves approximately ₹0.70 for every ₹1 change in the underlying stock price. Deep ITM options approach delta = 1.0.'},{q:'Theta decay accelerates most during:',opts:['6 months before expiry','1 month before expiry','Last 7–14 days before expiry','Immediately at purchase'],a:2,exp:'Theta decay is exponential — it accelerates dramatically in the last 1-2 weeks before expiry. Nifty weekly option buyers who hold to Thursday expiry lose most of their premium in the last 2 days if the expected move doesn\'t materialize.'},{q:'Being "long vega" means you profit when:',opts:['Underlying price rises','Implied volatility rises','Time passes quickly','Delta increases'],a:1,exp:'Long vega (net option buyer) positions profit when implied volatility rises, making options more expensive. Buying options before high-uncertainty events (earnings, RBI policy) captures potential IV expansion.'}] },
      { id: 'strategies', title: 'Options Strategies — Straddle, Iron Condor, Covered Call', duration: '10 min', difficulty: 'ADVANCED',
        points: ['Covered Call: own shares + sell OTM call. Generates premium income. Caps upside. Best in flat market.','Protective Put: own shares + buy ATM put. Portfolio insurance. Limits downside. Costs premium.','Straddle: buy ATM call + ATM put. Profits from large move in EITHER direction. Expensive.','Strangle: buy OTM call + OTM put. Cheaper than straddle. Needs bigger move to profit.','Iron Condor: sell OTM call + sell OTM put (collect premium) + buy further OTM wings for protection.','India\'s most popular: sell Nifty strangles/iron condors on weekly expiry. Collect theta. High margin required.'],
        formula: 'Iron Condor Max Profit = Net Premium Received | Max Loss = Spread Width − Net Premium',
        quiz: [{q:'A straddle profits when:',opts:['Price stays flat','Price makes large move in either direction','Only when price rises','Only when IV drops'],a:1,exp:'A long straddle (buy ATM call + ATM put) profits when the underlying makes a large move in either direction, exceeding the total combined premium paid for both options.'},{q:'Iron Condor is best suited for:',opts:['Directional bullish markets','High volatility breakout','Range-bound low-volatility markets','Bearish trending markets'],a:2,exp:'Iron Condor profits when the underlying stays within a defined range (between the short strikes). It\'s ideal in stable, low-volatility environments where you collect premium decay.'},{q:'Covered call is best when you expect:',opts:['Strong upside move','Sharp downside','Flat to mildly bullish movement','Extreme volatility'],a:2,exp:'Covered calls work best in flat to slightly bullish markets. You own stock and sell calls to collect premium income. If price surges past your strike, your upside is capped but you still profit.'}] },
      { id: 'iv-crush', title: 'Implied Volatility & IV Crush', duration: '8 min', difficulty: 'ADVANCED',
        points: ['Implied Volatility (IV): market\'s expectation of future volatility, extracted from option prices.','High IV = expensive options. Low IV = cheap options. Buy options at low IV, sell at high IV (ideally).','India VIX: implied volatility of Nifty 50 options. High India VIX = market fear/uncertainty.','IV Crush: after a major event (earnings, RBI policy), IV collapses — options lose value even if price moves as expected.','IV Crush example: NVDA earnings — stock rises 8% but call buyers lose money because IV fell from 80% to 40%.','Strategy: sell options INTO high IV events (collect rich premium), buy options in low-IV quiet periods.'],
        formula: 'Options Value ∝ IV | IV Crush Loss = (IV₁ − IV₂) × Vega per contract',
        quiz: [{q:'India VIX measures:',opts:['Nifty 50 daily moves','Implied volatility of Nifty 50 options','BSE Sensex historical volatility','RBI rate expectations'],a:1,exp:'India VIX measures the market\'s near-term volatility expectation, derived from Nifty 50 option prices across various strikes and maturities. High VIX = fear, uncertainty in Indian markets.'},{q:'IV Crush typically happens:',opts:['During strong market trends','Immediately after major anticipated events','During low-volume sessions','Only in bear markets'],a:1,exp:'IV Crush happens right after anticipated events (earnings, policy decisions, elections) resolve. The uncertainty premium in options disappears instantly, causing IV and option premiums to collapse.'},{q:'Buying options before earnings is risky because:',opts:['Options can\'t be traded near earnings','You need correct direction AND move must exceed implied move','SEBI bans it','Liquidity dries up'],a:1,exp:'Even with correct directional prediction, option buyers can lose if the actual move is smaller than what IV "priced in." The IV Crush on the post-event options can overwhelm any intrinsic value gained.'}] },
    ]
  },
];

type LearnView = 'OVERVIEW' | 'MODULE' | 'LESSON' | 'QUIZ';
interface LessonProgress { completed: boolean; score: number; attempts: number; flagged: boolean; lastSeen: string; }

const LEVEL_THRESHOLDS = [
  { name: 'NOVICE', min: 0, color: '#64748b' },
  { name: 'APPRENTICE', min: 100, color: '#34d399' },
  { name: 'ANALYST', min: 250, color: '#f59e0b' },
  { name: 'TRADER', min: 500, color: '#a78bfa' },
  { name: 'ELITE', min: 1000, color: '#00f5ff' },
];

function LearnTab() {
  const [view, setView] = useState<LearnView>('OVERVIEW');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('fincept_learn_progress') || '{}'); } catch { return {}; }
  });
  const [xp, setXp] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('fincept_learn_xp') || '0');
  });
  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const s = JSON.parse(localStorage.getItem('fincept_learn_streak') || '{"count":0,"last":""}');
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      return (s.last === today || s.last === yesterday) ? s.count : 0;
    } catch { return 0; }
  });
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const saveProgress = (p: Record<string, LessonProgress>, newXp: number) => {
    setProgress(p); setXp(newXp);
    localStorage.setItem('fincept_learn_progress', JSON.stringify(p));
    localStorage.setItem('fincept_learn_xp', String(newXp));
    const today = new Date().toDateString();
    const prev = JSON.parse(localStorage.getItem('fincept_learn_streak') || '{"count":0,"last":""}');
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const ns = prev.last === today ? prev.count : prev.last === yesterday ? prev.count + 1 : 1;
    setStreak(ns);
    localStorage.setItem('fincept_learn_streak', JSON.stringify({ count: ns, last: today }));
  };

  const getLesson = (lessonId: string) => {
    for (const m of LEARN_MODULES) {
      const l = m.lessons.find((l: any) => l.id === lessonId);
      if (l) return { lesson: l, module: m };
    }
    return null;
  };

  const totalLessons = LEARN_MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const currentLevel = LEVEL_THRESHOLDS.slice().reverse().find(l => xp >= l.min) || LEVEL_THRESHOLDS[0];
  const nextLevel = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.findIndex(l => l.name === currentLevel.name) + 1];

  const openLesson = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId); setActiveLessonId(lessonId); setView('LESSON');
    setQuizAnswers([]); setCurrentQ(0); setQuizDone(false); setSelectedAnswer(null); setShowExplanation(false);
  };

  const markComplete = (lessonId: string) => {
    const already = progress[lessonId]?.completed;
    const xpGain = already ? 0 : 10;
    const next = { ...progress, [lessonId]: { ...(progress[lessonId] || { score: 0, attempts: 0, flagged: false }), completed: true, lastSeen: new Date().toDateString() } };
    saveProgress(next, xp + xpGain);
  };

  const toggleFlag = (lessonId: string) => {
    const cur = progress[lessonId] || { completed: false, score: 0, attempts: 0, flagged: false, lastSeen: '' };
    saveProgress({ ...progress, [lessonId]: { ...cur, flagged: !cur.flagged } }, xp);
  };

  const startQuiz = () => {
    setCurrentQ(0); setQuizAnswers([]); setQuizDone(false); setSelectedAnswer(null); setShowExplanation(false); setView('QUIZ');
  };

  const submitAnswer = (ansIdx: number) => {
    const found = getLesson(activeLessonId!);
    if (!found) return;
    const quiz = found.lesson.quiz;
    setSelectedAnswer(ansIdx);
    setShowExplanation(true);
    const newAnswers = [...quizAnswers, ansIdx];
    setQuizAnswers(newAnswers);
    setTimeout(() => {
      if (currentQ + 1 >= quiz.length) {
        const correct = newAnswers.filter((a, i) => a === quiz[i].a).length;
        const score = Math.round((correct / quiz.length) * 100);
        const xpGain = Math.round(score / 100 * 25);
        const cur = progress[activeLessonId!] || { completed: false, score: 0, attempts: 0, flagged: false, lastSeen: '' };
        saveProgress({ ...progress, [activeLessonId!]: { ...cur, score: Math.max(cur.score, score), attempts: (cur.attempts || 0) + 1, lastSeen: new Date().toDateString() } }, xp + xpGain);
        setQuizDone(true);
      } else {
        setCurrentQ(q => q + 1); setSelectedAnswer(null); setShowExplanation(false);
      }
    }, 1800);
  };

  const DIFF_COLOR: Record<string, string> = { BEGINNER: '#34d399', INTERMEDIATE: '#f59e0b', ADVANCED: '#fb7185' };

  if (view === 'OVERVIEW') {
    const suggestedLesson = (() => {
      for (const m of LEARN_MODULES) {
        for (const l of m.lessons) {
          if (!progress[l.id]?.completed) return { moduleId: m.id, lessonId: l.id, title: l.title, module: m.title };
        }
      }
      return null;
    })();
    const flagged = Object.entries(progress).filter(([, p]) => p.flagged).map(([id]) => id);
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] text-[#64748b] font-mono uppercase tracking-widest">LEVEL</p>
            <p className="text-lg font-bold mt-1" style={{ color: currentLevel.color }}>{currentLevel.name}</p>
            {nextLevel && <><p className="text-[9px] text-[#64748b] font-mono">{xp}/{nextLevel.min} XP</p><div className="mt-1.5 h-1 bg-[#1e293b] rounded-full"><div className="h-1 rounded-full" style={{ width: `${Math.min(((xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100, 100)}%`, backgroundColor: currentLevel.color }} /></div></>}
          </div>
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] text-[#64748b] font-mono uppercase tracking-widest">TOTAL XP</p>
            <p className="text-lg font-bold text-amber-400 mt-1">{xp.toLocaleString()}</p>
            <p className="text-[9px] text-[#64748b]">+10 lesson · +25 perfect quiz</p>
          </div>
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] text-[#64748b] font-mono uppercase tracking-widest">PROGRESS</p>
            <p className="text-lg font-bold text-white mt-1">{completedCount}<span className="text-[#64748b] text-sm">/{totalLessons}</span></p>
            <div className="mt-1.5 h-1 bg-[#1e293b] rounded-full"><div className="h-1 bg-emerald-500 rounded-full" style={{ width: `${(completedCount / totalLessons) * 100}%` }} /></div>
          </div>
          <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
            <p className="text-[9px] text-[#64748b] font-mono uppercase tracking-widest">STREAK</p>
            <p className="text-lg font-bold text-orange-400 mt-1">🔥 {streak} day{streak !== 1 ? 's' : ''}</p>
            <p className="text-[9px] text-[#64748b]">Study daily to maintain</p>
          </div>
        </div>
        {(suggestedLesson || flagged.length > 0) && (
          <div className="bg-[#11131a] border border-amber-500/20 rounded-sm p-4">
            <p className="text-[9px] font-bold tracking-widest text-amber-500 uppercase mb-3 flex items-center gap-2"><Target size={10} /> STUDY PLAN</p>
            <div className="flex gap-3 flex-wrap">
              {suggestedLesson && (
                <button onClick={() => openLesson(suggestedLesson.moduleId, suggestedLesson.lessonId)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-sm hover:border-amber-500 cursor-pointer transition-all">
                  <Play size={10} className="text-amber-400" />
                  <span className="text-[10px] font-bold text-white">Continue: {suggestedLesson.title}</span>
                  <span className="text-[9px] text-[#64748b]">{suggestedLesson.module}</span>
                </button>
              )}
              {flagged.slice(0, 3).map(id => {
                const f = getLesson(id);
                if (!f) return null;
                return (
                  <button key={id} onClick={() => openLesson(f.module.id, id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-sm hover:border-red-500 cursor-pointer transition-all">
                    <Flame size={10} className="text-red-400" />
                    <span className="text-[10px] font-bold text-white">Review: {f.lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 gap-3">
          {LEARN_MODULES.map(m => {
            const done = m.lessons.filter((l: any) => progress[l.id]?.completed).length;
            const pct = Math.round((done / m.lessons.length) * 100);
            return (
              <div key={m.id} onClick={() => { setActiveModuleId(m.id); setView('MODULE'); }}
                className="bg-[#11131a] border rounded-sm p-4 cursor-pointer hover:opacity-90 transition-all"
                style={{ borderColor: pct === 100 ? `${m.color}60` : '#1e293b' }}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-[9px] font-bold font-mono" style={{ color: m.color }}>{pct}%</span>
                </div>
                <h3 className="text-[11px] font-bold text-white mb-1">{m.title}</h3>
                <p className="text-[9px] text-[#64748b] leading-relaxed mb-3 line-clamp-2">{m.description}</p>
                <div className="h-1 bg-[#1e293b] rounded-full mb-2"><div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: m.color }} /></div>
                <p className="text-[9px] text-[#64748b] font-mono">{done}/{m.lessons.length} lessons</p>
              </div>
            );
          })}
        </div>

        {/* Global Curations, YouTube channels & media resource base */}
        <div className="border-t border-[#1e293b] pt-6 mt-6">
          <h2 className="text-xs font-bold text-white tracking-wider uppercase mb-4 flex items-center gap-2">
            📚 Global Media & Curation Library
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Recommended Youtube Channels */}
            <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
              <p className="text-[9px] font-bold tracking-widest text-[#f59e0b] uppercase mb-3">📺 TOP YOUTUBE CHANNELS</p>
              <div className="space-y-3">
                {[
                  { name: 'Damodaran on Valuation', desc: 'NYU Stern Professor Aswath Damodaran teaches corporate finance and valuation.', link: 'https://www.youtube.com/@AswathDamodaranonValuation' },
                  { name: 'Plain Bagel', desc: 'Clear, concise breakdowns of financial concepts, news, and market behavior.', link: 'https://www.youtube.com/@ThePlainBagel' },
                  { name: 'Patrick Boyle On Finance', desc: 'Quantitative manager discusses financial history and macroeconomic trends.', link: 'https://www.youtube.com/@PatrickBoyleOnFinance' },
                  { name: 'Trading212', desc: 'Excellent visual playlist explaining chart patterns, indicator setups, and order book dynamics.', link: 'https://www.youtube.com/@Trading212' }
                ].map((c, i) => (
                  <a key={i} href={c.link} target="_blank" rel="noreferrer" className="block p-2 rounded-sm bg-[#0d0e12] border border-[#1e293b] hover:border-amber-500/50 transition-colors">
                    <p className="text-[10px] font-bold text-white font-mono">{c.name}</p>
                    <p className="text-[9px] text-[#64748b] mt-0.5 leading-relaxed">{c.desc}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Courses & Lectures */}
            <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
              <p className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase mb-3">🎓 FREE PROFESSIONAL COURSES</p>
              <div className="space-y-3">
                {[
                  { title: 'MIT 15.401 Finance Theory', desc: 'MIT OpenCourseWare course covering capital budgeting, portfolio theory, and pricing.', link: 'https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/' },
                  { title: 'Coursera: Financial Markets', desc: 'Yale Professor Robert Shiller explores market structure, behavioral economics, and risk.', link: 'https://www.coursera.org/learn/financial-markets-global' },
                  { title: 'Quantopian Lecture Series', desc: 'Archived lecture notebooks covering quantitative finance, signal decay, and alpha factors.', link: 'https://github.com/quantopian/research_public/tree/master/lectures' }
                ].map((c, i) => (
                  <a key={i} href={c.link} target="_blank" rel="noreferrer" className="block p-2 rounded-sm bg-[#0d0e12] border border-[#1e293b] hover:border-emerald-500/30 transition-colors">
                    <p className="text-[10px] font-bold text-white font-mono">{c.title}</p>
                    <p className="text-[9px] text-[#64748b] mt-0.5 leading-relaxed">{c.desc}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Audio & Video Library */}
            <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-4">
              <p className="text-[9px] font-bold tracking-widest text-pink-400 uppercase mb-3">🎧 AUDIO & VIDEO LIBRARY</p>
              <div className="space-y-3">
                {[
                  { title: 'Chat With Traders Podcast', desc: 'Interviews with market makers, algorithmic developers, and legendary retail traders.', link: 'https://chatwithtraders.com/' },
                  { title: 'Odd Lots Podcast (Bloomberg)', desc: 'Weekly deep dives into supply chains, rate actions, exotic assets, and policy.', link: 'https://www.bloomberg.com/oddlots' },
                  { title: 'SEBI Investor Awareness Videos', desc: 'Official video portal explaining retail safety, F&O risks, and grievance systems.', link: 'https://investor.sebi.gov.in/videos.html' }
                ].map((c, i) => (
                  <a key={i} href={c.link} target="_blank" rel="noreferrer" className="block p-2 rounded-sm bg-[#0d0e12] border border-[#1e293b] hover:border-pink-500/30 transition-colors">
                    <p className="text-[10px] font-bold text-white font-mono">{c.title}</p>
                    <p className="text-[9px] text-[#64748b] mt-0.5 leading-relaxed">{c.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'MODULE' && activeModuleId) {
    const mod = LEARN_MODULES.find(m => m.id === activeModuleId);
    if (!mod) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('OVERVIEW')} className="text-[9px] text-[#64748b] hover:text-white cursor-pointer border border-[#334155] px-2 py-1 rounded-sm">← BACK</button>
          <span className="text-2xl">{mod.emoji}</span>
          <div><h2 className="text-sm font-bold text-white">{mod.title}</h2><p className="text-[10px] text-[#64748b]">{mod.description}</p></div>
        </div>
        <div className="space-y-2">
          {mod.lessons.map((l: any, idx: number) => {
            const lp = progress[l.id];
            return (
              <div key={l.id} onClick={() => openLesson(mod.id, l.id)}
                className={`flex items-center gap-4 p-4 bg-[#11131a] border rounded-sm cursor-pointer transition-all ${lp?.completed ? 'border-emerald-900/60' : 'border-[#1e293b] hover:border-[#334155]'}`}>
                <span className="text-[#64748b] font-mono text-[10px] w-4">{idx + 1}</span>
                {lp?.completed ? <CheckCircle size={16} className="text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-[#334155] shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{l.title}</p>
                    {lp?.flagged && <Flame size={10} className="text-red-400" />}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded-sm font-bold" style={{ background: `${DIFF_COLOR[l.difficulty]}18`, color: DIFF_COLOR[l.difficulty] }}>{l.difficulty}</span>
                    <span className="text-[9px] text-[#64748b] font-mono">🕒 {l.duration}</span>
                    {(lp?.score || 0) > 0 && <span className="text-[9px] text-amber-400 font-mono">⭐ Quiz: {lp.score}%</span>}
                  </div>
                </div>
                <span className="text-[9px] text-[#64748b] font-mono">{l.quiz.length} questions →</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'LESSON' && activeLessonId) {
    const found = getLesson(activeLessonId);
    if (!found) return null;
    const { lesson: l, module: mod } = found;
    const lp = progress[activeLessonId];
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setView('MODULE')} className="text-[9px] text-[#64748b] hover:text-white cursor-pointer border border-[#334155] px-2 py-1 rounded-sm">← {mod.title}</button>
          <span className="text-[8px] px-2 py-0.5 rounded-sm font-bold" style={{ background: `${DIFF_COLOR[l.difficulty]}18`, color: DIFF_COLOR[l.difficulty] }}>{l.difficulty}</span>
          <span className="text-[9px] text-[#64748b] font-mono">🕒 {l.duration}</span>
          {lp?.completed && <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1"><CheckCircle size={10} /> COMPLETED</span>}
          {lp?.flagged && <span className="text-[9px] text-red-400 font-mono flex items-center gap-1"><Flame size={10} /> FLAGGED FOR REVIEW</span>}
        </div>
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-6">
          <h1 className="text-lg font-bold text-white mb-4">{mod.emoji} {l.title}</h1>
          <div className="space-y-3 mb-5">
            {l.points.map((pt: string, i: number) => (
              <div key={i} className="flex gap-3">
                <span className="text-amber-500 font-bold text-[10px] mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-[11px] text-[#cbd5e1] leading-relaxed">{pt}</p>
              </div>
            ))}
          </div>
          {l.formula && (
            <div className="bg-[#0d0e12] border border-[#1e293b] rounded-sm p-3">
              <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-1">KEY FORMULA</p>
              <p className="text-[10px] text-[#00f5ff] font-mono">{l.formula}</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={startQuiz} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-[#0d0e12] text-[10px] font-bold rounded-sm hover:bg-amber-400 cursor-pointer transition-all">
            <Target size={11} /> TAKE QUIZ ({l.quiz.length} questions)
          </button>
          {!lp?.completed && (
            <button onClick={() => markComplete(activeLessonId)} className="flex items-center gap-2 px-6 py-2.5 border border-emerald-600 text-emerald-400 text-[10px] font-bold rounded-sm hover:bg-emerald-600 hover:text-white cursor-pointer transition-all">
              <CheckCircle size={11} /> MARK COMPLETE (+10 XP)
            </button>
          )}
          <button onClick={() => toggleFlag(activeLessonId)}
            className={`flex items-center gap-2 px-4 py-2.5 border text-[10px] font-bold rounded-sm cursor-pointer transition-all ${lp?.flagged ? 'border-red-500 text-red-400' : 'border-[#334155] text-[#64748b] hover:border-red-500'}`}>
            <Flame size={11} /> {lp?.flagged ? 'REMOVE FLAG' : 'FLAG AS HARD'}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'QUIZ' && activeLessonId) {
    const found = getLesson(activeLessonId);
    if (!found) return null;
    const { lesson: l } = found;
    const quiz = l.quiz;
    const lp = progress[activeLessonId];

    if (quizDone) {
      const correct = quizAnswers.filter((a, i) => a === (quiz[i] as any).a).length;
      const score = Math.round((correct / quiz.length) * 100);
      return (
        <div className="space-y-4 max-w-xl mx-auto">
          <div className={`bg-[#11131a] border rounded-sm p-8 text-center ${score >= 70 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            <p className="text-4xl mb-3">{score === 100 ? '🌟' : score >= 70 ? '🎯' : '📚'}</p>
            <h2 className="text-xl font-bold text-white mb-1">{score === 100 ? 'Perfect!' : score >= 70 ? 'Well Done!' : 'Keep Studying'}</h2>
            <p className="text-3xl font-bold font-mono mt-2" style={{ color: score >= 70 ? '#34d399' : '#fb7185' }}>{score}%</p>
            <p className="text-[#64748b] text-sm mt-1">{correct}/{quiz.length} correct · +{Math.round(score / 100 * 25)} XP</p>
            {(lp?.score || 0) > 0 && <p className="text-[9px] text-[#64748b] mt-1">Best: {Math.max(lp!.score, score)}%</p>}
          </div>
          <div className="space-y-2">
            {(quiz as any[]).map((q: any, i: number) => (
              <div key={i} className={`bg-[#11131a] border rounded-sm p-3 ${quizAnswers[i] === q.a ? 'border-emerald-900/60' : 'border-red-900/60'}`}>
                <p className="text-[10px] font-bold text-white mb-1">{i + 1}. {q.q}</p>
                <div className="flex items-center gap-2">
                  {quizAnswers[i] === q.a ? <CheckCircle size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
                  <p className="text-[9px] text-[#94a3b8]">{q.opts[q.a]}</p>
                </div>
                <p className="text-[9px] text-[#64748b] mt-1 italic">{q.exp}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setView('LESSON')} className="px-6 py-2 border border-[#334155] text-[#94a3b8] text-[10px] font-bold rounded-sm hover:border-amber-500 cursor-pointer">← BACK TO LESSON</button>
            <button onClick={startQuiz} className="px-6 py-2 bg-amber-500 text-[#0d0e12] text-[10px] font-bold rounded-sm hover:bg-amber-400 cursor-pointer">RETRY QUIZ</button>
          </div>
        </div>
      );
    }

    const q = (quiz as any[])[currentQ];
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('LESSON')} className="text-[9px] text-[#64748b] hover:text-white cursor-pointer border border-[#334155] px-2 py-1 rounded-sm">← BACK</button>
          <p className="text-[9px] font-mono text-[#64748b]">Question {currentQ + 1} of {quiz.length}</p>
          <div className="flex gap-1">{(quiz as any[]).map((_: any, i: number) => <div key={i} className={`w-6 h-1 rounded-full ${i < currentQ ? 'bg-emerald-500' : i === currentQ ? 'bg-amber-500' : 'bg-[#1e293b]'}`} />)}</div>
        </div>
        <div className="bg-[#11131a] border border-[#1e293b] rounded-sm p-6">
          <p className="text-sm font-bold text-white mb-5">{q.q}</p>
          <div className="space-y-2">
            {(q.opts as string[]).map((opt: string, i: number) => {
              let cls = 'border-[#334155] text-[#94a3b8] hover:border-amber-500';
              if (showExplanation) {
                if (i === q.a) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
                else if (i === selectedAnswer) cls = 'border-red-500 bg-red-500/10 text-red-300';
                else cls = 'border-[#1e293b] text-[#475569]';
              } else if (selectedAnswer === i) cls = 'border-amber-500 text-white';
              return (
                <button key={i} disabled={showExplanation || selectedAnswer !== null} onClick={() => submitAnswer(i)}
                  className={`w-full text-left px-4 py-3 border rounded-sm text-[10px] font-mono cursor-pointer transition-all ${cls} disabled:cursor-default`}>
                  <span className="text-[#64748b] mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              );
            })}
          </div>
          {showExplanation && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm">
              <p className="text-[9px] text-amber-300 font-mono">{q.exp}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinceptPage() {
  const [data, setData] = useState<FullData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/fincept?action=full');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Bridge error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // live 30s refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  // Ticker search state
  const [tickerQuery, setTickerQuery] = useState('');
  const [tickerOpen, setTickerOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setTickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Track last refresh
  useEffect(() => { if (!loading) setLastRefresh(new Date()); }, [loading]);

  const tickerResults = tickerQuery.length >= 1
    ? Object.entries(WATCHLIST_UNIVERSE)
        .filter(([sym, info]) =>
          sym.toLowerCase().includes(tickerQuery.toLowerCase()) ||
          info.name.toLowerCase().includes(tickerQuery.toLowerCase())
        ).slice(0, 8)
    : [];


  return (
    <div className="min-h-screen bg-[#0a0b0f] text-[#e2e8f0] font-sans antialiased" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      {/* Top Status Bar */}
      <div className="bg-[#080910] border-b border-[#1e293b] px-4 py-1 flex items-center gap-4 text-[9px] font-mono">
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" /> LIVE
        </span>
        <span className="text-[#64748b]">{time.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} {time.toLocaleTimeString('en-US', { hour12: false })}</span>
        <span className="text-[#64748b]">|</span>
        <span className="text-amber-400 font-bold">FINCEPT TERMINAL</span>
        <span className="text-[#64748b]">|</span>
        <span className="text-[#64748b]">PROFESSIONAL RESEARCH DESK</span>
        <span className="ml-auto flex items-center gap-3">
          {lastRefresh && <span className="text-[#475569] text-[8px]">Updated {lastRefresh.toLocaleTimeString('en-US', { hour12: false })}</span>}
          <span className="text-[#64748b]">ENTERPRISE</span>
          <span className="text-amber-500 font-bold">v4.2.0</span>
          <span className="text-emerald-400 flex items-center gap-1">
            FEEDS: LIVE
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${loading ? 'animate-ping' : 'animate-pulse'}`} />
          </span>
        </span>
      </div>

      {/* Navigation */}
      <div className="bg-[#0d0e12] border-b border-[#1e293b] px-4 flex items-center gap-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-28 text-center py-3 text-[10px] font-bold tracking-wider transition-all cursor-pointer border-b-2 ${
              activeTab === tab
                ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                : 'border-transparent text-[#64748b] hover:text-white hover:bg-[#1e293b]'
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pr-2">
          {/* Ticker Search */}
          <div ref={searchRef} className="relative">
            <div className="w-48 flex items-center justify-between gap-1.5 px-3 py-1.5 border border-[#334155] rounded-sm bg-[#11131a] hover:border-amber-500/50 transition-all">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Search size={10} className="text-[#64748b] shrink-0" />
                <input
                  value={tickerQuery}
                  onChange={e => { setTickerQuery(e.target.value); setTickerOpen(true); setSelectedTicker(null); }}
                  onFocus={() => setTickerOpen(true)}
                  placeholder="Search ticker..."
                  className="bg-transparent text-[9px] text-white font-mono placeholder-[#475569] outline-none w-full min-w-0"
                />
              </div>
              {tickerQuery && <button onClick={() => { setTickerQuery(''); setTickerOpen(false); setSelectedTicker(null); }} className="text-[#64748b] hover:text-white cursor-pointer shrink-0"><X size={8} /></button>}
            </div>
            {tickerOpen && tickerResults.length > 0 && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-[#0d0e12] border border-[#334155] rounded-sm z-50 shadow-2xl overflow-hidden">
                {tickerResults.map(([sym, info]) => {
                  const livePrice = data?.market_overview?.find((m: any) => m.ticker === sym)?.price ?? info.price;
                  return (
                    <button key={sym} onClick={() => { setSelectedTicker(sym); setTickerOpen(false); setTickerQuery(''); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1e293b] cursor-pointer text-left border-b border-[#1e293b] last:border-0 transition-colors">
                      <span className="text-amber-400 font-bold font-mono text-[10px] w-20 shrink-0">{sym}</span>
                      <span className="text-[#94a3b8] text-[9px] flex-1 truncate">{info.name}</span>
                      <span className="text-[9px] font-mono shrink-0 flex items-center gap-1.5">
                        <span className="text-[#64748b] font-bold text-[8px] bg-[#1e293b] px-1 rounded-sm uppercase">{MARKET_LABEL[info.market] || info.market}</span>
                        <span className="text-white">{CURRENCY_SYMBOL[info.currency]}{livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button onClick={fetchData} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#334155] rounded-sm text-[9px] text-[#94a3b8] hover:border-amber-500 hover:text-white transition-all cursor-pointer font-mono">
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            {loading ? 'LOADING...' : 'REFRESH'}
          </button>
        </div>
      </div>

      {/* Ticker Detail Modal */}
      {selectedTicker && WATCHLIST_UNIVERSE[selectedTicker] && (() => {
        const t = WATCHLIST_UNIVERSE[selectedTicker];
        const liveInfo = data?.market_overview?.find((m: any) => m.ticker === selectedTicker);
        const chg = liveInfo?.change_pct ?? 0;
        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={() => setSelectedTicker(null)}>
            <div className="bg-[#0d0e12] border border-[#334155] rounded-sm p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xl font-bold text-amber-400 font-mono">{selectedTicker}</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">{t.name}</p>
                  <p className="text-[9px] text-[#64748b] mt-0.5">{MARKET_LABEL[t.market] || t.market} · {t.sector}</p>
                </div>
                <button onClick={() => setSelectedTicker(null)} className="text-[#64748b] hover:text-white cursor-pointer"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#11131a] rounded-sm p-3">
                  <p className="text-[8px] text-[#64748b] uppercase tracking-wider">PRICE</p>
                  <p className="text-lg font-bold text-white font-mono mt-1">{CURRENCY_SYMBOL[t.currency]}{(liveInfo?.price ?? t.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className={`text-[10px] font-bold font-mono ${chg >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{chg >= 0 ? '+' : ''}{chg.toFixed(2)}%</p>
                </div>
                <div className="bg-[#11131a] rounded-sm p-3">
                  <p className="text-[8px] text-[#64748b] uppercase tracking-wider">MKT CAP</p>
                  <p className="text-sm font-bold text-white mt-1">{t.mktCap}</p>
                  <p className="text-[9px] text-[#64748b]">Market Cap</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['P/E', `${t.pe}x`], ['DIV YIELD', `${t.divYield}%`], ['CURRENCY', t.currency]].map(([k, v]) => (
                  <div key={k} className="bg-[#11131a] rounded-sm p-2 text-center">
                    <p className="text-[8px] text-[#64748b]">{k}</p>
                    <p className="text-[10px] font-bold text-white font-mono mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => { setActiveTab('WATCHLIST'); setSelectedTicker(null); }}
                  className="flex-1 py-2 text-[9px] font-bold border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 cursor-pointer rounded-sm transition-all">
                  + ADD TO WATCHLIST
                </button>
                <button onClick={() => { setActiveTab('DRILL'); setSelectedTicker(null); }}
                  className="flex-1 py-2 text-[9px] font-bold border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer rounded-sm transition-all">
                  TRADE IN DRILL
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-950/30 border border-red-800 text-red-400 text-[10px] font-mono rounded-sm flex items-center gap-2">
          <AlertCircle size={12} /> Bridge Error: {error}
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <RefreshCw size={24} className="text-amber-500 animate-spin" />
            <p className="text-[10px] text-[#64748b] font-mono tracking-widest">INITIALIZING FINCEPT TERMINAL ENGINE...</p>
          </div>
        ) : data ? (
          <>
            {activeTab === 'DASHBOARD' && <DashboardTab data={data} />}
            {activeTab === 'MARKETS' && <MarketsTab data={data} />}
            {activeTab === 'PORTFOLIO' && <PortfolioTab data={data} />}
            {activeTab === 'EQUITY OPTIONS' && <OptionsTab data={data} />}
            {activeTab === 'FIXED INCOME' && <FixedIncomeTab data={data} />}
            {activeTab === 'FX' && <FXTab data={data} />}
            {activeTab === 'NEWS' && <NewsTab />}
            {activeTab === 'AI AGENTS' && <AIAgentsTab data={data} />}
            {activeTab === 'MACRO' && <MacroTab data={data} />}
            {activeTab === 'WATCHLIST' && <WatchlistTab />}
            {activeTab === 'DRILL' && <DrillTab />}
            {activeTab === 'LEARN' && <LearnTab />}
          </>
        ) : null}
      </div>
    </div>
  );
}
