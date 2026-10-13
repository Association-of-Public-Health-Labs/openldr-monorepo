import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart } from "./actions";

describe("vl-rejected-by-month", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches laboratories rejected_samples_by_month", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, [], "t");
    expect(vlGet.mock.calls[0][0]).toBe("/laboratories/rejected_samples_by_month/");
  });
  it("has one orange series by month", () => {
    const c = toChart([{ year: 2026, month: 3, month_name: "March", total: 4 }]);
    expect(c).toEqual({ labels: ["Mar/26"], series: [{ name: "Amostras Rejeitadas", color: "#fb8c00", data: [4] }] });
  });
});
