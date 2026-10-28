import { describe, expect, it } from "vitest";
import { completeMonths, mean, num, pct, sum, trendOf } from "./format";

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

  it("trend: the last two complete months, leaving out the current one", () => {
    const rows = [
      { year: 2026, month: 8 },
      { year: 2026, month: 9 },
      { year: 2026, month: 10 },
    ];
    expect(completeMonths(rows, [100, 120, 30], new Date(2026, 9, 21))).toEqual({ previous: 100, last: 120, index: 1 });
    expect(completeMonths(rows, [100, 120, 30], new Date(2026, 10, 2))).toEqual({ previous: 120, last: 30, index: 2 });
    expect(completeMonths(rows.slice(0, 1), [100], new Date(2026, 9, 21))).toBeNull();
  });

  it("trend wording: % for samples, points for suppression, days for TAT (down is good)", () => {
    expect(trendOf({ previous: 100, last: 120 }, "percent")).toMatchObject({ value: "+20.0%", direction: "up", good: true });
    expect(trendOf({ previous: 92.4, last: 92 }, "points")).toMatchObject({ value: "\u22120.4 p.p.", direction: "down", good: false });
    expect(trendOf({ previous: 12, last: 10.5 }, "days")).toMatchObject({ value: "\u22121.5 dias", direction: "down", good: true });
    expect(trendOf({ previous: 0, last: 5 }, "percent")).toBeNull();
    expect(trendOf(null, "days")).toBeNull();
  });
});
