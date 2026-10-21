import { describe, expect, it } from "vitest";
import { mondayOf, recentWeeks, weekLabel, weekRangeLabel, weekRangeParam } from "./weeks";

describe("weeks", () => {
  it("finds the Monday of any day, Sunday included", () => {
    expect(mondayOf(new Date(2026, 10, 8)).getDate()).toBe(2); // Sunday 8 Nov -> Monday 2 Nov
    expect(mondayOf(new Date(2026, 10, 2)).getDate()).toBe(2);
  });

  it("labels weeks within a month, across months and across years", () => {
    expect(weekLabel(new Date(2026, 10, 2))).toBe("2–8 Nov");
    expect(weekLabel(new Date(2026, 9, 26))).toBe("26 Out–1 Nov");
    expect(weekLabel(new Date(2026, 11, 28))).toBe("28 Dez–3 Jan");
  });

  it("lists the last complete weeks, oldest first, leaving out the current one", () => {
    const weeks = recentWeeks(3, new Date(2026, 10, 11)); // Wednesday 11 Nov
    expect(weeks.map((w) => w.label)).toEqual(["19–25 Out", "26 Out–1 Nov", "2–8 Nov"]);
    expect(weeks[2]).toMatchObject({ start: "2026-11-02", end: "2026-11-08", month: "Nov", year: 2026 });
    expect(weeks[1].month).toBe("Out");
  });

  it("labels a range and gives its API window", () => {
    const weeks = recentWeeks(4, new Date(2026, 10, 30));
    expect(weekRangeLabel(weeks, { from: 3, to: 3 })).toBe("23–29 Nov");
    expect(weekRangeLabel(weeks, { from: 0, to: 3 })).toBe("2 Nov – 29 Nov (4 semanas)");
    expect(weekRangeLabel(recentWeeks(2, new Date(2026, 10, 11)), { from: 0, to: 1 })).toBe("26 Out – 8 Nov (2 semanas)");
    expect(weekRangeParam(weeks, { from: 0, to: 3 })).toBe("2026-11-02,2026-11-29");
  });
});
