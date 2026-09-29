import {
  BattleOrbEntity,
  FighterId,
  AIPersonality,
  ArenaConfig,
  MatchStats,
  SlashEffect,
  ShadowOrb
} from '../types/fighter';
import { FIGHTERS, ARENAS } from './fighterData';
import { soundEngine } from '../services/soundEngine';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'fire' | 'lightning' | 'ring' | 'text' | 'slash';
  text?: string;
  x2?: number;
  y2?: number;
}

export interface DomainCutscene {
  active: boolean;
  fighterName: string;
  skillName: string;
  avatarUrl: string;
  themeColor: string;
  duration: number; // frames
  maxDuration: number;
}

export class BallEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public orb1!: BattleOrbEntity;
  public orb2!: BattleOrbEntity;

  public arena: ArenaConfig = ARENAS[0];
  public bgImage: HTMLImageElement | null = null;
  public p1Avatar: HTMLImageElement | null = null;
  public p2Avatar: HTMLImageElement | null = null;

  public particles: Particle[] = [];
  public slashes: SlashEffect[] = [];
  public hollowPurpleOrb: { x: number; y: number; vx: number; vy: number; radius: number; life: number } | null = null;
  public blackHole: { x: number; y: number; life: number; radius: number } | null = null;

  public isPaused: boolean = false;
  public frameCount: number = 0;
  public roundTime: number = 99;
  public isGameOver: boolean = false;
  public winnerId: number | null = null;
  public roundTimerInterval: number | null = null;

  public screenShake: number = 0;
  public hitStopFrames: number = 0;

  // Combat Damage Multiplier (Default 0.35 for low damage endurance battles)
  public damageScale: number = 0.35;

  // Domain Cut-in
  public cutscene: DomainCutscene = {
    active: false,
    fighterName: '',
    skillName: '',
    avatarUrl: '',
    themeColor: '',
    duration: 0,
    maxDuration: 55,
  };

  // Drag slingshot state for Player Mode
  public isDraggingP1: boolean = false;
  public dragStart: { x: number; y: number } = { x: 0, y: 0 };
  public dragCurrent: { x: number; y: number } = { x: 0, y: 0 };

  public stats: MatchStats = {
    winnerId: null,
    roundTime: 0,
    p1DamageDealt: 0,
    p2DamageDealt: 0,
    p1MaxCombo: 0,
    p2MaxCombo: 0,
    p1UltsUsed: 0,
    p2UltsUsed: 0,
    wallBounces: 0,
  };

  public onStateUpdate?: () => void;
  public onGameOver?: (winnerId: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.loadArena(ARENAS[0]);
    this.initMatch('gojo', 'sukuna', true, true);
  }

  public loadArena(arena: ArenaConfig) {
    this.arena = arena;
    this.bgImage = new Image();
    this.bgImage.src = arena.backgroundUrl;
  }

  public initMatch(
    p1Id: FighterId = 'gojo',
    p2Id: FighterId = 'sukuna',
    p1IsAI: boolean = true,
    p2IsAI: boolean = true,
    p1Personality: AIPersonality = 'tactician',
    p2Personality: AIPersonality = 'aggressive'
  ) {
    const config1 = FIGHTERS[p1Id] || FIGHTERS.gojo;
    const config2 = FIGHTERS[p2Id] || FIGHTERS.sukuna;

    this.p1Avatar = new Image();
    this.p1Avatar.src = config1.avatarUrl;

    this.p2Avatar = new Image();
    this.p2Avatar.src = config2.avatarUrl;

    const w = this.canvas.width;
    const h = this.canvas.height;

    this.orb1 = {
      id: 1,
      config: config1,
      isAI: p1IsAI,
      aiPersonality: p1Personality,
      x: w * 0.25,
      y: h * 0.5,
      vx: 4,
      vy: -2,
      radius: config1.radius,
      mass: config1.weight,
      spin: 0,
      hp: config1.maxHp,
      ghostHp: config1.maxHp,
      energy: config1.id === 'sans' ? 100 : 40,
      burst: 20,
      shield: 0,
      isInvincible: false,
      invincibleTimer: 0,
      comboCount: 0,
      comboDamage: 0,
      comboTimer: 0,
      skill1Cooldown: 0,
      skill2Cooldown: 0,
      skill3Cooldown: 0,
      isUltimateActive: false,
      ultimateTimer: 0,
      speedBuffTimer: 0,
      isInfinityActive: false,
      infinityTimer: 0,
      dodgeChance: config1.id === 'sans' ? 1.0 : 0,
      lastSkillUsed: null,
      trail: [],
      shadowMinions: [],
    };

    this.orb2 = {
      id: 2,
      config: config2,
      isAI: p2IsAI,
      aiPersonality: p2Personality,
      x: w * 0.75,
      y: h * 0.5,
      vx: -4,
      vy: 2,
      radius: config2.radius,
      mass: config2.weight,
      spin: 0,
      hp: config2.maxHp,
      ghostHp: config2.maxHp,
      energy: config2.id === 'sans' ? 100 : 40,
      burst: 20,
      shield: 0,
      isInvincible: false,
      invincibleTimer: 0,
      comboCount: 0,
      comboDamage: 0,
      comboTimer: 0,
      skill1Cooldown: 0,
      skill2Cooldown: 0,
      skill3Cooldown: 0,
      isUltimateActive: false,
      ultimateTimer: 0,
      speedBuffTimer: 0,
      isInfinityActive: false,
      infinityTimer: 0,
      dodgeChance: config2.id === 'sans' ? 1.0 : 0,
      lastSkillUsed: null,
      trail: [],
      shadowMinions: [],
    };

    this.particles = [];
    this.slashes = [];
    this.hollowPurpleOrb = null;
    this.blackHole = null;
    this.isGameOver = false;
    this.winnerId = null;
    this.roundTime = 99;
    this.screenShake = 0;
    this.hitStopFrames = 0;

    this.stats = {
      winnerId: null,
      roundTime: 0,
      p1DamageDealt: 0,
      p2DamageDealt: 0,
      p1MaxCombo: 0,
      p2MaxCombo: 0,
      p1UltsUsed: 0,
      p2UltsUsed: 0,
      wallBounces: 0,
    };

    if (this.roundTimerInterval) clearInterval(this.roundTimerInterval);
    this.roundTimerInterval = window.setInterval(() => {
      if (!this.isPaused && !this.isGameOver && this.roundTime > 0) {
        this.roundTime--;
        if (this.roundTime <= 0) {
          this.handleTimeout();
        }
      }
    }, 1000);
  }

  // --- Main Physics Loop ---

  public update() {
    this.frameCount++;

    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      this.render();
      return;
    }

    if (this.cutscene.active) {
      this.cutscene.duration--;
      if (this.cutscene.duration <= 0) {
        this.cutscene.active = false;
      }
      // Physics & battle flow NEVER freeze when skills or ultimates are used!
    }

    if (this.isGameOver) {
      this.updateParticles();
      this.render();
      return;
    }

    // AI decision
    if (this.orb1.isAI) this.updateAI(this.orb1, this.orb2);
    if (this.orb2.isAI) this.updateAI(this.orb2, this.orb1);

    // Update orb physics & abilities
    this.updateOrb(this.orb1);
    this.updateOrb(this.orb2);

    // Check circular collision between Orb1 and Orb2
    this.checkOrbClash(this.orb1, this.orb2);

    // Update minion orbs (SJW Arise soldiers)
    this.updateShadowMinions(this.orb1, this.orb2);
    this.updateShadowMinions(this.orb2, this.orb1);

    // Update Special Active Fields (Hollow Purple & Black Hole)
    this.updateSpecialFields();

    // Update slash marks & particles
    this.updateSlashes();
    this.updateParticles();

    // Check KO
    if (this.orb1.hp <= 0 && !this.isGameOver) {
      this.triggerKO(2);
    } else if (this.orb2.hp <= 0 && !this.isGameOver) {
      this.triggerKO(1);
    }

    this.render();

    if (this.frameCount % 5 === 0 && this.onStateUpdate) {
      this.onStateUpdate();
    }
  }

  // --- AI Controller for Balls ---

  private updateAI(self: BattleOrbEntity, opponent: BattleOrbEntity) {
    // Regenerate energy
    if (self.config.id === 'gojo') {
      // Six Eyes: Rapid cursed energy regen
      if (self.energy < self.config.maxEnergy) self.energy = Math.min(100, self.energy + 0.35);
    } else if (self.config.id === 'sans') {
      // Sans: Stamina regenerates slowly only when moving gently
      if (self.energy < self.config.maxEnergy && Math.hypot(self.vx, self.vy) < 8) {
        self.energy = Math.min(100, self.energy + 0.05);
      }
    } else {
      if (self.energy < self.config.maxEnergy) self.energy = Math.min(100, self.energy + 0.2);
    }

    const dx = opponent.x - self.x;
    const dy = opponent.y - self.y;
    const dist = Math.hypot(dx, dy);

    // Ultimate trigger check
    if (self.burst >= 100 && Math.random() < 0.08) {
      this.triggerUltimate(self, opponent);
      return;
    }

    // AI Slingshot Attack Impulse
    if (this.frameCount % 40 === (self.id === 1 ? 0 : 20)) {
      const angle = Math.atan2(dy, dx);
      let power = self.config.baseSpeed;

      if (self.aiPersonality === 'aggressive') power *= 1.35;
      else if (self.aiPersonality === 'tactician') power *= 1.1;

      // Predict opponent trajectory slightly
      const leadX = opponent.x + opponent.vx * 10;
      const leadY = opponent.y + opponent.vy * 10;
      const leadAngle = Math.atan2(leadY - self.y, leadX - self.x);

      self.vx += Math.cos(leadAngle) * (power * 0.45);
      self.vy += Math.sin(leadAngle) * (power * 0.45);

      // Play rush sound occasionally
      if (Math.random() < 0.4) soundEngine.playWallBounce();
    }

    // Skill 1 trigger
    if (self.skill1Cooldown <= 0 && self.energy >= self.config.skills.skill1.manaCost) {
      if (self.config.id === 'gojo' && dist < 140) {
        this.triggerSkill1(self, opponent);
      } else if (self.config.id === 'sukuna' && dist < 280) {
        this.triggerSkill1(self, opponent);
      } else if (self.config.id === 'sjw' && dist > 180) {
        this.triggerSkill1(self, opponent);
      } else if (Math.random() < 0.05) {
        this.triggerSkill1(self, opponent);
      }
    }

    // Skill 2 trigger
    if (self.skill2Cooldown <= 0 && self.energy >= self.config.skills.skill2.manaCost) {
      if (self.config.id === 'sukuna' && dist > 200) {
        this.triggerSkill2(self, opponent);
      } else if (self.config.id === 'gojo' && dist > 150) {
        this.triggerSkill2(self, opponent);
      } else if (self.config.id === 'sjw' && self.shadowMinions.length === 0) {
        this.triggerSkill2(self, opponent);
      } else if (self.config.id === 'sans' && dist > 140) {
        this.triggerSkill2(self, opponent);
      } else if (Math.random() < 0.04) {
        this.triggerSkill2(self, opponent);
      }
    }

    // Skill 3 trigger
    if (self.skill3Cooldown <= 0 && self.energy >= self.config.skills.skill3.manaCost) {
      if (self.config.id === 'gojo' && dist < 180) {
        this.triggerSkill3(self, opponent);
      } else if (self.config.id === 'sukuna' && dist > 160) {
        this.triggerSkill3(self, opponent);
      } else if (self.config.id === 'sjw' && dist > 180) {
        this.triggerSkill3(self, opponent);
      } else if (self.config.id === 'sans' && dist > 130) {
        this.triggerSkill3(self, opponent);
      } else if (Math.random() < 0.04) {
        this.triggerSkill3(self, opponent);
      }
    }
  }

  // --- Orb Physics & Wall Bounce ---

  private updateOrb(orb: BattleOrbEntity) {
    if (orb.skill1Cooldown > 0) orb.skill1Cooldown--;
    if (orb.skill2Cooldown > 0) orb.skill2Cooldown--;
    if (orb.skill3Cooldown > 0) orb.skill3Cooldown--;
    if (orb.invincibleTimer > 0) {
      orb.invincibleTimer--;
      if (orb.invincibleTimer <= 0) orb.isInvincible = false;
    }

    if (orb.infinityTimer > 0) {
      orb.infinityTimer--;
      if (orb.infinityTimer <= 0) orb.isInfinityActive = false;
    }

    if (orb.ultimateTimer > 0) {
      orb.ultimateTimer--;
      if (orb.ultimateTimer <= 0) orb.isUltimateActive = false;
    }

    if (orb.speedBuffTimer > 0) orb.speedBuffTimer--;

    // Countdown active skill notification
    if (orb.lastSkillUsed) {
      orb.lastSkillUsed.timer--;
      if (orb.lastSkillUsed.timer <= 0) {
        orb.lastSkillUsed = null;
      }
    }

    // Smooth Ghost HP
    if (orb.ghostHp > orb.hp) {
      orb.ghostHp -= (orb.ghostHp - orb.hp) * 0.08;
      if (Math.abs(orb.ghostHp - orb.hp) < 1) orb.ghostHp = orb.hp;
    }

    // Combo reset
    if (orb.comboTimer > 0) {
      orb.comboTimer--;
      if (orb.comboTimer <= 0) {
        orb.comboCount = 0;
        orb.comboDamage = 0;
      }
    }

    // Passive Energy Regens & Fighter Passives
    if (orb.config.id === 'gojo') {
      if (orb.energy < orb.config.maxEnergy) orb.energy = Math.min(100, orb.energy + 0.16);
    } else if (orb.config.id === 'sans') {
      // Sans Stamina slowly recovers when speed is low
      const curSpd = Math.hypot(orb.vx, orb.vy);
      if (orb.energy < orb.config.maxEnergy && curSpd < 8) {
        orb.energy = Math.min(100, orb.energy + 0.05);
      }
      // When exhausted (0 energy), spawn sweat droplets
      if (orb.energy <= 0 && this.frameCount % 24 === 0) {
        this.spawnParticle({
          x: orb.x + (Math.random() - 0.5) * 24,
          y: orb.y - orb.radius - 8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -2,
          size: 14,
          color: '#38bdf8',
          alpha: 1,
          life: 25,
          maxLife: 25,
          type: 'text',
          text: '💦',
        });
      }
    } else {
      if (orb.energy < orb.config.maxEnergy) orb.energy = Math.min(100, orb.energy + 0.12);
    }

    // Velocity Cap
    let maxSpeed = orb.speedBuffTimer > 0 ? 30 : 20;
    if (orb.config.id === 'sans' && orb.energy <= 0) {
      maxSpeed = 13; // Exhausted Sans slows down
    }
    const currentSpeed = Math.hypot(orb.vx, orb.vy);
    if (currentSpeed > maxSpeed) {
      orb.vx = (orb.vx / currentSpeed) * maxSpeed;
      orb.vy = (orb.vy / currentSpeed) * maxSpeed;
    }

    // Move
    orb.x += orb.vx;
    orb.y += orb.vy;

    // Spin
    orb.spin += (orb.vx * 0.05);

    // Friction / Drag (slight air resistance)
    orb.vx *= 0.992;
    orb.vy *= 0.992;

    // Trail history
    orb.trail.push({ x: orb.x, y: orb.y, alpha: 0.7, size: orb.radius });
    if (orb.trail.length > 8) orb.trail.shift();
    orb.trail.forEach(t => t.alpha *= 0.85);

    // Wall Bouncing Bounds
    const w = this.canvas.width;
    const h = this.canvas.height;
    const bounciness = this.arena.wallBounciness;
    let bounced = false;

    // Left
    if (orb.x - orb.radius < 24) {
      orb.x = 24 + orb.radius;
      orb.vx = -orb.vx * bounciness;
      bounced = true;
    }
    // Right
    if (orb.x + orb.radius > w - 24) {
      orb.x = w - 24 - orb.radius;
      orb.vx = -orb.vx * bounciness;
      bounced = true;
    }
    // Top
    if (orb.y - orb.radius < 24) {
      orb.y = 24 + orb.radius;
      orb.vy = -orb.vy * bounciness;
      bounced = true;
    }
    // Bottom
    if (orb.y + orb.radius > h - 24) {
      orb.y = h - 24 - orb.radius;
      orb.vy = -orb.vy * bounciness;
      bounced = true;
    }

    if (bounced) {
      this.stats.wallBounces++;
      soundEngine.playWallBounce();
      this.spawnWallSparks(orb.x, orb.y, orb.config.themeColor);

      // Wall slam damage when slammed hard (> 15 speed) - Sans is immune unless exhausted (0 energy)
      if (currentSpeed > 15) {
        if (orb.config.id === 'sans') {
          if (orb.energy <= 0) {
            orb.hp = 0;
            this.spawnTextParticle('FATAL HIT! 999999', orb.x, orb.y - 20, '#ef4444');
            soundEngine.playKO();
          }
        } else {
          const wallDamage = Math.max(1, Math.round(currentSpeed * 0.35 * this.damageScale));
          orb.hp = Math.max(0, orb.hp - wallDamage);
          this.spawnTextParticle(`-${wallDamage}`, orb.x, orb.y - 20, '#fb7185');
          this.screenShake = 4;
        }
      }
    }
  }

  // --- Circular Collision & Impulse Math ---

  private checkOrbClash(o1: BattleOrbEntity, o2: BattleOrbEntity) {
    const dx = o2.x - o1.x;
    const dy = o2.y - o1.y;
    const dist = Math.hypot(dx, dy);
    const minDist = o1.radius + o2.radius;

    if (dist < minDist && dist > 0) {
      // Normal vector
      const nx = dx / dist;
      const ny = dy / dist;

      // Relative velocity
      const kx = o1.vx - o2.vx;
      const ky = o1.vy - o2.vy;
      const relativeSpeed = kx * nx + ky * ny;

      // Only resolve if moving towards each other
      if (relativeSpeed > 0) {
        // Restitution (elasticity)
        const e = 0.98;
        const impulse = (-(1 + e) * relativeSpeed) / (1 / o1.mass + 1 / o2.mass);

        // Apply impulse to velocities
        o1.vx += (impulse / o1.mass) * nx;
        o1.vy += (impulse / o1.mass) * ny;
        o2.vx -= (impulse / o2.mass) * nx;
        o2.vy -= (impulse / o2.mass) * ny;

        // Separate orbs to eliminate overlap
        const overlap = minDist - dist;
        o1.x -= nx * overlap * 0.5;
        o1.y -= ny * overlap * 0.5;
        o2.x += nx * overlap * 0.5;
        o2.y += ny * overlap * 0.5;

        // Kinetic Clash Speed
        const clashImpact = Math.abs(relativeSpeed);

        // Scaled damage
        const baseImpactDmg = clashImpact * 1.35 * this.damageScale;
        let dmgTo1 = Math.max(1, Math.round(baseImpactDmg * o1.config.defense));
        let dmgTo2 = Math.max(1, Math.round(baseImpactDmg * o2.config.defense));

        // 1. Check Gojo Infinity Barrier! (Blocks 100% damage, deals fair barrier pushback)
        if (o1.isInfinityActive) {
          dmgTo1 = 0;
          dmgTo2 = Math.max(6, Math.round(baseImpactDmg * 0.85));
          o2.vx += nx * 14;
          o2.vy += ny * 14;
          this.spawnTextParticle('VÔ HẠ HẠN', o1.x, o1.y - 30, '#38bdf8');
          soundEngine.playOrbClash(2.0);
        } else if (o2.isInfinityActive) {
          dmgTo2 = 0;
          dmgTo1 = Math.max(6, Math.round(baseImpactDmg * 0.85));
          o1.vx -= nx * 14;
          o1.vy -= ny * 14;
          this.spawnTextParticle('VÔ HẠ HẠN', o2.x, o2.y - 30, '#38bdf8');
          soundEngine.playOrbClash(2.0);
        }

        // 2. Check Sans: 100% Dodge while Energy > 0, fatal hit when Energy <= 0!
        if (o1.config.id === 'sans') {
          if (o1.energy > 0) {
            dmgTo1 = 0;
            o1.energy = Math.max(0, o1.energy - 10);
            o1.vx += (Math.random() - 0.5) * 18;
            o1.vy += (Math.random() - 0.5) * 18;
            this.spawnTextParticle('MISS!', o1.x, o1.y - 25, '#38bdf8');
            soundEngine.playWallBounce();
            if (o1.energy <= 0) {
              this.spawnTextParticle('💦 HẾT THỂ LỰC!', o1.x, o1.y - 45, '#ef4444');
            }
          } else {
            dmgTo1 = o1.hp; // Fatal!
            this.spawnTextParticle('FATAL HIT! 999999', o1.x, o1.y - 35, '#ef4444');
            this.screenShake = 24;
            soundEngine.playKO();
          }
        }
        if (o2.config.id === 'sans') {
          if (o2.energy > 0) {
            dmgTo2 = 0;
            o2.energy = Math.max(0, o2.energy - 10);
            o2.vx += (Math.random() - 0.5) * 18;
            o2.vy += (Math.random() - 0.5) * 18;
            this.spawnTextParticle('MISS!', o2.x, o2.y - 25, '#38bdf8');
            soundEngine.playWallBounce();
            if (o2.energy <= 0) {
              this.spawnTextParticle('💦 HẾT THỂ LỰC!', o2.x, o2.y - 45, '#ef4444');
            }
          } else {
            dmgTo2 = o2.hp; // Fatal!
            this.spawnTextParticle('FATAL HIT! 999999', o2.x, o2.y - 35, '#ef4444');
            this.screenShake = 24;
            soundEngine.playKO();
          }
        }

        // Apply damage
        o1.hp = Math.max(0, o1.hp - dmgTo1);
        o2.hp = Math.max(0, o2.hp - dmgTo2);

        this.stats.p1DamageDealt += dmgTo2;
        this.stats.p2DamageDealt += dmgTo1;

        // Resource & Burst Meter (Sans doesn't gain stamina from getting hit)
        o1.burst = Math.min(100, o1.burst + clashImpact * 1.4);
        o2.burst = Math.min(100, o2.burst + clashImpact * 1.4);
        if (o1.config.id !== 'sans') o1.energy = Math.min(100, o1.energy + 8);
        if (o2.config.id !== 'sans') o2.energy = Math.min(100, o2.energy + 8);

        // Combos
        o1.comboCount++;
        o1.comboDamage += dmgTo2;
        o1.comboTimer = 70;
        if (o1.comboCount > this.stats.p1MaxCombo) this.stats.p1MaxCombo = o1.comboCount;

        o2.comboCount++;
        o2.comboDamage += dmgTo1;
        o2.comboTimer = 70;
        if (o2.comboCount > this.stats.p2MaxCombo) this.stats.p2MaxCombo = o2.comboCount;

        // Audio & Visual Shockwaves
        soundEngine.playOrbClash(Math.min(2.5, clashImpact * 0.15));
        this.screenShake = Math.min(18, clashImpact * 1.2);
        this.hitStopFrames = clashImpact > 10 ? 4 : 2;

        const midX = (o1.x + o2.x) / 2;
        const midY = (o1.y + o2.y) / 2;
        this.spawnClashSparks(midX, midY, o1.config.themeColor, o2.config.themeColor, clashImpact);

        if (dmgTo2 >= 1) this.spawnTextParticle(`-${dmgTo2}`, o2.x, o2.y - 40, o1.config.themeColor);
        if (dmgTo1 >= 1) this.spawnTextParticle(`-${dmgTo1}`, o1.x, o1.y - 40, o2.config.themeColor);
      }
    }
  }

  // --- Skills & Ultimates Execution ---

  public setDamageScale(scale: number) {
    this.damageScale = Math.max(0.1, scale);
  }

  /**
   * Centralized damage application handling:
   * 1. Gojo Infinity Barrier: Blocks 100% of damage and reflects counter damage.
   * 2. Sans 1 HP & Dodge: Dodges 100% of attacks while Energy > 0 (burning stamina).
   *    When Energy == 0 (Exhausted), Sans gets hit fatally (1 HP lost -> K.O.!).
   */
  public applyDamageToOrb(
    target: BattleOrbEntity,
    attacker: BattleOrbEntity | null,
    rawDamage: number,
    damageColor: string,
    isUnblockable: boolean = false
  ): boolean {
    if (this.isGameOver || target.hp <= 0) return false;

    // 1. Gojo Infinity Barrier (Blocks 100% non-unblockable damage & counters)
    if (target.isInfinityActive && !isUnblockable) {
      this.spawnTextParticle('VÔ HẠ HẠN', target.x, target.y - 35, '#38bdf8');
      this.spawnRing(target.x, target.y, target.radius + 24, '#38bdf8');
      soundEngine.playOrbClash(2.0);

      if (attacker) {
        const dx = attacker.x - target.x;
        const dy = attacker.y - target.y;
        const d = Math.hypot(dx, dy) || 1;
        attacker.vx += (dx / d) * 12;
        attacker.vy += (dy / d) * 12;
        const counterDmg = Math.max(4, Math.round(rawDamage * 0.20));
        if (attacker.config.id === 'sans') {
          if (attacker.energy > 0) {
            attacker.energy = Math.max(0, attacker.energy - 6);
            this.spawnTextParticle('MISS!', attacker.x, attacker.y - 25, '#38bdf8');
          } else {
            attacker.hp = 0;
            this.spawnTextParticle('FATAL HIT! 999999', attacker.x, attacker.y - 35, '#ef4444');
            soundEngine.playKO();
          }
        } else {
          attacker.hp = Math.max(0, attacker.hp - counterDmg);
          this.spawnTextParticle(`PHẢN ĐÒN -${counterDmg}`, attacker.x, attacker.y - 30, '#38bdf8');
        }
      }
      return false;
    }

    // 2. Sans 1 HP Dodge / Exhaustion Mechanic
    if (target.config.id === 'sans') {
      if (target.energy > 0) {
        // Sans dodges! Consumes 12 energy
        target.energy = Math.max(0, target.energy - 12);

        const evadeAngle = Math.random() * Math.PI * 2;
        const evadeDist = 42 + Math.random() * 26;
        const oldX = target.x;
        const oldY = target.y;

        target.x = Math.max(45, Math.min(this.canvas.width - 45, target.x + Math.cos(evadeAngle) * evadeDist));
        target.y = Math.max(45, Math.min(this.canvas.height - 45, target.y + Math.sin(evadeAngle) * evadeDist));
        target.vx += Math.cos(evadeAngle) * 10;
        target.vy += Math.sin(evadeAngle) * 10;

        this.spawnRing(oldX, oldY, target.radius + 15, '#38bdf8');
        this.spawnRing(target.x, target.y, target.radius + 12, '#ffffff');
        this.spawnTextParticle('MISS!', oldX, oldY - 25, '#38bdf8');
        soundEngine.playWallBounce();

        if (target.energy <= 0) {
          this.spawnTextParticle('💦 HẾT THỂ LỰC!', target.x, target.y - 45, '#ef4444');
          this.screenShake = 6;
        }
        return false;
      } else {
        // Sans has 0 energy -> Exhausted! Takes fatal hit!
        target.hp = 0;
        this.spawnTextParticle('FATAL HIT! 999999', target.x, target.y - 35, '#ef4444');
        this.screenShake = 26;
        soundEngine.playKO();
        this.spawnRing(target.x, target.y, 80, '#ef4444');
        this.spawnRing(target.x, target.y, 140, '#facc15');

        if (attacker) {
          if (attacker.id === 1) this.stats.p1DamageDealt += 1;
          else this.stats.p2DamageDealt += 1;
        }
        return true;
      }
    }

    // 3. Normal damage
    const dmg = Math.max(1, Math.round(rawDamage * target.config.defense));
    target.hp = Math.max(0, target.hp - dmg);
    this.spawnTextParticle(`-${dmg}`, target.x, target.y - 30, damageColor);

    if (attacker) {
      if (attacker.id === 1) this.stats.p1DamageDealt += dmg;
      else this.stats.p2DamageDealt += dmg;
    }
    return true;
  }

  public triggerSkill1(caster: BattleOrbEntity, target: BattleOrbEntity) {
    const sk = caster.config.skills.skill1;
    if (caster.energy < sk.manaCost || caster.skill1Cooldown > 0) return;

    caster.energy -= sk.manaCost;
    caster.skill1Cooldown = sk.cooldown;
    const appliedDmg = Math.max(1, Math.round(sk.damage * this.damageScale));

    // Register active skill notification under character in HUD
    caster.lastSkillUsed = {
      name: sk.name,
      vietnameseName: sk.vietnameseName,
      type: 'skill_1',
      typeLabel: 'KỸ NĂNG 1',
      color: sk.color || caster.config.themeColor,
      accentColor: sk.accentColor || '#ffffff',
      timer: 110,
      maxTimer: 110,
    };
    if (this.onStateUpdate) this.onStateUpdate();

    if (caster.config.id === 'gojo') {
      // Vô Hạ Hạn (Infinity Barrier - Tactical 80 frames shield duration ~ 1.33s)
      caster.isInfinityActive = true;
      caster.infinityTimer = 80;
      soundEngine.playOrbClash(2.0);
      this.screenShake = 10;
      this.spawnRing(caster.x, caster.y, 75, '#38bdf8');
      this.spawnRing(caster.x, caster.y, 110, '#ffffff');
      this.spawnRing(caster.x, caster.y, 145, '#0284c7');
      for (let i = 0; i < 20; i++) {
        const ang = (Math.PI * 2 / 20) * i;
        this.spawnParticle({
          x: caster.x,
          y: caster.y,
          vx: Math.cos(ang) * 8,
          vy: Math.sin(ang) * 8,
          size: Math.random() * 4 + 3,
          color: i % 2 === 0 ? '#38bdf8' : '#ffffff',
          alpha: 1,
          life: 20,
          maxLife: 20,
          type: 'spark',
        });
      }
    } else if (caster.config.id === 'sans') {
      // Gaster Blaster Beam
      soundEngine.playGasterBlaster();
      this.screenShake = 16;
      const angle = Math.atan2(target.y - caster.y, target.x - caster.x);
      const beamLen = 850;
      this.slashes.push({
        x1: caster.x,
        y1: caster.y,
        x2: caster.x + Math.cos(angle) * beamLen,
        y2: caster.y + Math.sin(angle) * beamLen,
        color: '#38bdf8',
        life: 28,
        maxLife: 28,
      });
      this.slashes.push({
        x1: caster.x,
        y1: caster.y,
        x2: caster.x + Math.cos(angle) * beamLen,
        y2: caster.y + Math.sin(angle) * beamLen,
        color: '#ffffff',
        life: 20,
        maxLife: 20,
      });

      this.spawnRing(caster.x + Math.cos(angle) * 40, caster.y + Math.sin(angle) * 40, 70, '#38bdf8');
      this.spawnRing(caster.x + Math.cos(angle) * 40, caster.y + Math.sin(angle) * 40, 110, '#ffffff');

      for (let i = 0; i < 22; i++) {
        const distR = Math.random() * 500;
        this.spawnParticle({
          x: caster.x + Math.cos(angle) * distR + (Math.random() - 0.5) * 30,
          y: caster.y + Math.sin(angle) * distR + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * 8 + (Math.random() - 0.5) * 6,
          vy: Math.sin(angle) * 8 + (Math.random() - 0.5) * 6,
          size: Math.random() * 6 + 3,
          color: Math.random() < 0.5 ? '#38bdf8' : '#ffffff',
          alpha: 1,
          life: 24,
          maxLife: 24,
          type: 'spark',
        });
      }

      target.vx += Math.cos(angle) * 24;
      target.vy += Math.sin(angle) * 24;
      this.applyDamageToOrb(target, caster, appliedDmg, '#38bdf8');
    } else if (caster.config.id === 'sukuna') {
      // Trảm Kích Giải & Bát (Dismantle Slashes)
      soundEngine.playDismantle();
      this.screenShake = 14;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i + (Math.random() - 0.5) * 0.3;
        const len = 420;
        this.slashes.push({
          x1: target.x - Math.cos(angle) * len,
          y1: target.y - Math.sin(angle) * len,
          x2: target.x + Math.cos(angle) * len,
          y2: target.y + Math.sin(angle) * len,
          color: '#ef4444',
          life: 25,
          maxLife: 25,
        });
      }
      for (let i = 0; i < 18; i++) {
        this.spawnParticle({
          x: target.x + (Math.random() - 0.5) * 60,
          y: target.y + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          size: Math.random() * 5 + 3,
          color: Math.random() < 0.6 ? '#dc2626' : '#f97316',
          alpha: 1,
          life: 20,
          maxLife: 20,
          type: 'spark',
        });
      }
      this.spawnRing(target.x, target.y, 90, '#ef4444');
      this.applyDamageToOrb(target, caster, appliedDmg, '#ef4444');
    } else if (caster.config.id === 'sjw') {
      // Thần Tốc Đột Kích (Shadow Dash Behind)
      soundEngine.playDismantle();
      this.screenShake = 12;
      const oldX = caster.x;
      const oldY = caster.y;

      const angle = Math.atan2(target.vy, target.vx) || 0;
      caster.x = target.x - Math.cos(angle) * (target.radius + caster.radius + 12);
      caster.y = target.y - Math.sin(angle) * (target.radius + caster.radius + 12);
      caster.vx = Math.cos(angle) * 26;
      caster.vy = Math.sin(angle) * 26;

      this.spawnParticle({
        x: oldX,
        y: oldY,
        x2: caster.x,
        y2: caster.y,
        vx: 0,
        vy: 0,
        size: 5,
        color: '#c084fc',
        alpha: 1,
        life: 14,
        maxLife: 14,
        type: 'slash',
      });

      this.slashes.push({
        x1: target.x - 60,
        y1: target.y - 60,
        x2: target.x + 60,
        y2: target.y + 60,
        color: '#a855f7',
        life: 22,
        maxLife: 22,
      });
      this.slashes.push({
        x1: target.x - 60,
        y1: target.y + 60,
        x2: target.x + 60,
        y2: target.y - 60,
        color: '#38bdf8',
        life: 22,
        maxLife: 22,
      });

      this.spawnRing(oldX, oldY, 70, '#4c1d95');
      this.spawnRing(caster.x, caster.y, 90, '#8b5cf6');
      for (let i = 0; i < 16; i++) {
        this.spawnParticle({
          x: target.x,
          y: target.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          size: Math.random() * 5 + 3,
          color: '#a855f7',
          alpha: 1,
          life: 20,
          maxLife: 20,
          type: 'spark',
        });
      }

      this.applyDamageToOrb(target, caster, appliedDmg, '#a855f7');
    } else {
      // Generic skill
      caster.vx *= 2;
      caster.vy *= 2;
      this.applyDamageToOrb(target, caster, appliedDmg, caster.config.themeColor);
      soundEngine.playOrbClash(1.5);
    }
  }

  public triggerSkill2(caster: BattleOrbEntity, target: BattleOrbEntity) {
    const sk = caster.config.skills.skill2;
    if (caster.energy < sk.manaCost || caster.skill2Cooldown > 0) return;

    caster.energy -= sk.manaCost;
    caster.skill2Cooldown = sk.cooldown;
    const appliedDmg = Math.max(1, Math.round(sk.damage * this.damageScale));

    // Register active skill notification under character in HUD
    caster.lastSkillUsed = {
      name: sk.name,
      vietnameseName: sk.vietnameseName,
      type: 'skill_2',
      typeLabel: 'KỸ NĂNG 2',
      color: sk.color || caster.config.themeColor,
      accentColor: sk.accentColor || '#ffffff',
      timer: 110,
      maxTimer: 110,
    };
    if (this.onStateUpdate) this.onStateUpdate();

    if (caster.config.id === 'gojo') {
      // Xích & Thương (Black Hole Attraction & Red Blast - Balanced Singularity)
      soundEngine.playHollowPurple();
      this.blackHole = {
        x: (caster.x + target.x) / 2,
        y: (caster.y + target.y) / 2,
        life: 75,
        radius: 130,
      };
      this.screenShake = 14;
      this.spawnRing(this.blackHole.x, this.blackHole.y, 70, '#f43f5e');
      this.spawnRing(this.blackHole.x, this.blackHole.y, 110, '#0284c7');
      for (let i = 0; i < 22; i++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.random() * 90 + 20;
        this.spawnParticle({
          x: this.blackHole.x + Math.cos(ang) * rad,
          y: this.blackHole.y + Math.sin(ang) * rad,
          vx: -Math.cos(ang) * 4,
          vy: -Math.sin(ang) * 4,
          size: Math.random() * 4 + 3,
          color: Math.random() < 0.5 ? '#f43f5e' : '#38bdf8',
          alpha: 1,
          life: 22,
          maxLife: 22,
          type: 'spark',
        });
      }
      this.applyDamageToOrb(target, caster, appliedDmg, '#f43f5e');
    } else if (caster.config.id === 'sukuna') {
      // Hỏa Tiễn Fuga: Khai Mở
      soundEngine.playHollowPurple();
      this.screenShake = 16;
      const angle = Math.atan2(target.y - caster.y, target.x - caster.x);
      caster.vx = Math.cos(angle) * 34;
      caster.vy = Math.sin(angle) * 34;
      caster.speedBuffTimer = 75;
      this.spawnRing(caster.x, caster.y, 90, '#ea580c');
      this.spawnRing(caster.x, caster.y, 150, '#facc15');
      for (let i = 0; i < 24; i++) {
        this.spawnParticle({
          x: caster.x,
          y: caster.y,
          vx: (Math.random() - 0.5) * 14,
          vy: (Math.random() - 0.5) * 14,
          size: Math.random() * 7 + 4,
          color: Math.random() < 0.6 ? '#f97316' : '#facc15',
          alpha: 1,
          life: 25,
          maxLife: 25,
          type: 'fire',
        });
      }
      this.applyDamageToOrb(target, caster, appliedDmg, '#ea580c');
    } else if (caster.config.id === 'sjw') {
      // TRỖI DẬY (ARISE! - 3 Shadow Minions)
      soundEngine.playArise();
      this.screenShake = 15;
      caster.shadowMinions = [];
      for (let i = 0; i < 3; i++) {
        const offsetAngle = (Math.PI * 2 / 3) * i;
        caster.shadowMinions.push({
          id: Math.random(),
          x: caster.x + Math.cos(offsetAngle) * 55,
          y: caster.y + Math.sin(offsetAngle) * 55,
          vx: Math.cos(offsetAngle) * 15,
          vy: Math.sin(offsetAngle) * 15,
          radius: 25,
          life: 420,
          maxLife: 420,
          damage: 6,
        });
      }
      this.spawnRing(caster.x, caster.y, 110, '#8b5cf6');
      this.spawnRing(caster.x, caster.y, 160, '#38bdf8');
      for (let i = 0; i < 22; i++) {
        this.spawnParticle({
          x: caster.x,
          y: caster.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          size: Math.random() * 6 + 3,
          color: '#7c3aed',
          alpha: 1,
          life: 24,
          maxLife: 24,
          type: 'spark',
        });
      }
    } else if (caster.config.id === 'sans') {
      // Blue Soul Gravity Slam
      soundEngine.playOrbClash(2.2);
      this.screenShake = 18;
      target.vy = 28;
      target.vx = target.x > this.canvas.width / 2 ? 18 : -18;
      this.spawnRing(target.x, target.y, 80, '#2563eb');
      this.spawnRing(target.x, target.y, 140, '#60a5fa');
      for (let i = 0; i < 20; i++) {
        this.spawnParticle({
          x: target.x,
          y: target.y,
          vx: (Math.random() - 0.5) * 12,
          vy: Math.random() * 12 + 4,
          size: Math.random() * 6 + 3,
          color: '#3b82f6',
          alpha: 1,
          life: 22,
          maxLife: 22,
          type: 'spark',
        });
      }
      this.applyDamageToOrb(target, caster, appliedDmg, '#2563eb');
    } else {
      caster.vx *= 2.5;
      caster.vy *= 2.5;
      this.applyDamageToOrb(target, caster, appliedDmg, caster.config.themeColor);
      soundEngine.playOrbClash(2.0);
    }
  }

  public triggerSkill3(caster: BattleOrbEntity, target: BattleOrbEntity) {
    const sk = caster.config.skills.skill3;
    if (caster.energy < sk.manaCost || caster.skill3Cooldown > 0) return;

    caster.energy -= sk.manaCost;
    caster.skill3Cooldown = sk.cooldown;
    const appliedDmg = Math.max(1, Math.round(sk.damage * this.damageScale));

    caster.lastSkillUsed = {
      name: sk.name,
      vietnameseName: sk.vietnameseName,
      type: 'skill_3',
      typeLabel: 'KỸ NĂNG 3',
      color: sk.color || caster.config.themeColor,
      accentColor: sk.accentColor || '#ffffff',
      timer: 110,
      maxTimer: 110,
    };
    if (this.onStateUpdate) this.onStateUpdate();

    if (caster.config.id === 'gojo') {
      // Hắc Thiểm (Black Flash) - Spatial spark explosion & Zone Awakening!
      soundEngine.playBlackFlash();
      this.screenShake = 18;
      const angle = Math.atan2(target.y - caster.y, target.x - caster.x);
      caster.vx = Math.cos(angle) * 28;
      caster.vy = Math.sin(angle) * 28;
      caster.speedBuffTimer = 50; // Balanced Zone boost

      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = Math.random() * 12 + 4;
        this.spawnParticle({
          x: (caster.x + target.x) / 2,
          y: (caster.y + target.y) / 2,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          size: Math.random() * 6 + 3,
          color: Math.random() < 0.6 ? '#020617' : '#38bdf8',
          alpha: 1,
          life: 24,
          maxLife: 24,
          type: 'spark',
        });
      }
      this.spawnRing((caster.x + target.x) / 2, (caster.y + target.y) / 2, 85, '#1e1b4b');
      this.spawnRing((caster.x + target.x) / 2, (caster.y + target.y) / 2, 130, '#38bdf8');
      this.applyDamageToOrb(target, caster, appliedDmg, '#38bdf8');
      target.vx += Math.cos(angle) * 24;
      target.vy += Math.sin(angle) * 24;

    } else if (caster.config.id === 'sukuna') {
      // Thế Giới Trảm (World Cutting Slash) - Space cutting slash line
      soundEngine.playDismantle();
      this.screenShake = 20;
      const angle = Math.atan2(target.y - caster.y, target.x - caster.x);
      const perpAngle = angle + Math.PI / 2;
      const len = 900;
      this.slashes.push({
        x1: target.x - Math.cos(perpAngle) * len,
        y1: target.y - Math.sin(perpAngle) * len,
        x2: target.x + Math.cos(perpAngle) * len,
        y2: target.y + Math.sin(perpAngle) * len,
        color: '#b91c1c',
        life: 35,
        maxLife: 35,
      });
      this.slashes.push({
        x1: target.x - Math.cos(perpAngle) * (len * 0.8),
        y1: target.y - Math.sin(perpAngle) * (len * 0.8),
        x2: target.x + Math.cos(perpAngle) * (len * 0.8),
        y2: target.y + Math.sin(perpAngle) * (len * 0.8),
        color: '#f87171',
        life: 30,
        maxLife: 30,
      });
      this.applyDamageToOrb(target, caster, appliedDmg, '#dc2626', true);
      target.vx += Math.cos(angle) * 24;
      target.vy += Math.sin(angle) * 24;

    } else if (caster.config.id === 'sjw') {
      // Bạo Tác Chưởng (Ruler's Authority)
      soundEngine.playOrbClash(2.0);
      this.screenShake = 16;
      const angle = Math.atan2(caster.y - target.y, caster.x - target.x);
      target.vx = Math.cos(angle) * 25;
      target.vy = Math.sin(angle) * 25 + 10;
      this.spawnRing(target.x, target.y, 100, '#7e22ce');
      this.spawnRing(target.x, target.y, 150, '#c084fc');
      this.applyDamageToOrb(target, caster, appliedDmg, '#a855f7');

    } else if (caster.config.id === 'sans') {
      // Rừng Xương Phán Quyết (Bone Storm)
      soundEngine.playWallBounce();
      this.screenShake = 14;
      for (let b = 0; b < 10; b++) {
        const bx = caster.x + (target.x - caster.x) * (b / 10) + (Math.random() - 0.5) * 40;
        const by = target.y + (Math.random() - 0.5) * 80;
        this.slashes.push({
          x1: bx,
          y1: by - 70,
          x2: bx,
          y2: by + 70,
          color: '#e0f2fe',
          life: 28,
          maxLife: 28,
        });
      }
      this.applyDamageToOrb(target, caster, appliedDmg, '#38bdf8');
      target.vx = -target.vx * 0.5;
    } else {
      this.applyDamageToOrb(target, caster, appliedDmg, caster.config.themeColor);
    }
  }

  public triggerUltimate(caster: BattleOrbEntity, target: BattleOrbEntity) {
    const ult = caster.config.skills.ultimate;
    if (caster.burst < 100) return;

    caster.burst = 0;
    caster.isUltimateActive = true;
    caster.ultimateTimer = 160;

    if (caster.id === 1) this.stats.p1UltsUsed++;
    else this.stats.p2UltsUsed++;

    // Register active skill notification under character in HUD
    caster.lastSkillUsed = {
      name: ult.name,
      vietnameseName: ult.vietnameseName,
      type: 'ultimate',
      typeLabel: '⚡ TUYỆT KỸ',
      color: ult.color || caster.config.themeColor,
      accentColor: ult.accentColor || '#ffffff',
      timer: 140,
      maxTimer: 140,
    };
    if (this.onStateUpdate) this.onStateUpdate();

    // Domain Cutscene (non-blocking cinematic atmosphere)
    soundEngine.playDomainExpansion();
    this.cutscene = {
      active: true,
      fighterName: caster.config.name,
      skillName: ult.vietnameseName,
      avatarUrl: caster.config.avatarUrl,
      themeColor: caster.config.themeColor,
      duration: 50,
      maxDuration: 50,
    };

    this.screenShake = 24;
    const appliedUltDmg = Math.max(2, Math.round(ult.damage * this.damageScale));

    if (caster.config.id === 'gojo') {
      // Spawn Hollow Purple Singularity!
      soundEngine.playHollowPurple();
      const angle = Math.atan2(target.y - caster.y, target.x - caster.x);
      this.hollowPurpleOrb = {
        x: caster.x,
        y: caster.y,
        vx: Math.cos(angle) * 15,
        vy: Math.sin(angle) * 15,
        radius: 95,
        life: 140,
      };
      this.spawnRing(caster.x, caster.y, 95, '#c084fc');
      this.spawnRing(caster.x, caster.y, 145, '#9333ea');
      for (let i = 0; i < 24; i++) {
        this.spawnParticle({
          x: caster.x,
          y: caster.y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          size: Math.random() * 7 + 3,
          color: Math.random() < 0.5 ? '#c084fc' : '#38bdf8',
          alpha: 1,
          life: 26,
          maxLife: 26,
          type: 'spark',
        });
      }
      this.applyDamageToOrb(target, caster, appliedUltDmg, '#9333ea', true);
    } else if (caster.config.id === 'sukuna') {
      // Phục Ma Ngự Thần Điện - Endless Slashes
      soundEngine.playDismantle();
      for (let s = 0; s < 26; s++) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const a = Math.random() * Math.PI;
        this.slashes.push({
          x1: x - Math.cos(a) * 350,
          y1: y - Math.sin(a) * 350,
          x2: x + Math.cos(a) * 350,
          y2: y + Math.sin(a) * 350,
          color: '#ef4444',
          life: 45,
          maxLife: 45,
        });
      }
      for (let i = 0; i < 32; i++) {
        this.spawnParticle({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: Math.random() * 6 + 3,
          color: Math.random() < 0.5 ? '#dc2626' : '#f97316',
          alpha: 1,
          life: 30,
          maxLife: 30,
          type: 'fire',
        });
      }
      this.applyDamageToOrb(target, caster, appliedUltDmg, '#dc2626');
    } else if (caster.config.id === 'sjw') {
      // Lãnh Địa Quân Vương
      soundEngine.playArise();
      this.spawnRing(target.x, target.y, 160, '#6d28d9');
      this.spawnRing(target.x, target.y, 240, '#38bdf8');
      for (let i = 0; i < 35; i++) {
        this.spawnParticle({
          x: target.x + (Math.random() - 0.5) * 160,
          y: target.y + (Math.random() - 0.5) * 160,
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 8 - 2, // rising souls
          size: Math.random() * 7 + 3,
          color: Math.random() < 0.5 ? '#8b5cf6' : '#38bdf8',
          alpha: 1,
          life: 32,
          maxLife: 32,
          type: 'spark',
        });
      }
      this.applyDamageToOrb(target, caster, appliedUltDmg, '#7c3aed');
    } else if (caster.config.id === 'sans') {
      // Megalovania Bad Time Gaster Blaster storm
      soundEngine.playGasterBlaster();
      this.screenShake = 24;

      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i + Math.random() * 0.2;
        this.slashes.push({
          x1: cx,
          y1: cy,
          x2: cx + Math.cos(a) * 600,
          y2: cy + Math.sin(a) * 600,
          color: '#38bdf8',
          life: 45,
          maxLife: 45,
        });
        this.slashes.push({
          x1: cx,
          y1: cy,
          x2: cx + Math.cos(a) * 600,
          y2: cy + Math.sin(a) * 600,
          color: '#ffffff',
          life: 35,
          maxLife: 35,
        });
      }

      this.spawnRing(cx, cy, 140, '#0284c7');
      this.spawnRing(cx, cy, 220, '#facc15');

      for (let i = 0; i < 35; i++) {
        this.spawnParticle({
          x: cx + (Math.random() - 0.5) * 200,
          y: cy + (Math.random() - 0.5) * 200,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          size: Math.random() * 7 + 3,
          color: Math.random() < 0.5 ? '#38bdf8' : '#facc15',
          alpha: 1,
          life: 30,
          maxLife: 30,
          type: 'spark',
        });
      }

      this.applyDamageToOrb(target, caster, appliedUltDmg, '#0284c7');
    } else {
      this.applyDamageToOrb(target, caster, appliedUltDmg, caster.config.themeColor);
      soundEngine.playKO();
    }
  }

  // --- Shadow Minions update (SJW) ---

  private updateShadowMinions(owner: BattleOrbEntity, target: BattleOrbEntity) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let i = owner.shadowMinions.length - 1; i >= 0; i--) {
      const m = owner.shadowMinions[i];
      m.life--;
      m.x += m.vx;
      m.y += m.vy;

      // Minion wall bounce
      if (m.x - m.radius < 24 || m.x + m.radius > w - 24) m.vx = -m.vx;
      if (m.y - m.radius < 24 || m.y + m.radius > h - 24) m.vy = -m.vy;

      // Homing impulse towards enemy
      const dx = target.x - m.x;
      const dy = target.y - m.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0) {
        m.vx += (dx / dist) * 0.45;
        m.vy += (dy / dist) * 0.45;
      }

      // Check clash with target
      if (dist < m.radius + target.radius) {
        const minionDmg = Math.max(1, Math.round(m.damage * this.damageScale));
        this.applyDamageToOrb(target, owner, minionDmg, '#8b5cf6');
        soundEngine.playOrbClash(0.8);
        m.vx = -m.vx * 1.2;
        m.vy = -m.vy * 1.2;
      }

      if (m.life <= 0) {
        owner.shadowMinions.splice(i, 1);
      }
    }
  }

  // --- Special Fields (Hollow Purple & Black Hole) ---

  private updateSpecialFields() {
    // Hollow Purple
    if (this.hollowPurpleOrb) {
      const hp = this.hollowPurpleOrb;
      hp.life--;
      hp.x += hp.vx;
      hp.y += hp.vy;

      // Drag target orb towards its center - small tick damage
      const target = this.orb1.config.id === 'gojo' ? this.orb2 : this.orb1;
      const dist = Math.hypot(hp.x - target.x, hp.y - target.y);
      if (dist < hp.radius + target.radius + 35) {
        target.vx += (hp.x - target.x) * 0.05;
        target.vy += (hp.y - target.y) * 0.05;
        if (this.frameCount % 18 === 0) {
          const tickDmg = Math.max(1, Math.round(1 * this.damageScale));
          this.applyDamageToOrb(target, null, tickDmg, '#9333ea');
        }
      }

      // Particle aura
      this.spawnParticle({
        x: hp.x + (Math.random() - 0.5) * hp.radius,
        y: hp.y + (Math.random() - 0.5) * hp.radius,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 10 + 4,
        color: Math.random() < 0.5 ? '#9333ea' : '#38bdf8',
        alpha: 0.9,
        life: 22,
        maxLife: 22,
        type: 'spark',
      });

      if (hp.life <= 0 || hp.x < -100 || hp.x > this.canvas.width + 100) {
        this.hollowPurpleOrb = null;
      }
    }

    // Black Hole (Xích & Thương)
    if (this.blackHole) {
      const bh = this.blackHole;
      bh.life--;

      // Gravitational pull on both orbs
      [this.orb1, this.orb2].forEach(orb => {
        const dx = bh.x - orb.x;
        const dy = bh.y - orb.y;
        const d = Math.hypot(dx, dy);
        if (d > 10) {
          orb.vx += (dx / d) * 1.0;
          orb.vy += (dy / d) * 1.0;
        }
      });

      if (bh.life <= 0) {
        this.blackHole = null;
      }
    }
  }

  // --- Slashes & Particles ---

  private updateSlashes() {
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      this.slashes[i].life--;
      if (this.slashes[i].life <= 0) {
        this.slashes.splice(i, 1);
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = p.life / p.maxLife;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public spawnWallSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 4 + 2,
        color,
        alpha: 0.9,
        life: 16,
        maxLife: 16,
        type: 'spark',
      });
    }
  }

  public spawnClashSparks(x: number, y: number, c1: string, c2: string, impact: number) {
    const count = Math.min(35, Math.round(15 + impact * 2));
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (impact * 0.8 + 4);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        color: Math.random() < 0.5 ? c1 : c2,
        alpha: 1,
        life: 22,
        maxLife: 22,
        type: 'spark',
      });
    }

    // Shockwave Ring
    this.spawnRing(x, y, 40 + impact * 4, c1);
  }

  public spawnRing(x: number, y: number, size: number, color: string) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size,
      color,
      alpha: 1,
      life: 18,
      maxLife: 18,
      type: 'ring',
    });
  }

  public spawnParticle(p: Particle) {
    this.particles.push(p);
  }

  public spawnTextParticle(text: string, x: number, y: number, color: string) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -1.6,
      size: 16,
      color,
      alpha: 1,
      life: 35,
      maxLife: 35,
      type: 'text',
      text,
    });
  }

  private triggerKO(winnerId: number) {
    this.isGameOver = true;
    this.winnerId = winnerId;
    this.stats.winnerId = winnerId;
    this.stats.roundTime = 99 - this.roundTime;
    soundEngine.playKO();

    if (this.onGameOver) {
      this.onGameOver(winnerId);
    }
  }

  private handleTimeout() {
    if (this.orb1.hp > this.orb2.hp) this.triggerKO(1);
    else if (this.orb2.hp > this.orb1.hp) this.triggerKO(2);
    else this.triggerKO(0);
  }

  // --- Rendering ---

  public render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // Screen Shake
    if (this.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.screenShake,
        (Math.random() - 0.5) * this.screenShake
      );
      this.screenShake *= 0.86;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // 1. Arena Background
    if (this.bgImage && this.bgImage.complete && this.bgImage.naturalWidth !== 0) {
      ctx.drawImage(this.bgImage, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, w, h);
    }

    ctx.fillStyle = this.arena.ambientLight;
    ctx.fillRect(0, 0, w, h);

    // Glowing Arena Border Barrier
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.strokeRect(22, 22, w - 44, h - 44);

    // Center Colosseum Ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 120, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Domain Atmosphere Effects (Malevolent Shrine / Monarch Domain / Infinite Void)
    this.renderDomainAtmosphere(ctx, w, h);

    // 3. Render Black Hole (Xích & Thương Singularity)
    if (this.blackHole) {
      this.renderBlackHole(ctx);
    }

    // 4. Render Slashes (Sukuna Dismantle & Cleave)
    this.renderSlashes(ctx);

    // 5. Render Shadow Minions (SJW Shadow Army)
    this.renderShadowMinions(ctx);

    // 6. Render Hollow Purple Singularity Orb
    if (this.hollowPurpleOrb) {
      this.renderHollowPurple(ctx);
    }

    // 7. Render Battle Orbs
    this.renderBattleOrb(ctx, this.orb1, this.p1Avatar);
    this.renderBattleOrb(ctx, this.orb2, this.p2Avatar);

    // 8. Render Slingshot Aim Line (for Player Mode)
    if (this.isDraggingP1) {
      this.renderSlingshotAim(ctx);
    }

    // 9. Render Particles
    this.renderParticles(ctx);

    // 10. Ultimate skill notice is now rendered under the character in HUD (no full-screen canvas block)

    // 11. Render K.O. Banner
    if (this.isGameOver) {
      this.renderGameOverBanner(ctx, w, h);
    }

    ctx.restore();
  }

  private renderDomainAtmosphere(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const isSukunaUlt =
      (this.orb1.config.id === 'sukuna' && this.orb1.isUltimateActive && this.orb1.ultimateTimer > 0) ||
      (this.orb2.config.id === 'sukuna' && this.orb2.isUltimateActive && this.orb2.ultimateTimer > 0);

    const isSjwUlt =
      (this.orb1.config.id === 'sjw' && this.orb1.isUltimateActive && this.orb1.ultimateTimer > 0) ||
      (this.orb2.config.id === 'sjw' && this.orb2.isUltimateActive && this.orb2.ultimateTimer > 0);

    const isGojoUlt =
      (this.orb1.config.id === 'gojo' && this.orb1.isUltimateActive && this.orb1.ultimateTimer > 0) ||
      (this.orb2.config.id === 'gojo' && this.orb2.isUltimateActive && this.orb2.ultimateTimer > 0);

    const isSansUlt =
      (this.orb1.config.id === 'sans' && this.orb1.isUltimateActive && this.orb1.ultimateTimer > 0) ||
      (this.orb2.config.id === 'sans' && this.orb2.isUltimateActive && this.orb2.ultimateTimer > 0);

    if (isSansUlt) {
      // Megalovania Bad Time Abyss
      const sansGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
      sansGrad.addColorStop(0, 'rgba(2, 132, 199, 0.25)');
      sansGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.65)');
      sansGrad.addColorStop(1, 'rgba(2, 6, 23, 0.92)');
      ctx.fillStyle = sansGrad;
      ctx.fillRect(0, 0, w, h);

      // Glowing twin magic eye flares
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(w / 2 - 35, h / 2 - 30, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.beginPath();
      ctx.arc(w / 2 + 35, h / 2 - 30, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (isSukunaUlt) {
      // Blood-red cursed domain overlay with eerie vignette
      const bloodGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.7);
      bloodGrad.addColorStop(0, 'rgba(220, 38, 38, 0.22)');
      bloodGrad.addColorStop(0.7, 'rgba(127, 29, 29, 0.45)');
      bloodGrad.addColorStop(1, 'rgba(69, 10, 10, 0.85)');
      ctx.fillStyle = bloodGrad;
      ctx.fillRect(0, 0, w, h);

      // Malevolent Shrine ghostly silhouette in the background center
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
      const cx = w / 2;
      const cy = h / 2 - 20;

      // Temple roof curved lines
      ctx.beginPath();
      ctx.moveTo(cx - 160, cy + 50);
      ctx.quadraticCurveTo(cx, cy - 30, cx + 160, cy + 50);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 200, cy + 70);
      ctx.quadraticCurveTo(cx, cy - 10, cx + 200, cy + 70);
      ctx.stroke();

      // Horned crest
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 25);
      ctx.lineTo(cx - 50, cy - 60);
      ctx.lineTo(cx, cy - 40);
      ctx.lineTo(cx + 50, cy - 60);
      ctx.lineTo(cx + 30, cy - 25);
      ctx.stroke();
      ctx.restore();
    } else if (isSjwUlt) {
      // Monarch Shadow Void Abyss
      const shadowGrad = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w * 0.75);
      shadowGrad.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
      shadowGrad.addColorStop(0.6, 'rgba(76, 29, 149, 0.5)');
      shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(0, 0, w, h);

      // Monarch Floor Runic Summoning Circle
      ctx.save();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 170, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 120, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (isGojoUlt) {
      // Cosmic Infinite Void Shimmer
      const voidGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.7);
      voidGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
      voidGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.3)');
      voidGrad.addColorStop(1, 'rgba(2, 6, 23, 0.8)');
      ctx.fillStyle = voidGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private renderBlackHole(ctx: CanvasRenderingContext2D) {
    if (!this.blackHole) return;
    const bh = this.blackHole;
    const t = this.frameCount * 0.08;

    ctx.save();

    // 1. Outer Gravitational Suction Waves
    for (let r = 3; r >= 1; r--) {
      const pulseRadius = (bh.radius * (r / 3) + (this.frameCount * 2) % 30);
      ctx.strokeStyle = r % 2 === 0 ? 'rgba(244, 63, 94, 0.25)' : 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bh.x, bh.y, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Spiraling Twin Accretion Arms (Red & Blue Plasma)
    for (let i = 0; i < 2; i++) {
      const isRed = i === 0;
      const baseAngle = isRed ? t : t + Math.PI;
      const color = isRed ? '#f43f5e' : '#0284c7';
      const glowColor = isRed ? '#fb7185' : '#38bdf8';

      ctx.strokeStyle = color;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 20;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let step = 0; step < 40; step++) {
        const spiralR = (step / 40) * bh.radius;
        const spiralA = baseAngle + (step * 0.12) * (isRed ? 1 : -1);
        const px = bh.x + Math.cos(spiralA) * spiralR;
        const py = bh.y + Math.sin(spiralA) * spiralR;
        if (step === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // 3. Singularity Core (Pitch Black with Radiant White/Cyan Event Horizon)
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#38bdf8';
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(bh.x, bh.y, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(bh.x, bh.y, 32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private renderSlashes(ctx: CanvasRenderingContext2D) {
    this.slashes.forEach(s => {
      ctx.save();
      const progress = s.life / s.maxLife;

      // Outer Crimson Cursed Glow
      ctx.strokeStyle = s.color;
      ctx.lineWidth = progress * 6 + 3;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      // Razor-Sharp White Hot Inner Blade Core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = progress * 2 + 1;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      // Spark Flares at tips
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(s.x1, s.y1, 4, 0, Math.PI * 2);
      ctx.arc(s.x2, s.y2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  private renderShadowMinions(ctx: CanvasRenderingContext2D) {
    [this.orb1, this.orb2].forEach(owner => {
      owner.shadowMinions.forEach(m => {
        ctx.save();

        // 1. Dark Shadow Flame Corona
        const flameGrad = ctx.createRadialGradient(m.x, m.y, 6, m.x, m.y, m.radius + 6);
        flameGrad.addColorStop(0, '#1e1b4b');
        flameGrad.addColorStop(0.5, '#6d28d9');
        flameGrad.addColorStop(0.9, '#a855f7');
        flameGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        // 2. Solid Obsidian Core
        ctx.fillStyle = '#0f172a';
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 3. Glowing Cyan Visor Eyes with trailing light
        const eyeOffset = Math.atan2(m.vy, m.vx) || 0;
        const ex = m.x + Math.cos(eyeOffset) * 8;
        const ey = m.y + Math.sin(eyeOffset) * 8;
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ex - 4, ey, 2.5, 0, Math.PI * 2);
        ctx.arc(ex + 4, ey, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 4. Rotating Curved Shadow Scythe Blade Arc
        const bladeA = this.frameCount * 0.12;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius + 8, bladeA, bladeA + Math.PI * 0.6);
        ctx.stroke();

        ctx.restore();
      });
    });
  }

  private renderHollowPurple(ctx: CanvasRenderingContext2D) {
    if (!this.hollowPurpleOrb) return;
    const hp = this.hollowPurpleOrb;
    const t = this.frameCount * 0.15;

    ctx.save();

    // 1. Multi-tier Cosmic Purple Plasma Corona
    const pGrad = ctx.createRadialGradient(hp.x, hp.y, 10, hp.x, hp.y, hp.radius);
    pGrad.addColorStop(0, '#ffffff');
    pGrad.addColorStop(0.2, '#f5d0fe');
    pGrad.addColorStop(0.5, '#c084fc');
    pGrad.addColorStop(0.8, '#7e22ce');
    pGrad.addColorStop(1, 'rgba(59, 7, 100, 0)');
    ctx.fillStyle = pGrad;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(hp.x, hp.y, hp.radius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Pitch Black Core Void with Bright Event Horizon
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(hp.x, hp.y, hp.radius * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#e879f9';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(hp.x, hp.y, hp.radius * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Counter-Rotating Tilted Plasma Rings
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(hp.x, hp.y, hp.radius * 0.85, hp.radius * 0.35, t, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(hp.x, hp.y, hp.radius * 0.85, hp.radius * 0.35, -t * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Branching Purple Lightning Bolts
    for (let i = 0; i < 5; i++) {
      const boltA = t * 2 + (Math.PI * 2 / 5) * i;
      const bx1 = hp.x + Math.cos(boltA) * (hp.radius * 0.35);
      const by1 = hp.y + Math.sin(boltA) * (hp.radius * 0.35);
      const bx2 = hp.x + Math.cos(boltA + (Math.random() - 0.5) * 0.5) * (hp.radius * 0.95);
      const by2 = hp.y + Math.sin(boltA + (Math.random() - 0.5) * 0.5) * (hp.radius * 0.95);

      ctx.strokeStyle = i % 2 === 0 ? '#ffffff' : '#e879f9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx1, by1);
      ctx.lineTo((bx1 + bx2) / 2 + (Math.random() - 0.5) * 12, (by1 + by2) / 2 + (Math.random() - 0.5) * 12);
      ctx.lineTo(bx2, by2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderBattleOrb(ctx: CanvasRenderingContext2D, orb: BattleOrbEntity, avatar: HTMLImageElement | null) {
    ctx.save();

    // 1. Render Trail
    orb.trail.forEach((t, idx) => {
      ctx.save();
      ctx.fillStyle = orb.config.themeColor;
      ctx.globalAlpha = t.alpha * 0.28;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size * (0.6 + idx * 0.05), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    const speed = Math.hypot(orb.vx, orb.vy);

    // 2. Fuga Fire Arrow Cloak (Sukuna Skill 2 Active)
    if (orb.config.id === 'sukuna' && orb.speedBuffTimer > 0) {
      ctx.save();
      const angle = Math.atan2(orb.vy, orb.vx);
      const fireGrad = ctx.createRadialGradient(orb.x, orb.y, orb.radius * 0.4, orb.x, orb.y, orb.radius + 28);
      fireGrad.addColorStop(0, '#facc15');
      fireGrad.addColorStop(0.4, '#f97316');
      fireGrad.addColorStop(0.8, '#ef4444');
      fireGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius + 28, 0, Math.PI * 2);
      ctx.fill();

      // Fiery Arrowhead pointing in trajectory direction
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(orb.x + Math.cos(angle) * (orb.radius + 30), orb.y + Math.sin(angle) * (orb.radius + 30));
      ctx.lineTo(orb.x + Math.cos(angle + 2.4) * (orb.radius + 14), orb.y + Math.sin(angle + 2.4) * (orb.radius + 14));
      ctx.lineTo(orb.x + Math.cos(angle - 2.4) * (orb.radius + 14), orb.y + Math.sin(angle - 2.4) * (orb.radius + 14));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Gojo Black Flash Awakened Zone Lightning Sparks
    if (orb.config.id === 'gojo' && orb.speedBuffTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#020617';
      ctx.shadowBlur = 18;
      for (let i = 0; i < 4; i++) {
        const ang = this.frameCount * 0.2 + (Math.PI * 2 / 4) * i;
        ctx.beginPath();
        ctx.moveTo(orb.x + Math.cos(ang) * orb.radius, orb.y + Math.sin(ang) * orb.radius);
        ctx.lineTo(orb.x + Math.cos(ang) * (orb.radius + 18), orb.y + Math.sin(ang) * (orb.radius + 18));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Sans Eye Flame & Exhaustion Visuals
    if (orb.config.id === 'sans') {
      ctx.save();
      if (orb.energy > 0) {
        // Glowing cyan-blue left eye flame trailing
        const eyeAngle = Math.atan2(orb.vy, orb.vx) || 0;
        const ex = orb.x + Math.cos(eyeAngle + 0.3) * (orb.radius * 0.4);
        const ey = orb.y + Math.sin(eyeAngle + 0.3) * (orb.radius * 0.4);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sans is EXHAUSTED: Pulsing red warning ring around orb
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Outer Energy Shell Aura
    const auraPulse = Math.sin(this.frameCount * 0.15) * 4 + 6;
    const auraGrad = ctx.createRadialGradient(orb.x, orb.y, orb.radius, orb.x, orb.y, orb.radius + auraPulse + speed * 1.5);
    auraGrad.addColorStop(0, orb.config.themeColor);
    auraGrad.addColorStop(0.7, orb.config.secondaryColor);
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius + auraPulse + speed * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Monarch Shadow Wings / Sovereign Crest (SJW Ultimate Active)
    if (orb.config.id === 'sjw' && orb.isUltimateActive && orb.ultimateTimer > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 24;
      // Wing arcs
      ctx.beginPath();
      ctx.arc(orb.x - 30, orb.y - 15, 45, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(orb.x + 30, orb.y - 15, 45, Math.PI * 1.2, Math.PI * 0.2, true);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Gojo Infinity Barrier Visual: Multi-layered Sacred Runic Geometry
    if (orb.isInfinityActive) {
      ctx.save();
      const rot = this.frameCount * 0.04;

      // Outer Segmented Runic Boundary Ring
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 24;
      ctx.setLineDash([16, 10, 4, 10]);
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius + 22, rot, rot + Math.PI * 2);
      ctx.stroke();

      // Inner Counter-Rotating Prismatic Ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius + 14, -rot * 1.2, -rot * 1.2 + Math.PI * 2);
      ctx.stroke();

      // Electric Spontaneous Sparks on Boundary
      for (let s = 0; s < 3; s++) {
        const sa = rot * 2 + (Math.PI * 2 / 3) * s;
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(orb.x + Math.cos(sa) * (orb.radius + 22), orb.y + Math.sin(sa) * (orb.radius + 22), 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. Clipped Avatar Sphere
    ctx.save();
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.clip();

    if (avatar && avatar.complete && avatar.naturalWidth !== 0) {
      ctx.drawImage(
        avatar,
        orb.x - orb.radius,
        orb.y - orb.radius,
        orb.radius * 2,
        orb.radius * 2
      );
    } else {
      const sphereGrad = ctx.createRadialGradient(
        orb.x - orb.radius * 0.3,
        orb.y - orb.radius * 0.3,
        5,
        orb.x,
        orb.y,
        orb.radius
      );
      sphereGrad.addColorStop(0, '#ffffff');
      sphereGrad.addColorStop(0.5, orb.config.themeColor);
      sphereGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2);
    }

    // Glass glossy highlight reflection
    const glossGrad = ctx.createLinearGradient(orb.x, orb.y - orb.radius, orb.x, orb.y);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glossGrad;
    ctx.beginPath();
    ctx.ellipse(orb.x, orb.y - orb.radius * 0.45, orb.radius * 0.65, orb.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 7. Metallic Rim Border
    ctx.strokeStyle = orb.config.themeColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = orb.config.themeColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private renderSlingshotAim(ctx: CanvasRenderingContext2D) {
    const o = this.orb1;
    const dx = o.x - this.dragCurrent.x;
    const dy = o.y - this.dragCurrent.y;

    ctx.save();
    // Drag Line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
    ctx.stroke();

    // Projected Forward Launch Vector
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(o.x + dx * 1.5, o.y + dy * 1.5);
    ctx.stroke();

    // Target crosshair
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(o.x + dx * 1.5, o.y + dy * 1.5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'text' && p.text) {
        ctx.font = '900 18px "Rajdhani", sans-serif';
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + (1 - p.alpha)), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'slash' && p.x2 !== undefined && p.y2 !== undefined) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x2, p.y2);
        ctx.stroke();
      } else if (p.type === 'fire') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private renderDomainCutscene(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();

    // Dark cinematic letterbox overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(0, 0, w, h);

    const bannerY = h * 0.36;
    const bannerH = 135;

    // Angled Dynamic Energy Slash Ribbon across screen
    const bGrad = ctx.createLinearGradient(0, bannerY, w, bannerY + bannerH);
    bGrad.addColorStop(0, '#020617');
    bGrad.addColorStop(0.2, this.cutscene.themeColor);
    bGrad.addColorStop(0.8, '#090d16');
    bGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bGrad;
    ctx.fillRect(0, bannerY, w, bannerH);

    // Glowing Neon Framing Edges
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = this.cutscene.themeColor;
    ctx.shadowBlur = 20;
    ctx.strokeRect(0, bannerY, w, bannerH);

    // Speed Lines sweeping across horizontally
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const ly = bannerY + 16 * (i + 1);
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(w, ly);
      ctx.stroke();
    }

    // Top Category Header
    ctx.font = '900 13px "Rajdhani", sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText('⚡ TUYỆT KỸ TỐI THƯỢNG · LÃNH ĐỊA TOÀN KHAI ⚡', w / 2, bannerY + 36);

    // Grand Technique Title (NO dialogue quotes!)
    ctx.font = '900 32px "Cinzel", serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = this.cutscene.themeColor;
    ctx.shadowBlur = 24;
    ctx.fillText(this.cutscene.skillName, w / 2, bannerY + 76);

    // Fighter Name Subtitle
    ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText(this.cutscene.fighterName.toUpperCase(), w / 2, bannerY + 108);

    ctx.restore();
  }

  private renderGameOverBanner(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';

    // Giant K.O.
    ctx.font = '900 84px "Cinzel", serif';
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 30;
    ctx.fillText('K. O. !', w / 2, h * 0.42);

    const winnerName = this.winnerId === 1 ? this.orb1.config.name : this.orb2.config.name;
    ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`CHIẾN THẮNG: ${winnerName.toUpperCase()}`, w / 2, h * 0.56);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Tự động đấu lại sau giây lát...', w / 2, h * 0.65);

    ctx.restore();
  }

  public destroy() {
    if (this.roundTimerInterval) clearInterval(this.roundTimerInterval);
  }
}
