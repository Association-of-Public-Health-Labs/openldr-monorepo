import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchOverview, summarize } from "./actions";

const range = { start: "2025-10-13", end: "2026-10-13" };

describe("overview status cards", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });

  it("calls the three summary endpoints with the same window", async () => {
    await fetchOverview(range, "t");
    expect(vlGet.mock.calls.map((c) => c[0])).toEqual([
      "/summary/number_of_samples_by_month/",
      "/summary/viral_suppression_by_month/",
      "/summary/tat_by_month/",
    ]);
    expect(vlGet.mock.calls.every((c) => c[1].interval_dates === "2025-10-13,2026-10-13")).toBe(true);
  });

  it("reproduces the legacy maths (sum, mean of rounded %, mean of TAT sums)", () => {
    const s = summarize({
      samples: [
        { year: 2026, month: 1, month_name: "January", total: 100 },
        { year: 2026, month: 2, month_name: "February", total: 50 },
      ],
      suppression: [
        { year: 2026, month: 1, month_name: "January", total: 3, suppressed: 2, not_suppressed: 1 },
        { year: 2026, month: 2, month_name: "February", total: 0, suppressed: 0, not_suppressed: 0 },
      ],
      tat: [
        { year: 2026, month: 1, month_name: "January", collection_reception: 2, reception_registration: 1, registration_analysis: null, analysis_validation: 3 },
      ],
    });
    expect(s.samples.value).toBe(150);
    expect(s.samples.labels).toEqual(["Jan/26", "Fev/26"]);
    expect(s.suppression.data).toEqual([67, 0]);
    expect(s.suppression.value).toBe(34); // round((67 + 0) / 2)
    expect(s.tat.value).toBe(6);
  });

  it("returns zeros for empty responses", () => {
    const s = summarize({ samples: [], suppression: [], tat: [] });
    expect([s.samples.value, s.suppression.value, s.tat.value]).toEqual([0, 0, 0]);
  });
});
