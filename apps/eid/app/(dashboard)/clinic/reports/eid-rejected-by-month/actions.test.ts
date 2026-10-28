import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { facilityParams, INITIAL_DRILL } from "@repo/design_system/lib/report/drill";
import { ENDPOINT, TITLE } from "./constants";

describe("eid-rejected-by-month", () => {
  it("uses its endpoint and title", () => {
    expect(ENDPOINT).toBe("/facilities/rejected_samples_by_month/");
    expect(TITLE).toBe("Amostras Rejeitadas/Mês");
  });
  it("first request equals the cache seed and takes no lab_type", () => {
    const source = readFileSync(join(__dirname, "index.tsx"), "utf8");
    expect(source).not.toContain("extraParams");
    expect(facilityParams({ start: "2026-01-01", end: "2026-06-30" }, INITIAL_DRILL, undefined)).toEqual({
      interval_dates: "2026-01-01,2026-06-30",
      facility_type: "province",
      disaggregation: "false",
    });
  });
});
