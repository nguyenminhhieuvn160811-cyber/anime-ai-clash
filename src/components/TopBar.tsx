import React from 'react';
import { Volume2, VolumeX, RotateCcw, Swords, Users, Sparkles, BarChart2 } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface TopBarProps {
  currentTab: 'arena' | 'select' | 'skills' | 'stats';
  setCurrentTab: (tab: 'arena' | 'select' | 'skills' | 'stats') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetMatch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  setCurrentTab,
  isMuted,
  onToggleMute,
  onResetMatch,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2">
        <a 
          href="#arena" 
          onClick={(e) => { e.preventDefault(); setCurrentTab('arena'); }}
          className="font-serif text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 hover:opacity-90 transition-opacity"
        >
          ANIME AI CLASH
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
        <button
          onClick={() => setCurrentTab('arena')}
          className={`flex items-center gap-1.5 transition-colors pb-0.5 ${
            currentTab === 'arena' 
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' 
              : 'hover:text-white'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Võ Đài Quyết Đấu</span>
        </button>

        <button
          onClick={() => setCurrentTab('select')}
          className={`flex items-center gap-1.5 transition-colors pb-0.5 ${
            currentTab === 'select' 
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' 
              : 'hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Chọn Tướng & AI</span>
        </button>

        <button
          onClick={() => setCurrentTab('skills')}
          className={`flex items-center gap-1.5 transition-colors pb-0.5 ${
            currentTab === 'skills' 
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' 
              : 'hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Tra Cứu Kỹ Năng</span>
        </button>

        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex items-center gap-1.5 transition-colors pb-0.5 ${
            currentTab === 'stats' 
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' 
              : 'hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Thống Kê Trận</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        <button
          onClick={onResetMatch}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-lg hover:from-cyan-300 hover:to-sky-200 transition-all shadow-md shadow-cyan-950/40 active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đấu Lại</span>
        </button>
      </div>
    </header>
  );
};
