import { describe, expect, it } from "vitest";
import {
  initialLabDrill,
  labDrillClickRow,
  labDrillClick,
  labDrillLevel,
  labDrillParams,
  labTrailLabel,
  rowsForDrill,
  type LabDrill,
} from "./lab-drill";

/** Drills `d` with each click in turn; fails the test if a click is ignored. */
function drillTo(d: LabDrill, ...clicks: [string, string?][]): LabDrill {
  return clicks.reduce((state, [label, code]) => {
    const next = labDrillClick(state, label, code);
    if (!next) throw new Error(`click on ${label} was ignored`);
    return next;
  }, d);
}

describe("lab drill-down", () => {
  it("test_lab_start_sends_nothing", () => {
    const d = initialLabDrill("lab");
    expect(labDrillLevel(d)).toBe("lab");
    expect(labDrillParams(d, [])).toEqual({});
  });

  it("test_province_start_sends_facility_type_province", () => {
    const d = initialLabDrill("province");
    expect(labDrillLevel(d)).toBe("province");
    expect(labDrillParams(d, [])).toEqual({ facility_type: "province" });
  });

  it("first level sends the selected lab codes", () => {
    expect(labDrillParams(initialLabDrill("lab"), ["PMB", "PJV"])).toEqual({ lab_code: ["PMB", "PJV"] });
    expect(labDrillParams(initialLabDrill("province"), ["PMB"])).toEqual({ facility_type: "province", lab_code: ["PMB"] });
  });

  it("test_lab_click_drills_by_code", () => {
    const d = drillTo(initialLabDrill("lab"), ["HG Maputo", "PMB"]);
    expect(labDrillLevel(d)).toBe("province");
    expect(labDrillParams(d, [])).toEqual({ facility_type: "lab", lab_code: ["PMB"], disaggregation: "true" });
  });

  it("test_province_click", () => {
    const d = drillTo(initialLabDrill("province"), ["Gaza"]);
    expect(labDrillLevel(d)).toBe("district");
    expect(labDrillParams(d, [])).toEqual({ facility_type: "province", province: ["Gaza"], disaggregation: "true" });
  });

  it("test_district_click", () => {
    const d = drillTo(initialLabDrill("province"), ["Gaza"], ["Chókwè"]);
    expect(labDrillLevel(d)).toBe("health_facility");
    expect(labDrillParams(d, [])).toEqual({ facility_type: "district", district: ["Chókwè"], disaggregation: "true" });
  });

  it("province and district clicks below a lab stay inside the clicked lab", () => {
    const atDistricts = drillTo(initialLabDrill("lab"), ["HG Maputo", "PMB"], ["Gaza"]);
    expect(labDrillParams(atDistricts, ["PMB", "PJV"])).toEqual({
      facility_type: "province",
      province: ["Gaza"],
      disaggregation: "true",
      lab_code: ["PMB"],
    });
  });

  it("test_lab_click_without_code_is_ignored", () => {
    const d = initialLabDrill("lab");
    expect(labDrillClick(d, "HG Maputo", undefined)).toBeNull();
    expect(labDrillClick(d, "HG Maputo", "")).toBeNull();
  });

  it("test_facility_level_click_is_ignored", () => {
    const d = drillTo(initialLabDrill("province"), ["Gaza"], ["Chókwè"]);
    expect(labDrillClick(d, "CS Chókwè")).toBeNull();
  });

  it("an empty label is ignored", () => {
    expect(labDrillClick(initialLabDrill("province"), "")).toBeNull();
  });

  it("test_drill_keeps_selected_lab_codes", () => {
    const d = drillTo(initialLabDrill("province"), ["Gaza"]);
    expect(labDrillParams(d, ["PMB", "PJV"])).toEqual({
      facility_type: "province",
      province: ["Gaza"],
      disaggregation: "true",
      lab_code: ["PMB", "PJV"],
    });
  });

  it("test_click_sends_row_name_verbatim", () => {
    const d = drillTo(initialLabDrill("province"), ["Zambézia"]);
    expect(labDrillParams(d, [])).toEqual({ facility_type: "province", province: ["Zambézia"], disaggregation: "true" });
    expect(d.trail).toEqual([{ level: "province", name: "Zambézia" }]);
  });

  it("test_rows_of_previous_level_are_ignored", () => {
    const labLevel = initialLabDrill("lab");
    const provinceLevel = drillTo(labLevel, ["HG Maputo", "PMB"]);
    const labRows = { drill: labLevel, rows: [{ testing_facility: "HG Maputo" }] };
    expect(rowsForDrill(labRows, provinceLevel)).toEqual([]);
    expect(rowsForDrill(labRows, labLevel)).toEqual(labRows.rows);
    // A structurally equal drill (e.g. after a reset) still matches.
    expect(rowsForDrill(labRows, initialLabDrill("lab"))).toEqual(labRows.rows);
    expect(rowsForDrill(null, labLevel)).toEqual([]);
    expect(rowsForDrill(undefined, labLevel)).toEqual([]);
  });

  it("reset (initial drill, labs cleared) sends the first level's params again", () => {
    const drilled = drillTo(initialLabDrill("province"), ["Gaza"]);
    expect(labDrillParams(drilled, ["PMB", "PJV"])).toHaveProperty("lab_code", ["PMB", "PJV"]);
    const reset = initialLabDrill(drilled.start);
    expect(labDrillParams(reset, [])).toEqual({ facility_type: "province" });
    expect(labTrailLabel(reset)).toBe("");
  });

  it("test_trail_label", () => {
    expect(labTrailLabel(initialLabDrill("lab"))).toBe("");
    const d = drillTo(initialLabDrill("lab"), ["Lab X", "LX"], ["Gaza"], ["Chókwè"]);
    expect(labTrailLabel(d)).toBe("Lab X → Gaza → Chókwè");
  });
});

describe("labDrillClickRow", () => {
  const rows = [
    { name: "Chókwè", code: "C1" },
    { name: "HG Maputo", code: "PMB" },
  ];
  type R = { name: string; code: string };
  const labelOf = (r: R) => r.name;
  const codeOf = (r: R) => r.code;

  it("ignores a label that matches no row", () => {
    expect(labDrillClickRow(initialLabDrill("lab"), rows, "Outro", labelOf, codeOf)).toBeNull();
    expect(labDrillClickRow(initialLabDrill("province"), [], "Gaza", labelOf, codeOf)).toBeNull();
  });

  it("drills with the matching row's own name and code", () => {
    const next = labDrillClickRow(initialLabDrill("lab"), rows, "HG Maputo", labelOf, codeOf);
    expect(next?.trail).toEqual([{ level: "lab", name: "HG Maputo", code: "PMB" }]);
  });
});
