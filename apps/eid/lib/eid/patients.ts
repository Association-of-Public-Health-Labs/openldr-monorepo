import { MAX_PER_PAGE, formatDateTimePt, patientCells, text, type PatientColumn, type PatientsPage as KitPatientsPage } from "@repo/design_system/lib/report/patients";
import type { Cell } from "@repo/design_system/lib/report/export/excel";
import { eidGet, type Params } from "./api";

export { MAX_PER_PAGE };

/** Shape of GET /hiv/eid/patients/by_facility/. */
export type PatientsPage = KitPatientsPage<Record<string, unknown>>;

/** One page of up to 500 patients (spec §4.5); `total` is the full count, so callers can tell when the list is cut. */
export async function fetchPatients(
  params: Params,
  token: string | null,
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  const page = await eidGet<PatientsPage>(
    "/patients/by_facility/",
    { ...params, page: 1, per_page: MAX_PER_PAGE },
    token,
  );
  return { rows: page.data ?? [], total: page.total_count ?? 0 };
}

/** The 17 keys of /hiv/eid/patients/ rows (api-contracts.md). Contact fields: never log these rows. */
export type EidPatientRow = {
  request_id: string | null;
  name: string | null;
  sex: string | null;
  age_in_days: number | null;
  requesting_province: string | null;
  requesting_district: string | null;
  requesting_facility: string | null;
  testing_facility: string | null;
  specimen_date: string | null;
  registered_date: string | null;
  analysis_date: string | null;
  authorised_date: string | null;
  lab_type: "poc" | "conventional" | null;
  result: string | null;
  rejection_reason: string | null;
  caregiver_phone: string | null;
  mother_ptv_id: string | null;
};

/** "2026-03-04T10:22:00" → "04/03/2026"; null → "—". */
export const formatDatePt = (v: unknown): string => formatDateTimePt(v as string | null | undefined) || "—";

const LAB_TYPE_LABEL: Record<string, string> = { poc: "PoC", conventional: "Convencional" };

/** "poc" → "PoC", "conventional" → "Convencional", anything else → "—". */
export const formatLabType = (v: unknown): string => LAB_TYPE_LABEL[String(v)] ?? "—";

/** Patient list columns (ruling C4). Names are shown in full (C5): the list is admin-only. */
export const PATIENT_COLUMNS: PatientColumn[] = [
  { key: "request_id", label: "Nº da requisição", format: text },
  { key: "name", label: "Nome", format: text },
  { key: "sex", label: "Sexo", format: text },
  { key: "age_in_days", label: "Idade (dias)" },
  { key: "requesting_province", label: "Província", format: text },
  { key: "requesting_district", label: "Distrito", format: text },
  { key: "requesting_facility", label: "US", format: text },
  { key: "testing_facility", label: "Laboratório", format: text },
  { key: "specimen_date", label: "Data de colheita", format: formatDatePt },
  { key: "registered_date", label: "Registo", format: formatDatePt },
  { key: "analysis_date", label: "Análise", format: formatDatePt },
  { key: "authorised_date", label: "Validação", format: formatDatePt },
  { key: "lab_type", label: "Tipo", format: formatLabType },
  { key: "result", label: "Resultado", format: text },
  { key: "rejection_reason", label: "Motivo de rejeição", format: text },
  { key: "caregiver_phone", label: "Contacto do cuidador", format: text },
  { key: "mother_ptv_id", label: "PTV da mãe", format: text },
];

export const PATIENT_HEADERS = PATIENT_COLUMNS.map((c) => c.label);

/** One page of /hiv/eid/patients/<endpoint>/; per_page is capped at the API's 500. Never log the rows (contacts). */
export const fetchPage = (
  endpoint: string,
  params: Params,
  page: number,
  perPage: number,
  token: string | null,
): Promise<KitPatientsPage<EidPatientRow>> =>
  eidGet<KitPatientsPage<EidPatientRow>>(`/patients/${endpoint}/`, { ...params, page, per_page: Math.min(perPage, MAX_PER_PAGE) }, token);

/** The page's Excel row: all 17 columns, full name and contacts included (admin-only page). */
export const toSheetRow = (row: EidPatientRow): Cell[] => patientCells(PATIENT_COLUMNS, row);
