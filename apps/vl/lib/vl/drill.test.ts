import { describe, expect, it } from "vitest";
import { drillClick, drillParams, drillSubtitle, fromFilter, INITIAL_DRILL, rowLevel } from "./drill";

describe("drill-down", () => {
  it("starts at province rows with no filter", () => {
    expect(rowLevel(INITIAL_DRILL)).toBe("province");
    expect(drillParams(INITIAL_DRILL)).toEqual({ facility_type: "province", disaggregation: "false" });
  });

  it("province click → district rows; district click → facility rows", () => {
    const a = drillClick(INITIAL_DRILL, "Gaza", false);
    expect(a.kind).toBe("drill");
    if (a.kind !== "drill") return;
    expect(drillParams(a.next)).toEqual({ facility_type: "province", disaggregation: "true", province: ["Gaza"] });
    expect(rowLevel(a.next)).toBe("district");

    const b = drillClick(a.next, "Chokwe", false);
    if (b.kind !== "drill") throw new Error("expected drill");
    expect(drillParams(b.next)).toEqual({ facility_type: "district", disaggregation: "true", district: ["Chokwe"] });
    expect(rowLevel(b.next)).toBe("health_facility");
    expect(b.next.trail).toEqual(["Gaza", "Chokwe"]);
  });

  it("facility click opens patients for admins, with the parent district", () => {
    const atFacilities = { filterType: "district" as const, names: ["Chokwe"], disaggregation: true, trail: ["Gaza", "Chokwe"] };
    expect(drillClick(atFacilities, "CS Chokwe", true)).toEqual({ kind: "patients", facility: "CS Chokwe", district: "Chokwe" });
  });

  it("facility click does nothing for non-admins (no patient request)", () => {
    const atFacilities = { filterType: "district" as const, names: ["Chokwe"], disaggregation: true, trail: [] };
    expect(drillClick(atFacilities, "CS Chokwe", false)).toEqual({ kind: "none" });
  });

  it("empty label does nothing", () => {
    expect(drillClick(INITIAL_DRILL, "", true)).toEqual({ kind: "none" });
  });

  it("maps FacilitiesPopup selections: province by value, district and clinic by label, clinic → health_facility", () => {
    expect(fromFilter([{ value: "Gaza", label: "Gaza" }], "province").names).toEqual(["Gaza"]);
    expect(fromFilter([{ value: "D12", label: "Chokwe" }], "district").names).toEqual(["Chokwe"]);
    const clinic = fromFilter([{ value: "1100", label: "CS Chokwe" }, { value: "1101", label: "CS B" }], "clinic");
    expect(clinic.filterType).toBe("health_facility");
    expect(drillParams(clinic)).toEqual({ facility_type: "health_facility", disaggregation: "false", health_facility: "CS Chokwe" });
  });

  it("subtitle shows the range, then the filter or the breadcrumb", () => {
    const range = { start: "2025-10-13", end: "2026-10-13" };
    expect(drillSubtitle(range, INITIAL_DRILL)).toBe("13 de outubro de 2025 à 13 de outubro de 2026");
    expect(drillSubtitle(range, fromFilter([{ value: "Gaza", label: "Gaza" }], "province"))).toBe(
      "13 de outubro de 2025 à 13 de outubro de 2026 | Província: Gaza",
    );
    expect(drillSubtitle(range, { filterType: "district", names: ["Chokwe"], disaggregation: true, trail: ["Gaza", "Chokwe"] })).toBe(
      "13 de outubro de 2025 à 13 de outubro de 2026 | Gaza → Chokwe",
    );
  });
});
