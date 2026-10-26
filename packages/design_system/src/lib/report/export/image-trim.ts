export type Pixels = { data: ArrayLike<number>; width: number; height: number };
export type Bounds = { x: number; y: number; width: number; height: number };

/** Smallest box holding every visible (non-transparent) pixel, or null when the image is empty. */
export function opaqueBounds({ data, width, height }: Pixels): Bounds | null {
  let top = height;
  let left = width;
  let bottom = -1;
  let right = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  if (bottom < 0) return null;
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}
