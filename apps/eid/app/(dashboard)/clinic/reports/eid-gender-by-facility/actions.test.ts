import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { facilityParams, INITIAL_DRILL } from "@repo/design_system/lib/report/drill";
import { DEFAULT_GENDER_TAB, genderExtraParams, genderTitle } from "@/lib/eid/gender-tabs";
import { ENDPOINT, TITLE } from "./constants";

describe("eid-gender-by-facility", () => {
  it("uses its endpoint and title", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_gender/");
    expect(TITLE).toBe("Amostras Testadas por Sexo/Província");
  });
  it("first request equals the cache seed: Todos sends no lab_type", () => {
    const source = readFileSync(join(__dirname, "index.tsx"), "utf8");
    expect(source).toContain("endpoint={ENDPOINT}");
    expect(source).toContain("onRestart");
    expect(facilityParams({ start: "2026-01-01", end: "2026-06-30" }, INITIAL_DRILL, genderExtraParams(DEFAULT_GENDER_TAB))).toEqual({
      interval_dates: "2026-01-01,2026-06-30",
      facility_type: "province",
      disaggregation: "false",
    });
  });
  it("PoC tab adds lab_type and the title suffix", () => {
    expect(facilityParams({ start: "2026-01-01", end: "2026-06-30" }, INITIAL_DRILL, genderExtraParams("poc")).lab_type).toBe("poc");
    expect(genderTitle(TITLE, "poc")).toBe(TITLE + " - PoC");
  });
});
