import type { MouseEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Info, Volume2 } from "lucide-react";
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
import { ElectricityLabTabs } from "@/components/ElectricityLabTabs";
import {
  ContinuitySampleStrip,
  type ContinuityWireMaterial,
} from "@/components/continuity/ContinuitySampleStrip";
import { imagePixelToNormalizedInObjectCover } from "@/components/continuity/mapImagePointToWorkArea";
import {
  FALLBACK_PROBE_TIP_BLACK_NORM,
  FALLBACK_PROBE_TIP_RED_NORM,
  METER_IMAGE_INTRINSIC,
  PROBE_TIP_BLACK_IMAGE_PX,
  PROBE_TIP_RED_IMAGE_PX,
  SAMPLE_TO_PROBE_SNAP_NORM,
} from "@/components/continuity/probeTipMapping";

const MULTIMETER_IMAGE_CANDIDATES = [
  "/images/engineering/electricity/continuity/multimeter.png",
  "/images/engineering/electricity/continuity/multimeter.jpg",
  "/images/engineering/electricity/continuity/multimeter.webp",
] as const;

const NONE_VALUE = "none";

/** Minimum normalized distance between the two sample ends. */
const MIN_SAMPLE_SEP = 0.05;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function materialConductiveForContinuity(m: ContinuityWireMaterial) {
  return m === "copper";
}

type ContinuityToneNodes = {
  ctx: AudioContext;
  osc: OscillatorNode;
  gain: GainNode;
};

/** Stops the sustained continuity tone and releases the audio context. */
function stopContinuityTone(nodesRef: { current: ContinuityToneNodes | null }) {
  const a = nodesRef.current;
  if (!a) return;
  nodesRef.current = null;
  try {
    const t = a.ctx.currentTime;
    a.osc.stop(t);
    a.osc.disconnect();
    a.gain.disconnect();
    void a.ctx.close();
  } catch {
    /* already stopped / unsupported */
  }
}

/** Steady tone while copper + closed path (real meters often buzz until the path opens). */
function startContinuityTone(nodesRef: { current: ContinuityToneNodes | null }) {
  stopContinuityTone(nodesRef);
  try {
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 1000;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    nodesRef.current = { ctx, osc, gain };
  } catch {
    /* ignore autoplay / unsupported */
  }
}

function clamp01(v: number, pad = 0.04) {
  return Math.min(1 - pad, Math.max(pad, v));
}

function defaultSampleEnds() {
  const cx = 0.5;
  const cy = 0.52;
  const half = 0.09;
  return {
    endRed: { x: clamp01(cx - half), y: clamp01(cy) },
    endBlack: { x: clamp01(cx + half), y: clamp01(cy) },
  };
}

/** True when each sample end sits on a probe tip (either orientation: red/dark rings may match either probe). */
function sampleEndsBridgingProbes(
  endRed: { x: number; y: number },
  endBlack: { x: number; y: number },
  tipRed: { x: number; y: number },
  tipBlack: { x: number; y: number },
  snap: number,
) {
  const okMatched =
    dist(endRed, tipRed) <= snap && dist(endBlack, tipBlack) <= snap;
  const okSwapped =
    dist(endRed, tipBlack) <= snap && dist(endBlack, tipRed) <= snap;
  return okMatched || okSwapped;
}

export function ContinuityTestDemo() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const meterImgRef = useRef<HTMLImageElement>(null);
  const [probeTipsNorm, setProbeTipsNorm] = useState({
    red: { ...FALLBACK_PROBE_TIP_RED_NORM },
    black: { ...FALLBACK_PROBE_TIP_BLACK_NORM },
  });
  const [wireMaterial, setWireMaterial] = useState<ContinuityWireMaterial | null>(null);
  const [sampleEndRed, setSampleEndRed] = useState({ x: 0.5, y: 0.52 });
  const [sampleEndBlack, setSampleEndBlack] = useState({ x: 0.5, y: 0.52 });
  const [pathBroken, setPathBroken] = useState(false);
  const [dragging, setDragging] = useState<null | "endRed" | "endBlack">(null);
  const [display, setDisplay] = useState("OFF");
  const [led, setLed] = useState<"off" | "green" | "red">("off");
  const [isTesting, setIsTesting] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [readingLatched, setReadingLatched] = useState(false);
  const [workDims, setWorkDims] = useState({ w: 0, h: 0 });
  const [meterImgIndex, setMeterImgIndex] = useState(0);
  const [meterImgFailed, setMeterImgFailed] = useState(false);
  const lastTestAt = useRef(0);
  const continuityToneRef = useRef<ContinuityToneNodes | null>(null);
  const testMeasureTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  /** Bumped on Stop / new run so a stale timeout cannot apply a result after Stop. */
  const testMeasureTokenRef = useRef(0);
  /** Lab readout right before this Test press — Stop restores this (undoes Test). */
  const preTestLabRef = useRef({
    readingLatched: false,
    led: "off" as "off" | "green" | "red",
    display: "OFF",
    pulse: false,
  });
  const wireMaterialRef = useRef(wireMaterial);
  wireMaterialRef.current = wireMaterial;

  const hasSample = wireMaterial !== null;
  const sampleSpanOk = dist(sampleEndRed, sampleEndBlack) >= MIN_SAMPLE_SEP;
  const sampleBridging = sampleEndsBridgingProbes(
    sampleEndRed,
    sampleEndBlack,
    probeTipsNorm.red,
    probeTipsNorm.black,
    SAMPLE_TO_PROBE_SNAP_NORM,
  );
  const canRunTest =
    hasSample && sampleBridging && sampleSpanOk && !isTesting && wireMaterial !== null;

  const snapTh = SAMPLE_TO_PROBE_SNAP_NORM;
  const redHandleSnapped =
    dist(sampleEndRed, probeTipsNorm.red) <= snapTh || dist(sampleEndRed, probeTipsNorm.black) <= snapTh;
  const blackHandleSnapped =
    dist(sampleEndBlack, probeTipsNorm.red) <= snapTh || dist(sampleEndBlack, probeTipsNorm.black) <= snapTh;

  let testDisabledReason = "";
  if (!hasSample) testDisabledReason = "Pick a sample material to place it on the bench.";
  else if (!sampleSpanOk) testDisabledReason = "Move the sample ends farther apart.";
  else if (!sampleBridging)
    testDisabledReason =
      "Drag each end onto a different probe’s metal tip. Either colored ring can go to either probe; both tips must be covered.";

  const toNorm = useCallback((clientX: number, clientY: number) => {
    const el = canvasRef.current;
    if (!el) return { x: 0.5, y: 0.5 };
    const r = el.getBoundingClientRect();
    return {
      x: clamp01((clientX - r.left) / r.width),
      y: clamp01((clientY - r.top) / r.height),
    };
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const p = toNorm(e.clientX, e.clientY);
      if (dragging === "endRed") setSampleEndRed(p);
      else setSampleEndBlack(p);
    };
    const up = () => setDragging(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, toNorm]);

  const measureWorkArea = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    setWorkDims({ w: el.clientWidth, h: el.clientHeight });
  }, []);

  const recalcProbeTips = useCallback(() => {
    const box = canvasRef.current;
    if (!box || meterImgFailed) {
      setProbeTipsNorm({
        red: { ...FALLBACK_PROBE_TIP_RED_NORM },
        black: { ...FALLBACK_PROBE_TIP_BLACK_NORM },
      });
      return;
    }
    const cw = box.clientWidth;
    const ch = box.clientHeight;
    if (cw < 8 || ch < 8) return;

    const img = meterImgRef.current;
    const iw =
      img && img.complete && img.naturalWidth > 0 ? img.naturalWidth : METER_IMAGE_INTRINSIC.w;
    const ih =
      img && img.complete && img.naturalHeight > 0 ? img.naturalHeight : METER_IMAGE_INTRINSIC.h;

    const clampN = (n: number) => Math.min(0.985, Math.max(0.015, n));
    let red = imagePixelToNormalizedInObjectCover(
      PROBE_TIP_RED_IMAGE_PX.x,
      PROBE_TIP_RED_IMAGE_PX.y,
      iw,
      ih,
      cw,
      ch,
      50,
      42,
    );
    let black = imagePixelToNormalizedInObjectCover(
      PROBE_TIP_BLACK_IMAGE_PX.x,
      PROBE_TIP_BLACK_IMAGE_PX.y,
      iw,
      ih,
      cw,
      ch,
      50,
      42,
    );
    red = { x: clampN(red.x), y: clampN(red.y) };
    black = { x: clampN(black.x), y: clampN(black.y) };
    setProbeTipsNorm({ red, black });
  }, [meterImgFailed]);

  useLayoutEffect(() => {
    measureWorkArea();
  }, [measureWorkArea]);

  useLayoutEffect(() => {
    recalcProbeTips();
  }, [workDims.w, workDims.h, meterImgIndex, meterImgFailed, recalcProbeTips]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measureWorkArea());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureWorkArea]);

  const shouldPlayContinuityTone =
    readingLatched &&
    wireMaterial === "copper" &&
    display === "CLOSED" &&
    led === "green";

  /** Stop is shown during measurement or while the latched copper CLOSED tone is on (so label matches sound). */
  const showStopOnButton = isTesting || shouldPlayContinuityTone;

  useEffect(() => {
    if (!shouldPlayContinuityTone) {
      stopContinuityTone(continuityToneRef);
    }
  }, [shouldPlayContinuityTone]);

  useEffect(() => {
    return () => stopContinuityTone(continuityToneRef);
  }, []);

  useEffect(() => {
    return () => {
      testMeasureTokenRef.current += 1;
      if (testMeasureTimeoutRef.current !== null) {
        window.clearTimeout(testMeasureTimeoutRef.current);
        testMeasureTimeoutRef.current = null;
      }
    };
  }, []);

  const cancelOngoingTest = useCallback(() => {
    testMeasureTokenRef.current += 1;
    const tid = testMeasureTimeoutRef.current;
    testMeasureTimeoutRef.current = null;
    if (tid !== null) {
      window.clearTimeout(tid);
    }
    stopContinuityTone(continuityToneRef);

    const s = preTestLabRef.current;
    setIsTesting(false);
    setReadingLatched(s.readingLatched);
    setLed(s.led);
    setDisplay(s.display);
    setPulse(s.pulse);
    lastTestAt.current = 0;

    if (
      s.readingLatched &&
      s.display === "CLOSED" &&
      s.led === "green" &&
      wireMaterialRef.current === "copper"
    ) {
      startContinuityTone(continuityToneRef);
    }
  }, []);

  useEffect(() => {
    if (!hasSample) {
      setDisplay("OFF");
      setLed("off");
      setReadingLatched(false);
      return;
    }
    if (isTesting) {
      setDisplay("TEST…");
      return;
    }
    if (readingLatched) return;
    if (!sampleSpanOk) {
      setDisplay("MOVE ENDS");
      return;
    }
    setDisplay(sampleBridging ? "READY" : "ALIGN");
  }, [hasSample, sampleBridging, sampleSpanOk, isTesting, readingLatched]);

  const runTest = () => {
    const now = Date.now();
    if (now - lastTestAt.current < 550) return;
    lastTestAt.current = now;
    if (!hasSample || !wireMaterial) return;

    if (!sampleBridging || !sampleSpanOk) {
      setLed("red");
      setDisplay("OPEN");
      setReadingLatched(true);
      return;
    }

    const prevTid = testMeasureTimeoutRef.current;
    if (prevTid !== null) {
      window.clearTimeout(prevTid);
      testMeasureTimeoutRef.current = null;
    }

    stopContinuityTone(continuityToneRef);
    preTestLabRef.current = {
      readingLatched,
      led,
      display,
      pulse,
    };

    testMeasureTokenRef.current += 1;
    const measureToken = testMeasureTokenRef.current;

    setIsTesting(true);
    setLed("off");
    setDisplay("TEST…");
    setPulse(false);

    testMeasureTimeoutRef.current = window.setTimeout(() => {
      testMeasureTimeoutRef.current = null;
      if (measureToken !== testMeasureTokenRef.current) {
        return;
      }
      const closed = !pathBroken;
      const conductive = materialConductiveForContinuity(wireMaterial);
      const continuity = closed && conductive;

      if (continuity) {
        setLed("green");
        setDisplay("CLOSED");
        startContinuityTone(continuityToneRef);
        setPulse(true);
        window.setTimeout(() => setPulse(false), 700);
      } else {
        setLed("red");
        setDisplay("OPEN");
      }
      setReadingLatched(true);
      setIsTesting(false);
    }, 420);
  };

  /** Second click of a double-click still targets this button but must not cancel the measurement we just started. */
  const onTestButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (isTesting) {
      if (e.detail === 2) {
        e.preventDefault();
        return;
      }
      cancelOngoingTest();
      return;
    }
    if (shouldPlayContinuityTone) {
      stopContinuityTone(continuityToneRef);
      setReadingLatched(false);
      setLed("off");
      setPulse(false);
      return;
    }
    runTest();
  };

  const onMaterialChange = (v: string) => {
    if (!v) return;
    if (v === NONE_VALUE) {
      setWireMaterial(null);
      setDragging(null);
      setReadingLatched(false);
      setLed("off");
      return;
    }
    const mat = v as ContinuityWireMaterial;
    if (wireMaterial === null) {
      const d = defaultSampleEnds();
      setSampleEndRed(d.endRed);
      setSampleEndBlack(d.endBlack);
      setPathBroken(false);
    }
    setWireMaterial(mat);
    setReadingLatched(false);
    setLed("off");
  };

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

        <header className="text-center space-y-2 relative">
          <div className="absolute top-0 right-0 md:right-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-amber-500/30">
                  <Info className="h-5 w-5" />
                  <span className="sr-only">About continuity testing</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Continuity testing</DialogTitle>
                  <DialogDescription>
                    A continuity check asks: “Is there a low-resistance path between these two points?” The meter
                    applies a small internal voltage and listens for current.
                  </DialogDescription>
                </DialogHeader>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>You need a <strong className="text-foreground">complete path</strong> through the sample.</li>
                  <li>The sample must <strong className="text-foreground">conduct</strong> well enough (here, copper passes; wood and plastic do not).</li>
                  <li>
                    Tap <strong className="text-foreground">Copper</strong>, <strong className="text-foreground">Wood</strong>, or{" "}
                    <strong className="text-foreground">Plastic</strong> to place a sample. Drag each end onto a probe’s{" "}
                    <strong className="text-foreground">metal tip</strong> (either end can go to either probe), then{" "}
                    <strong className="text-foreground">Test</strong>.
                  </li>
                </ul>
              </DialogContent>
            </Dialog>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Continuity test</h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Virtual meter in continuity mode: complete path + conductor → steady tone and green. Anything else → red,
            silence.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_220px] items-start">
          <div className="space-y-4 rounded-xl border border-border bg-card/50 p-4 md:p-5">
            <div
              ref={canvasRef}
              className="relative mx-auto aspect-[16/9] max-h-[380px] w-full overflow-hidden rounded-xl border-2 border-border bg-gradient-to-b from-muted/40 to-muted/80 select-none touch-none"
            >
              <div className="pointer-events-none absolute left-3 top-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Work area
              </div>

              {!meterImgFailed && (
                <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
                  <img
                    ref={meterImgRef}
                    key={MULTIMETER_IMAGE_CANDIDATES[meterImgIndex]}
                    src={MULTIMETER_IMAGE_CANDIDATES[meterImgIndex]}
                    alt=""
                    className="h-full w-full min-h-full min-w-full object-cover object-[center_42%] drop-shadow-md opacity-[0.98]"
                    loading="lazy"
                    decoding="async"
                    onLoad={() => recalcProbeTips()}
                    onError={() => {
                      if (meterImgIndex < MULTIMETER_IMAGE_CANDIDATES.length - 1) {
                        setMeterImgIndex((i) => i + 1);
                      } else {
                        setMeterImgFailed(true);
                      }
                    }}
                  />
                </div>
              )}

              {hasSample && wireMaterial !== null && (
                <ContinuitySampleStrip
                  wired
                  workW={workDims.w}
                  workH={workDims.h}
                  red={sampleEndRed}
                  black={sampleEndBlack}
                  material={wireMaterial}
                  pathBroken={pathBroken}
                  pulse={pulse}
                />
              )}

              {hasSample && (
                <>
                  <button
                    type="button"
                    aria-label="Sample end — drag onto a probe metal tip."
                    title="Sample end (red ring)"
                    className={cn(
                      "absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-red-900/50 bg-red-500 shadow-md active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      redHandleSnapped && "ring-2 ring-amber-400/50",
                    )}
                    style={{ left: `${sampleEndRed.x * 100}%`, top: `${sampleEndRed.y * 100}%` }}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setReadingLatched(false);
                      setLed("off");
                      setDragging("endRed");
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Other sample end — drag onto the other probe’s metal tip."
                    title="Sample end (dark ring)"
                    className={cn(
                      "absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-blue-700/50 bg-zinc-800 shadow-md active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-zinc-900",
                      blackHandleSnapped && "ring-2 ring-blue-400/45",
                    )}
                    style={{ left: `${sampleEndBlack.x * 100}%`, top: `${sampleEndBlack.y * 100}%` }}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setReadingLatched(false);
                      setLed("off");
                      setDragging("endBlack");
                    }}
                  />
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                className="bg-amber-600 text-white hover:bg-amber-700"
                onClick={onTestButtonClick}
                disabled={showStopOnButton ? false : !canRunTest}
                title={
                  isTesting
                    ? "Stop the measurement"
                    : shouldPlayContinuityTone
                      ? "Stop tone and clear reading"
                      : testDisabledReason
                }
              >
                {showStopOnButton ? "Stop" : "Test"}
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div className="space-y-2">
                <Label className="text-foreground">Sample material</Label>
                <ToggleGroup
                  type="single"
                  value={wireMaterial ?? NONE_VALUE}
                  onValueChange={onMaterialChange}
                  variant="outline"
                  className="justify-start flex-wrap"
                >
                  <ToggleGroupItem value={NONE_VALUE} className="text-muted-foreground">
                    None
                  </ToggleGroupItem>
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
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
                <Switch
                  id="path-toggle"
                  checked={!pathBroken}
                  onCheckedChange={(on) => {
                    setPathBroken(!on);
                    setReadingLatched(false);
                    setLed("off");
                  }}
                  disabled={!hasSample}
                />
                <Label htmlFor="path-toggle" className="cursor-pointer text-sm text-foreground">
                  {pathBroken ? "Path broken (gap)" : "Path complete"}
                </Label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="why-toggle" checked={showWhy} onCheckedChange={setShowWhy} />
              <Label htmlFor="why-toggle" className="text-foreground cursor-pointer text-sm">
                Why?
              </Label>
            </div>
            {showWhy && (
              <div className="rounded-lg border border-border bg-muted/25 p-3 text-xs text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  <strong className="text-foreground">Continuity</strong> means a closed loop with something conductive
                  enough between the probes. This meter treats <strong className="text-foreground">copper</strong> as a
                  good conductor and <strong className="text-foreground">wood / plastic</strong> as too resistive for a
                  steady continuity tone—simplified for class discussion.
                </p>
                <p>
                  A <strong className="text-foreground">broken path</strong> (gap) in the sample breaks the bridge between
                  the two probe tips, so no continuity even with copper leads.
                </p>
              </div>
            )}

            {!hasSample && (
              <p className="text-xs text-muted-foreground">
                Choose <strong className="text-foreground">Copper</strong>, <strong className="text-foreground">Wood</strong>, or{" "}
                <strong className="text-foreground">Plastic</strong> to place a sample on the bench. Drag each end onto a different probe’s{" "}
                <strong className="text-foreground">metal tip</strong> (either ring can reach either probe). Then <strong className="text-foreground">Test</strong>. Choose{" "}
                <strong className="text-foreground">None</strong> to remove the sample.
              </p>
            )}
            {hasSample && !sampleSpanOk && (
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Sample ends are too close — drag them farther apart.
              </p>
            )}
            {hasSample && sampleSpanOk && !sampleBridging && (
              <p className="text-xs text-muted-foreground">
                Move each end onto a <strong className="text-foreground">metal probe tip</strong> so both probes are touched (either ring can go to either probe). The display shows READY when both tips are covered.
              </p>
            )}
          </div>

          <div className="rounded-xl border-2 border-foreground/20 bg-gradient-to-b from-zinc-800 to-zinc-950 p-4 text-zinc-100 shadow-lg lg:sticky lg:top-4">
            <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              <span>CONT</span>
              <Volume2 className="h-4 w-4 text-amber-300" aria-hidden />
            </div>
            <div className="relative mb-4 overflow-hidden rounded-md bg-black/40 px-2 py-6 text-center font-mono text-2xl font-semibold tracking-wider text-amber-300 shadow-inner">
              <span className="relative z-[1]">{display}</span>
              {isTesting && (
                <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden bg-cyan-500/10" aria-hidden>
                  <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent animate-lcd-sweep" />
                </div>
              )}
              {!isTesting && led === "red" && readingLatched && (
                <div className="pointer-events-none absolute inset-0 z-[2] bg-red-500/10" aria-hidden />
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs text-zinc-400">LED</span>
              <div
                className={cn(
                  "h-6 w-6 rounded-full border-2 border-zinc-600 shadow-inner transition-colors",
                  led === "off" && "bg-zinc-700",
                  led === "green" && "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]",
                  led === "red" && "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]",
                )}
                aria-label={led === "green" ? "Continuity detected" : led === "red" ? "No continuity" : "Idle"}
              />
            </div>
            <p className="mt-3 text-center text-[10px] text-zinc-500">Continuity mode — steady tone on low resistance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
