import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { IconDashboard, IconSkills, IconLogs, IconIncubator, IconSettings } from "./components/Icons";
import { StatusBadge } from "./components/StatusBadge";
import { FloatingJack } from "./components/FloatingJack";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Jack Industrial | Command Center",
  description: "Sovereign Engine Dashboard v5.0.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('jack-theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light-mode');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light-mode');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} font-sans antialiased industrial-grid min-h-screen flex text-[var(--foreground)]`}>
        {/* Sidebar */}
        <aside className="w-72 border-r border-[var(--border)] bg-[var(--sidebar-bg)] backdrop-blur-2xl flex flex-col p-8 sticky top-0 h-screen z-50">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)]">
                <span className="text-xl font-bold text-white tracking-tighter italic">J</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tighter text-[var(--foreground)]">JACK-05</h1>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-bold">Industrial Engine</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1">
            <NavItem label="Dashboard" href="/" icon={<IconDashboard className="w-4 h-4" />} />
            <NavItem label="Skill Armory" href="/skills" icon={<IconSkills className="w-4 h-4" />} />
            <NavItem label="Mission Logs" href="/logs" icon={<IconLogs className="w-4 h-4" />} />
            <NavItem label="Cognitive Memory" href="/memory" icon={<IconDashboard className="w-4 h-4" />} />
            <NavItem label="Incubator" href="/incubator" icon={<IconIncubator className="w-4 h-4" />} />
            <NavItem href="/chat" label="Neural Link" icon={<span className="text-sm">📡</span>} />
            <div className="pt-4 mt-4 border-t border-[var(--border)]">
              <NavItem label="Settings" href="/settings" icon={<IconSettings className="w-4 h-4" />} />
            </div>
          </nav>
          
          <div className="pt-8 border-t border-[var(--border)] mt-auto">
            <div className="glass-card p-4 bg-[var(--surface)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Engine Status</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              </div>
              <StatusBadge status="OPTIMAL" className="w-full justify-center py-1" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen relative">
          {/* Global Header */}
          <header className="h-20 border-b border-[var(--border)] flex items-center justify-between px-10 sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-40">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.3em]">Session // 0xAF32</span>
              <div className="h-4 w-px bg-[var(--border)]" />
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest font-mono">Build 5.0.0-Stable</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="QUICK DISPATCH (ALT+K)" 
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-full px-6 py-2 text-[10px] font-bold tracking-widest outline-none focus:border-[var(--primary)] transition-all w-64 placeholder:text-[var(--muted)] text-[var(--foreground)]"
                />
              </div>
              <div className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--foreground)] overflow-hidden relative group cursor-pointer hover:border-[var(--primary)] transition-all">
                <div className="absolute inset-0 bg-[var(--primary-glow)] opacity-0 group-hover:opacity-100 transition-all" />
                <span className="text-xs font-bold font-mono">SJ</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-10 overflow-y-auto">
            {children}
          </main>
        </div>
        <FloatingJack />
      </body>
    </html>
  );
}

function NavItem({ label, href, icon }: { label: string; href: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] group">
      <div className="text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">
        {icon}
      </div>
      {label}
    </Link>
  );
}
