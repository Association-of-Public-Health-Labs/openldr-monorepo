import { describe, expect, it, vi } from "vitest";

// The real barrel loads the MUI maps (they touch `window`); only the code tables matter here.
vi.mock("@repo/design_system/app/atoms/maps/Provinces", () => ({
  GAZA_DISTRICT_CODES: { MZ0900C1: "Xai-Xai", MZ0900C6: "Chokwe" },
  NIASSA_DISTRICT_CODES: { MZ0100C1: "Lichinga" },
  CABO_DELGADO_DISTRICT_CODES: {}, NAMPULA_DISTRICT_CODES: {}, ZAMBEZIA_DISTRICT_CODES: {},
  TETE_DISTRICT_CODES: {}, MANICA_DISTRICT_CODES: {}, SOFALA_DISTRICT_CODES: {}, INHAMBANE_DISTRICT_CODES: {},
  MAPUTO_PROVINCIA_DISTRICT_CODES: {}, MAPUTO_CIDADE_DISTRICT_CODES: {},
}));

import { recentWeeks } from "@repo/design_system/lib/weeks";
import { buildDemo, NATIONAL } from "./data";
import { addCounts, EMPTY, totalOf } from "./tat";

const weeks = recentWeeks(28, new Date(2026, 10, 11));
const last = { from: 27, to: 27 };

describe("transport demonstration data", () => {
  it("the country is the sum of its provinces, a province of its districts, a district of its facilities", () => {
    const national = buildDemo(weeks, { range: last, province: null, district: null });
    expect(national.area.name).toBe(NATIONAL);
    expect(national.childLevel).toBe("province");
    expect(national.area.counts).toEqual(national.children.reduce((acc, c) => addCounts(acc, c.counts), EMPTY));

    const gaza = buildDemo(weeks, { range: last, province: "Gaza", district: null });
    expect(gaza.children.map((c) => c.name)).toEqual(["Xai-Xai", "Chokwe"]);
    expect(gaza.area.counts).toEqual(national.children.find((c) => c.name === "Gaza")?.counts);

    const chokwe = buildDemo(weeks, { range: last, province: "Gaza", district: "Chokwe" });
    expect(chokwe.childLevel).toBe("facility");
    expect(totalOf(chokwe.area.counts)).toBe(chokwe.children.reduce((n, c) => n + totalOf(c.counts), 0));
    expect(chokwe.area.counts).toEqual(gaza.children.find((c) => c.name === "Chokwe")?.counts);
    // The map keeps the province's districts while a district is open.
    expect(chokwe.mapUnits).toEqual(gaza.children);
  });

  it("is the same every time, and a range sums its weeks", () => {
    const a = buildDemo(weeks, { range: { from: 24, to: 27 }, province: "Gaza", district: null });
    const b = buildDemo(weeks, { range: { from: 24, to: 27 }, province: "Gaza", district: null });
    expect(a).toEqual(b);
    expect(a.area.counts).toEqual(a.weekly.slice(24, 28).reduce(addCounts, EMPTY));
    expect(a.weekly).toHaveLength(28);
  });
});
