import type { ViralLoadDateInterval } from "../types/common";
import { formatViralLoadInterval } from "../types/common";
import type {
  ViralLoadOverview,
  ViralLoadProvinceSuppression,
  ViralLoadSamplesHistory,
  ViralLoadTatMonthly,
  ViralSuppressionMonthly,
  VlHeaderIndicatorsResponse,
  VlMonthlyTotalResponse,
  VlProvinceSuppressionResponse,
  VlSuppressionMonthlyResponse,
  VlTatMonthlyResponse,
} from "../types/summary";

const EXPECTED_TAT_DAYS = 7;
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function numberOrZero(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

type MonthlyPayload = {
  date?: string | null;
  month?: number | string | null;
  month_name?: string | null;
  month_year?: string | null;
  period?: string | null;
  sample_month?: string | null;
  year?: number | string | null;
  year_month?: string | null;
};

function monthMeta(row: MonthlyPayload, index: number) {
  const explicitPeriod = row.year_month ?? row.period ?? row.date ?? row.sample_month ?? row.month_year;
  const parsedPeriod = parseYearMonth(explicitPeriod);
  const numericMonth = parseMonthNumber(row.month) ?? parseMonthName(row.month_name ?? row.month);
  const year = parseYear(row.year) ?? parsedPeriod?.year;
  const month = numericMonth ?? parsedPeriod?.month;
  const shortMonthLabel = getShortMonthLabel(row.month_name, month, row.month);

  if (year && month) {
    return {
      month: `${shortMonthLabel}/${String(year).slice(-2)}`,
      monthKey: `${year}-${String(month).padStart(2, "0")}`,
      monthLabel: `${shortMonthLabel} ${year}`,
      shortMonthLabel,
    };
  }

  const fallbackLabel = shortMonthLabel || String(explicitPeriod || row.month || "");

  return {
    month: fallbackLabel,
    monthKey: `${fallbackLabel || "month"}-${index}`,
    monthLabel: fallbackLabel,
    shortMonthLabel: fallbackLabel,
  };
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

function getShortMonthLabel(
  monthName: string | null | undefined,
  month: number | null,
  fallback: number | string | null | undefined,
) {
  if (monthName) return monthName.slice(0, 3);
  if (month) return MONTH_LABELS[month - 1];
  return fallback ? String(fallback).slice(0, 3) : "";
}

function totalSuppression(suppressed: number, notSuppressed: number) {
  return suppressed + notSuppressed;
}

function getNotSuppressed(row: {
  non_suppressed?: number | string | null;
  not_suppressed?: number | string | null;
  suppressed?: number | string | null;
  total?: number | string | null;
}) {
  const explicit = numberOrZero(row.not_suppressed ?? row.non_suppressed);
  if (explicit) return explicit;

  const total = numberOrZero(row.total);
  const suppressed = numberOrZero(row.suppressed);
  return total > suppressed ? total - suppressed : 0;
}

function totalTat(row: VlTatMonthlyResponse) {
  return (
    numberOrZero(row.collection_reception) +
    numberOrZero(row.reception_registration) +
    numberOrZero(row.registration_analysis) +
    numberOrZero(row.analysis_validation)
  );
}

export function adaptViralLoadOverview(
  header: VlHeaderIndicatorsResponse | null | undefined,
  tatRows: VlTatMonthlyResponse[] | null | undefined,
  interval: ViralLoadDateInterval,
): ViralLoadOverview {
  const samplesReceived = numberOrZero(header?.registered);
  const samplesTested = numberOrZero(header?.tested);
  const suppressed = numberOrZero(header?.suppressed);
  const notSuppressed = getNotSuppressed(header || {});
  const rejected = numberOrZero(header?.rejected);
  const tatValues = (tatRows || []).map(totalTat).filter((value) => value > 0);
  const tatAvg = tatValues.length
    ? Math.round((tatValues.reduce((sum, value) => sum + value, 0) / tatValues.length) * 10) / 10
    : 0;

  return {
    notSuppressed,
    periodLabel: formatViralLoadInterval(interval),
    rejected,
    samplesReceived,
    samplesTested,
    suppressionRate: percent(suppressed, totalSuppression(suppressed, notSuppressed)),
    suppressed,
    tatAvg,
  };
}

export function adaptViralSuppressionByMonth(
  rows: VlSuppressionMonthlyResponse[] | null | undefined,
): ViralSuppressionMonthly[] {
  return (rows || []).map((row, index) => {
    const suppressed = numberOrZero(row.suppressed);
    const notSuppressed = getNotSuppressed(row);
    const total = numberOrZero(row.total) || totalSuppression(suppressed, notSuppressed);
    const meta = monthMeta(row, index);

    return {
      month: meta.month,
      monthKey: meta.monthKey,
      monthLabel: meta.monthLabel,
      notSuppressed,
      shortMonthLabel: meta.shortMonthLabel,
      suppressed,
      suppressionRate: percent(suppressed, total),
      total,
    };
  });
}

export function adaptTatByMonth(rows: VlTatMonthlyResponse[] | null | undefined): ViralLoadTatMonthly[] {
  return (rows || []).map((row, index) => {
    const averageTat = Math.round(totalTat(row) * 10) / 10;
    const meta = monthMeta(row, index);

    return {
      averageTat,
      expectedTat: EXPECTED_TAT_DAYS,
      month: meta.month,
      monthKey: meta.monthKey,
      monthLabel: meta.monthLabel,
      shortMonthLabel: meta.shortMonthLabel,
      total: averageTat,
    };
  });
}

export function adaptSuppressionByProvince(
  rows: VlProvinceSuppressionResponse[] | null | undefined,
): ViralLoadProvinceSuppression[] {
  return (rows || [])
    .map((row) => {
      const suppressed = numberOrZero(row.suppressed);
      const notSuppressed = getNotSuppressed(row);
      const total = numberOrZero(row.total) || totalSuppression(suppressed, notSuppressed);

      return {
        notSuppressed,
        province: normalizeProvinceName(row.province),
        suppressionRate: percent(suppressed, total),
        suppressed,
        total,
      };
    })
    .filter((row) => row.province);
}

export function adaptSamplesHistory(
  sampleRows: VlMonthlyTotalResponse[] | null | undefined,
  suppressionRows: VlSuppressionMonthlyResponse[] | null | undefined,
): ViralLoadSamplesHistory[] {
  const suppressionByMonth = new Map(
    adaptViralSuppressionByMonth(suppressionRows).map((row) => [row.monthKey, row]),
  );

  return (sampleRows || []).map((row, index) => {
    const meta = monthMeta(row, index);
    const received = numberOrZero(row.total);
    const suppression = suppressionByMonth.get(meta.monthKey);
    const tested = suppression?.total || 0;

    return {
      month: meta.month,
      monthKey: meta.monthKey,
      monthLabel: meta.monthLabel,
      pending: Math.max(received - tested, 0),
      received,
      rejected: 0,
      shortMonthLabel: meta.shortMonthLabel,
      suppressionRate: suppression?.suppressionRate || 0,
      tested,
    };
  });
}

export function normalizeProvinceName(value: string | null | undefined) {
  const province = (value || "").trim();
  const replacements: Record<string, string> = {
    "Maputo Cidade": "Cidade de Maputo",
    "Cidade Maputo": "Cidade de Maputo",
  };

  return replacements[province] || province;
}
