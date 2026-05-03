# Continuity lab — multimeter artwork

Place your multimeter graphic here (transparent PNG recommended).

**Tried in order until one loads:**

1. `multimeter.png`
2. `multimeter.jpg`
3. `multimeter.webp`

**Full URL in the app:** `/images/engineering/electricity/continuity/multimeter.png` (etc.)

If no file is present, the work area omits the graphic; the **readout column** on the right still shows CONT / LCD / LED, using **fallback** probe tip positions (rough normalized coords in code).

The PNG is drawn **edge-to-edge in the work area** (`inset-0`, `object-cover`) so there are no side gutters; focal bias `object-[center_42%]` keeps the body/dial in frame. The sample bar and draggable rings sit **above** the image layer.

---

## Maintainers: swapping or recropping the PNG

Behavior and tip hit-testing are documented in **`docs/continuity-test-scope.md`**.

1. **`src/components/continuity/probeTipMapping.ts`**  
   - `METER_IMAGE_INTRINSIC` — expected width × height of the reference asset.  
   - `PROBE_TIP_*_IMAGE_PX` — metal **needle** points in **source image pixel** space.  
   - `SAMPLE_TO_PROBE_SNAP_NORM` — how close each sample end (normalized coords) must be to a mapped tip for READY / Test.

2. **`ContinuityTestDemo.tsx`** — the `<img>` must use the **same** `object-position` as `imagePixelToNormalizedInObjectCover(..., posXPercent, posYPercent)` (currently **50** / **42** with Tailwind `object-[center_42%]`).

3. If the image fails to load, tips fall back to `FALLBACK_PROBE_TIP_*_NORM` in the same file.
