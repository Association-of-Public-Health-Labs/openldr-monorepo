import type {
  CategoryMetricPoint,
  FacilityMetricPoint,
  GenderMetric,
  MonthlyMetricPoint,
  ViralLoadFacilityLevel,
  VlFacilityAgeResponse,
  VlFacilityGenderResponse,
  VlFacilityMetricResponse,
  VlFacilityMonthlyResponse,
  VlFacilityTestReasonResponse,
} from "../types/facility";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type FacilityAggregateTotals = {
  notSuppressed: number;
  rejected: number;
  suppressed: number;
  tatNumerator: number;
  tatWeight: number;
  total: number;
};

type FacilityMetricMode = "default" | "registered" | "rejected" | "tat" | "tested";

export type GeoDrilldownViewLevel = "district" | "facility" | "province";

function numberOrZero(value: number | string | null | undefined): number {
  const normalized = typeof value === "string" ? value.trim().replace(/\s+/g, "").replace(/,/g, "") : value;
  const parsed = Number(normalized);
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

function firstText(...values: Array<number | string | null | undefined>) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function resolveGeoLabel(row: VlFacilityMetricResponse, viewLevel: GeoDrilldownViewLevel) {
  if (viewLevel === "district") {
    return firstText(row.district, row.district_name, row.requesting_district, row.location, row.requesting_facility);
  }

  if (viewLevel === "facility") {
    return firstText(
      row.health_facility,
      row.facility,
      row.facility_name,
      row.requesting_facility,
      row.requesting_facility_name,
      row.location,
      row.name,
    );
  }

  return firstText(row.province, row.province_name, row.requesting_province, row.location, row.requesting_facility, row.name);
}

function getNotSuppressed(row: VlFacilityMetricResponse) {
  const explicit = numberOrZero(row.not_suppressed ?? row.non_suppressed);
  if (explicit) return explicit;

  const total = numberOrZero(row.total);
  const suppressed = numberOrZero(row.suppressed);
  return total > suppressed ? total - suppressed : 0;
}

function getTatAvg(row: VlFacilityMetricResponse) {
  const direct = numberOrZero(row.tat ?? row.avg_tat ?? row.average_tat ?? row.days);
  if (direct) return Math.round(direct * 10) / 10;

  const total =
    numberOrZero(row.collection_reception) +
    numberOrZero(row.reception_registration) +
    numberOrZero(row.registration_analysis) +
    numberOrZero(row.analysis_validation);

  return Math.round(total * 10) / 10;
}

function getMetricValue(row: VlFacilityMetricResponse, mode: FacilityMetricMode): number {
  if (mode === "registered") {
    return (
      numberOrZero(row.total) ||
      numberOrZero(row.registered) ||
      numberOrZero(row.total_registered) ||
      numberOrZero(row.total_not_null) ||
      0
    );
  }

  if (mode === "tested") {
    return numberOrZero(row.tested) || numberOrZero(row.total_not_null) || numberOrZero(row.total) || 0;
  }

  if (mode === "rejected") {
    return (
      numberOrZero(row.rejected) ||
      numberOrZero(row.rejections) ||
      numberOrZero(row.rejected_samples) ||
      numberOrZero(row.samples_rejected) ||
      numberOrZero(row.total_rejected) ||
      numberOrZero(row.total) ||
      numberOrZero(row.count) ||
      0
    );
  }

  if (mode === "tat") {
    return getTatAvg(row) || numberOrZero(row.total) || 0;
  }

  return (
    numberOrZero(row.total) ||
    numberOrZero(row.samples) ||
    numberOrZero(row.registered) ||
    numberOrZero(row.total_registered) ||
    numberOrZero(row.tested) ||
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

function monthMeta(row: VlFacilityMonthlyResponse, index: number) {
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

export function adaptFacilityMetrics(
  rows: VlFacilityMetricResponse[] | null | undefined,
  level: ViralLoadFacilityLevel = "province",
  mode: FacilityMetricMode = "default",
): FacilityMetricPoint[] {
  const viewLevel: GeoDrilldownViewLevel = level === "health_facility" ? "facility" : level;
  const grouped = new Map<string, {
    label: string;
    rawRows: VlFacilityMetricResponse[];
  }>();
  const sourceRows = rows || [];

  if (process.env.NODE_ENV === "development") {
    const firstRow = sourceRows[0];
    console.debug("[VL clinic facility payload]", {
      context: { level, mode, viewLevel },
      firstRow,
      keys: firstRow ? Object.keys(firstRow) : [],
    });
  }

  sourceRows.forEach((row) => {
    const resolvedLabel = resolveGeoLabel(row, viewLevel);
    const locationName = resolvedLabel || "Sem localização";
    const groupKey = resolvedLabel ? normalizeKey(locationName) : "sem-localizacao";
    const existing = grouped.get(groupKey);
    if (existing) {
      existing.rawRows.push(row);
    } else {
      grouped.set(groupKey, { label: locationName, rawRows: [row] });
    }
  });

  if (process.env.NODE_ENV === "development" && sourceRows.length) {
    const missingRows = Array.from(grouped.values()).find((group) => normalizeKey(group.label) === "sem-localizacao")?.rawRows.length || 0;
    if (missingRows / sourceRows.length >= 0.8) {
      console.warn("[VL clinic] Many rows without geo label", {
        context: { level, mode, viewLevel },
        sampleKeys: sourceRows[0] ? Object.keys(sourceRows[0]) : [],
        sampleRows: sourceRows.slice(0, 3),
      });
    }
  }

  const normalizedItems = Array.from(grouped.values())
    .map((group) => {
      const isMissingLocation = normalizeKey(group.label) === "sem-localizacao";
      const totals = group.rawRows.reduce<FacilityAggregateTotals>(
        (acc, row) => {
          const suppressed = numberOrZero(row.suppressed);
          const notSuppressed = getNotSuppressed(row);
          const rejected = mode === "rejected" ? getMetricValue(row, "rejected") : numberOrZero(row.rejected ?? row.total_rejected);
          const total = getMetricValue(row, mode) || suppressed + notSuppressed || rejected;
          const tatAvg = getTatAvg(row);
          return {
            notSuppressed: acc.notSuppressed + notSuppressed,
            rejected: acc.rejected + rejected,
            suppressed: acc.suppressed + suppressed,
            tatNumerator: acc.tatNumerator + tatAvg * (total || 1),
            tatWeight: acc.tatWeight + (total || 1),
            total: acc.total + total,
          };
        },
        { notSuppressed: 0, rejected: 0, suppressed: 0, tatNumerator: 0, tatWeight: 0, total: 0 },
      );

      const locationName = group.label;

      return {
        canDrillDown: !isMissingLocation,
        level,
        locationKey: `${level}-${normalizeKey(locationName)}`,
        locationName,
        notSuppressed: totals.notSuppressed,
        rawRows: group.rawRows,
        rejected: totals.rejected,
        suppressed: totals.suppressed,
        suppressionRate: percent(totals.suppressed, totals.suppressed + totals.notSuppressed || totals.total),
        tatAvg: totals.tatWeight ? Math.round((totals.tatNumerator / totals.tatWeight) * 10) / 10 : 0,
        total: totals.total,
      };
    })
    .sort((a, b) => b.total - a.total);

  if (process.env.NODE_ENV === "development" && mode === "rejected") {
    console.debug("[VL clinic rejections adapter]", {
      context: { level, mode, viewLevel },
      firstRow: sourceRows[0],
      normalizedFirstItem: normalizedItems[0],
    });
  }

  return normalizedItems;
}

export function adaptRejectedFacilityMetrics(
  rows: VlFacilityMetricResponse[] | null | undefined,
  level: ViralLoadFacilityLevel = "province",
): FacilityMetricPoint[] {
  return adaptFacilityMetrics(rows, level, "rejected");
}

export function adaptRegisteredFacilityMetrics(
  rows: VlFacilityMetricResponse[] | null | undefined,
  level: ViralLoadFacilityLevel = "province",
): FacilityMetricPoint[] {
  return adaptFacilityMetrics(rows, level, "registered");
}

export function adaptTestedFacilityMetrics(
  rows: VlFacilityMetricResponse[] | null | undefined,
  level: ViralLoadFacilityLevel = "province",
): FacilityMetricPoint[] {
  return adaptFacilityMetrics(rows, level, "tested");
}

export function adaptTatFacilityMetrics(
  rows: VlFacilityMetricResponse[] | null | undefined,
  level: ViralLoadFacilityLevel = "province",
): FacilityMetricPoint[] {
  return adaptFacilityMetrics(rows, level, "tat");
}

export function adaptMonthlyMetrics(rows: VlFacilityMonthlyResponse[] | null | undefined): MonthlyMetricPoint[] {
  return (rows || []).map((row, index) => {
    const meta = monthMeta(row, index);
    return {
      ...meta,
      registered: numberOrZero(row.registered ?? row.total),
      rejected: numberOrZero(row.rejected ?? row.total_rejected ?? row.total),
      tatAvg: getTatAvg(row),
      tested: numberOrZero(row.tested ?? row.total),
    };
  });
}

export function adaptGenderCategories(rows: VlFacilityGenderResponse[] | null | undefined): CategoryMetricPoint[] {
  const male = (rows || []).reduce((sum, row) => sum + numberOrZero(row.male_suppressed) + numberOrZero(row.male_not_suppressed), 0);
  const female = (rows || []).reduce((sum, row) => sum + numberOrZero(row.female_suppressed) + numberOrZero(row.female_not_suppressed), 0);

  return [
    { category: "Masculino", key: "male", total: male },
    { category: "Feminino", key: "female", total: female },
  ].filter((row) => row.total > 0);
}

export function adaptGenderMonthlyMetrics(rows: VlFacilityGenderResponse[] | null | undefined): GenderMetric[] {
  return (rows || []).map((row, index) => {
    const meta = monthMeta(row, index);
    const male =
      numberOrZero(row.male) ||
      numberOrZero(row.male_suppressed) + numberOrZero(row.male_not_suppressed);
    const female =
      numberOrZero(row.female) ||
      numberOrZero(row.female_suppressed) + numberOrZero(row.female_not_suppressed);
    const explicitUnknown =
      numberOrZero(row.unknown) ||
      numberOrZero(row.not_specified) ||
      numberOrZero(row.other);
    const total = numberOrZero(row.total) || male + female + explicitUnknown;
    const unknown = explicitUnknown || Math.max(total - male - female, 0);

    return {
      ...meta,
      female,
      male,
      total,
      unknown,
    };
  });
}

export function adaptAgeCategories(rows: VlFacilityAgeResponse[] | null | undefined): CategoryMetricPoint[] {
  const totals = new Map<string, number>();

  (rows || []).forEach((row) => {
    const category = row.age_group || "Não especificado";
    totals.set(category, (totals.get(category) || 0) + numberOrZero(row.total));
  });

  return Array.from(totals.entries())
    .map(([category, total]) => ({ category: category === "Unknown" ? "Não especificado" : category, key: normalizeKey(category), total }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);
}

export function adaptTestReasonCategories(rows: VlFacilityTestReasonResponse[] | null | undefined): CategoryMetricPoint[] {
  const routine = (rows || []).reduce((sum, row) => sum + numberOrZero(row.routine), 0);
  const treatmentFailure = (rows || []).reduce((sum, row) => sum + numberOrZero(row.treatment_failure), 0);
  const notSpecified = (rows || []).reduce((sum, row) => sum + numberOrZero(row.reason_not_specified), 0);

  return [
    { category: "Rotina", key: "routine", total: routine },
    { category: "Suspeita de falha terapêutica", key: "treatment-failure", total: treatmentFailure },
    { category: "Não especificado", key: "not-specified", total: notSpecified },
  ].filter((row) => row.total > 0);
}
