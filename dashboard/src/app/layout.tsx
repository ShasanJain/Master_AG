import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased industrial-grid min-h-screen flex`}>
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen">
          <div className="mb-10">
            <h1 className="text-2xl font-bold tracking-tighter neon-text">JACK-05</h1>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Industrial Engine</p>
          </div>
          
          <nav className="flex-1 space-y-2">
            <NavItem label="Dashboard" active />
            <NavItem label="Skill Armory" />
            <NavItem label="Mission Logs" />
            <NavItem label="Incubator" />
            <NavItem label="Settings" />
          </nav>
          
          <div className="pt-6 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-white/60 uppercase tracking-widest">System Active</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
      ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}
    `}>
      {label}
    </div>
  );
}
