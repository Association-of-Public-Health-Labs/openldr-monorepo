import { describe, expect, it } from "vitest";
import { isSundayToSaturday, recentWeeks, sundayOf, weekLabel, weekRangeLabel, weekRangeParam } from "./weeks";

describe("weeks (Sunday to Saturday, as the weekly reports)", () => {
  it("finds the Sunday of any day, Saturday included", () => {
    expect(sundayOf(new Date(2026, 9, 3)).getDate()).toBe(27); // Saturday 3 Oct -> Sunday 27 Sep
    expect(sundayOf(new Date(2026, 8, 27)).getDate()).toBe(27);
    expect(sundayOf(new Date(2026, 9, 21)).getDate()).toBe(18); // Wednesday 21 Oct
  });

  it("labels weeks within a month, across months and across years", () => {
    expect(weekLabel(new Date(2026, 9, 4))).toBe("4–10 Out");
    expect(weekLabel(new Date(2026, 8, 27))).toBe("27 Set–3 Out");
    expect(weekLabel(new Date(2026, 11, 27))).toBe("27 Dez–2 Jan");
  });

  it("lists the last complete weeks, oldest first, leaving out the current one", () => {
    const weeks = recentWeeks(3, new Date(2026, 9, 21)); // Wednesday 21 Oct
    expect(weeks.map((w) => w.label)).toEqual(["27 Set–3 Out", "4–10 Out", "11–17 Out"]);
    expect(weeks[0]).toMatchObject({ start: "2026-09-27", end: "2026-10-03", month: "Set", year: 2026 });
    // On a Saturday the week is not over yet.
    expect(recentWeeks(1, new Date(2026, 9, 24))[0].label).toBe("11–17 Out");
    expect(recentWeeks(1, new Date(2026, 9, 25))[0].label).toBe("18–24 Out");
  });

  it("only whole Sunday-to-Saturday weeks are weeks", () => {
    expect(isSundayToSaturday("2026-09-27", "2026-10-03")).toBe(true);
    expect(isSundayToSaturday("2026-09-27T00:00:00", "2026-10-03T00:00:00")).toBe(true);
    expect(isSundayToSaturday("2026-06-01", "2026-06-06")).toBe(false); // Monday to Saturday
    expect(isSundayToSaturday("2026-06-13", "2026-06-19")).toBe(false); // Saturday to Friday
  });

  it("labels a range and gives its API window", () => {
    const weeks = recentWeeks(4, new Date(2026, 10, 1));
    expect(weekRangeLabel(weeks, { from: 3, to: 3 })).toBe("25–31 Out");
    expect(weekRangeLabel(weeks, { from: 0, to: 3 })).toBe("4 Out – 31 Out (4 semanas)");
    expect(weekRangeLabel(recentWeeks(2, new Date(2026, 9, 11)), { from: 0, to: 1 })).toBe("27 Set – 10 Out (2 semanas)");
    expect(weekRangeParam(weeks, { from: 0, to: 3 })).toBe("2026-10-04,2026-10-31");
  });
});
