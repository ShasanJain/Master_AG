import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react'

// Fira Code / Fira Sans Simulation (we'll use system fonts that are similar if google font not loaded, or load via css)
// Theme: Pink/Gold Elegant Dashboard
// Background: #FDF2F8 (fuchsia-50 / pink-50)
// Text: #831843 (pink-900)
// Primary: #DB2777 (pink-600)
// Secondary: #F472B6 (pink-400)
// CTA: #CA8A04 (yellow-600)

const MOCK_DATA = Array.from({ length: 15 }).map((_, i) => ({
  id: `TRX-${1000 + i}`,
  date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  amount: (Math.random() * 5000 + 100).toFixed(2),
  status: Math.random() > 0.2 ? 'Completed' : 'Pending',
  client: `Client Entity ${String.fromCharCode(65 + (i % 26))}`
}))

export default function SkillDashboard() {
  const [hoveredRow, setHoveredRow] = useState(null)

  return (
    <div className="min-h-screen bg-[#FDF2F8] text-[#831843] p-4 sm:p-6 lg:p-8" style={{ fontFamily: '"Fira Sans", sans-serif' }}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financial Overview</h1>
          <p className="text-[#DB2777] text-sm mt-1">Real-time metrics and transaction log</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F472B6]" size={16} />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="w-full bg-white border border-[#F472B6]/30 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[#DB2777] focus:ring-1 focus:ring-[#DB2777] transition-all"
            />
          </div>
          <button className="bg-white border border-[#F472B6]/30 p-2 rounded-md hover:bg-white/80 transition-colors cursor-pointer text-[#DB2777]">
            <Filter size={18} />
          </button>
          <button className="bg-[#CA8A04] hover:bg-[#A16207] text-white p-2 rounded-md transition-colors cursor-pointer flex items-center gap-2 px-4 shadow-sm hover:shadow">
            <Download size={16} />
            <span className="hidden sm:inline text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Grid (Dense) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Volume", value: "$1.2M", change: "+14.5%", pos: true },
          { label: "Active Clients", value: "3,492", change: "+2.1%", pos: true },
          { label: "Pending Risk", value: "$42k", change: "-5.4%", pos: false },
          { label: "Processing Time", value: "1.2s", change: "-12%", pos: true }
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-[#F472B6]/20 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <p className="text-sm text-[#DB2777] mb-1 font-medium">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold" style={{ fontFamily: '"Fira Code", monospace' }}>{kpi.value}</span>
              <div className={`flex items-center text-xs font-medium ${kpi.pos ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.pos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <div className="lg:col-span-1 bg-white border border-[#F472B6]/20 rounded-lg p-5 shadow-sm h-[400px] flex flex-col">
          <h2 className="text-base font-semibold mb-4 border-b border-[#FDF2F8] pb-2">Volume Trend</h2>
          <div className="flex-1 flex items-end gap-1 group cursor-pointer">
            {Array.from({ length: 24 }).map((_, i) => {
              const h = Math.random() * 80 + 20;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end group-hover:opacity-50 hover:!opacity-100 transition-opacity relative">
                  {/* Tooltip Simulation */}
                  <div className="opacity-0 hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#831843] text-white text-xs py-1 px-2 rounded font-mono pointer-events-none z-10 whitespace-nowrap">
                    ${(h * 10).toFixed(0)}
                  </div>
                  <div 
                    className="bg-[#DB2777] rounded-t-sm transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Data Table */}
        <div className="lg:col-span-2 bg-white border border-[#F472B6]/20 rounded-lg shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-[#F472B6]/20 flex justify-between items-center bg-[#FDF2F8]/50">
            <h2 className="text-base font-semibold">Recent Transactions</h2>
            <button className="text-sm text-[#DB2777] hover:underline font-medium cursor-pointer">View All</button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#DB2777] uppercase bg-white sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.map((row, i) => (
                  <tr 
                    key={row.id} 
                    className={`border-b border-[#FDF2F8] transition-colors cursor-pointer ${hoveredRow === i ? 'bg-[#FDF2F8]' : 'bg-white'}`}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-4 py-2 font-mono text-xs">{row.id}</td>
                    <td className="px-4 py-2 text-gray-500">{row.date}</td>
                    <td className="px-4 py-2 font-medium">{row.client}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${row.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-[#FDF2F8] text-[#DB2777]'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-medium">${row.amount}</td>
                    <td className="px-4 py-2 text-right">
                      <button className="text-gray-400 hover:text-[#DB2777] transition-colors p-1 rounded hover:bg-white">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
