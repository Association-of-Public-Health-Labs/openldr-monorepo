import { beforeEach, describe, expect, it, vi } from "vitest";
import { patientCells } from "@repo/design_system/lib/report/patients";

const eidGet = vi.fn();
vi.mock("./api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a) }));

import { fetchPage, PATIENT_COLUMNS, toSheetRow, type EidPatientRow } from "./patients";

beforeEach(() => eidGet.mockReset());

describe("fetchPage", () => {
  it("calls the endpoint with page and per_page capped at 500, and the token", async () => {
    eidGet.mockResolvedValue({ status: "success", page: 2, per_page: 500, total_count: 0, total_pages: 0, data: [] });
    await fetchPage("by_name", { name: "Ana" }, 2, 5000, "tok");
    expect(eidGet).toHaveBeenCalledWith("/patients/by_name/", { name: "Ana", page: 2, per_page: 500 }, "tok");
  });
});

describe("toSheetRow", () => {
  it("carries the full name and both contacts", () => {
    const row = { request_id: "MZ1", name: "Ana Maria Silva", caregiver_phone: "841234567", mother_ptv_id: "PTV1" } as EidPatientRow;
    const cells = toSheetRow(row);
    expect(cells).toEqual(patientCells(PATIENT_COLUMNS, row));
    expect(cells).toContain("Ana Maria Silva");
    expect(cells).toContain("841234567");
    expect(cells).toContain("PTV1");
    expect(cells).toHaveLength(17);
  });
});
