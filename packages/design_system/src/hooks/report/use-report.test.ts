import { describe, expect, it, vi } from "vitest";
import { createRequestGate } from "../../lib/report/request-gate";
import { readReportServices, type ReportServices } from "./report-context";
import { reportDeps, runLatest } from "./use-report";

describe("runLatest", () => {
  it("test_latest_request_wins", () => {
    const gate = createRequestGate();
    const first = gate.next();
    const second = gate.next();
    const apply = vi.fn();
    runLatest(gate, first, "old", apply);
    runLatest(gate, second, "new", apply);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith("new");
  });
});

describe("readReportServices", () => {
  it("test_use_report_context_throws_outside_provider", () => {
    expect(() => readReportServices(null)).toThrow("ReportProvider em falta");
  });

  it("returns the value when provided", () => {
    const value = {} as ReportServices;
    expect(readReportServices(value)).toBe(value);
  });
});

describe("reportDeps", () => {
  it("test_range_report_reloads_on_extra_deps", () => {
    const range = { start: "2025-01-01", end: "2025-12-31" };
    expect(reportDeps(range, [0])).toEqual([range, 0]);
    // Changing an extra dep changes the dependency list (the effect would re-run) ...
    const changed = reportDeps(range, [3]).some((d, i) => !Object.is(d, reportDeps(range, [0])[i]));
    expect(changed).toBe(true);
    // ... with no extra deps the list is just the range (behaviour unchanged).
    expect(reportDeps(range)).toEqual([range]);
    // The second load is the one applied.
    const gate = createRequestGate();
    const first = gate.next();
    const second = gate.next();
    const apply = vi.fn();
    runLatest(gate, first, "segment 0", apply);
    runLatest(gate, second, "segment 3", apply);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith("segment 3");
  });
});
