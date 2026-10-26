import { describe, expect, it, vi } from "vitest";
import { createRequestGate } from "../../lib/report/request-gate";
import { readReportServices, type ReportServices } from "./report-context";
import { runLatest } from "./use-report";

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
