import { describe, expect, it } from "vitest";
import { PROVINCES, filterClinics, filterDistricts, formatClinics, formatDistricts } from "./facilities";

const districts = formatDistricts([
  { DistrictCode: "D1", DistrictName: "Chokwe", ProvinceName: "Gaza" },
  { DistrictCode: "D2", DistrictName: "Moatize", ProvinceName: "Tete" },
]);
const clinics = formatClinics([
  { FacilityCode: "C1", FacilityName: "CS Chokwe", DistrictName: "Chokwe", ProvinceName: "Gaza" },
  { FacilityCode: "C2", FacilityName: "HR Moatize", DistrictName: "Moatize", ProvinceName: "Tete" },
]);

describe("facilities dialog data", () => {
  it("lists the 11 provinces, as the old dialog", () => {
    expect(PROVINCES).toHaveLength(11);
    expect(PROVINCES.find((p) => p.value === "Zambezia")?.label).toBe("Zambézia");
  });

  it("keeps the option shape the cards read (value, label, district, province)", () => {
    expect(districts[0]).toEqual({ value: "D1", label: "Chokwe", district: "Chokwe", province: "Gaza" });
    expect(clinics[1]).toEqual({ value: "C2", label: "HR Moatize", clinic: "HR Moatize", district: "Moatize", province: "Tete" });
  });

  it("drops blank names and repeated codes from the dictionary", () => {
    const rows = formatDistricts([
      { DistrictCode: "D1", DistrictName: "Chokwe", ProvinceName: "Gaza" },
      { DistrictCode: "D1", DistrictName: "Chokwe", ProvinceName: "Gaza" },
      { DistrictCode: "D9", DistrictName: " ", ProvinceName: "Gaza" },
    ]);
    expect(rows.map((r) => r.value)).toEqual(["D1"]);
  });

  it("narrows districts to the chosen provinces (by label), all when none is chosen", () => {
    expect(filterDistricts(districts, [{ value: "Gaza", label: "Gaza" }]).map((d) => d.label)).toEqual(["Chokwe"]);
    expect(filterDistricts(districts, [])).toHaveLength(2);
    const zambezia = formatDistricts([{ DistrictCode: "Z1", DistrictName: "Mocuba", ProvinceName: "Zambezia" }]);
    expect(filterDistricts(zambezia, PROVINCES.filter((p) => p.value === "Zambezia"))).toHaveLength(1);
  });

  it("narrows clinics by province, then by district", () => {
    expect(filterClinics(clinics, [{ value: "Tete", label: "Tete" }], []).map((c) => c.value)).toEqual(["C2"]);
    expect(filterClinics(clinics, [], [{ value: "D1", label: "Chokwe" }]).map((c) => c.value)).toEqual(["C1"]);
    expect(filterClinics(clinics, [], [])).toHaveLength(2);
  });
});
