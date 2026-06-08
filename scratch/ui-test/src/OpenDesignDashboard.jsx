import { motion } from 'framer-motion'
import { Settings, BarChart3, Users, DollarSign, Activity, Maximize2, RefreshCw } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

export default function OpenDesignDashboard() {
  return (
    <div className="min-h-screen p-8 text-slate-50 font-sans tracking-tight bg-[#0f172a] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 xl:grid-cols-4 gap-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="xl:col-span-4 flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Overview</h1>
            <p className="uppercase text-[10px] tracking-widest text-slate-400 font-mono mt-1">Live Telemetry Data</p>
          </div>
          <div className="flex gap-3">
            <button className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out shadow-2xl shadow-black/50">
              <RefreshCw size={18} />
            </button>
            <button className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out shadow-2xl shadow-black/50">
              <Maximize2 size={18} />
            </button>
          </div>
        </motion.div>

        {/* KPI Wall */}
        <motion.div variants={itemVariants} className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { icon: DollarSign, label: "Revenue", value: "$42,500", trend: "+12.5%" },
            { icon: Users, label: "Active Users", value: "1,240", trend: "+5.2%" },
            { icon: Activity, label: "System Load", value: "24%", trend: "-2.1%" },
            { icon: BarChart3, label: "Conversion", value: "3.2%", trend: "+0.8%" }
          ].map((kpi, idx) => (
            <div key={idx} className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:scale-[1.02] transition-all duration-300 ease-out shadow-2xl shadow-black/50 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <kpi.icon size={20} className="text-blue-400" />
                </div>
                <span className="text-xs font-mono tracking-widest text-emerald-400">{kpi.trend}</span>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tighter">{kpi.value}</p>
                <p className="uppercase text-[10px] tracking-widest text-slate-400 font-mono mt-1">{kpi.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Viz */}
        <motion.div variants={itemVariants} className="xl:col-span-3 h-[500px] p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold tracking-tight">Performance Matrix</h2>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <Settings size={18} className="text-slate-400" />
            </button>
          </div>
          <div className="flex-1 border border-white/5 rounded-2xl bg-black/20 flex items-center justify-center relative overflow-hidden">
             {/* Abstract chart placeholder */}
             <div className="absolute bottom-0 w-full flex items-end gap-2 px-8 h-full opacity-60">
                {[40, 70, 45, 90, 65, 85, 30, 50, 75, 100, 60, 80].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                    className="flex-1 bg-gradient-to-t from-blue-500/20 to-blue-400/80 rounded-t-lg hover:scale-[1.02] hover:brightness-125 transition-all cursor-pointer"
                  />
                ))}
             </div>
          </div>
        </motion.div>

        {/* Tweaks Panel */}
        <motion.div variants={itemVariants} className="xl:col-span-1 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-1">Tweaks</h2>
            <p className="uppercase text-[10px] tracking-widest text-slate-400 font-mono">System Parameters</p>
          </div>
          
          <div className="flex flex-col gap-5 flex-1 justify-center">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="uppercase text-[10px] tracking-widest text-slate-300 font-mono">Parameter {i+1}</span>
                  <span className="text-xs font-mono text-blue-400">{(Math.random() * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 60 + 20}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-4 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out font-mono tracking-widest text-[10px] uppercase shadow-xl shadow-black/30">
            Apply Changes
          </button>
        </motion.div>

      </motion.div>
    </div>
  )
}
