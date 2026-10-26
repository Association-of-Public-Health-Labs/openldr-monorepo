import { vlGet, type Params } from "./api";
import type { Cell } from "@repo/design_system/lib/report/export/excel";
import { MAX_PER_PAGE, patientCells, patientRowKey, text, type PatientColumn } from "@repo/design_system/lib/report/patients";

export { MAX_PER_PAGE, patientRowKey };

export type PatientEndpoint = "by_name" | "by_facility" | "by_result_type" | "by_test_reason";
export type ResultType = "suppressed" | "not_suppressed";
export type TestReason = "Routine" | "Repeat" | "Suspected treatment failure" | "Reason Not Specified";

export type PatientFilters = {
  date_basis?: "registration" | "analysis";
  result_type?: ResultType[];
  test_reason?: TestReason[];
  pregnant?: boolean;
  breastfeeding?: boolean;
  rejected?: boolean;
  age_range?: [number, number];
};

/** Fields of hiv/vl/patients rows used by the app (the API sends more). */
export type PatientRow = {
  request_id: string | null;
  first_name?: string | null;
  last_name?: string | null;
  nid?: string | null;
  age_in_years?: number | null;
  sex_code?: string | null;
  phone?: string | null;
  province?: string | null;
  district?: string | null;
  health_facility?: string | null;
  specimen_datetime?: string | null;
  registered_datetime?: string | null;
  analysis_datetime?: string | null;
  authorised_datetime?: string | null;
  final_result?: string | null;
  viral_load_result_category?: string | null;
  reason_for_test?: string | null;
};

export type PatientsPage = {
  status: string;
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  data: PatientRow[];
};

export const RESULT_TYPE_LABEL: Record<ResultType, string> = {
  suppressed: "CV < 1000 (suprimida)",
  not_suppressed: "CV > 1000 (não suprimida)",
};

export const TEST_REASON_LABEL: Record<TestReason, string> = {
  Routine: "Rotina",
  Repeat: "Repetição",
  "Suspected treatment failure": "Suspeita de falha terapêutica",
  "Reason Not Specified": "Motivo não preenchido",
};

export function patientFilterParams(filters: PatientFilters): Params {
  const params: Params = {};
  if (filters.date_basis) params.date_basis = filters.date_basis;
  if (filters.result_type?.length) params.result_type = filters.result_type;
  if (filters.pregnant) params.pregnant = "true";
  if (filters.breastfeeding) params.breastfeeding = "true";
  if (filters.rejected) params.rejected = "true";
  if (filters.age_range) params.age_range = `${filters.age_range[0]},${filters.age_range[1]}`;
  if (filters.test_reason?.length) params.test_reason = filters.test_reason;
  return params;
}

export const fetchPatients = (
  endpoint: PatientEndpoint,
  params: Params,
  page: number,
  perPage: number,
  token: string | null,
): Promise<PatientsPage> =>
  vlGet<PatientsPage>(
    `/patients/${endpoint}/`,
    { ...params, page, per_page: Math.min(perPage, MAX_PER_PAGE) },
    token,
  );

/** "2026-03-04T10:22:00" → "04/03/2026"; null → "". */
export function formatDateTimePt(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : "";
}

const suppressionLabel = (category: string | null | undefined): string =>
  category === "Suppressed" ? "CV Suprimida" : category === "Not Suppressed" ? "CV Não Suprimida" : "";

const date = (v: unknown): string => formatDateTimePt(v as string | null | undefined);

/** Patient list columns, in the legacy Excel order. */
export const PATIENT_COLUMNS: PatientColumn[] = [
  { key: "first_name", label: "Nome", format: text },
  { key: "last_name", label: "Apelido", format: text },
  { key: "nid", label: "NID", format: text },
  { key: "age_in_years", label: "Idade" },
  { key: "sex_code", label: "Sexo", format: text },
  { key: "phone", label: "Contacto", format: text },
  { key: "province", label: "Província", format: text },
  { key: "district", label: "Distrito", format: text },
  { key: "health_facility", label: "Unidade Sanitária", format: text },
  { key: "specimen_datetime", label: "Data de Colheita", format: date },
  { key: "registered_datetime", label: "Data de Registo", format: date },
  { key: "analysis_datetime", label: "Data de Análise", format: date },
  { key: "authorised_datetime", label: "Data de Validação", format: date },
  { key: "final_result", label: "Resultado Final", format: text },
  {
    key: "viral_load_result_category",
    label: "Supressão Viral",
    format: (v) => suppressionLabel(v as string | null | undefined),
    badge: (label) => (label === "CV Suprimida" ? "good" : "bad"),
  },
  {
    key: "reason_for_test",
    label: "Motivo de Teste",
    format: (v) => (v ? TEST_REASON_LABEL[v as TestReason] ?? String(v) : ""),
  },
];

export const PATIENT_HEADERS = PATIENT_COLUMNS.map((c) => c.label);

export const patientToRow = (p: PatientRow): Cell[] => patientCells(PATIENT_COLUMNS, p);

/** Tested-type drill-downs: analysis-date window, rows with a result (legacy "ViralLoadResultCategory IS NOT NULL"). */
export const TESTED_PATIENTS: PatientFilters = {
  date_basis: "analysis",
  result_type: ["suppressed", "not_suppressed"],
};
