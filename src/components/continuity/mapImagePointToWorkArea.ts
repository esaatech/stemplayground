/**
 * Map a point from **source image pixel space** (0…iw, 0…ih) to **normalized**
 * coordinates (0…1) in the work-area box, matching CSS `object-fit: cover` and
 * percentage `object-position` (same as `object-center` + vertical `posYPercent`).
 */
export function imagePixelToNormalizedInObjectCover(
  ix: number,
  iy: number,
  intrinsicW: number,
  intrinsicH: number,
  containerW: number,
  containerH: number,
  posXPercent = 50,
  posYPercent = 42,
): { x: number; y: number } {
  if (intrinsicW < 1 || intrinsicH < 1 || containerW < 1 || containerH < 1) {
    return { x: 0.5, y: 0.5 };
  }
  const s = Math.max(containerW / intrinsicW, containerH / intrinsicH);
  const alignIx = (posXPercent / 100) * intrinsicW;
  const alignIy = (posYPercent / 100) * intrinsicH;
  const alignCx = (posXPercent / 100) * containerW;
  const alignCy = (posYPercent / 100) * containerH;
  const tlX = alignCx - alignIx * s;
  const tlY = alignCy - alignIy * s;
  const cx = tlX + ix * s;
  const cy = tlY + iy * s;
  return { x: cx / containerW, y: cy / containerH };
}
