import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ElectricityMaterial as Material } from "@/content/electricityMaterialScience";
import { MaterialScienceMoreDialog } from "@/components/MaterialScienceMoreDialog";
import { ElectricityLabTabs } from "@/components/ElectricityLabTabs";

type EnergyMode = "button" | "handle";

const CONDUCTIVITY: Record<Material, number> = {
  copper: 1,
  wood: 0.24,
  plastic: 0.04,
};

/**
 * Motion model vs material: metals = freer random walk + easy drift along path;
 * insulators = tighter “vibration around atoms”, weak bulk drift, no free wrap along wire.
 */
const MOTION_BY_MATERIAL: Record<
  Material,
  {
    wanderScale: number;
    /** Hooke-style pull toward anchor — higher = more “stuck vibrating in place”. */
    springK: number;
    /** Velocity multiplier each frame (lower = heavier damping). */
    velocityDamp: number;
    /** Scales organized drift beyond conductivity alone. */
    driftScale: number;
    /** Free carriers re-enter left; insulators bounce at ends of the path. */
    periodicWrapX: boolean;
  }
> = {
  copper: { wanderScale: 1, springK: 0, velocityDamp: 0.985, driftScale: 1, periodicWrapX: true },
  wood: { wanderScale: 0.58, springK: 0.09, velocityDamp: 0.982, driftScale: 0.85, periodicWrapX: true },
  /* Plastic: still thermally “alive” (tiny jitter), but localized — not frozen at 0 K. */
  plastic: { wanderScale: 0.4, springK: 0.22, velocityDamp: 0.965, driftScale: 0.65, periodicWrapX: false },
};

const MATERIAL_LABEL: Record<Material, string> = {
  copper: "Copper — easy flow",
  wood: "Wood — harder flow",
  plastic: "Plastic — insulator",
};

/** Short “why” for the sim — matches intro level; wood/plastic differ in real life too. */
const MATERIAL_SCIENCE_NOTE: Record<Material, string> = {
  copper:
    "In a metal like copper, many electrons are effectively free to drift through the lattice when a push is applied, so current can build up quickly.",
  wood:
    "Wood is not a metal: charges cannot drift through it as freely as in copper. Electrons stay tied up in molecules and a messy structure, so organized flow stays weak (this lab makes that difference obvious).",
  plastic:
    "In a good insulator like plastic, charges are tightly bound: they still jiggle with thermal energy (vibration), but they do not drift through the bulk like in a metal. There are almost no free carriers, so organized current stays tiny even with the same push.",
};

/** When lab “current” is max (push × conductivity = 1), meter tops out here — gives readouts in the few-amp range on copper. */
const AMMETER_FULL_SCALE_AMPS = 3.5;

function formatElectricCurrent(amps: number): string {
  const a = Math.max(0, amps);
  if (a >= 1) {
    const t = Math.round(a * 10) / 10;
    return Number.isInteger(t) ? `${t} A` : `${t.toFixed(1)} A`;
  }
  return `${Math.round(a * 1000)} mA`;
}

function isDocumentDark() {
  return document.documentElement.classList.contains("dark");
}

/** Outer “wire / material” shell: look changes with copper vs wood vs plastic. */
function drawMaterialChannel(
  ctx: CanvasRenderingContext2D,
  bounds: { left: number; top: number; right: number; bottom: number; r: number },
  material: Material,
) {
  const { left, top, right, bottom, r } = bounds;
  const x = left - 6;
  const y = top - 6;
  const rw = right - left + 12;
  const rh = bottom - top + 12;
  const dark = isDocumentDark();

  ctx.beginPath();
  ctx.roundRect(x, y, rw, rh, r);

  if (material === "copper") {
    const g = ctx.createLinearGradient(x, y, x + rw, y + rh);
    if (dark) {
      g.addColorStop(0, "hsl(32 34% 26%)");
      g.addColorStop(0.5, "hsl(28 38% 20%)");
      g.addColorStop(1, "hsl(24 32% 16%)");
    } else {
      g.addColorStop(0, "hsl(38 52% 90%)");
      g.addColorStop(0.45, "hsl(32 46% 80%)");
      g.addColorStop(1, "hsl(28 42% 68%)");
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = dark ? "hsl(34 48% 52%)" : "hsl(26 52% 34%)";
    ctx.lineWidth = 2.75;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, rw - 4, Math.min(rh * 0.38, rh - 8), Math.max(2, r - 3));
    ctx.strokeStyle = dark ? "hsla(40, 45%, 58%, 0.2)" : "hsla(45, 90%, 96%, 0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (material === "wood") {
    ctx.fillStyle = dark ? "hsl(28 28% 20%)" : "hsl(34 38% 74%)";
    ctx.fill();
    ctx.strokeStyle = dark ? "hsl(32 36% 38%)" : "hsl(26 42% 32%)";
    ctx.lineWidth = 2.75;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, rw, rh, r);
    ctx.clip();
    const bottomY = y + rh;
    const grainAlpha = dark ? 0.14 : 0.2;
    for (let i = -2; i < rw / 5 + 3; i++) {
      ctx.strokeStyle = dark ? `hsla(25, 32%, 52%, ${grainAlpha})` : `hsla(28, 40%, 28%, ${grainAlpha})`;
      ctx.lineWidth = 1.1;
      const gx = x + i * 6.5 + (i % 4) * 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.quadraticCurveTo(gx + 5 + (i % 3) * 2, y + rh * 0.5, gx - 1.5, bottomY);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    const g = ctx.createLinearGradient(x, y, x, y + rh);
    if (dark) {
      g.addColorStop(0, "hsl(218 14% 28%)");
      g.addColorStop(0.55, "hsl(220 12% 20%)");
      g.addColorStop(1, "hsl(222 10% 14%)");
    } else {
      g.addColorStop(0, "hsl(218 18% 95%)");
      g.addColorStop(0.55, "hsl(220 14% 88%)");
      g.addColorStop(1, "hsl(220 12% 80%)");
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = dark ? "hsl(215 14% 48%)" : "hsl(220 10% 58%)";
    ctx.lineWidth = 2.25;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(x + 2.5, y + 2.5, rw - 5, Math.min(rh * 0.28, rh - 6), Math.max(2, r - 3));
    ctx.strokeStyle = dark ? "hsla(210, 18%, 62%, 0.22)" : "hsla(0, 0%, 100%, 0.65)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

const PARTICLE_COUNT = 110;
const FLOW_AXIS_SPEED = 0.42;

/** Small negative-charge glyph: filled circle with a horizontal bar (electron convention). */
function drawElectronCharge(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "hsl(225 58% 52%)";
  ctx.strokeStyle = "hsl(225 50% 28%)";
  ctx.lineWidth = Math.max(0.75, radius * 0.2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "hsl(210 35% 98%)";
  ctx.lineWidth = Math.max(0.7, radius * 0.24);
  ctx.lineCap = "round";
  const w = radius * 0.4;
  ctx.moveTo(x - w, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.restore();
}

type Particle = { x: number; y: number; vx: number; vy: number; anchorX: number; anchorY: number };

function initParticles(width: number, height: number, pad: number): Particle[] {
  const innerW = Math.max(40, width - pad * 2);
  const innerH = Math.max(40, height - pad * 2);
  const left = pad;
  const top = pad;
  const out: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = left + Math.random() * innerW;
    const y = top + Math.random() * innerH;
    out.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      anchorX: x,
      anchorY: y,
    });
  }
  return out;
}

export function ElectricityFlowDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const [energyMode, setEnergyMode] = useState<EnergyMode>("button");
  const [material, setMaterial] = useState<Material>("copper");
  const [buttonHeld, setButtonHeld] = useState(false);
  const [handleStrength, setHandleStrength] = useState(0);
  const [showMeter, setShowMeter] = useState(false);
  const dialDragRef = useRef(false);

  const pushId = useId();
  const dialId = useId();

  const effectivePush =
    energyMode === "button" ? (buttonHeld ? 1 : 0) : handleStrength;

  const conductivity = CONDUCTIVITY[material];
  const currentValue = Math.min(1, Math.max(0, effectivePush * conductivity));
  const amps = currentValue * AMMETER_FULL_SCALE_AMPS;
  const currentReading = formatElectricCurrent(amps);

  const effectivePushRef = useRef(effectivePush);
  const conductivityRef = useRef(conductivity);
  const materialRef = useRef<Material>(material);
  useEffect(() => {
    effectivePushRef.current = effectivePush;
  }, [effectivePush]);
  useEffect(() => {
    conductivityRef.current = conductivity;
  }, [conductivity]);
  useEffect(() => {
    materialRef.current = material;
  }, [material]);

  /** Re-pin “atomic sites” when switching material so insulator springs match new behavior. */
  useEffect(() => {
    for (const p of particlesRef.current) {
      p.anchorX = p.x;
      p.anchorY = p.y;
    }
  }, [material]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reducedMotionRef.current = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const updateDialFromClient = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const strength = Math.min(1, Math.max(0, (Math.atan2(-dy, dx) + Math.PI / 2) / Math.PI));
    setHandleStrength(strength);
  }, []);

  const onDialPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dialDragRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    updateDialFromClient(e.clientX, e.clientY, rect);
  };

  const onDialPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dialDragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    updateDialFromClient(e.clientX, e.clientY, rect);
  };

  const onDialPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    dialDragRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = 14;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container.clientWidth;
      const h = Math.max(220, Math.min(320, w * 0.28));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = initParticles(w, h, pad);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const step = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const particles = particlesRef.current;
      const push = effectivePushRef.current;
      const cond = conductivityRef.current;
      const mat = materialRef.current;
      const motion = MOTION_BY_MATERIAL[mat];
      const flow = push * cond * FLOW_AXIS_SPEED * (dt / 16) * motion.driftScale;
      const rm = reducedMotionRef.current;
      const jitterScale = (rm ? 0.12 : 0.55) * motion.wanderScale;

      const left = pad;
      const right = w - pad;
      const top = pad;
      const bottom = h - pad;

      const vDamp = motion.velocityDamp;

      for (const p of particles) {
        p.vx += (Math.random() - 0.5) * jitterScale * 0.35;
        p.vy += (Math.random() - 0.5) * jitterScale * 0.35;

        if (motion.springK > 0) {
          p.vx += motion.springK * (p.anchorX - p.x);
          p.vy += motion.springK * (p.anchorY - p.y);
        }

        p.vx += flow * 0.22;
        p.vx *= vDamp;
        p.vy *= vDamp;
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);

        if (p.y < top) {
          p.y = top;
          p.vy *= -0.6;
        } else if (p.y > bottom) {
          p.y = bottom;
          p.vy *= -0.6;
        }

        if (motion.periodicWrapX) {
          if (p.x > right) p.x = left;
          if (p.x < left) p.x = right;
        } else {
          if (p.x > right) {
            p.x = right;
            p.vx *= -0.45;
          } else if (p.x < left) {
            p.x = left;
            p.vx *= -0.45;
          }
        }
      }

      ctx.clearRect(0, 0, w, h);

      const r = 10;
      drawMaterialChannel(ctx, { left, top, right, bottom, r }, materialRef.current);

      if (push > 0.06) {
        const midY = (top + bottom) / 2;
        const alpha = 0.25 + push * 0.55;
        ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
        ctx.lineWidth = 2;
        const segments = 3;
        for (let i = 0; i < segments; i++) {
          const t = (i + 0.5) / segments;
          const ax = left + 24 + (right - left - 48) * (t - 0.08);
          const bx = ax + 22;
          ctx.beginPath();
          ctx.moveTo(ax, midY);
          ctx.lineTo(bx, midY);
          ctx.stroke();
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(bx, midY);
          ctx.lineTo(bx - 7, midY - 4);
          ctx.lineTo(bx - 7, midY + 4);
          ctx.closePath();
          ctx.fill();
        }
      }

      const er = 3.4;
      for (const p of particles) {
        drawElectronCharge(ctx, p.x, p.y, er);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const bulbGlow = 8 + currentValue * 42;
  const bulbOpacity = 0.35 + currentValue * 0.65;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          to="/engineering/electricity"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>←</span> Back to Electricity
        </Link>

        <ElectricityLabTabs />

        <header className="text-center space-y-2 relative animate-fade-in">
          <div className="absolute top-0 right-0 md:right-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-amber-500/30">
                  <Info className="h-5 w-5" />
                  <span className="sr-only">What is electric current?</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Electricity in this lab</DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    A simple model of electrons in a path, pushed by energy, slowed by the material.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-muted-foreground text-sm md:text-base py-2">
                  <p>
                    Each <strong className="text-foreground">−</strong> in a circle is an{" "}
                    <strong className="text-foreground">electron</strong> (negative charge). They are already in the
                    path—when there is no push, they jiggle but do not drift together.
                  </p>
                  <p>
                    <strong className="text-foreground">Current</strong> means many electrons moving together in one
                    direction. Your <strong className="text-foreground">push</strong> (energy) nudges them that way.
                  </p>
                  <p>
                    <strong className="text-foreground">Copper</strong> lets them move easily.{" "}
                    <strong className="text-foreground">Wood</strong> makes it harder.{" "}
                    <strong className="text-foreground">Plastic</strong> acts like an insulator, so almost no organized
                    flow happens even with the same push.
                  </p>
                  <p>
                    The <strong className="text-foreground">bulb</strong> gets brighter when more current flows in this
                    model—try the button, then the handle, then change the material.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">Electricity Flow Simulator</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Electrons are already there—add energy to push them. Compare how different materials respond.
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-1">1 Random motion</span>
          <span className="text-muted-foreground/50">→</span>
          <span className="rounded-full bg-muted px-2 py-1">2 Button push</span>
          <span className="text-muted-foreground/50">→</span>
          <span className="rounded-full bg-muted px-2 py-1">3 Handle strength</span>
          <span className="text-muted-foreground/50">→</span>
          <span className="rounded-full bg-muted px-2 py-1">4 Materials</span>
        </div>

        <div
          ref={containerRef}
          aria-label={`Conductor path: ${MATERIAL_LABEL[material]}`}
          className={cn(
            "rounded-xl border overflow-hidden shadow-sm transition-[border-color,background-color,box-shadow] duration-300",
            material === "copper" &&
              "border-amber-700/45 bg-gradient-to-b from-amber-100/55 via-orange-50/40 to-amber-200/35 dark:border-amber-600/50 dark:from-amber-950/55 dark:via-orange-950/35 dark:to-amber-950/45",
            material === "wood" &&
              "border-amber-900/40 bg-gradient-to-b from-amber-900/12 via-yellow-950/10 to-amber-950/20 dark:border-amber-800/45 dark:from-amber-950/40 dark:via-yellow-950/25 dark:to-amber-950/35",
            material === "plastic" &&
              "border-slate-400/55 bg-gradient-to-b from-slate-200/50 via-slate-100/35 to-slate-300/40 dark:border-slate-500/45 dark:from-slate-800/55 dark:via-slate-900/45 dark:to-slate-950/50",
          )}
        >
          <canvas ref={canvasRef} className="block w-full touch-none select-none" aria-hidden />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_auto] items-start">
          <div className="space-y-5 rounded-xl border border-border bg-card/50 p-4 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div className="space-y-2 min-w-0">
                <Label className="text-foreground">Energy input</Label>
                <ToggleGroup
                  type="single"
                  value={energyMode}
                  onValueChange={(v) => v && setEnergyMode(v as EnergyMode)}
                  variant="outline"
                  className="justify-start flex-wrap"
                >
                  <ToggleGroupItem value="button" aria-label="Button push mode" className="data-[state=on]:border-amber-500/60">
                    Button
                  </ToggleGroupItem>
                  <ToggleGroupItem value="handle" aria-label="Handle strength mode" className="data-[state=on]:border-amber-500/60">
                    Handle
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-2 min-w-0 sm:shrink-0">
                <Label className="text-foreground sm:text-right">Material</Label>
                <ToggleGroup
                  type="single"
                  value={material}
                  onValueChange={(v) => v && setMaterial(v as Material)}
                  variant="outline"
                  className="justify-start flex-wrap sm:justify-end"
                >
                  <ToggleGroupItem value="copper" className="data-[state=on]:border-amber-500/60">
                    Copper
                  </ToggleGroupItem>
                  <ToggleGroupItem value="wood" className="data-[state=on]:border-amber-500/60">
                    Wood
                  </ToggleGroupItem>
                  <ToggleGroupItem value="plastic" className="data-[state=on]:border-amber-500/60">
                    Plastic
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {energyMode === "button" ? (
              <div className="space-y-2">
                <Label htmlFor={pushId} className="text-foreground leading-snug block">
                  Press and hold to push the electron in one direction
                </Label>
                <Button
                  id={pushId}
                  type="button"
                  variant="default"
                  aria-label="Press and hold to push the electron in one direction"
                  className={cn(
                    "w-full h-14 text-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white",
                    "active:scale-[0.99] transition-transform",
                  )}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setButtonHeld(true);
                  }}
                  onPointerUp={() => setButtonHeld(false)}
                  onPointerLeave={() => setButtonHeld(false)}
                  onPointerCancel={() => setButtonHeld(false)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      setButtonHeld(true);
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      setButtonHeld(false);
                    }
                  }}
                >
                  Press and hold
                </Button>
                <p className="text-xs text-muted-foreground">
                  Keyboard: hold <kbd className="px-1 rounded bg-muted border border-border">Space</kbd> while this
                  button is focused.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label id={`${dialId}-label`} className="text-foreground">
                  Strength (drag around the dial)
                </Label>
                <div className="flex items-center gap-6 flex-wrap">
                  <div
                    id={dialId}
                    role="slider"
                    aria-labelledby={`${dialId}-label`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(handleStrength * 100)}
                    tabIndex={0}
                    className={cn(
                      "relative h-28 w-28 shrink-0 rounded-full border-2 border-amber-500/40 bg-muted/30",
                      "outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
                    )}
                    onPointerDown={onDialPointerDown}
                    onPointerMove={onDialPointerMove}
                    onPointerUp={onDialPointerUp}
                    onPointerCancel={onDialPointerUp}
                    onKeyDown={(e) => {
                      const step = e.shiftKey ? 0.1 : 0.05;
                      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                        e.preventDefault();
                        setHandleStrength((s) => Math.min(1, s + step));
                      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                        e.preventDefault();
                        setHandleStrength((s) => Math.max(0, s - step));
                      } else if (e.key === "Home") {
                        e.preventDefault();
                        setHandleStrength(0);
                      } else if (e.key === "End") {
                        e.preventDefault();
                        setHandleStrength(1);
                      }
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-sm font-mono text-foreground">{Math.round(handleStrength * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Move the pointer around the center: <strong className="text-foreground">up</strong> adds more
                    push. Or use arrow keys when the dial is focused.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">{MATERIAL_LABEL[material]}</p>
              <div
                role="note"
                className="rounded-lg border border-border bg-muted/25 px-3 py-2.5 text-xs text-muted-foreground leading-relaxed"
              >
                <p>{MATERIAL_SCIENCE_NOTE[material]}</p>
                <div className="mt-2 flex justify-end border-t border-border/50 pt-2">
                  <MaterialScienceMoreDialog material={material} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch id="meter-toggle" checked={showMeter} onCheckedChange={setShowMeter} />
              <Label htmlFor="meter-toggle" className="text-foreground cursor-pointer">
                Show current meter
              </Label>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 lg:min-w-[200px]">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Bulb</p>
              <div
                className="relative mx-auto h-24 w-24 rounded-full border-2 border-amber-900/30 bg-gradient-to-b from-amber-100/80 to-amber-200/40 dark:from-amber-200/20 dark:to-amber-950/40"
                style={{
                  opacity: bulbOpacity,
                  boxShadow: `0 0 ${bulbGlow}px ${8 + currentValue * 28}px rgba(251, 191, 36, ${0.35 + currentValue * 0.45})`,
                }}
                aria-label={`Bulb brightness follows current, about ${currentReading}`}
              />
              {showMeter && (
                <div className="rounded-lg border border-border bg-background px-4 py-2 font-mono text-lg tabular-nums">
                  <span className="text-muted-foreground text-xs block font-sans tracking-wide">Current</span>
                  <span className="text-2xl font-semibold tracking-tight">{currentReading}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
