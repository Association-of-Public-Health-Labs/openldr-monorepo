import { describe, expect, it } from "vitest";
import { patientCells } from "@repo/design_system/lib/report/patients";
import { PATIENT_COLUMNS, type EidPatientRow } from "./patients";

const row: EidPatientRow = {
  request_id: "MZ1",
  name: "Ana Maria Silva",
  sex: "F",
  age_in_days: 45,
  requesting_province: "Gaza",
  requesting_district: "Chokwe",
  requesting_facility: "CS Chokwe",
  testing_facility: "INS",
  specimen_date: "2026-03-04T10:22:00",
  registered_date: "2026-03-05",
  analysis_date: null,
  authorised_date: "2026-03-09T08:00:00",
  lab_type: "poc",
  result: "Detected",
  rejection_reason: null,
  caregiver_phone: "841234567",
  mother_ptv_id: "PTV1",
};

const cells = (r: Partial<EidPatientRow>) => Object.fromEntries(PATIENT_COLUMNS.map((c, i) => [c.key, patientCells(PATIENT_COLUMNS, r)[i]]));

describe("PATIENT_COLUMNS", () => {
  it("has the 17 columns in C4 order with their labels", () => {
    expect(PATIENT_COLUMNS.map((c) => [c.key, c.label])).toEqual([
      ["request_id", "Nº da requisição"],
      ["name", "Nome"],
      ["sex", "Sexo"],
      ["age_in_days", "Idade (dias)"],
      ["requesting_province", "Província"],
      ["requesting_district", "Distrito"],
      ["requesting_facility", "US"],
      ["testing_facility", "Laboratório"],
      ["specimen_date", "Data de colheita"],
      ["registered_date", "Registo"],
      ["analysis_date", "Análise"],
      ["authorised_date", "Validação"],
      ["lab_type", "Tipo"],
      ["result", "Resultado"],
      ["rejection_reason", "Motivo de rejeição"],
      ["caregiver_phone", "Contacto do cuidador"],
      ["mother_ptv_id", "PTV da mãe"],
    ]);
  });
  it("every column has a non-empty label", () => {
    expect(PATIENT_COLUMNS.every((c) => c.label.trim().length > 0)).toBe(true);
  });
  it("shows the full name (C5)", () => {
    expect(cells(row).name).toBe("Ana Maria Silva");
  });
  it("formats dates as dd/mm/aaaa and null as an em dash", () => {
    const c = cells(row);
    expect(c.specimen_date).toBe("04/03/2026");
    expect(c.registered_date).toBe("05/03/2026");
    expect(c.authorised_date).toBe("09/03/2026");
    expect(c.analysis_date).toBe("—");
  });
  it("maps lab_type", () => {
    expect(cells(row).lab_type).toBe("PoC");
    expect(cells({ lab_type: "conventional" }).lab_type).toBe("Convencional");
    expect(cells({ lab_type: null }).lab_type).toBe("—");
  });
  it("keeps age as a raw number and blanks missing text", () => {
    const c = cells({ request_id: "X", age_in_days: 0 });
    expect(c.age_in_days).toBe(0);
    expect(c.rejection_reason).toBe("");
  });
});
