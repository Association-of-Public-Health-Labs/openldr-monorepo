import type {
  LaboratoryMetricPoint,
  MonthlyLaboratoryMetricPoint,
  ReasonMetricPoint,
  VlLaboratoryMetricResponse,
  VlLaboratoryMonthlyResponse,
  VlLaboratoryReasonResponse,
} from "../types/laboratory";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function numberOrZero(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getLabName(row: VlLaboratoryMetricResponse) {
  return row.testing_facility ?? row.testing_facility_name ?? row.LabName ?? row.lab_name ?? row.lab ?? row.laboratory ?? "Sem laboratório";
}

function getTatAvg(row: VlLaboratoryMetricResponse) {
  const direct = numberOrZero(row.avg_tat ?? row.tat);
  if (direct) return Math.round(direct * 10) / 10;

  const total =
    numberOrZero(row.collection_reception) +
    numberOrZero(row.reception_registration) +
    numberOrZero(row.registration_analysis) +
    numberOrZero(row.analysis_validation);

  return Math.round(total * 10) / 10;
}

function getTotal(row: VlLaboratoryMetricResponse) {
  return (
    numberOrZero(row.total) ||
    numberOrZero(row.samples) ||
    numberOrZero(row.tested) ||
    numberOrZero(row.value) ||
    numberOrZero(row.count) ||
    numberOrZero(row.total_not_null) + numberOrZero(row.total_null)
  );
}

function parseYearMonth(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})[-/](\d{1,2})(?:[-/]\d{1,2})?/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    if (isValidYearMonth(year, month)) return { month, year };
  }

  const reverseMatch = text.match(/^(\d{1,2})[-/](\d{4})$/);
  if (reverseMatch) {
    const month = Number(reverseMatch[1]);
    const year = Number(reverseMatch[2]);
    if (isValidYearMonth(year, month)) return { month, year };
  }

  return null;
}

function parseYear(value: number | string | null | undefined) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= 2200 ? year : null;
}

function parseMonthNumber(value: number | string | null | undefined) {
  const month = Number(value);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
}

function parseMonthName(value: number | string | null | undefined) {
  if (!value) return null;
  const normalized = String(value)
    .trim()
    .slice(0, 3)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const monthIndex = MONTH_LABELS.map((label) =>
    label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase(),
  ).indexOf(normalized);

  return monthIndex >= 0 ? monthIndex + 1 : null;
}

function isValidYearMonth(year: number, month: number) {
  return Number.isInteger(year) && Number.isInteger(month) && year >= 1900 && year <= 2200 && month >= 1 && month <= 12;
}

function monthMeta(row: VlLaboratoryMonthlyResponse, index: number) {
  const explicitPeriod = row.year_month ?? row.period ?? row.date ?? row.sample_month ?? row.month_year;
  const parsedPeriod = parseYearMonth(explicitPeriod);
  const numericMonth = parseMonthNumber(row.month) ?? parseMonthName(row.month_name ?? row.month);
  const year = parseYear(row.year) ?? parsedPeriod?.year;
  const month = numericMonth ?? parsedPeriod?.month;
  const shortMonthLabel = row.month_name ? row.month_name.slice(0, 3) : month ? MONTH_LABELS[month - 1] : String(row.month ?? "").slice(0, 3);

  if (year && month) {
    return {
      monthKey: `${year}-${String(month).padStart(2, "0")}`,
      monthLabel: `${shortMonthLabel} ${year}`,
      shortMonthLabel,
    };
  }

  const fallback = shortMonthLabel || String(explicitPeriod || row.month || "Mês");
  return {
    monthKey: `${normalizeKey(fallback)}-${index}`,
    monthLabel: fallback,
    shortMonthLabel: fallback,
  };
}

export function adaptLaboratoryMetrics(rows: VlLaboratoryMetricResponse[] | null | undefined): LaboratoryMetricPoint[] {
  const points = (rows || []).map((row) => {
    const labName = String(getLabName(row));
    const total = getTotal(row);
    return {
      labKey: `lab-${normalizeKey(labName)}`,
      labName,
      percentage: 0,
      rejected: numberOrZero(row.rejected ?? row.total),
      tatAvg: getTatAvg(row),
      total,
    };
  });
  const grandTotal = points.reduce((sum, row) => sum + row.total, 0);
  return points
    .map((row) => ({ ...row, percentage: percent(row.total, grandTotal) }))
    .sort((a, b) => b.total - a.total);
}

export function adaptRejectedLaboratoryMetrics(rows: VlLaboratoryMetricResponse[] | null | undefined): LaboratoryMetricPoint[] {
  return adaptLaboratoryMetrics(
    (rows || []).map((row) => ({
      ...row,
      rejected: row.rejected ?? row.total,
      total: row.rejected ?? row.total,
    })),
  );
}

export function adaptLaboratoryMonthlyMetrics(rows: VlLaboratoryMonthlyResponse[] | null | undefined): MonthlyLaboratoryMetricPoint[] {
  return (rows || []).map((row, index) => {
    const meta = monthMeta(row, index);
    const total = getTotal(row);
    return {
      ...meta,
      rejected: numberOrZero(row.rejected ?? row.total),
      tatAvg: getTatAvg(row),
      tested: numberOrZero(row.tested ?? row.total),
      total,
    };
  });
}

export function adaptLaboratoryReasonMetrics(rows: VlLaboratoryReasonResponse[] | null | undefined): ReasonMetricPoint[] {
  const routine = (rows || []).reduce((sum, row) => sum + numberOrZero(row.routine), 0);
  const treatmentFailure = (rows || []).reduce((sum, row) => sum + numberOrZero(row.treatment_failure), 0);
  const notSpecified = (rows || []).reduce((sum, row) => sum + numberOrZero(row.reason_not_specified), 0);
  const explicit = new Map<string, number>();

  (rows || []).forEach((row) => {
    const reason = row.test_reason ?? row.reason ?? row.rejection_reason;
    if (!reason) return;
    explicit.set(reason, (explicit.get(reason) || 0) + getTotal(row));
  });

  const base = explicit.size
    ? Array.from(explicit.entries()).map(([reasonLabel, total]) => ({
        reasonKey: normalizeKey(reasonLabel),
        reasonLabel: normalizeReason(reasonLabel),
        total,
      }))
    : [
        { reasonKey: "routine", reasonLabel: "Rotina", total: routine },
        { reasonKey: "treatment-failure", reasonLabel: "Suspeita de falha terapêutica", total: treatmentFailure },
        { reasonKey: "not-specified", reasonLabel: "Não especificado", total: notSpecified },
      ];

  const grandTotal = base.reduce((sum, row) => sum + row.total, 0);
  return base
    .filter((row) => row.total > 0)
    .map((row) => ({ ...row, percentage: percent(row.total, grandTotal) }))
    .sort((a, b) => b.total - a.total);
}

function normalizeReason(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "routine") return "Rotina";
  if (normalized === "suspected treatment failure" || normalized === "suspeita de falha terapêutica") return "Suspeita de falha terapêutica";
  if (normalized === "reason not specified" || normalized === "não preenchido") return "Não especificado";
  return value;
}

