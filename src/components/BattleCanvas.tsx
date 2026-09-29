import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BallEngine } from '../game/ballEngine';
import { FighterId, AIPersonality, ArenaConfig, GameMode, DamageLevel } from '../types/fighter';
import { BattleHUD } from './BattleHUD';
import { CombatControls } from './CombatControls';
import { soundEngine } from '../services/soundEngine';

interface BattleCanvasProps {
  p1Id: FighterId;
  p2Id: FighterId;
  p1Personality: AIPersonality;
  p2Personality: AIPersonality;
  selectedArena: ArenaConfig;
  onMatchFinished: (winnerName: string, duration: number, p1Dmg: number, p2Dmg: number) => void;
}

export const BattleCanvas: React.FC<BattleCanvasProps> = ({
  p1Id,
  p2Id,
  p1Personality,
  p2Personality,
  selectedArena,
  onMatchFinished,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BallEngine | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [gameMode, setGameMode] = useState<GameMode>('ai_vs_ai');
  const [damageLevel, setDamageLevel] = useState<DamageLevel>('small');
  const [autoRematch, setAutoRematch] = useState(true);

  const [, setTick] = useState(0);

  // Initialize or reconfigure engine
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!engineRef.current) {
      engineRef.current = new BallEngine(canvasRef.current);
    }

    const engine = engineRef.current;
    engine.loadArena(selectedArena);

    const scale = damageLevel === 'tiny' ? 0.2 : damageLevel === 'small' ? 0.35 : 0.75;
    engine.setDamageScale(scale);

    engine.initMatch(
      p1Id,
      p2Id,
      gameMode === 'ai_vs_ai',
      true,
      p1Personality,
      p2Personality
    );

    engine.onStateUpdate = () => {
      setTick((t) => (t + 1) % 1000);
    };

    engine.onGameOver = (winnerId) => {
      const winnerName =
        winnerId === 1
          ? engine.orb1.config.name
          : winnerId === 2
          ? engine.orb2.config.name
          : 'Hòa';
      onMatchFinished(
        winnerName,
        engine.stats.roundTime,
        engine.stats.p1DamageDealt,
        engine.stats.p2DamageDealt
      );

      if (autoRematch) {
        setTimeout(() => {
          if (engineRef.current && engineRef.current.isGameOver) {
            handleReset();
          }
        }, 3400);
      }
    };
  }, [p1Id, p2Id, p1Personality, p2Personality, selectedArena, gameMode, autoRematch]);

  // Sync damage level dynamically to engine
  useEffect(() => {
    if (engineRef.current) {
      const scale = damageLevel === 'tiny' ? 0.2 : damageLevel === 'small' ? 0.35 : 0.75;
      engineRef.current.setDamageScale(scale);
    }
  }, [damageLevel]);

  // Main 60fps Animation Loop with Speed multiplier
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);
      const dt = time - lastTime;

      const targetInterval = 1000 / (60 * speed);
      if (dt >= targetInterval) {
        lastTime = time - (dt % targetInterval);
        if (engineRef.current && !isPaused) {
          engineRef.current.update();
        }
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, speed]);

  // Mouse & Touch Slingshot interaction for Player Mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const engine = engineRef.current;
      if (!engine || gameMode !== 'player_vs_ai' || engine.isGameOver || isPaused) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const pos = getCanvasPos(clientX, clientY);

      const o1 = engine.orb1;
      const dist = Math.hypot(pos.x - o1.x, pos.y - o1.y);

      // Click within or near orb1 to start slingshot drag
      if (dist <= o1.radius + 30) {
        engine.isDraggingP1 = true;
        engine.dragStart = { x: o1.x, y: o1.y };
        engine.dragCurrent = pos;
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const engine = engineRef.current;
      if (!engine || !engine.isDraggingP1) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      engine.dragCurrent = getCanvasPos(clientX, clientY);
    };

    const handlePointerUp = () => {
      const engine = engineRef.current;
      if (!engine || !engine.isDraggingP1) return;

      const o1 = engine.orb1;
      const dx = o1.x - engine.dragCurrent.x;
      const dy = o1.y - engine.dragCurrent.y;
      const dragDist = Math.hypot(dx, dy);

      if (dragDist > 10) {
        // Launch with slingshot impulse!
        const launchSpeed = Math.min(28, dragDist * 0.18);
        const angle = Math.atan2(dy, dx);
        o1.vx = Math.cos(angle) * launchSpeed;
        o1.vy = Math.sin(angle) * launchSpeed;
        o1.speedBuffTimer = 40;
        soundEngine.playWallBounce();
      }

      engine.isDraggingP1 = false;
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);

      canvas.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [gameMode, isPaused]);

  // WASD Steering for Player 1
  useEffect(() => {
    if (gameMode !== 'player_vs_ai') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine || engine.isGameOver || isPaused) return;
      const o1 = engine.orb1;
      const accel = 3.5;

      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          o1.vx -= accel;
          break;
        case 'd':
        case 'arrowright':
          o1.vx += accel;
          break;
        case 'w':
        case 'arrowup':
          o1.vy -= accel;
          break;
        case 's':
        case 'arrowdown':
          o1.vy += accel;
          break;
        case '1':
        case 'j':
          engine.triggerSkill1(o1, engine.orb2);
          break;
        case '2':
        case 'k':
          engine.triggerSkill2(o1, engine.orb2);
          break;
        case '3':
        case 'l':
          engine.triggerSkill3(o1, engine.orb2);
          break;
        case '4':
        case 'u':
          engine.triggerUltimate(o1, engine.orb2);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, isPaused]);

  const handleReset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.initMatch(
        p1Id,
        p2Id,
        gameMode === 'ai_vs_ai',
        true,
        p1Personality,
        p2Personality
      );
      setTick((t) => t + 1);
    }
  }, [p1Id, p2Id, gameMode, p1Personality, p2Personality]);

  const handleStepFrame = useCallback(() => {
    if (engineRef.current && isPaused) {
      engineRef.current.update();
    }
  }, [isPaused]);

  const handleTriggerP1Skill = (type: 'skill_1' | 'skill_2' | 'skill_3' | 'ultimate') => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    if (type === 'skill_1') engine.triggerSkill1(engine.orb1, engine.orb2);
    else if (type === 'skill_2') engine.triggerSkill2(engine.orb1, engine.orb2);
    else if (type === 'skill_3') engine.triggerSkill3(engine.orb1, engine.orb2);
    else if (type === 'ultimate') engine.triggerUltimate(engine.orb1, engine.orb2);
  };

  const handleTriggerP2Skill = (type: 'skill_1' | 'skill_2' | 'skill_3' | 'ultimate') => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    if (type === 'skill_1') engine.triggerSkill1(engine.orb2, engine.orb1);
    else if (type === 'skill_2') engine.triggerSkill2(engine.orb2, engine.orb1);
    else if (type === 'skill_3') engine.triggerSkill3(engine.orb2, engine.orb1);
    else if (type === 'ultimate') engine.triggerUltimate(engine.orb2, engine.orb1);
  };

  const engine = engineRef.current;

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto gap-4 py-4 px-2 sm:px-4">
      {/* Canvas Viewport Frame */}
      <div className="relative w-full aspect-[16/9] max-h-[580px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl shadow-cyan-950/20 select-none cursor-crosshair">
        
        {/* Drawing Plane */}
        <canvas
          ref={canvasRef}
          width={1000}
          height={540}
          className="w-full h-full object-contain block"
        />

        {/* Dynamic Fighting Game HUD Overlay */}
        {engine && (
          <BattleHUD
            orb1={engine.orb1}
            orb2={engine.orb2}
            roundTime={engine.roundTime}
            damageLevel={damageLevel}
          />
        )}
      </div>

      {/* Control Deck */}
      {engine && (
        <CombatControls
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onStepFrame={handleStepFrame}
          speed={speed}
          onSetSpeed={setSpeed}
          damageLevel={damageLevel}
          onSetDamageLevel={setDamageLevel}
          gameMode={gameMode}
          onSetGameMode={setGameMode}
          autoRematch={autoRematch}
          onToggleAutoRematch={() => setAutoRematch(!autoRematch)}
          orb1={engine.orb1}
          orb2={engine.orb2}
          onTriggerP1Skill={handleTriggerP1Skill}
          onTriggerP2Skill={handleTriggerP2Skill}
        />
      )}
    </div>
  );
};
