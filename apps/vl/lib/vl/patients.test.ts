import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/config/api", () => ({ api: () => ({ get }) }));

import { fetchPatients, PATIENT_HEADERS, patientFilterParams, patientRowKey, patientToRow, TESTED_PATIENTS, type PatientRow } from "./patients";

describe("patientFilterParams", () => {
  it("serialises every drill-down filter with bound-parameter values", () => {
    expect(
      patientFilterParams({
        date_basis: "analysis",
        result_type: ["suppressed", "not_suppressed"],
        pregnant: true,
        breastfeeding: false,
        rejected: true,
        age_range: [15, 49],
        test_reason: ["Routine"],
      }),
    ).toEqual({
      date_basis: "analysis",
      result_type: ["suppressed", "not_suppressed"],
      pregnant: "true",
      rejected: "true",
      age_range: "15,49",
      test_reason: ["Routine"],
    });
  });
  it("returns {} for no filters", () => {
    expect(patientFilterParams({})).toEqual({});
  });
});

describe("fetchPatients", () => {
  beforeEach(() => get.mockReset());
  it("calls /hiv/vl/patients/<endpoint>/ and caps per_page at 500", async () => {
    get.mockResolvedValue({ data: { status: "success", page: 1, per_page: 500, total_count: 0, total_pages: 0, data: [] } });
    await fetchPatients("by_facility", { health_facility: "CS X" }, 1, 9999, "tok");
    expect(get).toHaveBeenCalledWith("/hiv/vl/patients/by_facility/", {
      params: { health_facility: "CS X", page: 1, per_page: 500 },
      paramsSerializer: { indexes: null },
    });
  });
});

describe("patient rows", () => {
  const row: PatientRow = {
    request_id: "MZ1",
    first_name: "Ana",
    last_name: "Silva",
    nid: "0101/123",
    age_in_years: 34,
    sex_code: "F",
    phone: "841234567",
    province: "Gaza",
    district: "Chokwe",
    health_facility: "CS Chokwe",
    specimen_datetime: "2026-03-04T10:22:00",
    registered_datetime: "2026-03-05T08:00:00",
    analysis_datetime: null,
    authorised_datetime: null,
    final_result: "<20",
    viral_load_result_category: "Suppressed",
    reason_for_test: "Suspected treatment failure",
  };

  it("formats a patient in the legacy Excel column order", () => {
    expect(PATIENT_HEADERS).toHaveLength(16);
    expect(patientToRow(row)).toEqual([
      "Ana", "Silva", "0101/123", 34, "F", "841234567", "Gaza", "Chokwe", "CS Chokwe",
      "04/03/2026", "05/03/2026", "", "", "<20", "CV Suprimida", "Suspeita de falha terapêutica",
    ]);
  });
  it("handles null and missing values", () => {
    const blank = patientToRow({ request_id: "MZ2" } as PatientRow);
    expect(blank).toHaveLength(16);
    expect(blank.every((c) => c === "" || c === null)).toBe(true);
  });
  it("patientRowKey is unique when request_id is null or repeated", () => {
    const rows = [{ request_id: null }, { request_id: null }, { request_id: "MZ1" }, { request_id: "MZ1" }] as PatientRow[];
    const keys = rows.map((row, i) => patientRowKey(row, i));
    expect(new Set(keys).size).toBe(4);
  });
});

describe("TESTED_PATIENTS", () => {
  it("lists tested samples by analysis date with a result (legacy ViralLoadResultCategory IS NOT NULL)", () => {
    expect(patientFilterParams(TESTED_PATIENTS)).toEqual({
      date_basis: "analysis",
      result_type: ["suppressed", "not_suppressed"],
    });
  });
});
