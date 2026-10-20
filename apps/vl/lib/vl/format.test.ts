import { describe, expect, it } from "vitest";
import { mean, num, pct, sum } from "./format";

describe("format", () => {
  it("pct rounds and guards zero or missing totals", () => {
    expect(pct(2, 3)).toBe(67);
    expect(pct(5, 0)).toBe(0);
    expect(pct(null, null)).toBe(0);
  });
  it("num, sum and mean treat null as 0 and empty lists as 0", () => {
    expect(num(null)).toBe(0);
    expect(num(Number.NaN)).toBe(0);
    expect(sum([1, null, 2])).toBe(3);
    expect(mean([])).toBe(0);
    expect(mean([1, 2])).toBe(1.5);
  });
});
