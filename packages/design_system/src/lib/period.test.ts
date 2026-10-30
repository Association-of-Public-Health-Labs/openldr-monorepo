import { describe, expect, it } from "vitest";
import { isLastTwelveMonths, LAST_12_MONTHS_LABEL, periodLabel } from "./period";

const today = new Date(2026, 9, 19, 12); // 19 Oct 2026, local noon

describe("isLastTwelveMonths", () => {
  it("accepts the same day a year before up to today", () => {
    expect(isLastTwelveMonths("2025-10-19", "2026-10-19", today)).toBe(true);
  });

  it("accepts the 1st of the month 11 months before up to today", () => {
    expect(isLastTwelveMonths("2025-11-01", "2026-10-19", today)).toBe(true);
  });

  it("allows one day of UTC shift on either end", () => {
    expect(isLastTwelveMonths("2025-10-18", "2026-10-18", today)).toBe(true);
    expect(isLastTwelveMonths("2025-10-31", "2026-10-19", today)).toBe(true);
  });

  it("accepts date-times", () => {
    expect(isLastTwelveMonths("2025-10-19T00:00:00Z", "2026-10-19T22:00:00Z", today)).toBe(true);
  });

  it("rejects other periods", () => {
    expect(isLastTwelveMonths("2026-01-01", "2026-10-19", today)).toBe(false);
    expect(isLastTwelveMonths("2025-10-19", "2026-09-30", today)).toBe(false);
    expect(isLastTwelveMonths("2024-10-19", "2025-10-19", today)).toBe(false);
    expect(isLastTwelveMonths("2025-09-01", "2026-10-19", today)).toBe(false);
    expect(isLastTwelveMonths("", "", today)).toBe(false);
  });

  it("handles 29 February", () => {
    const leap = new Date(2028, 1, 29, 12);
    expect(isLastTwelveMonths("2027-02-28", "2028-02-29", leap)).toBe(true);
  });
});

describe("periodLabel", () => {
  const fmt = (s: string, e: string) => `${s} à ${e}`;
  it("names the default period and formats the others", () => {
    expect(periodLabel("2025-10-19", "2026-10-19", fmt, today)).toBe(LAST_12_MONTHS_LABEL);
    expect(periodLabel("2026-01-01", "2026-06-30", fmt, today)).toBe("2026-01-01 à 2026-06-30");
  });
});
