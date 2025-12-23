
import React, { useContext } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const modes: { id: 'light' | 'dark' | 'system', icon: any, label: string }[] = [
    { id: 'light', icon: Sun, label: 'KUNDUZGI' },
    { id: 'system', icon: Monitor, label: 'TIZIM' },
    { id: 'dark', icon: Moon, label: 'TUNGI' },
  ];

  return (
    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/5 transition-colors">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setTheme(mode.id)}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
            theme === mode.id 
              ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          title={mode.label}
        >
          <mode.icon size={14} />
          {theme === mode.id && <span className="text-[10px] font-black tracking-widest hidden lg:inline">{mode.label}</span>}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
