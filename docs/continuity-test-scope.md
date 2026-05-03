# Continuity test lab — PDS review and implementation scope

Original PDS goals: virtual multimeter in continuity mode, probes, material path, test action, audio + LED feedback, teach closed path + conductor vs insulator.

## In scope (v1 — shipped)

| PDS area | What we built |
|----------|----------------|
| Main work area | Multimeter art (optional); **mapped metal tip** positions; **SVG sample strip** between the two draggable **sample ends**; visual **gap** when the in-sample path is broken |
| Multimeter (continuity) | Panel with CONT label, speaker icon, text display, green / red / neutral LED |
| Probes | **Fixed** on the bench image; **draggable red / dark rings** are the **two ends of the sample** (not the probe handles). Either ring may touch either probe tip (matched or swapped). |
| Material | **Copper / wood / plastic** via toggle; first material choice **places** default end positions and resets path-broken. **None** clears the sample. |
| Place sample | No separate “connect” control: choosing a material **is** placing the sample. |
| Test | **~550 ms** minimum between runs; **~420 ms** simulated measurement delay; **Web Audio** sustained sine tone (1 kHz) while a **copper + closed path** reading is latched |
| Break / complete path | **Switch**: toggles **in-sample gap** only (open path through the bar). Does not model probe attachment. |
| Feedback | Green + **continuous tone** when **path complete (!pathBroken) + copper** (tone stops when the latched reading is cleared or invalidated); red otherwise |
| Teaching | Short inline “Why?” copy; info dialog on the page |
| Tabs | **Flow simulator** ↔ **Continuity test** under Electricity |

## Deferred (future)

| PDS item | Reason |
|----------|--------|
| Numeric current / sensitivity slider | Adds UI complexity; same theme as “full circuit builder” |
| Full microscopic “Why?” view | Separate view with bound vs free electrons; v1 uses text only |
| Long flow animation of electrons | Light pulse on success only in v1 |
| Integration with arbitrary circuit builder | Large feature |
| Pixel-isotropic snap / tighter tip calibration | Current snap is **normalized** `hypot(Δx, Δy)`; tolerance differs by direction on wide layouts. Intentionally **left as-is** for now. |

## Routes

- Flow: `/engineering/electricity/lab`
- Continuity: `/engineering/electricity/continuity`

## Files

| Path | Role |
|------|------|
| `src/components/ContinuityTestDemo.tsx` | Work area, drag logic, READY / ALIGN / TEST, `runTest`, readout column |
| `src/components/continuity/ContinuitySampleStrip.tsx` | SVG strip + gradients; needs `workW` / `workH` ≥ 8 |
| `src/components/continuity/probeTipMapping.ts` | Tip **image pixel** anchors, intrinsic size, **`SAMPLE_TO_PROBE_SNAP_NORM`**, fallback normalized tips if image fails |
| `src/components/continuity/mapImagePointToWorkArea.ts` | `object-fit: cover` + object-position math (`posX`/`posY` percent must match the img class) |
| `src/components/ElectricityLabTabs.tsx` | Shared tab navigation |
| `src/pages/ElectricityContinuityPage.tsx` | Route shell |
| `public/images/engineering/electricity/continuity/README.md` | Asset filenames and layout notes |

## Implementation notes (current behavior)

- **Coordinates**: Sample ends and probe tips are **normalized** (0–1) in the **work-area** div (same box as `getBoundingClientRect` for dragging).
- **READY / Test gating**: `sampleEndsBridgingProbes` requires each end within **`SAMPLE_TO_PROBE_SNAP_NORM`** (default **0.08**) of **some** tip, with one end per tip (matched or swapped). **`MIN_SAMPLE_SEP`** (0.05) prevents the ends from sitting on top of each other.
- **Continuity result**: `continuity = !pathBroken && wireMaterial === "copper"` after bridging and span checks pass.
- **Audio**: On success, a **sustained** tone runs until `readingLatched && display === "CLOSED" && led === "green" && copper` is no longer true (e.g. drag an end, change material, toggle path, new test, or leave the page).
- **Layout**: `workDims` from `ResizeObserver` + layout effect; tips recomputed when size or image changes. If the box is tiny (either client dimension under **8 px**), `recalcProbeTips` skips updating (tips stay previous or fallback).
