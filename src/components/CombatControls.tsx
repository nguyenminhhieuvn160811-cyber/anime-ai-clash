import React from 'react';
import { Play, Pause, StepForward, RefreshCw, Gamepad2, Bot, ShieldAlert } from 'lucide-react';
import { GameMode, BattleOrbEntity, DamageLevel } from '../types/fighter';

interface CombatControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onStepFrame: () => void;
  speed: number;
  onSetSpeed: (speed: number) => void;
  damageLevel: DamageLevel;
  onSetDamageLevel: (level: DamageLevel) => void;
  gameMode: GameMode;
  onSetGameMode: (mode: GameMode) => void;
  autoRematch: boolean;
  onToggleAutoRematch: () => void;
  orb1: BattleOrbEntity;
  orb2: BattleOrbEntity;
  onTriggerP1Skill: (type: 'skill_1' | 'skill_2' | 'skill_3' | 'ultimate') => void;
  onTriggerP2Skill: (type: 'skill_1' | 'skill_2' | 'skill_3' | 'ultimate') => void;
}

export const CombatControls: React.FC<CombatControlsProps> = ({
  isPaused,
  onTogglePause,
  onStepFrame,
  speed,
  onSetSpeed,
  damageLevel,
  onSetDamageLevel,
  gameMode,
  onSetGameMode,
  autoRematch,
  onToggleAutoRematch,
  orb1,
  orb2,
  onTriggerP1Skill,
  onTriggerP2Skill,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Top Row: Playback & Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Mode & Damage Level Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
            <button
              onClick={() => onSetGameMode('ai_vs_ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                gameMode === 'ai_vs_ai'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI vs AI (Tự Động Quyết Đấu)</span>
            </button>

            <button
              onClick={() => onSetGameMode('player_vs_ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                gameMode === 'player_vs_ai'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Người Chơi Kéo Bắn vs AI</span>
            </button>
          </div>

          {/* Damage Level Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
            <span className="flex items-center gap-1 text-[11px] text-slate-400 px-2 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Sát thương:
            </span>
            <button
              onClick={() => onSetDamageLevel('tiny')}
              title="Đòn đánh rất nhỏ, đấu siêu lâu & dồn dập"
              className={`px-2 py-1 font-semibold rounded-lg transition-all ${
                damageLevel === 'tiny'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Siêu Bé
            </button>
            <button
              onClick={() => onSetDamageLevel('small')}
              title="Đòn đánh bé vừa vặn theo yêu cầu, giao tranh mãn nhãn"
              className={`px-2.5 py-1 font-semibold rounded-lg transition-all ${
                damageLevel === 'small'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bé (Chuẩn)
            </button>
            <button
              onClick={() => onSetDamageLevel('medium')}
              title="Sát thương trung bình"
              className={`px-2 py-1 font-semibold rounded-lg transition-all ${
                damageLevel === 'medium'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vừa
            </button>
          </div>
        </div>

        {/* Playback Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? 'Tiếp Tục' : 'Tạm Dừng'}</span>
          </button>

          <button
            onClick={onStepFrame}
            disabled={!isPaused}
            title="Tua 1 khung hình (khi đang tạm dừng)"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <StepForward className="w-4 h-4" />
          </button>

          {/* Speed Presets */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[0.5, 1.0, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`px-2 py-1 text-xs font-mono font-bold rounded transition-colors ${
                  speed === s
                    ? 'bg-slate-700 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
            <input 
              type="checkbox" 
              checked={autoRematch}
              onChange={onToggleAutoRematch}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="flex items-center gap-1 font-medium">
              <RefreshCw className="w-3 h-3 text-cyan-400" /> Tự đấu lại
            </span>
          </label>
        </div>
      </div>

      {/* Manual Skill Deck: Trigger Hollow Purple, Malevolent Shrine, Arise immediately! */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
        
        {/* P1 Skill Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-[11px] font-bold text-cyan-400 shrink-0 uppercase tracking-wider">
            {orb1.config.name}:
          </span>
          <button
            onClick={() => onTriggerP1Skill('skill_1')}
            disabled={orb1.energy < orb1.config.skills.skill1.manaCost}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 border border-slate-700 transition-all truncate"
          >
            {orb1.config.skills.skill1.vietnameseName}
          </button>
          <button
            onClick={() => onTriggerP1Skill('skill_2')}
            disabled={orb1.energy < orb1.config.skills.skill2.manaCost}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 border border-slate-700 transition-all truncate"
          >
            {orb1.config.skills.skill2.vietnameseName}
          </button>
          <button
            onClick={() => onTriggerP1Skill('skill_3')}
            disabled={orb1.energy < orb1.config.skills.skill3.manaCost}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 border border-slate-700 transition-all truncate"
          >
            {orb1.config.skills.skill3.vietnameseName}
          </button>
          <button
            onClick={() => onTriggerP1Skill('ultimate')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all truncate ${
              orb1.burst >= 100 
                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black animate-pulse shadow-md shadow-amber-500/40' 
                : 'bg-slate-800 text-slate-400 opacity-60'
            }`}
          >
            💥 {orb1.config.skills.ultimate.vietnameseName}
          </button>
        </div>

        {/* P2 Skill Buttons */}
        <div className="flex items-center justify-start md:justify-end gap-2 overflow-x-auto py-1">
          <span className="text-[11px] font-bold text-rose-400 shrink-0 uppercase tracking-wider">
            {orb2.config.name}:
          </span>
          <button
            onClick={() => onTriggerP2Skill('skill_1')}
            disabled={orb2.energy < orb2.config.skills.skill1.manaCost}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 border border-slate-700 transition-all truncate"
          >
            {orb2.config.skills.skill1.vietnameseName}
          </button>
          <button
            onClick={() => onTriggerP2Skill('skill_2')}
            disabled={orb2.energy < orb2.config.skills.skill2.manaCost}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 border border-slate-700 transition-all truncate"
          >
            {orb2.config.skills.skill2.vietnameseName}
          </button>
          <button
            onClick={() => onTriggerP2Skill('skill_3')}
            disabled={orb2.energy < orb2.config.skills.skill3.manaCost}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 border border-slate-700 transition-all truncate"
          >
            {orb2.config.skills.skill3.vietnameseName}
          </button>
          <button
            onClick={() => onTriggerP2Skill('ultimate')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all truncate ${
              orb2.burst >= 100 
                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black animate-pulse shadow-md shadow-amber-500/40' 
                : 'bg-slate-800 text-slate-400 opacity-60'
            }`}
          >
            💥 {orb2.config.skills.ultimate.vietnameseName}
          </button>
        </div>

      </div>

      {/* Slingshot Instructions for Player Mode */}
      {gameMode === 'player_vs_ai' && (
        <div className="flex items-center justify-between text-[11px] text-slate-300 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800/80 font-mono">
          <span className="text-cyan-400 font-bold">🎮 Hướng dẫn Kéo Bắn:</span>
          <span>Nhấp giữ Chuột vào Quả Bóng P1 rồi Kéo lùi lại để ngắm & Thả ra để Bắn siêu tốc!</span>
          <span className="text-amber-400">Phím W/A/S/D: Gia tốc chuyển hướng</span>
        </div>
      )}
    </div>
  );
};
