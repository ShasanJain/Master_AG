export default function SkillsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <section>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Skill Armory</h2>
        <p className="text-white/40">Active Registry: <span className="text-blue-400 font-mono">PLATINUM-DENSITY</span></p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RegistryCard title="polyglot-master" status="Active" desc="22+ Languages. Industrial execution core." />
        <RegistryCard title="incident-command-system" status="Active" desc="Outage & Emergency Response." />
        <RegistryCard title="workspace-master" status="Active" desc="Google Workspace Automation." />
        <RegistryCard title="advanced-web-recon" status="Active" desc="Semantic Scraping & Research." />
        <RegistryCard title="third-party-integrations" status="Active" desc="HubSpot, Shopify, Notion." />
        <RegistryCard title="quality-gate" status="Active" desc="LINT + BUILD + TEST Verification." />
        <RegistryCard title="design-quality-gate" status="Active" desc="UX & Accessibility Audits." />
        <RegistryCard title="writing-skills" status="Active" desc="High-Density BLUF Comms." />
        <RegistryCard title="youtube-visuals" status="Active" desc="High-CTR Design Engine." />
      </section>
    </div>
  );
}

function RegistryCard({ title, status, desc }: { title: string; status: string; desc: string }) {
  return (
    <div className="glass-card p-6 flex flex-col border-l-2 border-l-blue-500/50">
      <div className="flex justify-between items-center mb-4">
        <code className="text-blue-400 font-bold text-xs">{title}</code>
        <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest">{status}</span>
      </div>
      <p className="text-sm text-white/50 flex-1 mb-6">{desc}</p>
      <button className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">Configure Registry</button>
    </div>
  );
}
