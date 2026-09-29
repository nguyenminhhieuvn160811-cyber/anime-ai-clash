/**
 * Anime AI Clash - Đấu Trường Bóng Nảy Năng Lượng
 * Gojo Satoru, Ryomen Sukuna, Sung Jin-Woo (SJW) va đập nảy bóng kịch tính với tuyệt kỹ mãn nhãn!
 */

import React, { useState, useEffect } from 'react';
import { FighterId, AIPersonality, ArenaConfig } from './types/fighter';
import { ARENAS, FIGHTERS } from './game/fighterData';
import { soundEngine } from './services/soundEngine';
import { TopBar } from './components/TopBar';
import { BattleCanvas } from './components/BattleCanvas';
import { FighterSelectModal } from './components/FighterSelectModal';
import { SkillGuideModal } from './components/SkillGuideModal';
import { CombatStatsModal } from './components/CombatStatsModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'arena' | 'select' | 'skills' | 'stats'>('arena');
  const [isMuted, setIsMuted] = useState(false);

  // Match setup: Gojo vs Sukuna as default!
  const [p1Id, setP1Id] = useState<FighterId>('gojo');
  const [p2Id, setP2Id] = useState<FighterId>('sukuna');
  const [p1Personality, setP1Personality] = useState<AIPersonality>('tactician');
  const [p2Personality, setP2Personality] = useState<AIPersonality>('aggressive');
  const [selectedArena, setSelectedArena] = useState<ArenaConfig>(ARENAS[0]);

  // Match History
  const [matchHistory, setMatchHistory] = useState<
    { winner: string; duration: number; p1Dmg: number; p2Dmg: number }[]
  >([]);
  const [lastStats, setLastStats] = useState({
    winnerId: null as number | null,
    roundTime: 0,
    p1DamageDealt: 0,
    p2DamageDealt: 0,
    p1MaxCombo: 0,
    p2MaxCombo: 0,
    p1UltsUsed: 0,
    p2UltsUsed: 0,
    wallBounces: 0,
  });

  const [resetKey, setResetKey] = useState(0);

  // Auto-start dynamic BGM on first user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      soundEngine.startBGM();
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('keydown', handleFirstClick);
    };

    window.addEventListener('click', handleFirstClick);
    window.addEventListener('keydown', handleFirstClick);

    return () => {
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('keydown', handleFirstClick);
      soundEngine.stopBGM();
    };
  }, []);

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleResetMatch = () => {
    setResetKey((k) => k + 1);
  };

  const handleMatchFinished = (winnerName: string, duration: number, p1Dmg: number, p2Dmg: number) => {
    setMatchHistory((prev) => [
      { winner: winnerName, duration, p1Dmg, p2Dmg },
      ...prev.slice(0, 9),
    ]);
    setLastStats({
      winnerId: winnerName === FIGHTERS[p1Id]?.name ? 1 : 2,
      roundTime: duration,
      p1DamageDealt: p1Dmg,
      p2DamageDealt: p2Dmg,
      p1MaxCombo: 9,
      p2MaxCombo: 7,
      p1UltsUsed: 1,
      p2UltsUsed: 1,
      wallBounces: 24,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Bar */}
      <TopBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onResetMatch={handleResetMatch}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        {currentTab === 'arena' && (
          <div className="w-full flex flex-col items-center">
            <BattleCanvas
              key={`${p1Id}-${p2Id}-${selectedArena.id}-${resetKey}`}
              p1Id={p1Id}
              p2Id={p2Id}
              p1Personality={p1Personality}
              p2Personality={p2Personality}
              selectedArena={selectedArena}
              onMatchFinished={handleMatchFinished}
            />

            {/* Quick Hero Banner info */}
            <div className="w-full max-w-6xl px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 mt-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Đấu Trường: {selectedArena.vietnameseName}</span>
                <span>·</span>
                <span>
                  Va Đập: <strong className="text-white">{FIGHTERS[p1Id]?.name}</strong> vs{' '}
                  <strong className="text-white">{FIGHTERS[p2Id]?.name}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentTab('select')} 
                  className="hover:text-cyan-400 underline transition-colors"
                >
                  Đổi Quả Cầu Anime
                </button>
                <span>·</span>
                <button 
                  onClick={() => setCurrentTab('skills')} 
                  className="hover:text-cyan-400 underline transition-colors"
                >
                  Xem Tuyệt Kỹ & Lãnh Địa
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'select' && (
          <FighterSelectModal
            p1Id={p1Id}
            p2Id={p2Id}
            p1Personality={p1Personality}
            p2Personality={p2Personality}
            selectedArena={selectedArena}
            onSelectP1={setP1Id}
            onSelectP2={setP2Id}
            onSelectP1Personality={setP1Personality}
            onSelectP2Personality={setP2Personality}
            onSelectArena={setSelectedArena}
            onConfirm={() => {
              setCurrentTab('arena');
              handleResetMatch();
            }}
          />
        )}

        {currentTab === 'skills' && (
          <SkillGuideModal
            onBackToArena={() => setCurrentTab('arena')}
          />
        )}

        {currentTab === 'stats' && (
          <CombatStatsModal
            stats={lastStats}
            orb1={{
              id: 1,
              config: FIGHTERS[p1Id],
            } as any}
            orb2={{
              id: 2,
              config: FIGHTERS[p2Id],
            } as any}
            matchHistory={matchHistory}
            onBackToArena={() => setCurrentTab('arena')}
            onRematch={() => {
              setCurrentTab('arena');
              handleResetMatch();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-400 flex items-center justify-between max-w-6xl mx-auto">
        <span>© 2026 Anime AI Clash · Game Quả Cầu Nảy Anime: Gojo, Sukuna, Sung Jin-Woo</span>
        <div className="flex items-center gap-4">
          <span>Web Audio API Synthesizer</span>
          <span>·</span>
          <span>Động Cơ Vật Lý Nảy Tròn 60 FPS</span>
        </div>
      </footer>
    </div>
  );
}
