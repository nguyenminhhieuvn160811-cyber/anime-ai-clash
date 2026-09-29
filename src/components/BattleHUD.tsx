import React from 'react';
import { BattleOrbEntity, DamageLevel } from '../types/fighter';
import { Zap, Flame, Gauge, Shield, Swords, Sparkles } from 'lucide-react';

interface BattleHUDProps {
  orb1: BattleOrbEntity;
  orb2: BattleOrbEntity;
  roundTime: number;
  damageLevel?: DamageLevel;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  orb1,
  orb2,
  roundTime,
  damageLevel = 'small',
}) => {
  const p1HpPercent = Math.max(0, (orb1.hp / orb1.config.maxHp) * 100);
  const p1GhostPercent = Math.max(0, (orb1.ghostHp / orb1.config.maxHp) * 100);
  const p1EnergyPercent = Math.min(100, (orb1.energy / orb1.config.maxEnergy) * 100);
  const p1BurstPercent = Math.min(100, orb1.burst);
  const p1Speed = Math.round(Math.hypot(orb1.vx, orb1.vy) * 10);

  const p2HpPercent = Math.max(0, (orb2.hp / orb2.config.maxHp) * 100);
  const p2GhostPercent = Math.max(0, (orb2.ghostHp / orb2.config.maxHp) * 100);
  const p2EnergyPercent = Math.min(100, (orb2.energy / orb2.config.maxEnergy) * 100);
  const p2BurstPercent = Math.min(100, orb2.burst);
  const p2Speed = Math.round(Math.hypot(orb2.vx, orb2.vy) * 10);

  // Status generator for balanced under-character bay
  const getStatus = (orb: BattleOrbEntity) => {
    if (orb.lastSkillUsed) {
      return {
        isSkill: true,
        label: orb.lastSkillUsed.typeLabel,
        text: orb.lastSkillUsed.vietnameseName,
        color: orb.lastSkillUsed.color,
        isUlt: orb.lastSkillUsed.type === 'ultimate',
      };
    }
    if (orb.isInfinityActive) {
      return {
        isSkill: false,
        label: 'VÔ HẠ HẠN',
        text: '🛡️ Vô Hạ Hạn: Hộ Thể 1.3s & Đẩy Lùi',
        color: '#38bdf8',
        isUlt: false,
      };
    }
    if (orb.config.id === 'gojo' && orb.speedBuffTimer > 0) {
      return {
        isSkill: false,
        label: 'THỨC TỈNH',
        text: '⚡ Thức Tỉnh Hắc Thiểm (Tăng Tốc)',
        color: '#c084fc',
        isUlt: false,
      };
    }
    if (orb.config.id === 'sans') {
      if (orb.hp <= 0) {
        return {
          isSkill: false,
          label: 'K.O.',
          text: '💀 Sans Đã Bị Đánh Trúng!',
          color: '#ef4444',
          isUlt: false,
        };
      }
      if (orb.energy <= 0) {
        return {
          isSkill: false,
          label: 'KIỆT SỨC',
          text: '💦 HẾT THỂ LỰC! KHÔNG THỂ NÉ (1 HIT LÀ CHẾT)!',
          color: '#ef4444',
          isUlt: true,
        };
      }
      if (orb.energy < 30) {
        return {
          isSkill: false,
          label: 'THỞ DỐC',
          text: `💦 Đang Thở Dốc (${Math.round(orb.energy)} MP Né)`,
          color: '#f59e0b',
          isUlt: false,
        };
      }
      return {
        isSkill: false,
        label: 'NÉ TUYỆT ĐỐI',
        text: `✨ Né Mọi Đòn Đánh & Chiêu Thức (${Math.round(orb.energy)} MP)`,
        color: '#38bdf8',
        isUlt: false,
      };
    }
    if (orb.speedBuffTimer > 0) {
      return {
        isSkill: false,
        label: 'TĂNG TỐC',
        text: 'Hỏa Tiễn Fuga: Khai Mở',
        color: '#f97316',
        isUlt: false,
      };
    }
    if (orb.shadowMinions && orb.shadowMinions.length > 0) {
      return {
        isSkill: false,
        label: 'QUÂN BỘI',
        text: `Đội Quân Bóng Ma (${orb.shadowMinions.length})`,
        color: '#c084fc',
        isUlt: false,
      };
    }
    if (orb.burst >= 100) {
      return {
        isSkill: false,
        label: 'SẴN SÀNG',
        text: '⚡ Tuyệt Kỹ Đã Đầy!',
        color: '#facc15',
        isUlt: true,
      };
    }
    return {
      isSkill: false,
      label: 'TRẠNG THÁI',
      text: 'Sẵn Sàng Chiến Đấu',
      color: orb.config.themeColor,
      isUlt: false,
    };
  };

  const status1 = getStatus(orb1);
  const status2 = getStatus(orb2);

  return (
    <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none z-20 flex flex-col justify-between">
      {/* Top 3-Column Balanced Grid */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 sm:gap-5 max-w-6xl mx-auto w-full">
        
        {/* ==================== PLAYER 1 (LEFT / CYAN) ==================== */}
        <div className="flex flex-col gap-1.5 min-w-0">
          
          {/* Header Bar */}
          <div className="flex items-center gap-3">
            {/* Avatar Disc */}
            <div 
              className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 bg-slate-950 shrink-0 shadow-lg"
              style={{ borderColor: orb1.config.themeColor, boxShadow: `0 0 14px ${orb1.config.themeColor}50` }}
            >
              <img 
                src={orb1.config.avatarUrl} 
                alt={orb1.config.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 bg-cyan-600 text-[9px] font-mono font-black px-1 rounded-tl text-white">
                P1
              </span>
            </div>

            {/* Title & Name */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-sm sm:text-base text-white tracking-wide truncate drop-shadow">
                  {orb1.config.name}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 uppercase shrink-0">
                  {orb1.config.series}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <span className="truncate">{orb1.config.title}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5 font-mono text-cyan-400 font-bold shrink-0">
                  <Gauge className="w-3 h-3" /> {p1Speed} km/h
                </span>
              </div>
            </div>
          </div>

          {/* Health Bar (Left to Right) */}
          <div className="relative h-5 sm:h-5.5 bg-slate-950/95 rounded-full border border-slate-700/80 overflow-hidden shadow-inner">
            <div 
              className="absolute inset-y-0 left-0 bg-amber-400/80 transition-all duration-300 ease-out"
              style={{ width: `${p1GhostPercent}%` }}
            />
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-75 shadow-md"
              style={{ width: `${p1HpPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] sm:text-[11px] font-mono font-bold text-white drop-shadow">
              <span className="bg-black/60 px-1 rounded text-cyan-300">HP</span>
              <span className="tabular-nums drop-shadow-md">
                {orb1.config.id === 'sans' ? (
                  orb1.hp > 0 ? (
                    orb1.energy > 0 ? (
                      <span className="text-cyan-300 font-black">1/1 HP (NÉ CHIÊU ✨)</span>
                    ) : (
                      <span className="text-rose-400 font-black animate-pulse">1/1 HP (⚠️ HẾT MP - 1 HIT LÀ CHẾT)</span>
                    )
                  ) : (
                    <span className="text-slate-400 font-black">0/1 HP (K.O.)</span>
                  )
                ) : (
                  `${Math.round(orb1.hp)} / ${orb1.config.maxHp}`
                )}
              </span>
            </div>
          </div>

          {/* Secondary Sub Bars: Energy & Burst */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {/* Energy MP */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-slate-400 font-semibold text-[9px] sm:text-[10px]">
                <span className="flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-cyan-400" />
                  {orb1.config.id === 'sans' ? 'THỂ LỰC NÉ' : 'NĂNG LƯỢNG'}
                </span>
                <span className="font-mono">{Math.round(orb1.energy)}/100</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all" 
                  style={{ width: `${p1EnergyPercent}%` }}
                />
              </div>
            </div>

            {/* Burst Ultimate */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between font-semibold text-[9px] sm:text-[10px]">
                <span className={`flex items-center gap-0.5 ${p1BurstPercent >= 100 ? 'text-amber-300 font-black animate-pulse' : 'text-slate-400'}`}>
                  <Flame className="w-2.5 h-2.5 text-amber-400" /> TUYỆT KỸ
                </span>
                <span className="font-mono text-amber-400">{Math.round(p1BurstPercent)}%</span>
              </div>
              <div className={`h-1.5 bg-slate-950 rounded-full overflow-hidden border ${p1BurstPercent >= 100 ? 'border-amber-400 shadow-sm shadow-amber-400' : 'border-slate-800'}`}>
                <div 
                  className={`h-full transition-all ${p1BurstPercent >= 100 ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-orange-400 animate-pulse' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`} 
                  style={{ width: `${p1BurstPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Under-Character Skill & Status Bay */}
          <div className="h-9 min-h-[36px] flex items-center">
            <div 
              className={`w-full flex items-center gap-2 px-2.5 py-1 rounded-xl border backdrop-blur-md transition-all duration-200 shadow-md ${
                status1.isSkill
                  ? status1.isUlt
                    ? 'bg-gradient-to-r from-slate-950 via-purple-950/95 to-slate-950 border-amber-400 shadow-amber-500/30 ring-1 ring-amber-400/60'
                    : 'bg-slate-950/95 border-cyan-400/90 shadow-cyan-950/60 ring-1 ring-cyan-400/30'
                  : 'bg-slate-950/80 border-slate-800/80'
              }`}
              style={{
                borderColor: status1.isSkill ? status1.color : undefined,
              }}
            >
              <div 
                className={`w-2 h-2 rounded-full shrink-0 ${status1.isSkill ? (status1.isUlt ? 'animate-ping' : 'animate-pulse') : 'opacity-60'}`}
                style={{ backgroundColor: status1.color }}
              />
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span 
                  className="text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 shrink-0 leading-none"
                  style={{ color: status1.color }}
                >
                  {status1.label}
                </span>
                <span className={`font-serif font-black text-xs truncate ${status1.isSkill ? 'text-white drop-shadow' : 'text-slate-300'}`}>
                  {status1.text}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ==================== CENTER CONSOLE (BALANCED ANCHOR) ==================== */}
        <div className="flex flex-col items-center justify-center shrink-0 px-1 pt-1">
          {/* Main Timer Dial */}
          <div className="relative flex flex-col items-center justify-center w-16 sm:w-18 py-1.5 px-2 rounded-2xl bg-slate-950/95 border-2 border-amber-400/90 shadow-xl shadow-amber-950/70 backdrop-blur-md">
            <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tabular-nums drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] leading-tight">
              {roundTime}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-black italic tracking-widest text-rose-500 uppercase drop-shadow">
                VS
              </span>
            </div>
          </div>

          {/* Damage Mode Badge below Timer */}
          <div className="mt-1.5 flex items-center justify-center">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-950/90 border border-slate-700/80 text-slate-300 shadow-sm whitespace-nowrap">
              {damageLevel === 'tiny' ? 'DMG: SIÊU BÉ' : damageLevel === 'small' ? 'DMG: BÉ' : 'DMG: VỪA'}
            </span>
          </div>
        </div>

        {/* ==================== PLAYER 2 (RIGHT / RED) ==================== */}
        <div className="flex flex-col gap-1.5 min-w-0">
          
          {/* Header Bar */}
          <div className="flex items-center justify-end gap-3 text-right">
            {/* Title & Name */}
            <div className="flex flex-col min-w-0 flex-1 items-end">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300 uppercase shrink-0">
                  {orb2.config.series}
                </span>
                <span className="font-serif font-black text-sm sm:text-base text-white tracking-wide truncate drop-shadow">
                  {orb2.config.name}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-0.5 font-mono text-rose-400 font-bold shrink-0">
                  <Gauge className="w-3 h-3" /> {p2Speed} km/h
                </span>
                <span>·</span>
                <span className="truncate">{orb2.config.title}</span>
              </div>
            </div>

            {/* Avatar Disc */}
            <div 
              className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 bg-slate-950 shrink-0 shadow-lg"
              style={{ borderColor: orb2.config.themeColor, boxShadow: `0 0 14px ${orb2.config.themeColor}50` }}
            >
              <img 
                src={orb2.config.avatarUrl} 
                alt={orb2.config.name}
                className="w-full h-full object-cover scale-x-[-1]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 left-0 bg-rose-600 text-[9px] font-mono font-black px-1 rounded-tr text-white">
                P2
              </span>
            </div>
          </div>

          {/* Health Bar (Right to Left) */}
          <div className="relative h-5 sm:h-5.5 bg-slate-950/95 rounded-full border border-slate-700/80 overflow-hidden shadow-inner">
            <div 
              className="absolute inset-y-0 right-0 bg-amber-400/80 transition-all duration-300 ease-out"
              style={{ width: `${p2GhostPercent}%` }}
            />
            <div 
              className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-500 via-orange-400 to-amber-400 transition-all duration-75 shadow-md"
              style={{ width: `${p2HpPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] sm:text-[11px] font-mono font-bold text-white drop-shadow">
              <span className="tabular-nums drop-shadow-md">
                {orb2.config.id === 'sans' ? (
                  orb2.hp > 0 ? (
                    orb2.energy > 0 ? (
                      <span className="text-cyan-300 font-black">(NÉ CHIÊU ✨) 1/1 HP</span>
                    ) : (
                      <span className="text-rose-400 font-black animate-pulse">(⚠️ HẾT MP - 1 HIT LÀ CHẾT) 1/1 HP</span>
                    )
                  ) : (
                    <span className="text-slate-400 font-black">(K.O.) 0/1 HP</span>
                  )
                ) : (
                  `${Math.round(orb2.hp)} / ${orb2.config.maxHp}`
                )}
              </span>
              <span className="bg-black/60 px-1 rounded text-rose-300">HP</span>
            </div>
          </div>

          {/* Secondary Sub Bars: Burst & Energy */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {/* Burst Ultimate */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between font-semibold text-[9px] sm:text-[10px]">
                <span className={`flex items-center gap-0.5 ${p2BurstPercent >= 100 ? 'text-amber-300 font-black animate-pulse' : 'text-slate-400'}`}>
                  <Flame className="w-2.5 h-2.5 text-amber-400" /> TUYỆT KỸ
                </span>
                <span className="font-mono text-amber-400">{Math.round(p2BurstPercent)}%</span>
              </div>
              <div className={`h-1.5 bg-slate-950 rounded-full overflow-hidden border ${p2BurstPercent >= 100 ? 'border-amber-400 shadow-sm shadow-amber-400' : 'border-slate-800'}`}>
                <div 
                  className={`h-full transition-all ${p2BurstPercent >= 100 ? 'bg-gradient-to-l from-amber-400 via-rose-500 to-orange-400 animate-pulse' : 'bg-gradient-to-l from-amber-600 to-amber-400'}`} 
                  style={{ width: `${p2BurstPercent}%` }}
                />
              </div>
            </div>

            {/* Energy MP */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-slate-400 font-semibold text-[9px] sm:text-[10px]">
                <span className="flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-rose-400" />
                  {orb2.config.id === 'sans' ? 'THỂ LỰC NÉ' : 'NĂNG LƯỢNG'}
                </span>
                <span className="font-mono">{Math.round(orb2.energy)}/100</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-l from-rose-500 to-orange-400 transition-all" 
                  style={{ width: `${p2EnergyPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Under-Character Skill & Status Bay */}
          <div className="h-9 min-h-[36px] flex items-center justify-end">
            <div 
              className={`w-full flex items-center justify-end gap-2 px-2.5 py-1 rounded-xl border backdrop-blur-md transition-all duration-200 shadow-md text-right ${
                status2.isSkill
                  ? status2.isUlt
                    ? 'bg-gradient-to-l from-slate-950 via-rose-950/95 to-slate-950 border-amber-400 shadow-amber-500/30 ring-1 ring-amber-400/60'
                    : 'bg-slate-950/95 border-rose-500/90 shadow-rose-950/60 ring-1 ring-rose-500/30'
                  : 'bg-slate-950/80 border-slate-800/80'
              }`}
              style={{
                borderColor: status2.isSkill ? status2.color : undefined,
              }}
            >
              <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1">
                <span className={`font-serif font-black text-xs truncate ${status2.isSkill ? 'text-white drop-shadow' : 'text-slate-300'}`}>
                  {status2.text}
                </span>
                <span 
                  className="text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 shrink-0 leading-none"
                  style={{ color: status2.color }}
                >
                  {status2.label}
                </span>
              </div>
              <div 
                className={`w-2 h-2 rounded-full shrink-0 ${status2.isSkill ? (status2.isUlt ? 'animate-ping' : 'animate-pulse') : 'opacity-60'}`}
                style={{ backgroundColor: status2.color }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic Hit Combos (Symmetrically Positioned) */}
      <div className="flex justify-between items-start w-full px-4 sm:px-8 mt-2 pointer-events-none">
        <div className="min-w-0">
          {orb1.comboCount > 1 && (
            <div className="flex flex-col items-start animate-bounce">
              <span className="font-mono font-black text-2xl sm:text-3xl italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300 drop-shadow-[0_2px_12px_rgba(34,211,238,0.7)]">
                {orb1.comboCount} BUMPS!
              </span>
              <span className="font-mono text-[11px] font-bold text-amber-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                COMBO: {orb1.comboDamage} DMG
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 text-right">
          {orb2.comboCount > 1 && (
            <div className="flex flex-col items-end animate-bounce">
              <span className="font-mono font-black text-2xl sm:text-3xl italic tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-rose-500 to-amber-300 drop-shadow-[0_2px_12px_rgba(244,63,94,0.7)]">
                {orb2.comboCount} BUMPS!
              </span>
              <span className="font-mono text-[11px] font-bold text-amber-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                COMBO: {orb2.comboDamage} DMG
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
