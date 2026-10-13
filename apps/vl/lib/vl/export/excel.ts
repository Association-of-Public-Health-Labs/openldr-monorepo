import * as XLSX from "xlsx";
import { toIsoDate } from "../dates";

export type Cell = string | number | null;
export type ExcelSheet = { header: Cell[]; rows: Cell[][] };

export const safeFileName = (name: string): string =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** Excel sheet names: max 31 chars, none of []:*?/\ */
export const sheetName = (name: string): string => name.replace(/[[\]:*?/\\]/g, "").slice(0, 31);

export const sheetToAoa = (title: string, subtitle: string, sheet: ExcelSheet): Cell[][] => [
  [title],
  [subtitle],
  [],
  sheet.header,
  ...sheet.rows,
];

export function exportSheet(title: string, subtitle: string, sheet: ExcelSheet, today: Date = new Date()): void {
  const worksheet = XLSX.utils.aoa_to_sheet(sheetToAoa(title, subtitle, sheet));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName(title));
  XLSX.writeFile(workbook, `${safeFileName(title)}_${toIsoDate(today)}.xlsx`);
}
