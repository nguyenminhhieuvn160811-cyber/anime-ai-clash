/**
 * Enhanced Web Audio API Sound Synthesizer for Anime Battle Orbs.
 * Procedural anime sound effects: Hollow Purple, Malevolent Shrine slashes, Arise shadow summon, kinetic orb clashes.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  private isBgmPlaying: boolean = false;

  constructor() {}

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Kinetic Orb Clash (Va chạm nảy bóng anime)
  public playOrbClash(intensity: number = 1.0) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const dur = Math.min(0.25, 0.1 + intensity * 0.08);

    // Deep sub thump
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(220 + intensity * 60, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + dur);

    g1.gain.setValueAtTime(Math.min(0.9, 0.4 + intensity * 0.3), now);
    g1.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc1.connect(g1);
    g1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + dur);

    // High energetic anime laser snap
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(600 + intensity * 300, now);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    g2.gain.setValueAtTime(0.35 * intensity, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc2.connect(g2);
    g2.connect(this.sfxGain);
    osc2.start(now);
    osc2.stop(now + 0.08);
  }

  // Wall barrier bounce ping
  public playWallBounce() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Hollow Purple (Hư Thức Tử - Gojo Satoru)
  public playHollowPurple() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Cosmic rising tone
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(90, now);
    osc1.frequency.exponentialRampToValueAtTime(980, now + 0.55);

    g1.gain.setValueAtTime(0.1, now);
    g1.gain.linearRampToValueAtTime(0.7, now + 0.45);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc1.connect(g1);
    g1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.9);

    // Deep thunder explosion
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(180, now + 0.45);
    osc2.frequency.exponentialRampToValueAtTime(30, now + 1.2);

    g2.gain.setValueAtTime(0, now);
    g2.gain.setValueAtTime(0.9, now + 0.45);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc2.connect(g2);
    g2.connect(this.sfxGain);
    osc2.start(now + 0.45);
    osc2.stop(now + 1.2);
  }

  // Dismantle & Cleave (Trảm Kích Giải - Sukuna)
  public playDismantle() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    [0, 0.05, 0.1].forEach((delay) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now + delay);
      osc.frequency.exponentialRampToValueAtTime(220, now + delay + 0.08);

      g.gain.setValueAtTime(0.4, now + delay);
      g.gain.exponentialRampToValueAtTime(0.005, now + delay + 0.08);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.08);
    });
  }

  // Arise (Trỗi Dậy - Sung Jin-Woo)
  public playArise() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Dark mystic chords
    [220, 277.18, 329.63, 440].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      g.gain.setValueAtTime(0.3, now + idx * 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.6);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.6);
    });
  }

  // Gaster Blaster laser sweep (Sans)
  public playGasterBlaster() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.45);

    g.gain.setValueAtTime(0.65, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Black Flash (Hắc Thiểm - electric burst)
  public playBlackFlash() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

    g.gain.setValueAtTime(0.8, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Domain Expansion Announcement Gong
  public playDomainExpansion() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Ancient temple gong resonance
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(82, now + 1.8);

    g.gain.setValueAtTime(0.8, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.8);
  }

  public playKO() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 1.4);

    g.gain.setValueAtTime(0.95, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.4);
  }

  // --- Dynamic High-Energy Anime Arcade BGM ---
  public startBGM() {
    if (this.isBgmPlaying) return;
    this.initCtx();
    this.isBgmPlaying = true;

    const stepDuration = 60 / 138 / 4; // 138 BPM
    const bassline = [55, 55, 65.4, 55, 73.4, 55, 82.4, 73.4];
    const synthLead = [330, 392, 440, 523.25, 440, 392, 330, 293.66];

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || !this.bgmGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      // Bass punch
      if (this.bgmStep % 2 === 0) {
        const freq = bassline[(this.bgmStep / 2) % bassline.length];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        g.gain.setValueAtTime(0.18, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

        osc.connect(g);
        g.connect(this.bgmGain);
        osc.start(now);
        osc.stop(now + 0.16);
      }

      // Arpeggiated Anime Synth Hook
      if (this.bgmStep % 4 === 1 || this.bgmStep % 4 === 3) {
        const leadFreq = synthLead[(this.bgmStep * 2) % synthLead.length];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(leadFreq, now);

        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.005, now + 0.1);

        osc.connect(g);
        g.connect(this.bgmGain);
        osc.start(now);
        osc.stop(now + 0.1);
      }

      this.bgmStep = (this.bgmStep + 1) % 32;
    }, stepDuration * 1000);
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }
}

export const soundEngine = new SoundEngine();
