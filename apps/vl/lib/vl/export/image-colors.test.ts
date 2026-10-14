import { describe, expect, it } from "vitest";
import { replaceOklch } from "./image-colors";

describe("replaceOklch", () => {
  it("replaces each oklch() occurrence and keeps the rest of the value", () => {
    const value = "oklch(0.2 0 0 / 0.1) 0px 1px 2px 0px, 0 4px 6px -1px oklch(0.5 0.1 200)";
    expect(replaceOklch(value, (c) => `rgb(<${c}>)`)).toBe(
      "rgb(<oklch(0.2 0 0 / 0.1)>) 0px 1px 2px 0px, 0 4px 6px -1px rgb(<oklch(0.5 0.1 200)>)",
    );
  });
  it("returns values without oklch unchanged", () => {
    expect(replaceOklch("none", () => "x")).toBe("none");
  });
});
