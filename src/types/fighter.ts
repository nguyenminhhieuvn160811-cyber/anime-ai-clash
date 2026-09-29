export type FighterId = 'gojo' | 'sukuna' | 'sjw' | 'sans';

export type AIPersonality = 'aggressive' | 'tactician' | 'zoner' | 'chaotic';

export type GameMode = 'ai_vs_ai' | 'player_vs_ai';

export type DamageLevel = 'tiny' | 'small' | 'medium';

export interface SkillDefinition {
  id: string;
  name: string;
  vietnameseName: string;
  description: string;
  manaCost: number;
  burstCost: number; // for ultimate
  cooldown: number; // in frames (60fps)
  damage: number;
  knockbackPower: number;
  color: string;
  accentColor: string;
  soundType: 'hollow_purple' | 'dismantle' | 'arise' | 'impact' | 'explosion' | 'gaster_blaster';
  dialogueLine?: string;
}

export interface FighterConfig {
  id: FighterId;
  name: string;
  title: string;
  series: string; // Jujutsu Kaisen, Solo Leveling, Undertale, etc.
  themeColor: string;
  secondaryColor: string;
  avatarUrl: string;
  maxHp: number;
  maxEnergy: number;
  maxBurst: number;
  weight: number; // impact mass
  baseSpeed: number; // velocity impulse
  defense: number;
  radius: number; // orb size in px
  skills: {
    skill1: SkillDefinition;
    skill2: SkillDefinition;
    skill3: SkillDefinition;
    ultimate: SkillDefinition;
  };
  lore: string;
}

export interface ShadowOrb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  damage: number;
}

export interface ActiveSkillNotice {
  name: string;
  vietnameseName: string;
  type: 'skill_1' | 'skill_2' | 'skill_3' | 'ultimate';
  typeLabel: string;
  color: string;
  accentColor?: string;
  timer: number;
  maxTimer: number;
}

export interface BattleOrbEntity {
  id: number; // 1 or 2
  config: FighterConfig;
  isAI: boolean;
  aiPersonality: AIPersonality;

  // 2D Circle Physics
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  spin: number;

  // Combat Stats
  hp: number;
  ghostHp: number;
  energy: number; // MP
  burst: number; // Ultimate gauge (0-100)
  shield: number; // Infinity or barrier
  isInvincible: boolean;
  invincibleTimer: number;

  // State & Cooldowns
  comboCount: number;
  comboDamage: number;
  comboTimer: number;
  skill1Cooldown: number;
  skill2Cooldown: number;
  skill3Cooldown: number;
  isUltimateActive: boolean;
  ultimateTimer: number;

  // Active status buffs
  speedBuffTimer: number;
  isInfinityActive: boolean;
  infinityTimer: number;
  dodgeChance?: number; // For Sans agility dodge
  lastSkillUsed?: ActiveSkillNotice | null;

  // Visuals
  trail: { x: number; y: number; alpha: number; size: number }[];
  shadowMinions: ShadowOrb[];
}

export interface SlashEffect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface ArenaConfig {
  id: string;
  name: string;
  vietnameseName: string;
  backgroundUrl: string;
  ambientLight: string;
  wallBounciness: number;
}

export interface MatchStats {
  winnerId: number | null;
  roundTime: number;
  p1DamageDealt: number;
  p2DamageDealt: number;
  p1MaxCombo: number;
  p2MaxCombo: number;
  p1UltsUsed: number;
  p2UltsUsed: number;
  wallBounces: number;
}
