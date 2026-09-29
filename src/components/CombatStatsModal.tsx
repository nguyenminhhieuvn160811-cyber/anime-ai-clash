import React from 'react';
import { MatchStats, BattleOrbEntity } from '../types/fighter';
import { Trophy, Swords, BarChart3, RotateCcw, ShieldAlert } from 'lucide-react';

interface CombatStatsModalProps {
  stats: MatchStats;
  orb1: BattleOrbEntity;
  orb2: BattleOrbEntity;
  matchHistory: { winner: string; duration: number; p1Dmg: number; p2Dmg: number }[];
  onBackToArena: () => void;
  onRematch: () => void;
}

export const CombatStatsModal: React.FC<CombatStatsModalProps> = ({
  stats,
  orb1,
  orb2,
  matchHistory,
  onBackToArena,
  onRematch,
}) => {
  const totalDmg = Math.max(1, stats.p1DamageDealt + stats.p2DamageDealt);
  const p1DmgPercent = Math.round((stats.p1DamageDealt / totalDmg) * 100);
  const p2DmgPercent = 100 - p1DmgPercent;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif text-3xl font-black text-white tracking-wider flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            BẢNG THỐNG KÊ CHIẾN BÁO VA ĐẬP
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Tổng kết sát thương va đập, chuỗi phản xạ nảy tường và số lần giải phóng Lãnh Địa / Tuyệt Kỹ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRematch}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-lg hover:from-cyan-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Đấu Lại Ngay
          </button>
          <button
            onClick={onBackToArena}
            className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            Quay Lại Sàn Đấu
          </button>
        </div>
      </div>

      {/* Primary Match Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* P1 Column */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border-2 border-cyan-500/30 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 bg-slate-950">
            <img 
              src={orb1.config.avatarUrl} 
              alt={orb1.config.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-serif font-black text-lg text-white">{orb1.config.name}</span>
          <span className="text-xs text-cyan-300 font-mono">BÊN XANH (P1) · {orb1.config.series}</span>

          <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tổng sát thương gây ra:</span>
              <span className="font-mono font-bold text-cyan-400 tabular-nums">{stats.p1DamageDealt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Combo va đập lớn nhất:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">{stats.p1MaxCombo} BUMPS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tuyệt kỹ / Lãnh địa:</span>
              <span className="font-mono font-bold text-rose-400 tabular-nums">{stats.p1UltsUsed} lần</span>
            </div>
          </div>
        </div>

        {/* Center Overview */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center gap-4">
          <Trophy className="w-12 h-12 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">KẾT QUẢ TRẬN</span>
            <span className="font-serif font-black text-2xl text-amber-300">
              {stats.winnerId === 1 
                ? `${orb1.config.name} THẮNG!` 
                : stats.winnerId === 2 
                  ? `${orb2.config.name} THẮNG!` 
                  : 'HÒA NHAU!'}
            </span>
          </div>

          <div className="w-full flex flex-col gap-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
              <span className="text-cyan-400">{p1DmgPercent}%</span>
              <span>Tỉ Lệ Sát Thương</span>
              <span className="text-rose-400">{p2DmgPercent}%</span>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div className="bg-cyan-500 h-full" style={{ width: `${p1DmgPercent}%` }} />
              <div className="bg-rose-500 h-full" style={{ width: `${p2DmgPercent}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Tổng lần dội tường (Wall Bounces): <strong className="text-white font-mono">{stats.wallBounces}</strong></span>
          </div>
        </div>

        {/* P2 Column */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border-2 border-rose-500/30 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-500 bg-slate-950">
            <img 
              src={orb2.config.avatarUrl} 
              alt={orb2.config.name}
              className="w-full h-full object-cover scale-x-[-1]"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-serif font-black text-lg text-white">{orb2.config.name}</span>
          <span className="text-xs text-rose-300 font-mono">BÊN ĐỎ (P2) · {orb2.config.series}</span>

          <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tổng sát thương gây ra:</span>
              <span className="font-mono font-bold text-rose-400 tabular-nums">{stats.p2DamageDealt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Combo va đập lớn nhất:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">{stats.p2MaxCombo} BUMPS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tuyệt kỹ / Lãnh địa:</span>
              <span className="font-mono font-bold text-rose-400 tabular-nums">{stats.p2UltsUsed} lần</span>
            </div>
          </div>
        </div>

      </div>

      {/* History */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Lịch Sử Các Ván Đấu Vừa Qua:
        </span>
        {matchHistory.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-4 text-center">
            Chưa có ván đấu nào hoàn tất trong phiên làm việc này.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {matchHistory.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-xs">
                <span className="font-mono text-slate-400">Ván #{idx + 1}</span>
                <span className="font-serif font-bold text-amber-300">{m.winner}</span>
                <span className="font-mono text-slate-300">P1: {m.p1Dmg} DMG / P2: {m.p2Dmg} DMG</span>
                <span className="font-mono text-slate-400">{m.duration}s</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
