export default function LogsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <section>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Mission Logs</h2>
        <p className="text-white/40">Audit Trail Status: <span className="text-emerald-500 font-mono">SYNCED</span></p>
      </section>

      <section className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">Timestamp</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">Mission</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">Personnel</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <LogEntry time="19:04" mission="Sovereign Dashboard Scaffold" status="SUCCESS" agent="Architect" />
            <LogEntry time="18:57" mission="YouTube Visuals v1.0 Promotion" status="SUCCESS" agent="Auditor" />
            <LogEntry time="18:42" mission="Industrial Cron Initialization" status="ACTIVE" agent="Ops Lead" />
          </tbody>
        </table>
      </section>
    </div>
  );
}

function LogEntry({ time, mission, status, agent }: { time: string; mission: string; status: string; agent: string }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 font-mono text-xs text-white/40">{time}</td>
      <td className="px-6 py-4 font-medium text-white/80">{mission}</td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold px-2 py-1 rounded ${status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-white/40">{agent}</td>
    </tr>
  );
}
