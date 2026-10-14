import { describe, expect, it } from "vitest";
import { formatDatePt, formatRangePt, intervalParam, lastYear, monthLabel } from "./dates";

const d = (s: string) => {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
};

describe("windows", () => {
  it("lastYear is the same day one year earlier", () => {
    expect(lastYear(d("2026-10-13"))).toEqual({ start: "2025-10-13", end: "2026-10-13" });
  });
  it("lastYear on 29 February falls back to 28 February", () => {
    expect(lastYear(d("2028-02-29"))).toEqual({ start: "2027-02-28", end: "2028-02-29" });
  });
  it("intervalParam joins with a comma", () => {
    expect(intervalParam({ start: "2025-01-01", end: "2025-12-31" })).toBe("2025-01-01,2025-12-31");
  });
});

describe("labels", () => {
  it("monthLabel uses Portuguese abbreviations and a 2-digit year so 13-month windows never repeat", () => {
    expect(monthLabel(2025, 10)).toBe("Out/25");
    expect(monthLabel(2026, 10)).toBe("Out/26");
    expect(monthLabel(2026, 2)).toBe("Fev/26");
  });
  it("formatDatePt and formatRangePt avoid timezone shifts", () => {
    expect(formatDatePt("2026-01-01")).toBe("01 de janeiro de 2026");
    expect(formatRangePt({ start: "2025-10-13", end: "2026-10-13" })).toBe("13 de outubro de 2025 à 13 de outubro de 2026");
  });
});
