import { describe, expect, it } from "vitest";
import { fromCalendarRange, initialRange, toCalendarRange } from "./date-range";

describe("date range helpers", () => {
  it("defaults to the last year up to today, as the old dialog", () => {
    expect(initialRange(undefined, new Date(2026, 9, 19))).toEqual(["2025-10-19", "2026-10-19"]);
    expect(initialRange(["2026-01-01", "2026-03-31"], new Date(2026, 9, 19))).toEqual(["2026-01-01", "2026-03-31"]);
  });

  it("round-trips between YYYY-MM-DD strings and the picker's calendar dates", () => {
    const range = toCalendarRange(["2026-01-05", "2026-02-28"]);
    expect(range?.start.toString()).toBe("2026-01-05");
    expect(fromCalendarRange(range)).toEqual(["2026-01-05", "2026-02-28"]);
  });

  it("returns null for an incomplete or invalid range", () => {
    expect(toCalendarRange(["", "2026-02-28"])).toBeNull();
    expect(fromCalendarRange(null)).toBeNull();
    expect(fromCalendarRange({ start: toCalendarRange(["2026-01-05", "2026-01-06"])!.start, end: null as never })).toBeNull();
  });
});
