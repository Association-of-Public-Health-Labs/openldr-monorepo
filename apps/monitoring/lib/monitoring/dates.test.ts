import { describe, it, expect } from "vitest";
import { getLastTwelveMonths } from "./dates";
describe("getLastTwelveMonths", () => {
  it("spans ~12 months, YYYY-MM-DD", () => {
    const r = getLastTwelveMonths(new Date("2026-07-07T00:00:00Z"));
    expect(r.endDate).toBe("2026-07-07");
    expect(r.startDate).toBe("2025-07-07");
  });
});
