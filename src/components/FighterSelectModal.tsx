import React from 'react';
import { FIGHTERS, ARENAS } from '../game/fighterData';
import { FighterId, AIPersonality, ArenaConfig } from '../types/fighter';
import { Check, Sparkles, Flame, Shield, Zap } from 'lucide-react';

interface FighterSelectModalProps {
  p1Id: FighterId;
  p2Id: FighterId;
  p1Personality: AIPersonality;
  p2Personality: AIPersonality;
  selectedArena: ArenaConfig;
  onSelectP1: (id: FighterId) => void;
  onSelectP2: (id: FighterId) => void;
  onSelectP1Personality: (p: AIPersonality) => void;
  onSelectP2Personality: (p: AIPersonality) => void;
  onSelectArena: (arena: ArenaConfig) => void;
  onConfirm: () => void;
}

const PERSONALITIES: { id: AIPersonality; label: string; desc: string }[] = [
  { id: 'aggressive', label: '⚡ Cuồng Bạo Tấn Công', desc: 'Liên tục lao thẳng vào đối phương với gia tốc tối đa.' },
  { id: 'tactician', label: '🛡️ Bậc Thầy Phản Đòn', desc: 'Căn góc nảy tường, thủ thế kích hoạt khiên và phản kích.' },
  { id: 'zoner', label: '🎯 Pháp Sư Tầm Xa', desc: 'Giữ cự ly an toàn, liên tục spam chiêu thức và hố đen.' },
  { id: 'chaotic', label: '🌀 Điên Cuồng Khó Đoán', desc: 'Đổi hướng ngẫu nhiên, đập nảy siêu tốc làm loạn sàn đấu.' },
];

export const FighterSelectModal: React.FC<FighterSelectModalProps> = ({
  p1Id,
  p2Id,
  p1Personality,
  p2Personality,
  selectedArena,
  onSelectP1,
  onSelectP2,
  onSelectP1Personality,
  onSelectP2Personality,
  onSelectArena,
  onConfirm,
}) => {
  const fightersList = Object.values(FIGHTERS);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6 px-4">
      <div className="flex flex-col items-center text-center gap-1">
        <h2 className="font-serif text-3xl font-black text-white tracking-wider">
          CHỌN QUẢ CẦU ANIME & ĐẤU TRƯỜNG
        </h2>
        <p className="text-sm text-slate-400">
          Chọn đấu sĩ huyền thoại: Gojo Satoru, Ryomen Sukuna, Sung Jin-Woo (SJW), Sans the Skeleton cùng phong cách va đập của AI!
        </p>
      </div>

      {/* Roster Pickers: P1 vs P2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* P1 Configuration */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-900/80 border-2 border-cyan-500/40 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block animate-ping" />
              Quả Cầu 1 (Bên Xanh / P1)
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Đang chọn: <strong className="text-white">{FIGHTERS[p1Id]?.name}</strong>
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {fightersList.map((f) => {
              const isSelected = p1Id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSelectP1(f.id)}
                  className={`group relative flex flex-col items-center p-3 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50 scale-[1.02]' 
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-2 bg-slate-900 border-2 border-slate-700">
                    <img 
                      src={f.avatarUrl} 
                      alt={f.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">{f.series}</span>
                  <span className="font-serif font-bold text-xs text-white truncate w-full text-center">
                    {f.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* AI Personality select for P1 */}
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-300">Tính cách AI Bên Xanh:</span>
            <div className="grid grid-cols-2 gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectP1Personality(p.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    p1Personality === p.id
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* P2 Configuration */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-900/80 border-2 border-rose-500/40 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping" />
              Quả Cầu 2 (Bên Đỏ / P2)
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Đang chọn: <strong className="text-white">{FIGHTERS[p2Id]?.name}</strong>
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {fightersList.map((f) => {
              const isSelected = p2Id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSelectP2(f.id)}
                  className={`group relative flex flex-col items-center p-3 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'border-rose-500 bg-rose-950/40 shadow-lg shadow-rose-950/50 scale-[1.02]' 
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-2 bg-slate-900 border-2 border-slate-700">
                    <img 
                      src={f.avatarUrl} 
                      alt={f.name}
                      className="w-full h-full object-cover scale-x-[-1] group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">{f.series}</span>
                  <span className="font-serif font-bold text-xs text-white truncate w-full text-center">
                    {f.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* AI Personality select for P2 */}
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-300">Tính cách AI Bên Đỏ:</span>
            <div className="grid grid-cols-2 gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectP2Personality(p.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    p2Personality === p.id
                      ? 'border-rose-500 bg-rose-950/40 text-rose-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Arena Stage */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Chọn Đấu Trường Va Đập:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARENAS.map((arena) => {
            const isSelected = selectedArena.id === arena.id;
            return (
              <button
                key={arena.id}
                onClick={() => onSelectArena(arena)}
                className={`group relative flex flex-col rounded-xl overflow-hidden border text-left transition-all ${
                  isSelected 
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative h-28 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src={arena.backgroundUrl} 
                    alt={arena.vietnameseName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  {isSelected && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase">
                      Đã chọn
                    </span>
                  )}
                </div>
                <div className="p-3 bg-slate-950">
                  <div className="font-serif font-bold text-sm text-white">{arena.vietnameseName}</div>
                  <div className="text-xs text-slate-400">{arena.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onConfirm}
          className="px-8 py-3.5 text-base font-black tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-xl hover:from-amber-300 hover:to-rose-300 shadow-xl shadow-amber-950/40 transition-all hover:scale-105 active:scale-95 uppercase"
        >
          ⚔️ BẮT ĐẦU VA ĐẬP NẢY BÓNG
        </button>
      </div>
    </div>
  );
};
