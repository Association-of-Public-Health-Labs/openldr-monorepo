import { describe, expect, it } from "vitest";
import { facilityHint, patientRequestParams } from "./facility";

const range = { start: "2026-01-01", end: "2026-06-30" };

describe("facilityHint", () => {
  it("test_facility_hint_for_users_only", () => {
    expect(facilityHint("health_facility", "user")).toBe("A lista de pacientes está disponível apenas para Administradores.");
    expect(facilityHint("health_facility", "admin")).toBeNull();
    expect(facilityHint("health_facility", "unknown")).toBeNull();
    expect(facilityHint("province", "user")).toBeNull();
    expect(facilityHint("district", "user")).toBeNull();
  });
});

describe("patientRequestParams", () => {
  it("test_patient_request_params", () => {
    expect(
      patientRequestParams(range, { kind: "patients", facility: "CS Chokwe", district: "Chokwe" }, {
        date_basis: "analysis",
        result_type: ["suppressed", "not_suppressed"],
      }),
    ).toEqual({
      interval_dates: "2026-01-01,2026-06-30",
      health_facility: "CS Chokwe",
      district: ["Chokwe"],
      date_basis: "analysis",
      result_type: ["suppressed", "not_suppressed"],
    });
    const plain = patientRequestParams(range, { kind: "patients", facility: "CS X" });
    expect(plain).toEqual({ interval_dates: "2026-01-01,2026-06-30", health_facility: "CS X", district: undefined });
  });
});
