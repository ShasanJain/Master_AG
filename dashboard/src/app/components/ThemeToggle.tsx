'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check initial state
    if (document.documentElement.classList.contains('light-mode')) {
      setIsLight(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsLight(!isLight);
    if (!isLight) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-full hover:border-[var(--primary)] transition-all cursor-pointer shadow-[0_0_10px_var(--primary-glow)] flex items-center justify-center relative overflow-hidden"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isLight ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isLight ? <Sun size={16} className="text-[#CA8A04]" /> : <Moon size={16} className="text-[var(--primary)]" />}
      </motion.div>
    </button>
  );
}
