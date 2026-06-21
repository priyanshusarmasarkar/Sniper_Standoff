/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Crosshair, 
  Heart, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Award, 
  Play, 
  Skull, 
  ShieldAlert, 
  Zap, 
  CheckCircle,
  HelpCircle,
  Clock,
  Target
} from "lucide-react";

// ==========================================
// WEB AUDIO SYNTH ENGINE (No external file deps)
// ==========================================
class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playShoot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === 'suspended') ctx.resume();

    // Noise node for gun powder explosion
    const bufferSize = ctx.sampleRate * 0.45;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
    filter.Q.setValueAtTime(8, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(1.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    // Oscillator for heavy chest punch
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.18);

    oscGain.gain.setValueAtTime(1.6, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start();
    osc.start();
    noise.stop(ctx.currentTime + 0.45);
    osc.stop(ctx.currentTime + 0.25);

    // Mechanical Bolt slide-chambering reload effect played with 400ms delay
    setTimeout(() => {
      this.playMechanicalBolt(ctx);
    }, 380);
  }

  private playMechanicalBolt(ctx: AudioContext) {
    if (this.muted) return;
    // Clack 1 (open bolt chamber)
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(900, ctx.currentTime);
    osc1.frequency.setValueAtTime(1600, ctx.currentTime + 0.02);
    g1.gain.setValueAtTime(0.25, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.07);

    // Clack 2 (close bolt breach) after 150ms
    setTimeout(() => {
      if (this.muted) return;
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(550, ctx.currentTime);
      osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.015);
      g2.gain.setValueAtTime(0.2, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc2.connect(g2);
      g2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.08);
    }, 140);
  }

  playExplosion(tinnitus: boolean) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === "suspended") ctx.resume();

    // Massive noise block for devastating rumble
    const bufferSize = ctx.sampleRate * 1.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(220, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(5, ctx.currentTime + 1.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(2.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 1.8);

    // Thick bass oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(95, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(10, ctx.currentTime + 0.6);
    oscGain.gain.setValueAtTime(1.8, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.75);

    // High tinnitus ringing feedback
    if (tinnitus) {
      const tinOsc = ctx.createOscillator();
      const tinGain = ctx.createGain();
      tinOsc.type = "sine";
      tinOsc.frequency.setValueAtTime(7400, ctx.currentTime);
      tinGain.gain.setValueAtTime(0.15, ctx.currentTime);
      tinGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      tinOsc.connect(tinGain);
      tinGain.connect(ctx.destination);
      tinOsc.start();
      tinOsc.stop(ctx.currentTime + 2.6);
    }
  }

  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === "suspended") ctx.resume();

    // Comical heavy descending military groan
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);

    // Metallic hit squawk / Radio bip feedback
    setTimeout(() => {
      if (this.muted) return;
      const chirp = ctx.createOscillator();
      const chirpG = ctx.createGain();
      chirp.type = "sine";
      chirp.frequency.setValueAtTime(1100, ctx.currentTime);
      chirp.frequency.setValueAtTime(1700, ctx.currentTime + 0.05);
      chirpG.gain.setValueAtTime(0.09, ctx.currentTime);
      chirpG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      chirp.connect(chirpG);
      chirpG.connect(ctx.destination);
      chirp.start();
      chirp.stop(ctx.currentTime + 0.14);
    }, 160);
  }

  playFuseSizzle() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === "suspended") ctx.resume();

    // Sudden light high hiss spark
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(2200 + Math.random() * 1500, ctx.currentTime);
    g.gain.setValueAtTime(0.02, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(4500, ctx.currentTime);

    osc.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }

  playWarningChirp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1450, ctx.currentTime);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  playStartMission() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    // Heroic arpeggio
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, now + idx * 0.12);

      g.gain.setValueAtTime(0.14, now + idx * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);
    });
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    // Sad, ominous military salute descending
    const notes = [293.66, 261.63, 220.00, 146.83]; // D4, C4, A3, D3
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.22);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, now + idx * 0.22);

      g.gain.setValueAtTime(0.18, now + idx * 0.22);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.22 + 0.65);

      osc.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      osc.start(now + idx * 0.22);
      osc.stop(now + idx * 0.22 + 0.7);
    });
  }

  playLevelUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      g.gain.setValueAtTime(0.15, now + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  playTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(3200, ctx.currentTime);
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }
}

// Global hook instanced helper
const sfx = new SoundEngine();

// ==========================================
// GAME CONSTANTS & CONFIGS
// ==========================================
interface CoverSpot {
  id: string;
  name: string;
  left: number; // percentage
  top: number;  // percentage
  width: number; // percentage width
  height: number; // percentage height
  enemyOffsetX: number; // offset center adjustment
  enemyOffsetY: number; // offset height adjustment
  range: number; // simulated distance in meters
  facing: "left" | "right";
}

const COVER_SPOTS: CoverSpot[] = [
  {
    id: "ruin-left",
    name: "Ruined Wall",
    left: 12,
    top: 48,
    width: 22,
    height: 48,
    enemyOffsetX: 0,
    enemyOffsetY: -35,
    range: 310,
    facing: "right",
  },
  {
    id: "boulder-left",
    name: "Canyon Rocks",
    left: 28,
    top: 58,
    width: 18,
    height: 38,
    enemyOffsetX: 0,
    enemyOffsetY: -35,
    range: 245,
    facing: "right",
  },
  {
    id: "sandbag-center",
    name: "Sandbag Wall",
    left: 45,
    top: 64,
    width: 20,
    height: 32,
    enemyOffsetX: 0,
    enemyOffsetY: -35,
    range: 175,
    facing: "right",
  },
  {
    id: "scrap-pile",
    name: "Scrap Heap",
    left: 62,
    top: 56,
    width: 16,
    height: 40,
    enemyOffsetX: -5,
    enemyOffsetY: -35,
    range: 290,
    facing: "left",
  },
  {
    id: "container-right",
    name: "Cargo Container",
    left: 76,
    top: 44,
    width: 20,
    height: 52,
    enemyOffsetX: 0,
    enemyOffsetY: -35,
    range: 335,
    facing: "left",
  },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
}

interface BloodSplatter {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface SmokeSpark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
}

interface GameLog {
  id: number;
  message: string;
  type: "success" | "warning" | "info" | "damage";
}

export default function App() {
  // Game States
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "GAMEOVER">("START");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("sniper_highscore") || "0", 10);
    } catch {
      return 0;
    }
  });
  
  const [lives, setLives] = useState<number>(1);
  const [level, setLevel] = useState<number>(1);
  const [combatMuted, setCombatMuted] = useState<boolean>(false);
  const [codered, setCodered] = useState<boolean>(false); // critical life flash

  // Player Stats for Debrief
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [shotsHit, setShotsHit] = useState<number>(0);
  const [grenadesHit, setGrenadesHit] = useState<number>(0);
  const [recoiling, setRecoiling] = useState<boolean>(false);
  const [reloading, setReloading] = useState<boolean>(false);

  // Enemy / Target states
  const [enemyActive, setEnemyActive] = useState<boolean>(false);
  const [enemyCoverIdx, setEnemyCoverIdx] = useState<number>(0);
  const [enemyState, setEnemyState] = useState<"PEEK" | "PREPARE" | "THROWN" | "HIT">("PEEK");
  
  // Grenade flight parameters
  const [grenadeAirborne, setGrenadeAirborne] = useState<boolean>(false);
  const [grenadeProgress, setGrenadeProgress] = useState<number>(0); // 0 to 1
  const [grenadeCoords, setGrenadeCoords] = useState<{ x: number; y: number; scale: number; rot: number }>({ x: 0, y: 0, scale: 0.2, rot: 0 });

  // Visual effects
  const [shake, setShake] = useState<boolean>(false);
  const [damageFlash, setDamageFlash] = useState<boolean>(false);
  const [shootFlash, setShootFlash] = useState<boolean>(false);
  const [bloodSplats, setBloodSplats] = useState<BloodSplatter[]>([]);
  const [sparks, setSparks] = useState<SmokeSpark[]>([]);
  const [scrollingLogs, setScrollingLogs] = useState<GameLog[]>([]);

  // Mouse coords relative to viewport
  const scopeRangeRef = useRef<number>(150);
  const mousePos = useRef<{ x: number; y: number }>({ x: 300, y: 300 });
  const scopeRef = useRef<HTMLDivElement>(null);
  const gameViewportRef = useRef<HTMLDivElement>(null);

  // Background ambient drifting dust particles
  const [ambientDust, setAmbientDust] = useState<Particle[]>([]);

  // Timers and loop references
  const enemySpawnTimer = useRef<NodeJS.Timeout | null>(null);
  const enemyBehaviorTimer = useRef<NodeJS.Timeout | null>(null);
  const grenadeAnimFrame = useRef<number | null>(null);
  const lastGrenadeTime = useRef<number>(0);
  const particleIdCounter = useRef<number>(0);
  const logIdCounter = useRef<number>(0);

  // References to keep state values up to date inside async setTimeout / requestAnimationFrame closures
  const gameStateRef = useRef<"START" | "PLAYING" | "GAMEOVER">("START");
  const levelRef = useRef<number>(1);
  const grenadeAirborneRef = useRef<boolean>(false);
  const enemyActiveRef = useRef<boolean>(false);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    grenadeAirborneRef.current = grenadeAirborne;
  }, [grenadeAirborne]);

  useEffect(() => {
    enemyActiveRef.current = enemyActive;
  }, [enemyActive]);

  // Dynamic getters derived from levelRef to avoid stale React closures
  const getPeekTime = () => Math.max(850, 1800 - levelRef.current * 120);
  const getFlightTime = () => Math.max(1000, 1800 - levelRef.current * 90);

  // Add system notifications logger
  const addeventLog = (message: string, type: "success" | "warning" | "info" | "damage" = "info") => {
    const id = ++logIdCounter.current;
    setScrollingLogs(prev => [{ id, message, type }, ...prev.slice(0, 5)]);
  };

  // Sound Engine Mute sync
  const toggleMute = () => {
    const isMuted = sfx.toggleMute();
    setCombatMuted(isMuted);
    localStorage.setItem("sniper_muted", isMuted ? "Y" : "N");
  };

  useEffect(() => {
    const savedMuted = localStorage.getItem("sniper_muted");
    if (savedMuted === "Y") {
      sfx.muted = true;
      setCombatMuted(true);
    }
  }, []);

  // Set up Ambient Dust on Mount
  useEffect(() => {
    const freshDust: Particle[] = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1.5,
      speedX: Math.random() * 0.4 - 0.2 - 0.1, // drift leftwards
      speedY: Math.random() * 0.2 - 0.1 - 0.05, // slowly float down
      opacity: Math.random() * 0.4 + 0.1,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 1 - 0.5
    }));
    setAmbientDust(freshDust);

    const interval = setInterval(() => {
      setAmbientDust(prev => prev.map(p => {
        let lx = p.x + p.speedX;
        let ly = p.y + p.speedY;
        if (lx < -5) lx = 105;
        if (ly > 105) ly = -5;
        if (ly < -5) ly = 105;
        return {
          ...p,
          x: lx,
          y: ly,
          rotation: p.rotation + p.rotSpeed
        };
      }));
    }, 45);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Real-time Range Finder and coordinate tracker inside scope
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameViewportRef.current || !scopeRef.current) return;
    const rect = gameViewportRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePos.current = { x, y };

    // Set Scope Visual Position directly for raw performance
    scopeRef.current.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;

    // Calculate approximate distance range text indicator depending on nearest cover spot
    // Normalize coordinates to percentage to estimate matching cover
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    let closestCover = COVER_SPOTS[0];
    let minDist = 99999;
    
    COVER_SPOTS.forEach(spot => {
      const spotCenterX = spot.left + spot.width / 2;
      const spotCenterY = spot.top + spot.height / 3;
      const dist = Math.hypot(px - spotCenterX, py - spotCenterY);
      if (dist < minDist) {
        minDist = dist;
        closestCover = spot;
      }
    });

    // Hover variance rangefinder effect
    const finalEstimatedRange = Math.round(closestCover.range + Math.sin(x * 0.01 + y * 0.01) * 3);
    scopeRangeRef.current = finalEstimatedRange;
    const readoutEl = document.getElementById("scope-range-val");
    if (readoutEl) {
      readoutEl.textContent = `RNG: ${finalEstimatedRange}m`;
    }
  };

  // Spark Generator helper
  const createExplosionSparks = (px: number, py: number, color: string = "#f59e0b") => {
    const freshSparks: SmokeSpark[] = Array.from({ length: 16 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 8 + 4;
      return {
        id: ++particleIdCounter.current,
        x: px,
        y: py,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - (Math.random() * 3), // drift up
        color,
        size: Math.random() * 5 + 3,
        opacity: 1
      };
    });
    setSparks(prev => [...prev, ...freshSparks]);
  };

  // Trailing Fuse Spark and Smoke Trail Generator during Bomb's flight path
  const createFuseSpark = (gx: number, gy: number, scale: number) => {
    const freshSparks: SmokeSpark[] = [];
    
    // 1. Bright sizzling hot-spot fuse sparks
    const sparkCount = Math.random() > 0.4 ? 2 : 1;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 4 + 1.5;
      freshSparks.push({
        id: ++particleIdCounter.current,
        // Aligned near the top-right of the grenade (where the fuse visual sits)
        x: gx + (Math.random() * 10 - 5) * scale,
        y: gy - 12 * scale + (Math.random() * 8 - 4) * scale,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1,
        color: Math.random() > 0.45 ? "#f97316" : "#facc15", // orange or yellow
        size: Math.random() * 2.5 + 1.2,
        opacity: 1.0
      });
    }

    // 2. Slow lingering smoke puff puffs to outline the flight trajectory
    if (Math.random() > 0.5) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 0.8 + 0.2;
      freshSparks.push({
        id: ++particleIdCounter.current,
        x: gx,
        y: gy - 10 * scale,
        vx: Math.cos(angle) * spd,
        vy: -Math.random() * 0.5 - 0.3,
        color: "#d4d4d8", // zinc/smoke grey
        size: Math.random() * 6 + 3,
        opacity: 0.5
      });
    }

    setSparks(prev => [...prev, ...freshSparks]);
  };

  // Spark animation ticker
  useEffect(() => {
    if (sparks.length === 0) return;
    const interval = jsTick();
    return () => cancelAnimationFrame(interval);

    function jsTick() {
      return requestAnimationFrame(() => {
        setSparks(prev => prev
          .map(s => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            vy: s.vy + 0.15, // gravity effect
            opacity: s.opacity - 0.05,
            size: Math.max(0.2, s.size - 0.1)
          }))
          .filter(s => s.opacity > 0)
        );
        jsTick();
      });
    }
  }, [sparks.length]);

  // Damage vignette cleanup
  useEffect(() => {
    if (damageFlash) {
      const t = setTimeout(() => setDamageFlash(false), 300);
      return () => clearTimeout(t);
    }
  }, [damageFlash]);

  // Recoil flash cleanup
  useEffect(() => {
    if (shootFlash) {
      const t = setTimeout(() => setShootFlash(false), 150);
      return () => clearTimeout(t);
    }
  }, [shootFlash]);

  // Shaking screen decay
  useEffect(() => {
    if (shake) {
      const t = setTimeout(() => setShake(false), 550);
      return () => clearTimeout(t);
    }
  }, [shake]);

  // Speed up levels on score increases
  useEffect(() => {
    if (gameState !== "PLAYING") return;
    const computedLevel = Math.min(10, Math.floor(score / 600) + 1);
    if (computedLevel !== level) {
      setLevel(computedLevel);
      sfx.playLevelUp();
      addeventLog(`⚠️ COMBAT DIFFICULTY UPGRADED: LEVEL ${computedLevel}`, "warning");
    }
  }, [score, level, gameState]);

  // ==========================================
  // CORE GAMEPLAY LIFECYCLE
  // ==========================================

  const startMission = () => {
    sfx.playStartMission();
    setGameState("PLAYING");
    gameStateRef.current = "PLAYING";
    setScore(0);
    setLives(1);
    setLevel(1);
    levelRef.current = 1;
    setShotsFired(0);
    setShotsHit(0);
    setGrenadesHit(0);
    setBloodSplats([]);
    setSparks([]);
    setEnemyActive(false);
    enemyActiveRef.current = false;
    setGrenadeAirborne(false);
    grenadeAirborneRef.current = false;
    setReloading(false);
    setRecoiling(false);
    setCodered(false);
    setScrollingLogs([]);
    addeventLog(`⚡ MISSION BEGUN. OPERATOR GHOST ONLINE.`, "success");
    addeventLog(`🎯 Target: Major Petrov. High threat.`, "info");

    // Queue initial enemy spawn
    triggerEnemySpawnDelay(3000);
  };

  const triggerEnemySpawnDelay = (delayMs: number) => {
    cleanupTimers();
    enemySpawnTimer.current = setTimeout(() => {
      spawnEnemy();
    }, delayMs);
  };

  const cleanupTimers = () => {
    if (enemySpawnTimer.current) clearTimeout(enemySpawnTimer.current);
    if (enemyBehaviorTimer.current) clearTimeout(enemyBehaviorTimer.current);
    if (grenadeAnimFrame.current) cancelAnimationFrame(grenadeAnimFrame.current);
  };

  const spawnEnemy = () => {
    if (gameStateRef.current !== "PLAYING") return;

    // Pick a random cover index that is different from previous, or fully random
    const randSpot = Math.floor(Math.random() * COVER_SPOTS.length);
    setEnemyCoverIdx(randSpot);
    setEnemyActive(true);
    enemyActiveRef.current = true;
    setEnemyState("PEEK");

    addeventLog(`👁️ SYSTEM: Visual on Target - ${COVER_SPOTS[randSpot].name}`, "warning");

    // Enemy behavior flowchart: Peek -> Prepare -> Throw grenade
    enemyBehaviorTimer.current = setTimeout(() => {
      prepareThrow(randSpot);
    }, getPeekTime() * 0.6);
  };

  const prepareThrow = (coverIdx: number) => {
    setEnemyState("PREPARE");
    sfx.playWarningChirp();

    enemyBehaviorTimer.current = setTimeout(() => {
      launchGrenade(coverIdx);
    }, getPeekTime() * 0.4);
  };

  // Launch Grenade trajectory calculator
  const launchGrenade = (coverIdx: number) => {
    if (gameStateRef.current !== "PLAYING") return;
    setEnemyState("THROWN");
    setGrenadeAirborne(true);
    grenadeAirborneRef.current = true;
    setGrenadeProgress(0);

    const spot = COVER_SPOTS[coverIdx];
    addeventLog(`💣 WARNING: GRENADE AIRBORNE! TAKE OUT TARGET!`, "damage");

    // Start running trajectory animation loop
    lastGrenadeTime.current = performance.now();
    animateGrenadeFlight(spot);
  };

  const animateGrenadeFlight = (spot: CoverSpot) => {
    const duration = getFlightTime();
    let startTimestamp: number | null = null;

    let tickerSoundCounter = 0;

    const tick = (timestamp: number) => {
      if (gameStateRef.current !== "PLAYING" || !grenadeAirborneRef.current) return;
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(1, elapsed / duration);

      setGrenadeProgress(progress);

      // Play sizzling fuse and ticking warnings
      tickerSoundCounter++;
      if (tickerSoundCounter % 15 === 0) {
        sfx.playFuseSizzle();
      }
      if (tickerSoundCounter % 24 === 0) {
        sfx.playTick();
      }

      // 1. Aligned start coordinates: Starts precisely at Petrov's throw hand holding position
      const startX = spot.left + spot.width / 2 + 3.5; 
      const startY = spot.top + (spot.enemyOffsetY * 0.22); 
      const endX = 50; // Visual impact landing zone
      const endY = 85; 

      // 2. Cinematic Perspective Velocity: Depth acceleration under 3D projection
      const tView = Math.pow(progress, 1.4); 
      const curX = startX + (endX - startX) * tView;

      // 3. Realistic 3D Ballistic Parabolic Arc
      const arcHeight = -100; // Peak pixel displacement
      const pathArc = arcHeight * progress * (1 - progress) * 4; 
      const curY = startY + (endY - startY) * tView + (pathArc / 3.2); 

      // 4. Cinematic Quadratic Scale Swell (stays small in distance, rushes headlong on camera)
      const curScale = 0.2 + Math.pow(progress, 1.8) * 7.5;
      
      // Aerodynamic tumbling rotational wiggle
      const curRot = progress * 900 + Math.sin(progress * 12) * 20;

      setGrenadeCoords({ x: curX, y: curY, scale: curScale, rot: curRot });

      // 5. Spawn real-time physical fuse sizzles and smoke
      const viewport = gameViewportRef.current;
      if (viewport) {
        const rect = viewport.getBoundingClientRect();
        const px = (curX / 100) * rect.width;
        const py = (curY / 100) * rect.height;
        createFuseSpark(px, py, curScale);
      }

      if (progress < 1) {
        grenadeAnimFrame.current = requestAnimationFrame(tick);
      } else {
        // Impact! Boom! Damage player
        detonateExplosion();
      }
    };

    grenadeAnimFrame.current = requestAnimationFrame(tick);
  };

  // Deter player damage and score subtraction on blast
  const detonateExplosion = () => {
    setGrenadeAirborne(false);
    grenadeAirborneRef.current = false;
    setEnemyActive(false);
    enemyActiveRef.current = false;
    
    // Play explosion audio and screen ringing effect if low health
    const isCritical = lives <= 1;
    sfx.playExplosion(isCritical);

    setShake(true);
    setDamageFlash(true);

    const nextLives = lives - 1;
    setLives(nextLives);
    addeventLog(`💥 CRITICAL DAMAGE: GRENADE DETONATION!`, "damage");

    // Spark shower at camera center impact
    createExplosionSparks(window.innerWidth / 2 || 500, window.innerHeight / 2 || 350, "#ef4444");

    // Add blood splat on camera glass
    const splat: BloodSplatter = {
      id: Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 80 + 40,
      opacity: 0.8
    };
    setBloodSplats(prev => [...prev, splat]);

    if (nextLives <= 1) {
      setCodered(true);
    }

    if (nextLives <= 0) {
      triggerGameOver();
    } else {
      // Spawn next enemy after delay
      triggerEnemySpawnDelay(3000);
    }
  };

  const triggerGameOver = () => {
    sfx.playGameOver();
    setGameState("GAMEOVER");
    gameStateRef.current = "GAMEOVER";
    setEnemyActive(false);
    enemyActiveRef.current = false;
    setGrenadeAirborne(false);
    grenadeAirborneRef.current = false;
    cleanupTimers();

    // Persist Highscore
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem("sniper_highscore", score.toString());
      } catch (e) {
        // Localstorage write shield
      }
    }
  };

  // ==========================================
  // SHOOT & DOUBLE CLICK MECHANICS
  // ==========================================

  const triggerSniperFire = () => {
    if (gameState !== "PLAYING") return;
    if (reloading || recoiling) return; // blocked during rechambering loop

    sfx.playShoot();
    setShotsFired(prev => prev + 1);

    // Dynamic Kick recoil visual feedback
    setRecoiling(true);
    setShootFlash(true);
    setShake(true);

    // Calculate Hit Check
    const successHit = checkHitRegistration();

    // Trigger Bolt mechanical rechamber lock immediately
    setTimeout(() => {
      setRecoiling(false);
      setReloading(true); // show reload chamber block
    }, 180);

    setTimeout(() => {
      setReloading(false); // Reload complete, bolt slide shut
    }, 950);
  };

  // Distance formula / box-overlap coordinate hit handler
  const checkHitRegistration = (): boolean => {
    if (!gameViewportRef.current) return false;
    const viewportRect = gameViewportRef.current.getBoundingClientRect();
    const mx = mousePos.current.x;
    const my = mousePos.current.y;

    // 1. Check Grenade Intercept first
    if (grenadeAirborne) {
      // Match raw coordinates on viewport mapping
      const grenadeScreenX = (grenadeCoords.x / 100) * viewportRect.width;
      const grenadeScreenY = (grenadeCoords.y / 100) * viewportRect.height;
      const grenadeSqueezeRadius = Math.max(22, 10 * grenadeCoords.scale);

      const distanceToGrenade = Math.hypot(mx - grenadeScreenX, my - grenadeScreenY);
      if (distanceToGrenade <= grenadeSqueezeRadius + 30) { // generous aim assistance
        // Success: shot grenade out of raw sky!
        setGrenadeAirborne(false);
        grenadeAirborneRef.current = false;
        sfx.playHit();
        createExplosionSparks(mx, my, "#f97316");
        
        const extraPoints = 150 + level * 20;
        setScore(prev => prev + extraPoints);
        setShotsHit(prev => prev + 1);
        setGrenadesHit(prev => prev + 1);

        addeventLog(`🎯 BULLSEYE: INCOMING GRENADE INTERCEPTED! +${extraPoints}`, "success");
        
        // Clean up the enemy target as well since the threat of this turn is fully cleared!
        setEnemyActive(false);
        enemyActiveRef.current = false;
        
        // Spawn next enemy after delay
        triggerEnemySpawnDelay(3000);
        return true;
      }
    }

    // 2. Check Major Enemy registration
    if (enemyActive && enemyState !== "HIT") {
      const enemyElement = document.getElementById("major-svg-target");
      if (enemyElement) {
        const enemyRect = enemyElement.getBoundingClientRect();
        
        // Check if mouse (mx, my) corresponds inside target bounding rect
        const pad = 15; // friendly aiming assist padding
        const isXOverlap = mx >= (enemyRect.left - viewportRect.left - pad) && 
                          mx <= (enemyRect.right - viewportRect.left + pad);
        const isYOverlap = my >= (enemyRect.top - viewportRect.top - pad) && 
                          my <= (enemyRect.bottom - viewportRect.top + pad);

        if (isXOverlap && isYOverlap) {
          // HIT CONFIRMED!
          setEnemyState("HIT");
          sfx.playHit();
          createExplosionSparks(mx, my, "#dc2626"); // blood spark

          const points = 100;
          setScore(prev => prev + points);
          setShotsHit(prev => prev + 1);

          addeventLog(`🎯 TARGET DOWN! Neutralized in ${COVER_SPOTS[enemyCoverIdx].name}! +${points}`, "success");

          // If a grenade is currently airborne, do NOT cancel it!
          if (grenadeAirborne) {
            // Clear behavior timers so Petrov doesn't do actions, but NOT the airborne grenade loop
            if (enemyBehaviorTimer.current) clearTimeout(enemyBehaviorTimer.current);
            // Spawn of the next enemy is handled dynamically upon grenade detonation or interception.
          } else {
            // Otherwise cancel any preparing/queued throw
            setGrenadeAirborne(false);
            grenadeAirborneRef.current = false;
            cleanupTimers();

            // Spawn next enemy after small latency
            triggerEnemySpawnDelay(3000);
          }
          return true;
        }
      }
    }

    // Miss feedback
    addeventLog(`💨 SYSTEM: MISSED FOCUS COORDS (Range: ${scopeRangeRef.current}m)`, "info");
    createExplosionSparks(mx, my, "#78716c"); // cement/rock dust debris puff
    return false;
  };

  // Handle Double click event directly on viewport wrapping
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    triggerSniperFire();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0e] text-zinc-100 font-sans overflow-x-hidden antialiased select-none">
      
      {/* HEADER TACTICAL STRIP */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-rose-500/30 bg-rose-950/15 text-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all duration-300 hover:border-rose-500/50">
            <Crosshair className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-wider text-zinc-100 font-sans">
                Sniper <span className="text-rose-500 font-medium">Standoff</span>
              </h1>
              <span className="text-[9px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest animate-pulse">
                v2.0 LIVE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">TACTICAL COMBAT ENGAGEMENT • SECTOR BRAVO</p>
          </div>
        </div>

        {/* TOP STATUS */}
        {gameState === "PLAYING" && (
          <div className="hidden lg:flex items-center gap-8 font-mono text-xs text-zinc-400 bg-zinc-900/40 px-6 py-2 rounded-xl border border-zinc-800/60 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">TACTICAL WEAPON</span>
              <span className="text-rose-400 font-bold font-mono">M24 SWS (7.62MM)</span>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">ATMOSPHERE</span>
              <span className="text-zinc-300">4 KTS / SW • DRY</span>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">THERMAL SYS</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* MUTING CONTROLLER */}
        <button
          onClick={toggleMute}
          className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer shadow-sm active:scale-95"
          title={combatMuted ? "Unmute Combat Audio" : "Mute Combat Audio"}
          id="sound-opt-toggle"
        >
          {combatMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </header>

      {/* PRIMARY CONTROLLER BOUNDS */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 w-full max-w-6xl mx-auto">
        
        {/* APPLET WRAPPER CONTAINER */}
        <div className="relative w-full aspect-video md:h-[620px] rounded-3xl border-4 border-zinc-900 bg-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] shadow-rose-950/5 overflow-hidden flex flex-col select-none">
          
          {/* ==========================================
              START SCREEN STATE
             ========================================== */}
          {gameState === "START" && (
            <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center px-6 py-12 z-50 overflow-y-auto">
              {/* Tactical Blueprint Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(244,63,94,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
              
              {/* High-tech Blueprint design lines */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.04)_0%,transparent_75%)] pointer-events-none" />

              <div className="max-w-2xl text-center space-y-8 relative z-10 py-6">
                
                {/* High operating score pill banner */}
                {highScore > 0 && (
                  <div className="inline-flex items-center gap-2 font-mono text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full shadow-sm">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="uppercase tracking-widest font-semibold">HIGH RUN SCORE STATE:</span>
                    <span className="text-zinc-100 font-black">{highScore.toLocaleString()}</span>
                  </div>
                )}

                {/* Stencil titled logo */}
                <div className="space-y-3">
                  <div className="inline-block py-1 px-3 rounded text-[10.5px] font-mono tracking-widest bg-rose-950/40 text-rose-400 border border-rose-900/40 uppercase font-bold">
                    OPERATIONAL DIRECTIVE: OUTPOST RECON
                  </div>
                  <h1 className="text-5xl md:text-7xl font-sans font-black uppercase tracking-tight text-white select-none">
                    SNIPER <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]">STANDOFF</span>
                  </h1>
                </div>

                <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-sans px-6 max-w-xl mx-auto">
                  Take up cover, calibrate your optical lenses, and defend military limits against elite forces led by <span className="text-rose-400 font-bold uppercase underline decoration-rose-500/50 underline-offset-4">Major Petrov</span>. Eliminate him as he peeks out before his chemical grenades detonate your defense chassis.
                </p>

                {/* Micro bento tutorial grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-mono text-xs text-zinc-300 max-w-xl mx-auto py-2">
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/70 hover:border-rose-500/30 hover:bg-zinc-900/60 transition-all duration-300 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-400 text-sm font-bold tracking-wider">
                      <Target className="w-4 h-4 text-rose-500" />
                      <span>AIM LENS</span>
                    </div>
                    <p className="text-zinc-400 leading-normal text-[11px] font-sans">
                      Fly your cursor across the scope window. Native browser pointer is hidden to enforce realistic micro-tracking.
                    </p>
                  </div>

                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/70 hover:border-rose-500/30 hover:bg-zinc-900/60 transition-all duration-300 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-400 text-sm font-bold tracking-wider">
                      <Crosshair className="w-4 h-4 text-rose-500" />
                      <span>DBL CLICK</span>
                    </div>
                    <p className="text-zinc-400 leading-normal text-[11px] font-sans">
                      Double-click to trigger heavy rifle. Keep steady: bolt loading rechamber bars impose lock delays after a discharge.
                    </p>
                  </div>

                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/70 hover:border-rose-500/30 hover:bg-zinc-900/60 transition-all duration-300 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-400 text-sm font-bold tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                      <span>GRENADES</span>
                    </div>
                    <p className="text-zinc-400 leading-normal text-[11px] font-sans">
                      Petrov deploys timed pineapple charges. Shoot him down quickly, or snipe airborne explosives out of the sky!
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={startMission}
                    className="cursor-pointer inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-[0_0_25px_rgba(239,68,68,0.25)] hover:shadow-[0_0_35px_rgba(239,68,68,0.45)] active:scale-95 border-b-4 border-red-800"
                    id="start-mission-btn"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>ENGAGE TARGETS NOW</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              GAME OVER SCREEN STATE
             ========================================== */}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center px-6 py-8 z-50 overflow-y-auto">
              {/* Severe red tint grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.025)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

              <div className="max-w-md w-full text-center space-y-6 relative z-10 py-2">
                
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full text-[10px] font-mono font-bold tracking-widest bg-rose-950/60 text-rose-400 border border-rose-500/20 uppercase shadow-sm">
                    <Skull className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                    <span>OPERATOR OVERRUN</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase text-rose-500 font-sans tracking-tight">
                    MISSION COMPROMISED
                  </h1>
                </div>

                {/* Tactical Stats readout */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 text-left font-mono text-xs divide-y divide-zinc-800/80 space-y-3.5 shadow-xl">
                  <div className="pb-3.5 flex justify-between items-center">
                    <span className="uppercase text-zinc-400 font-medium tracking-wider">COMBAT SCORE</span>
                    <span className="text-2xl font-bold font-sans text-rose-400">{score.toLocaleString()}</span>
                  </div>

                  <div className="py-3.5 flex justify-between items-center">
                    <span className="uppercase text-zinc-400 font-medium tracking-wider">SURVIVED LEVEL</span>
                    <span className="text-amber-400 font-black">LVL {level}</span>
                  </div>

                  <div className="py-3.5 flex justify-between items-center">
                    <span className="uppercase text-zinc-400 font-medium tracking-wider">AIM ACCURACY</span>
                    <span className="text-zinc-200 font-bold">
                      {shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0}% 
                      <span className="text-[10px] text-zinc-500 ml-1.5 font-normal">
                        ({shotsHit}/{shotsFired} SHOTS)
                      </span>
                    </span>
                  </div>

                  <div className="py-3.5 flex justify-between items-center">
                    <span className="uppercase text-zinc-400 font-medium tracking-wider">GRENADES NEUTRALIZED</span>
                    <span className="text-rose-400 font-black">{grenadesHit}</span>
                  </div>

                  <div className="pt-3.5 flex justify-between items-center">
                    <span className="uppercase text-zinc-400 font-medium tracking-wider">HIGH RECORD RATING</span>
                    <span className="text-zinc-100 font-bold">{highScore.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={startMission}
                    className="w-full cursor-pointer inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] border-b-4 border-red-800 active:scale-95"
                    id="redeploy-btn"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin-slow text-rose-200" />
                    <span>REDEPLOY GHOST OPERATOR</span>
                  </button>

                  <p className="text-zinc-500 text-[10px] uppercase font-mono leading-relaxed px-2">
                    📢 OPERATIONAL DEBRIEF: Calibration requires absolute finger lock. Take deep counts and do not shoot blindly to avoid bolt load cooldown cycle!
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              PRIMARY COMBAT GAMEPLAY VIEWPORT
             ========================================== */}
          {gameState === "PLAYING" && (
            <div
              ref={gameViewportRef}
              onMouseMove={handleMouseMove}
              onDoubleClick={handleDoubleClick}
              className={`relative flex-1 overflow-hidden select-none cursor-crosshair transition-all duration-75 ${
                shake ? "translate-y-2 translate-x-1 duration-0 border-rose-500" : ""
              }`}
              style={{
                // Shaking camera animation trigger
                animation: shake ? "shake-visual 0.1s infinite" : "none"
              }}
              id="game-lens-viewport"
            >
              
              {/* AESTHETIC VINTAGE TV SCANLINES OVERLAY */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.14)_50%)] bg-[size:100%_4px] pointer-events-none z-10" />

              {/* OUT OF LIVES RED CRITICAL HUD WARNING STRIP CHASSIS */}
              {codered && (
                <div className="absolute inset-0 ring-4 ring-red-500/50 ring-inset pointer-events-none animate-pulse-fast z-[29]" />
              )}

              {/* BACKGROUND SKY DRIFT */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#b45309] via-[#3f1903] to-[#141212] pointer-events-none">
                {/* Visual Sun flare glowing */}
                <div className="absolute top-[18%] left-[58%] w-[330px] h-[330px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />
                
                {/* Mountain Silhouette vectors */}
                <svg className="absolute bottom-1/3 left-0 w-full h-[160px] text-[#131111] fill-current opacity-70 pointer-events-none" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  <path d="M0,80 L80,30 L180,65 L290,20 L380,55 L450,40 L585,75 L670,25 L790,60 L900,30 L1000,75 L1000,100 L0,100 Z" />
                </svg>

                <svg className="absolute bottom-1/4 left-0 w-full h-[120px] text-[#0a0909] fill-current opacity-90 pointer-events-none" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  <path d="M0,90 L120,40 L230,70 L340,30 L410,60 L520,35 L680,75 L760,20 L890,65 L1000,45 L1000,100 L0,100 Z" />
                </svg>
              </div>

              {/* PARTICLES DRIFTING GLOBALLY */}
              {ambientDust.map(p => (
                <div
                  key={p.id}
                  className="absolute rounded-full bg-amber-500/20 pointer-events-none"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    opacity: p.opacity,
                    transform: `rotate(${p.rotation}deg)`,
                    transition: "opacity 0.2s"
                  }}
                />
              ))}

              {/* WARNING GRENADE TRACK OVERHEAD TICKER */}
              {grenadeAirborne && (
                <div className="absolute top-18 left-1/2 -translate-x-1/2 bg-rose-500 text-white font-mono font-black text-[10px] md:text-xs uppercase px-5 py-2 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-rose-300/30 tracking-widest flex items-center gap-2 z-[25] animate-pulse">
                  <ShieldAlert className="w-4 h-4 animate-bounce" />
                  <span>ALERT: THREAT GRENADE INCOMING! AIM & SHOOT DIRECTLY!</span>
                </div>
              )}

              {/* ==========================================
                  TARGET ENEMIES (Behind Covers Z-index=10)
                 ========================================== */}
              {enemyActive && (
                <div
                  className="absolute pointer-events-none transition-all duration-300"
                  style={{
                    left: `${COVER_SPOTS[enemyCoverIdx].left}%`,
                    top: `${COVER_SPOTS[enemyCoverIdx].top}%`,
                    width: `${COVER_SPOTS[enemyCoverIdx].width}%`,
                    height: `${COVER_SPOTS[enemyCoverIdx].height}%`,
                    zIndex: 10,
                  }}
                >
                  {/* Enemy Position Container sits exact center */}
                  <div
                    id="major-svg-target"
                    className={`absolute left-1/2 w-[75px] h-[95px] md:w-[95px] md:h-[115px] -translate-x-1/2 transition-transform duration-350 ${
                      enemyState === "HIT" 
                        ? "translate-y-[125%] rotate-45 opacity-0 scale-75 duration-500" 
                        : enemyState === "PREPARE" || enemyState === "THROWN"
                          ? "translate-y-0 opacity-100 scale-100"
                          : "translate-y-0 opacity-100 scale-100" // PEEKING
                    }`}
                    style={{
                      top: `${COVER_SPOTS[enemyCoverIdx].enemyOffsetY}px`,
                      transformOrigin: "bottom center"
                    }}
                  >
                    {/* ENEMY VECTOR DRAWING */}
                    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl" id="enemy-soldier-major">
                      {/* Red Target Aura Indicator while aiming */}
                      <circle cx="50" cy="50" r="44" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5 5" className="animate-spin-slow opacity-85" />
                      {/* Body Camouflage fatigues */}
                      <path d="M22,95 L78,95 L72,68 C72,68 62,55 50,55 C38,55 28,68 28,68 Z" fill="#2d3722" stroke="#1c2114" strokeWidth="2" />
                      {/* Camouflage spots */}
                      <path d="M34,70 Q40,65 44,72 L42,88 Q32,84 34,70 Z" fill="#3f4e30" />
                      {/* Camo sand spots */}
                      <path d="M56,74 Q62,68 66,75 L62,86 L54,82 Z" fill="#8c7a5c" />
                      
                      {/* Arms lifting grenade when pre-throwing */}
                      {(enemyState === "PREPARE" || enemyState === "PEEK") && (
                        <g className="animate-pulse">
                          {/* Throw Hand holding Pineapple shell */}
                          <path d="M72,75 Q85,55 88,38 L80,34 Q74,52 70,72 Z" fill="#2d3722" stroke="#1c2114" strokeWidth="1.5" />
                          <circle cx="86" cy="36" r="8" fill="#5c6340" stroke="#252a16" strokeWidth="1" />
                          {/* Red glowing trigger fuse sparks on grenade */}
                          <circle cx="86" cy="36" r="3.5" fill="#f43f5e" className="animate-ping" />
                        </g>
                      )}

                      {/* Arm snap release pose after throwing the grenade */}
                      {enemyState === "THROWN" && (
                        <g>
                          {/* Arm completely swiped down-right in a high-speed follow-through motion */}
                          <path d="M72,75 Q86,85 86,92 L78,95 Q74,84 70,72 Z" fill="#2d3722" stroke="#1c2114" strokeWidth="1.5" />
                          {/* Empty brown leather military glove representing release */}
                          <circle cx="82" cy="93" r="5" fill="#5c6340" stroke="#252a16" strokeWidth="1" />
                        </g>
                      )}

                      {/* Head neck */}
                      <rect x="42" y="45" width="16" height="15" fill="#d97706" rx="2" stroke="#78350f" strokeWidth="1.5" />

                      {/* Face */}
                      <circle cx="50" cy="38" r="18" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />

                      {/* Giant General Mustache */}
                      <path d="M30,42 Q50,42 50,45 Q50,42 70,42 Q50,54 30,42 Z" fill="#1c1917" stroke="#000" strokeWidth="1" />

                      {/* Visor aviator Sunglasses */}
                      <polygon points="34,31 48,31 46,39 36,39" fill="#1c1917" stroke="#000" />
                      <polygon points="52,31 66,31 64,39 54,39" fill="#1c1917" stroke="#000" />
                      <line x1="48" y1="33" x2="52" y2="33" stroke="#000" strokeWidth="2" />
                      {/* Sunglasses shine blue line */}
                      <line x1="36" y1="33" x2="44" y2="37" stroke="#67e8f9" strokeWidth="1" opacity="0.8" />
                      <line x1="54" y1="33" x2="62" y2="37" stroke="#67e8f9" strokeWidth="1" opacity="0.8" />

                      {/* Scowl Eyebrows */}
                      <path d="M33,26 Q46,29 48,30" stroke="#1c1917" strokeWidth="2" fill="none" />
                      <path d="M67,26 Q54,29 52,30" stroke="#1c1917" strokeWidth="2" fill="none" />

                      {/* General Beret tilted right side */}
                      <path d="M26,26 Q44,8 66,16 Q72,21 72,28 Q50,22 28,28 Z" fill="#991b1b" stroke="#581010" strokeWidth="1.5" />
                      <path d="M32,27 L68,27" stroke="#1a0404" strokeWidth="3" />
                      {/* Little Gold metal badge medal */}
                      <polygon points="46,20 48,15 50,20 45,17 51,17" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
                    </svg>

                    {/* RED HEADSHOT TARGET HIGHLIGHT (Eye grabber) */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 border-2 border-rose-500 rounded-full animate-ping opacity-75 pointer-events-none" />
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm select-none pointer-events-none tracking-wider uppercase">
                      TARGET
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  FOREGROUND COVERS (Z-index=20 overlays)
                 ========================================== */}
              <div className="absolute inset-x-0 bottom-0 top-[40%] pointer-events-none z-20">
                {COVER_SPOTS.map((spot, idx) => (
                  <div
                    key={spot.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${spot.left}%`,
                      top: `${spot.top - 40}%`, // offset adjusted
                      width: `${spot.width}%`,
                      height: `${spot.height * 2}%`,
                    }}
                  >
                    {/* SVG COVER RENDER */}
                    {spot.id === "ruin-left" && (
                      <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-2xl">
                        {/* Bricks stack concrete wall block with cracks and metal poles */}
                        <rect x="0" y="30" width="100" height="120" fill="#424b5a" stroke="#2a303c" strokeWidth="3" />
                        {/* Brick outlines */}
                        <line x1="0" y1="60" x2="100" y2="60" stroke="#191d24" strokeWidth="2" opacity="0.6" />
                        <line x1="0" y1="90" x2="100" y2="90" stroke="#191d24" strokeWidth="2" opacity="0.6" />
                        <line x1="0" y1="120" x2="100" y2="120" stroke="#191d24" strokeWidth="2" opacity="0.6" />
                        
                        <line x1="30" y1="30" x2="30" y2="60" stroke="#191d24" strokeWidth="2" opacity="0.6" />
                        <line x1="70" y1="30" x2="70" y2="60" stroke="#191d24" strokeWidth="2" opacity="0.6" />
                        <line x1="50" y1="60" x2="50" y2="90" stroke="#191d24" strokeWidth="2" opacity="0.6" />
                        <line x1="20" y1="90" x2="20" y2="120" stroke="#191d24" strokeWidth="2" opacity="0.6" />
                        <line x1="80" y1="90" x2="80" y2="120" stroke="#191d24" strokeWidth="2" opacity="0.6" />

                        {/* Cracked corner */}
                        <path d="M0,35 L40,35 L30,48 L45,55 L35,68 L50,75 L40,95 L0,95" fill="#2c323f" stroke="#191d24" strokeWidth="2" />
                        <path d="M100,50 L80,55 L90,70 L75,76 L85,90 L60,110 L100,110" fill="#2c323f" />

                        {/* Exposed industrial reinforcement rusted rebar steel */}
                        <line x1="15" y1="0" x2="15" y2="30" stroke="#78350f" strokeWidth="3" />
                        <line x1="25" y1="5" x2="25" y2="30" stroke="#78350f" strokeWidth="2.5" />
                        <line x1="85" y1="-5" x2="85" y2="50" stroke="#78350f" strokeWidth="3" />
                      </svg>
                    )}

                    {spot.id === "boulder-left" && (
                      <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-2xl">
                        {/* Sandstone rugged canyons rocks */}
                        <path d="M0,150 L5,75 L25,48 L55,42 L85,62 L100,90 L100,150 Z" fill="#6f210a" stroke="#3c1303" strokeWidth="3" />
                        {/* Shading/Grooves lines */}
                        <path d="M25,48 L40,82 L35,150" stroke="#300d03" strokeWidth="4" fill="none" opacity="0.7" />
                        <path d="M55,42 L65,88 L75,150" stroke="#300d03" strokeWidth="5" fill="none" opacity="0.7" />
                        {/* Dust highlights */}
                        <path d="M5,75 Q25,72 55,78" stroke="#87290a" strokeWidth="2" fill="none" opacity="0.6" />
                      </svg>
                    )}

                    {spot.id === "sandbag-center" && (
                      <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-2xl">
                        {/* Layers of stacked canvas sandbags */}
                        {/* Bottom Row */}
                        <rect x="0" y="110" width="38" height="40" rx="6" fill="#61230e" stroke="#381303" strokeWidth="2.5" />
                        <rect x="34" y="110" width="38" height="40" rx="6" fill="#61230e" stroke="#381303" strokeWidth="2.5" />
                        <rect x="68" y="110" width="36" height="40" rx="6" fill="#61230e" stroke="#381303" strokeWidth="2.5" />
                        
                        {/* Middle Row */}
                        <rect x="15" y="75" width="36" height="38" rx="6" fill="#a14704" stroke="#381303" strokeWidth="2.5" />
                        <rect x="48" y="75" width="38" height="38" rx="6" fill="#a14704" stroke="#381303" strokeWidth="2.5" />
                        
                        {/* Top Single Bag */}
                        <rect x="28" y="45" width="44" height="34" rx="6" fill="#ca6a02" stroke="#381303" strokeWidth="2.5" />

                        {/* Cloth folds decoration details */}
                        <path d="M38,55 Q50,48 62,55" stroke="#6b2f0a" fill="none" strokeWidth="1.5" />
                        <path d="M25,88 Q35,80 43,88" stroke="#6b2f0a" fill="none" strokeWidth="1.5" />
                        <path d="M56,88 Q65,80 74,88" stroke="#6b2f0a" fill="none" strokeWidth="1.5" />
                      </svg>
                    )}

                    {spot.id === "scrap-pile" && (
                      <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-2xl">
                        {/* Scrap industrial pile: rusty barrel and metal plate casing */}
                        {/* Oil drum */}
                        <rect x="15" y="60" width="45" height="90" rx="3" fill="#0f6e2e" stroke="#0e3a1d" strokeWidth="2.5" />
                        <line x1="15" y1="85" x2="60" y2="85" stroke="#0e3a1d" strokeWidth="3" />
                        <line x1="15" y1="115" x2="60" y2="115" stroke="#0e3a1d" strokeWidth="3" />
                        {/* Rust stains */}
                        <path d="M18,65 Q30,75 25,95" stroke="#a14704" strokeWidth="4" fill="none" opacity="0.6" />
                        <path d="M44,110 L50,135" stroke="#a14704" strokeWidth="5" fill="none" opacity="0.6" />

                        {/* Hazard warning steel sheets foreground */}
                        <polygon points="45,150 95,95 100,150" fill="#67625e" stroke="#34312e" strokeWidth="2" />
                        {/* Hazard stripes */}
                        <path d="M58,135 L68,125" stroke="#ca6a02" strokeWidth="4" />
                        <path d="M70,123 L80,113" stroke="#ca6a02" strokeWidth="4" />
                        <path d="M82,111 L92,101" stroke="#ca6a02" strokeWidth="4" />
                      </svg>
                    )}

                    {spot.id === "container-right" && (
                      <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-2xl">
                        {/* Rusty shipping container with lines and latch bars */}
                        <rect x="5" y="10" width="95" height="140" fill="#a11515" rx="4" stroke="#3a0404" strokeWidth="3" />
                        {/* Corrugated Vertical ribs */}
                        <line x1="20" y1="10" x2="20" y2="150" stroke="#6d1212" strokeWidth="3" />
                        <line x1="35" y1="10" x2="35" y2="150" stroke="#6d1212" strokeWidth="3" />
                        <line x1="50" y1="10" x2="50" y2="150" stroke="#6d1212" strokeWidth="3" />
                        <line x1="65" y1="10" x2="65" y2="150" stroke="#6d1212" strokeWidth="3" />
                        <line x1="80" y1="10" x2="80" y2="150" stroke="#6d1212" strokeWidth="3" />

                        {/* Steel locking rods door hardware */}
                        <line x1="42" y1="20" x2="42" y2="140" stroke="#4b5563" strokeWidth="2" />
                        <line x1="58" y1="20" x2="58" y2="140" stroke="#4b5563" strokeWidth="2" />
                        <rect x="38" y="75" width="8" height="15" fill="#1f2937" />
                        <rect x="54" y="75" width="8" height="15" fill="#1f2937" />

                        {/* Rust stains */}
                        <path d="M8,15 Q30,45 15,80" stroke="#6f210a" strokeWidth="7" fill="none" opacity="0.4" />
                        <path d="M72,30 Q92,72 82,105" stroke="#6f210a" strokeWidth="5" fill="none" opacity="0.4" />
                      </svg>
                    )}

                  </div>
                ))}
              </div>

              {/* ==========================================
                  FLYING RED TIMER GRENADE (Z-index=30)
                 ========================================== */}
              {grenadeAirborne && (
                <div
                  className="absolute pointer-events-none select-none transition-all duration-75 z-30"
                  style={{
                    left: `${grenadeCoords.x}%`,
                    top: `${grenadeCoords.y}%`,
                    transform: `translate(-50%, -50%) scale(${grenadeCoords.scale}) rotate(${grenadeCoords.rot}deg)`,
                    width: "48px",
                    height: "48px"
                  }}
                >
                  {/* Glowing pineapple bomb vector */}
                  <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-2xl">
                    <defs>
                      <radialGradient id="fuse-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fca5a5" />
                        <stop offset="50%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="transparent" />
                      </radialGradient>
                    </defs>

                    {/* Red warning active pulse back aura */}
                    <circle cx="20" cy="20" r="18" fill="url(#fuse-glow)" className="animate-pulse" />

                    {/* Outer dark metal core shell */}
                    <circle cx="20" cy="22" r="11" fill="#292524" stroke="#1c1917" strokeWidth="1.5" />
                    
                    {/* Shell lines segmented pattern (pineapple grid) */}
                    <path d="M12,22 L28,22 M20,11 L20,33 M15,15 L25,29 M15,29 L25,15" stroke="#1c1917" strokeWidth="1.5" opacity="0.8" />

                    {/* Handle and pin cap on top */}
                    <rect x="17" y="7" width="6" height="5" fill="#44403c" stroke="#1c1917" strokeWidth="1" />
                    <circle cx="15" cy="8" r="4" fill="none" stroke="#78716c" strokeWidth="1.5" />
                    
                    {/* Fiery sizzle active fuse wire */}
                    <path d="M20,7 Q25,2 23,-3" fill="none" stroke="#f59e0b" strokeWidth="2" />
                    {/* Flame head spark */}
                    <circle cx="23" cy="-3" r="3" fill="#fca5a5" className="animate-ping" />
                    <circle cx="23" cy="-3" r="2.5" fill="#ef4444" />
                  </svg>

                  {/* HIGH THREAT WARNING CORNER METRIC OVERLAY */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="bg-rose-600 text-white text-[8px] font-mono font-black py-0.5 px-2 rounded-full uppercase tracking-wider animate-bounce shadow-sm">
                      💥 CAUTION
                    </span>
                    <span className="text-[7.5px] text-rose-400 font-mono font-bold mt-0.5 select-none whitespace-nowrap bg-zinc-950/80 px-1 py-0.5 rounded border border-rose-500/10">
                      {(Math.round(grenadeCoords.scale * 10)) / 10}x PROXIMITY
                    </span>
                  </div>
                </div>
              )}

              {/* ==========================================
                  DAMAGE BLOOD SPlATTERS & CAMERA EFFECT (Z-index=35)
                 ========================================== */}
              <div className="absolute inset-0 pointer-events-none z-35 mix-blend-multiply select-none">
                {bloodSplats.map(s => (
                  <svg
                    key={s.id}
                    className="absolute text-red-950/45 fill-current opacity-80"
                    style={{
                      left: `${s.x}%`,
                      top: `${s.y}%`,
                      width: `${s.size}px`,
                      height: `${s.size}px`,
                    }}
                    viewBox="0 0 100 100"
                  >
                    {/* Random splat vector path */}
                    <path d="M50,10 Q55,40 70,30 Q85,20 75,50 Q85,80 50,75 Q20,80 30,50 Q15,20 50,10 Z" />
                    <circle cx="20" cy="30" r="4" />
                    <circle cx="75" cy="25" r="3.5" />
                    <circle cx="82" cy="65" r="5" />
                    <circle cx="32" cy="72" r="3" />
                  </svg>
                ))}
              </div>

              {/* GUN TRIGGER FIRE FLUX LIGHT SPLITS */}
              {shootFlash && (
                <div className="absolute inset-0 bg-amber-400/20 pointer-events-none mix-blend-overlay z-[36] duration-0 transition-none" />
              )}
              {damageFlash && (
                <div className="absolute inset-0 bg-rose-950/40 pointer-events-none z-[36] duration-0 transition-none" />
              )}

              {/* RENDERING REAL-TIME SMOKE SPARKS */}
              <div className="absolute inset-0 pointer-events-none z-[37]">
                {sparks.map(s => (
                  <div
                    key={s.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: `${s.x}px`,
                      top: `${s.y}px`,
                      width: `${s.size}px`,
                      height: `${s.size}px`,
                      backgroundColor: s.color,
                      opacity: s.opacity,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
              </div>

              {/* ==========================================
                  TACTICAL SNIPER SCOPE LENS OVERLAY (Z-index=40)
                  Note: Centers exact around relative mouse coord mousePos.current
                 ========================================== */}
              <div
                ref={scopeRef}
                className="absolute w-[360px] h-[360px] md:w-[460px] md:h-[460px] pointer-events-none z-40 select-none"
                style={{
                  top: 0,
                  left: 0,
                  transform: "translate3d(150px, 150px, 0)",
                  willChange: "transform",
                }}
              >
                {/* 1. Outside massive black mask overlay extending out */}
                <div className="absolute -inset-[1500px] border-[1500px] border-zinc-950/98 rounded-full pointer-events-none" />
                
                {/* 2. Glass Lens Tube Cylinder rim shadow vignette circle */}
                <div className="absolute inset-0 rounded-full border-[10px] border-zinc-900 shadow-[inset_0_0_90px_rgba(0,0,0,0.98)] pointer-events-none" />

                {/* 3. Mild tint lens color reflections */}
                <div className="absolute inset-0 rounded-full bg-rose-500/5 mix-blend-color-dodge pointer-events-none" />

                {/* 4. CROSSHAIR AND GRID LINES OVERLAY */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  
                  {/* Vertical Reticle Line */}
                  <div className="absolute bottom-5 top-5 w-[1.5px] bg-rose-500/80" />
                  {/* Horizontal Reticle Line */}
                  <div className="absolute left-5 right-5 h-[1.5px] bg-rose-500/80" />

                  {/* Bullet Drop mil-dot tree markings ticks on center */}
                  <div className="absolute flex flex-col gap-3.5 justify-center items-center pointer-events-none">
                    <div className="w-5 h-[1.5px] bg-rose-500" />
                    <div className="w-2.5 h-[1px] bg-rose-500/80" />
                    <div className="w-5 h-[1.5px] bg-rose-500" />
                    <div className="w-2.5 h-[1px] bg-rose-500/80" />
                    <div className="w-8 h-[1.5px] bg-rose-500" />
                  </div>

                  {/* Windage horizontal tick markings */}
                  <div className="absolute flex gap-3.5 justify-center items-center pointer-events-none">
                    <div className="h-5 w-[1.5px] bg-rose-500/80" />
                    <div className="h-2.5 w-[1px] bg-rose-500/60" />
                    <div className="h-5 w-[1.5px] bg-rose-500" />
                    <div className="h-2.5 w-[1px] bg-rose-500/60" />
                    <div className="h-5 w-[1.5px] bg-rose-500/80" />
                  </div>

                  {/* Outer secondary reticle circle limits */}
                  <div className="absolute w-[72%] h-[72%] rounded-full border border-rose-500/35 pointer-events-none" />
                  <div className="absolute w-[42%] h-[42%] rounded-full border border-rose-500/15 pointer-events-none" />

                  {/* Absolute Center Tiny Red Laser sight dot */}
                  <div className="absolute w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444] z-10" />

                  {/* Double Click prompt inside lens directly */}
                  <div className="absolute bottom-16 text-center font-mono text-[8px] tracking-widest text-rose-400 bg-zinc-950/85 px-2.5 py-1 rounded border border-rose-500/20 shadow select-none uppercase">
                    DBL-CLICK CHAMBER FIRE
                  </div>

                  {/* Reload / Rechamber indicator */}
                  {reloading && (
                    <div className="absolute top-[28%] bg-zinc-950 border border-amber-500/50 px-4 py-1.5 rounded-lg text-[10px] text-amber-500 font-mono uppercase tracking-widest animate-pulse flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Bolt action cycling</span>
                    </div>
                  )}

                  {/* Recoil Kick flash blocking pointer */}
                  {recoiling && (
                    <div className="absolute inset-0 rounded-full bg-zinc-950 opacity-95 transition-none" />
                  )}

                  {/* Real-time Dynamic Lens Telemetry text readouts */}
                  <div className="absolute top-18 left-14 text-left font-mono text-[9px] text-rose-500/90 space-y-0.5 select-none hidden md:block">
                    <div id="scope-range-val">RNG: {scopeRangeRef.current}m</div>
                    <div>WND: 4 KT</div>
                    <div>CAL: NORMAL</div>
                  </div>

                  <div className="absolute top-18 right-14 text-right font-mono text-[9px] text-rose-500/90 space-y-0.5 select-none hidden md:block">
                    <div>SYS: OPERATIONAL</div>
                    <div>BAT: 94%</div>
                    <div>ZOOM: 12x</div>
                  </div>

                  {/* Bottom digital angle pitch dial */}
                  <div className="absolute bottom-11 text-center font-mono text-[9px] text-rose-400 bg-zinc-950/85 px-3 py-1 rounded border border-rose-500/20 shadow-sm select-none">
                    AZ: 042° / EL: -12°
                  </div>

                </div>
              </div>

              {/* ==========================================
                  TACTICAL HUD ELEMENTS (Z-index=45)
                 ========================================== */}
              
              {/* TOP HUD ROW BAR: OPERATOR BIO & MISSION RATING */}
              <div className="absolute top-4 inset-x-6 flex items-center justify-between z-[45] pointer-events-none">
                {/* Left sector status */}
                <div className="flex flex-col gap-1.5 text-left font-mono pointer-events-auto bg-zinc-950/90 backdrop-blur-md p-3.5 rounded-xl border border-zinc-800/80 shadow-md">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-zinc-200 font-extrabold uppercase tracking-wide">OPERATOR ID: SPECTRE-1</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">HEALTH MONITOR:</span>
                    <div className="flex gap-1.5 text-rose-600">
                      {Array.from({ length: 1 }).map((_, i) => (
                        <Heart
                          key={i}
                          className={`w-4 h-4 transition-all duration-350 ${i < lives ? "fill-current text-rose-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" : "text-zinc-800 fill-none"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Metrics Tracker */}
                <div className="flex flex-col gap-1 text-right font-mono pointer-events-auto bg-zinc-950/90 backdrop-blur-md p-3.5 rounded-xl border border-zinc-800/80 shadow-md">
                  <div className="text-[9px] text-zinc-500 font-extrabold tracking-widest">DEPLOYMENT LEVEL</div>
                  <div className="text-sm font-bold font-sans text-zinc-300">
                    RATING: <span className="text-rose-500 font-mono text-xl font-bold">{score.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    DIFFICULTY RATING: <span className="text-amber-500 font-bold uppercase">LVL {level}</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM SYSTEM CONSOLE LOG SCROLL (Immersion logs) */}
              <div className="absolute bottom-4 left-6 max-w-[280px] space-y-1.5 z-[45] pointer-events-none hidden md:block text-left font-mono">
                {scrollingLogs.map(log => (
                  <div
                    key={log.id}
                    className={`text-[9.5px] py-1 px-3 rounded-lg border leading-tight shadow-sm select-none transition-all ${
                      log.type === "success"
                        ? "bg-emerald-950/90 text-emerald-300 border-emerald-800/30 font-semibold"
                        : log.type === "warning"
                          ? "bg-amber-950/90 text-amber-300 border-amber-800/30"
                          : log.type === "damage"
                            ? "bg-rose-950/95 text-rose-200 border-rose-800/40 animate-pulse font-bold"
                            : "bg-zinc-900/90 text-zinc-300 border-zinc-800/50"
                    }`}
                  >
                    {log.message}
                  </div>
                ))}
              </div>

              {/* BOTTOM RIGHT WEAPON CALIBER & COOLDOWN HUD SLOT */}
              <div className="absolute bottom-4 right-6 pointer-events-auto z-[45] bg-zinc-950/90 backdrop-blur-md p-4 rounded-xl border border-zinc-800/80 flex items-center gap-4 shadow-lg text-right font-mono select-none">
                <div className="flex flex-col justify-center">
                  <span className="text-[8.5px] text-zinc-500 font-bold uppercase tracking-wider">CHAMBER SECURITY</span>
                  {reloading ? (
                    <span className="text-amber-500 font-black text-xs uppercase animate-pulse">RECYCLING FLAP...</span>
                  ) : recoiling ? (
                    <span className="text-rose-500 font-black text-xs uppercase animate-pulse">RECOIL FORCE</span>
                  ) : (
                    <span className="text-rose-400 font-bold text-xs uppercase tracking-wide">RIFLE READY</span>
                  )}

                  {/* Loader progress bar */}
                  <div className="w-28 bg-zinc-800 h-2 rounded mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${
                        reloading ? "bg-amber-500 transition-none" : recoiling ? "bg-rose-500" : "bg-rose-500"
                      }`}
                      style={{
                        width: reloading ? "20%" : recoiling ? "0%" : "100%",
                        transition: reloading ? "none" : "width 0.9s ease"
                      }}
                    />
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-zinc-800" />

                <div className="flex flex-col text-center">
                  <span className="text-[8.5px] text-zinc-500 font-bold uppercase tracking-wider">CALIBER</span>
                  <span className="text-zinc-300 font-bold text-sm leading-tight font-sans">7.62 • NATO</span>
                  <span className="text-[8px] text-zinc-500 uppercase mt-0.5">FMJ M24</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* EXTERNAL FOOTER STATS INFO */}
        <div className="mt-4 flex flex-wrap gap-4 items-center justify-between w-full text-zinc-500 text-xs font-mono px-2">
          <div>
            <span>TACTICAL POINT OUTPOST ENGAGEMENT ZONE</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900/60 px-3 py-1 rounded-full border border-zinc-800/60 shadow-sm">
              <Crosshair className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>DOUBLE-CLICK LENS TO FIRE HEAVY CALIBER</span>
            </span>
          </div>
        </div>

      </main>

      {/* FOOTER METADATA */}
      <footer className="mt-auto border-t border-zinc-900/80 bg-zinc-950/80 py-5 px-6 text-center text-xs text-zinc-500 font-mono">
        <div className="tracking-wide">
          SNIPER STANDOFF &copy; {new Date().getFullYear()} / FOR BRAVO PLANK DIVISION UNIT
        </div>
        <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest font-medium">
          Synthesized Soundwave Engine Configured on Web Audio API Nodes • Direct Pure Oscillator Sines • Fully Assetless
        </div>
      </footer>

    </div>
  );
}
