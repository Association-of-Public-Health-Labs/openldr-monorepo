import type { Cell } from "./export/excel";

export type PatientRecord = Record<string, unknown>;

export type PatientColumn = {
  key: string;
  label: string;
  /** Text of the cell. Without it the raw value is kept (numbers stay numbers in Excel). */
  format?: (v: unknown) => string;
  /** Shows the non-empty cell text as a soft badge in the table: green "good", red "bad". */
  badge?: (text: string) => "good" | "bad";
};

/** One page of a /patients/* endpoint (the API's paging envelope). */
export type PatientsPage<Row = PatientRecord> = {
  status: string;
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  data: Row[];
};

/** Patients per request (the API's cap). */
export const MAX_PER_PAGE = 500;

/** null/undefined → "", anything else as text. */
export const text = (v: unknown): string => (v == null ? "" : String(v));

function rawCell(v: unknown): Cell {
  if (v == null) return null;
  return typeof v === "number" || typeof v === "string" ? v : String(v);
}

/** "2026-03-04T10:22:00" → "04/03/2026"; null → "". */
export function formatDateTimePt(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : "";
}

/** React key for a patient row: request_id can be null or repeated, so the index keeps it unique. */
export const patientRowKey = (p: PatientRecord, index: number): string => `${String(p.request_id ?? "sem-id")}-${index}`;

/** One patient as table/Excel cells, in column order. */
export const patientCells = (columns: PatientColumn[], row: PatientRecord): Cell[] =>
  columns.map((c) => (c.format ? c.format(row[c.key]) : rawCell(row[c.key])));

/** Excel sheet of patients, header = column labels. */
export const patientsSheet = (columns: PatientColumn[], rows: PatientRecord[]) => ({
  header: columns.map((c) => c.label),
  rows: rows.map((row) => patientCells(columns, row)),
});
