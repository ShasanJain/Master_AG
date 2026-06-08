import { useState } from 'react'
import OpenDesignDashboard from './OpenDesignDashboard'
import SkillDashboard from './SkillDashboard'

function App() {
  const [activeTab, setActiveTab] = useState('open-design')

  return (
    <div>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md border border-white/20 p-1 rounded-full flex gap-1 shadow-2xl text-sm font-medium">
        <button 
          onClick={() => setActiveTab('open-design')}
          className={`px-4 py-2 rounded-full transition-all ${activeTab === 'open-design' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
        >
          Open Design (Dark)
        </button>
        <button 
          onClick={() => setActiveTab('skill')}
          className={`px-4 py-2 rounded-full transition-all ${activeTab === 'skill' ? 'bg-[#DB2777] text-white' : 'text-white hover:bg-white/20'}`}
        >
          UI-UX Skill (Light)
        </button>
      </div>

      {activeTab === 'open-design' ? <OpenDesignDashboard /> : <SkillDashboard />}
    </div>
  )
}

export default App
