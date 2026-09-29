import React, { useState } from 'react';
import { FIGHTERS } from '../game/fighterData';
import { FighterId } from '../types/fighter';
import { Zap, Flame, Sparkles, Sword, Shield, Gauge } from 'lucide-react';

interface SkillGuideModalProps {
  onBackToArena: () => void;
}

export const SkillGuideModal: React.FC<SkillGuideModalProps> = ({
  onBackToArena,
}) => {
  const fighters = Object.values(FIGHTERS);
  const [selectedId, setSelectedId] = useState<FighterId>('gojo');
  const active = FIGHTERS[selectedId];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif text-3xl font-black text-white tracking-wider flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-cyan-400" />
            BÍ TRUYỀN TUYỆT KỸ & LÃNH ĐỊA ANIME
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Khám phá trọn bộ 4 chiêu thức của Gojo Satoru, Ryomen Sukuna, Sung Jin-Woo (SJW) và Sans the Skeleton (Undertale)
          </p>
        </div>
        <button
          onClick={onBackToArena}
          className="self-start sm:self-auto px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
        >
          Trở Lại Đấu Trường
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {fighters.map((f) => {
          const isActive = selectedId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedId(f.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-950 shrink-0 border border-slate-700">
                <img 
                  src={f.avatarUrl} 
                  alt={f.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-cyan-400 uppercase">{f.series}</div>
                <div className="font-serif font-bold text-xs text-white truncate">{f.name}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Character Profile */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-4">
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-cyan-400 shadow-2xl shadow-cyan-950">
              <img 
                src={active.avatarUrl} 
                alt={active.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                {active.series}
              </span>
              <h3 className="font-serif text-xl font-black text-white">{active.name}</h3>
              <p className="text-xs text-slate-300 font-medium">{active.title}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            "{active.lore}"
          </p>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Máu quả cầu (Max HP):</span>
              <span className="font-mono font-bold text-emerald-400">{active.maxHp}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Trọng lượng va đập (Mass):</span>
              <span className="font-mono font-bold text-cyan-400">{active.weight}x</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Tốc độ nảy cơ bản:</span>
              <span className="font-mono font-bold text-amber-400">{active.baseSpeed} px/frame</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Skills */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Skill 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-bold font-mono">
                  CHIÊU 1
                </span>
                <h4 className="font-serif font-black text-lg text-white">
                  {active.skills.skill1.vietnameseName}
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> MP: {active.skills.skill1.manaCost}
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sword className="w-3.5 h-3.5" /> DMG: {active.skills.skill1.damage}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {active.skills.skill1.description}
            </p>
          </div>

          {/* Skill 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-400 text-xs font-bold font-mono">
                  CHIÊU 2
                </span>
                <h4 className="font-serif font-black text-lg text-white">
                  {active.skills.skill2.vietnameseName}
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> MP: {active.skills.skill2.manaCost}
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sword className="w-3.5 h-3.5" /> DMG: {active.skills.skill2.damage}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {active.skills.skill2.description}
            </p>
          </div>

          {/* Skill 3 (Chiêu Mới) */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-400 text-xs font-bold font-mono">
                  CHIÊU 3
                </span>
                <h4 className="font-serif font-black text-lg text-white">
                  {active.skills.skill3.vietnameseName}
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> MP: {active.skills.skill3.manaCost}
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sword className="w-3.5 h-3.5" /> DMG: {active.skills.skill3.damage}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {active.skills.skill3.description}
            </p>
          </div>

          {/* Ultimate (Tuyệt Kỹ / Lãnh Địa) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-rose-950/40 to-slate-900/80 border-2 border-amber-500/50 shadow-xl shadow-amber-950/20 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-xs font-black font-mono uppercase tracking-wider animate-pulse">
                  TUYỆT KỸ TỐI THƯỢNG (ULTIMATE / DOMAIN)
                </span>
                <h4 className="font-serif font-black text-xl text-amber-300">
                  {active.skills.ultimate.vietnameseName}
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-400" /> NỘ: 100%
                </span>
                <span className="text-rose-400 font-black text-sm flex items-center gap-1">
                  <Sword className="w-4 h-4" /> DMG: {active.skills.ultimate.damage}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {active.skills.ultimate.description}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
