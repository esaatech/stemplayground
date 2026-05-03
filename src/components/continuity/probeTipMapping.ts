/**
 * Metal **probe tip** positions in **source image pixels** for
 * `public/images/engineering/electricity/continuity/multimeter.png` (1536×1024).
 * COM (black) probe tip is left of the red (+) probe tip in this composition.
 * Re-measure in an editor if the PNG changes; `imagePixelToNormalizedInObjectCover`
 * maps these to the work area under `object-cover` + `object-[center_42%]`.
 */
export const METER_IMAGE_INTRINSIC = { w: 1536, h: 1024 } as const;

/** COM (black) lead — sharp metal tip in image space. */
export const PROBE_TIP_BLACK_IMAGE_PX = { x: 748, y: 188 } as const;

/** Red (+) VΩmA lead — sharp metal tip in image space. */
export const PROBE_TIP_RED_IMAGE_PX = { x: 1292, y: 192 } as const;

/** How close a sample end must be (normalized) to a mapped probe tip for READY / Test. */
export const SAMPLE_TO_PROBE_SNAP_NORM = 0.08;

/** If the meter image fails to load, use these normalized fallbacks (rough). */
export const FALLBACK_PROBE_TIP_BLACK_NORM = { x: 0.36, y: 0.26 } as const;
export const FALLBACK_PROBE_TIP_RED_NORM = { x: 0.72, y: 0.26 } as const;
