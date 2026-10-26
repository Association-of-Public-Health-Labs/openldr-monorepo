import { describe, expect, it } from "vitest";
import { opaqueBounds } from "./image-trim";

/** A width × height RGBA image, transparent except the listed [x, y] pixels. */
function image(width: number, height: number, opaque: [number, number][]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (const [x, y] of opaque) data[(y * width + x) * 4 + 3] = 255;
  return { data, width, height };
}

describe("opaqueBounds", () => {
  it("returns the box around the visible pixels", () => {
    expect(opaqueBounds(image(10, 8, [[2, 3], [6, 5], [4, 1]]))).toEqual({ x: 2, y: 1, width: 5, height: 5 });
  });
  it("keeps a single visible pixel", () => {
    expect(opaqueBounds(image(4, 4, [[3, 0]]))).toEqual({ x: 3, y: 0, width: 1, height: 1 });
  });
  it("returns null for a fully transparent image", () => {
    expect(opaqueBounds(image(4, 4, []))).toBeNull();
  });
});
