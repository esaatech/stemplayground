import { useId } from "react";
import { cn } from "@/lib/utils";

export type ContinuityWireMaterial = "copper" | "wood" | "plastic";

type Props = {
  wired: boolean;
  workW: number;
  workH: number;
  red: { x: number; y: number };
  black: { x: number; y: number };
  material: ContinuityWireMaterial;
  pathBroken: boolean;
  pulse?: boolean;
};

function strokeGradientId(material: ContinuityWireMaterial, uid: string) {
  return `continuity-sample-${material}-${uid}`;
}

/** Sample runs between metal-tip coords (same normalized values as draggable rings when wired). */
export function ContinuitySampleStrip({
  wired,
  workW,
  workH,
  red,
  black,
  material,
  pathBroken,
  pulse,
}: Props) {
  const uid = useId().replace(/:/g, "");
  if (!wired || workW < 8 || workH < 8) return null;

  const x1 = red.x * workW;
  const y1 = red.y * workH;
  const x2 = black.x * workW;
  const y2 = black.y * workH;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy);
  if (L < 4) return null;

  const gapPx = pathBroken ? Math.min(28, L * 0.12) : 0;
  const strokePx = Math.max(6, Math.min(14, workH * 0.028));
  const ux = dx / L;
  const uy = dy / L;
  const run = (L - gapPx) / 2;

  const x1e = x1 + ux * run;
  const y1e = y1 + uy * run;
  const x2e = x2 - ux * run;
  const y2e = y2 - uy * run;

  const gradId = strokeGradientId(material, uid);
  const midX = ((red.x + black.x) / 2) * 100;
  const midY = ((red.y + black.y) / 2) * 100;

  const lineCommon = {
    strokeWidth: strokePx,
    strokeLinecap: "round" as const,
    vectorEffect: "nonScalingStroke" as const,
    stroke: `url(#${gradId})`,
    className: cn(
      "transition-[filter] duration-300",
      pulse && "drop-shadow-[0_0_10px_rgba(251,191,36,0.75)]",
    ),
  };

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-visible"
        viewBox={`0 0 ${workW} ${workH}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
            {material === "copper" && (
              <>
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="45%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#b45309" />
              </>
            )}
            {material === "wood" && (
              <>
                <stop offset="0%" stopColor="#713f12" />
                <stop offset="40%" stopColor="#a16207" />
                <stop offset="100%" stopColor="#422006" />
              </>
            )}
            {material === "plastic" && (
              <>
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </>
            )}
          </linearGradient>
        </defs>

        {!pathBroken && <line x1={x1} y1={y1} x2={x2} y2={y2} {...lineCommon} />}

        {pathBroken && (
          <>
            <line x1={x1} y1={y1} x2={x1e} y2={y1e} {...lineCommon} />
            <line x1={x2} y1={y2} x2={x2e} y2={y2e} {...lineCommon} />
          </>
        )}
      </svg>

      {pathBroken && (
        <div
          className="pointer-events-none absolute z-[6] rounded bg-background/95 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border shadow-sm"
          style={{ left: `${midX}%`, top: `${midY}%`, transform: "translate(-50%, -50%)" }}
          aria-hidden
        >
          Gap
        </div>
      )}

      {pulse && !pathBroken && (
        <svg
          className="pointer-events-none absolute inset-0 z-[4] h-full w-full overflow-visible opacity-60"
          viewBox={`0 0 ${workW} ${workH}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgb(251 191 36)"
            strokeWidth={strokePx + 6}
            strokeLinecap="round"
            vectorEffect="nonScalingStroke"
            filter="blur(3px)"
          />
        </svg>
      )}
    </>
  );
}
