import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/monitoring/api", () => ({ monitoringGet: vi.fn() }));
import { toDonut } from "./actions";

describe("national-connectivity actions", () => {
  it("splits the period into online and offline shares", () => {
    expect(toDonut({ categories: [], uptimePct: 88, downtimePct: 12 })).toEqual({ labels: ["Online", "Offline"], series: [88, 12] });
  });
});
