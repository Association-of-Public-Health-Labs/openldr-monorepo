import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { facilityParams, INITIAL_DRILL } from "@repo/design_system/lib/report/drill";
import { TAT_SEGMENTS } from "@/lib/eid/series";
import { toChart, toExcel } from "./actions";
import { ENDPOINT, TITLE } from "./constants";

const range = { start: "2026-01-01", end: "2026-06-30" };
const source = () => readFileSync(join(__dirname, "index.tsx"), "utf8");

describe("eid-tat-avg-by-month", () => {
  it("uses its endpoint and title", () => {
    expect(ENDPOINT).toBe("/facilities/tat_avg_by_month/");
    expect(TITLE).toBe("Tempo de Resposta por Mês (média)");
  });
  it("first request equals the cache seed: no lab_type, no category", () => {
    expect(source()).toContain("endpoint={ENDPOINT}");
    expect(facilityParams(range, INITIAL_DRILL, undefined)).toEqual({
      interval_dates: "2026-01-01,2026-06-30",
      facility_type: "province",
      disaggregation: "false",
    });
  });
  it("builds one stack per bar from the shared series", () => {
    const row = { year: 2026, month: 3, collection_hub_reception: 1, hub_reception_hub_registration: 2, hub_registration_lab_reception: 3, lab_registration_analysis: 4, lab_reception_lab_registration: 5, analysis_validation: 6 };
    const c = toChart([row] as never);
    expect(c.labels).toEqual(["Mar/26"]);
    expect(c.series.map((s) => s.name)).toEqual((TAT_SEGMENTS).map((s) => s.label));
    expect(toExcel([row] as never).header[0]).toBe("Mês");
  });
});
