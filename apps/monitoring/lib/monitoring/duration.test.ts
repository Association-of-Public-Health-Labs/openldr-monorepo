import { describe, it, expect } from "vitest";
import { offlineDurationMs, humanizeDuration } from "./duration";

describe("offlineDurationMs", () => {
  it("computes wall-clock between two timestamps", () => {
    expect(offlineDurationMs("2025-08-14T13:00:00Z", "2025-08-14T15:00:00Z")).toBe(2 * 3600_000);
  });
  it("uses now when end is null (pending)", () => {
    const now = new Date("2025-08-14T17:00:00Z");
    expect(offlineDurationMs("2025-08-14T13:00:00Z", null, now)).toBe(4 * 3600_000);
  });
  it("clamps negative span to 0", () => {
    expect(offlineDurationMs("2025-08-14T15:00:00Z", "2025-08-14T13:00:00Z")).toBe(0);
  });
});
describe("humanizeDuration", () => {
  it("minutes under an hour", () => { expect(humanizeDuration(30 * 60_000)).toBe("30 minutos"); });
  it("hours under a day", () => { expect(humanizeDuration(4 * 3600_000)).toBe("4 horas"); });
  it("days", () => { expect(humanizeDuration(2 * 24 * 3600_000)).toBe("2 dias"); });
  it("singular", () => { expect(humanizeDuration(3600_000)).toBe("1 hora"); });
  it("singular minute", () => { expect(humanizeDuration(60_000)).toBe("1 minuto"); });
  it("exact 24h boundary goes to days", () => { expect(humanizeDuration(24 * 3_600_000)).toBe("1 dia"); });
  it("59.5 minutes stays in minutes bucket (no premature rounding to hours)", () => {
    expect(humanizeDuration(3_570_000)).toBe("60 minutos");
  });
});
