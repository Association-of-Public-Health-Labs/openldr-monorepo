import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { facilityParams, INITIAL_DRILL } from "@repo/design_system/lib/report/drill";
import { ENDPOINT, PATIENT_PARAMS, TITLE } from "./constants";

describe("eid-registered-by-facility", () => {
  it("uses its endpoint and title", () => {
    expect(ENDPOINT).toBe("/facilities/registered_samples/");
    expect(TITLE).toBe("Amostras Registadas/Província");
  });
  it("patient params per ruling C4", () => {
    expect(PATIENT_PARAMS).toEqual({});
  });
  it("first request equals the cache seed: no extraParams, so no lab_type or category", () => {
    const source = readFileSync(join(__dirname, "index.tsx"), "utf8");
    expect(source).not.toContain("extraParams");
    expect(source).toContain("endpoint={ENDPOINT}");
    expect(facilityParams({ start: "2026-01-01", end: "2026-06-30" }, INITIAL_DRILL, undefined)).toEqual({
      interval_dates: "2026-01-01,2026-06-30",
      facility_type: "province",
      disaggregation: "false",
    });
  });
});
