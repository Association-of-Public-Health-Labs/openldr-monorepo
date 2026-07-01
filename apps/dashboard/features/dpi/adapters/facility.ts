import type {
  DpiAgeMetric,
  DpiGenderMetric,
  DpiLocationMetric,
  DpiLocationTatMetric,
  DpiMonthlyLocationMetric,
} from "../types/facility";

type UnknownRecord = Record<string, unknown>;

const MONTHS: Record<string, number> = {
  april: 4,
  august: 8,
  december: 12,
  february: 2,
  january: 1,
  july: 7,
  june: 6,
  march: 3,
  may: 5,
  november: 11,
  october: 10,
  september: 9,
};

const ageLabels: Record<string, string> = {
  "0-2 months": "0-2 meses",
  "18+ months": "18+ meses",
  "2-9 months": "2-9 meses",
  "9-18 months": "9-18 meses",
  Unknown: "Não especificado",
};

function asArray(payload: unknown): UnknownRecord[] {
  assertPayloadOk(payload);
  if (Array.isArray(payload)) return payload.filter((item): item is UnknownRecord => item !== null && typeof item === "object");
  if (payload && typeof payload === "object") {
    const record = payload as UnknownRecord;
    const nested = record.data ?? record.results ?? record.report;
    if (Array.isArray(nested)) return nested.filter((item): item is UnknownRecord => item !== null && typeof item === "object");
  }
  return [];
}

function assertPayloadOk(payload: unknown) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as UnknownRecord;
    if (record.status === "error") {
      throw new Error("Não foi possível carregar este relatório de DPI.");
    }
  }
}

function numberFrom(record: UnknownRecord, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function stringFrom(record: UnknownRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function locationName(record: UnknownRecord) {
  return stringFrom(
    record,
    [
      "requesting_facility",
      "province",
      "province_name",
      "district",
      "district_name",
      "facility",
      "facility_name",
      "health_facility",
      "ResultRequestingFacilityName",
      "ResultRequestingProvinceName",
      "ResultRequestingDistrictName",
    ],
    "Não especificado",
  );
}

function keyFromLabel(label: string, index: number) {
  return `${label || "sem-local"}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function monthName(record: UnknownRecord) {
  return stringFrom(record, ["month_name", "MonthName", "monthName", "month", "Month"], "Sem mês");
}

function monthKey(record: UnknownRecord, index: number) {
  const year = stringFrom(record, ["year", "Year"], "");
  const rawMonth = stringFrom(record, ["month", "Month"], "");
  const name = monthName(record);
  const monthNumber = Number(rawMonth) || MONTHS[name.toLowerCase()] || index + 1;
  if (year) return `${year}-${String(monthNumber).padStart(2, "0")}`;
  return `${name}-${index}`;
}

function monthLabel(record: UnknownRecord, index: number) {
  const year = stringFrom(record, ["year", "Year"], "");
  const name = monthName(record).slice(0, 3);
  return year ? `${name}/${String(year).slice(-2)}` : `${name}/${index + 1}`;
}

function tatTotal(record: UnknownRecord) {
  return [
    "collection_receiveHub",
    "receiveHub_registrationHub",
    "registrationHub_receiveLab",
    "receiveLab_registrationLab",
    "registrationLab_analyseLab",
    "analyseLab_validationLab",
  ].reduce((sum, key) => sum + numberFrom(record, [key]), 0);
}

export function adaptDpiLocationMetrics(payload: unknown): DpiLocationMetric[] {
  return asArray(payload).map((record, index) => {
    const total = numberFrom(record, ["total", "Total"]);
    const tested = numberFrom(record, ["tested", "Testados"], total);
    const registered = numberFrom(record, ["registered", "Registadas", "Registados"], total);
    const positive = numberFrom(record, ["positive", "Positive", "Positivo", "Positivas"]);
    const negative = numberFrom(record, ["negative", "Negative", "Negativo", "Negativas"]);
    const rejected = numberFrom(record, ["rejected", "Rejeitadas", "Rejeitados"]);
    const pending = numberFrom(record, ["pending", "Pendentes"]);
    const name = locationName(record);

    return {
      locationKey: keyFromLabel(name, index),
      locationName: name,
      negative,
      pending,
      positive,
      registered,
      rejected,
      tested,
      total: total || registered || tested || rejected,
    };
  });
}

export function adaptDpiTatLocationMetrics(payload: unknown): DpiLocationTatMetric[] {
  return asArray(payload).map((record, index) => {
    const name = locationName(record);
    const total = tatTotal(record);
    const tatAvg = numberFrom(record, ["tat", "avg_tat", "tatAvg", "value"], total);
    return {
      locationKey: keyFromLabel(name, index),
      locationName: name,
      tatAvg: Math.round(tatAvg * 10) / 10,
      total,
    };
  });
}

export function adaptDpiMonthlyMetrics(payload: unknown): DpiMonthlyLocationMetric[] {
  return asArray(payload).map((record, index) => {
    const total = numberFrom(record, ["total", "Total"]);
    return {
      monthKey: monthKey(record, index),
      monthLabel: monthLabel(record, index),
      negative: numberFrom(record, ["negative", "Negative", "Negativas"]),
      positive: numberFrom(record, ["positive", "Positive", "Positivas"]),
      registered: numberFrom(record, ["registered", "Registadas", "Registados"], total),
      rejected: numberFrom(record, ["rejected", "Rejeitadas", "Rejeitados"], total),
      shortMonthLabel: monthLabel(record, index),
      tatAvg: Math.round(tatTotal(record) * 10) / 10,
      tested: numberFrom(record, ["tested", "Testadas", "Testados"], total),
      total,
    };
  });
}

export function adaptDpiGenderMetrics(payload: unknown): DpiGenderMetric[] {
  return asArray(payload).map((record, index) => {
    const male = numberFrom(record, ["male", "Male", "M", "Masculino"]);
    const female = numberFrom(record, ["female", "Female", "F", "Feminino"]);
    const total = numberFrom(record, ["total", "Total"], male + female);
    return {
      female,
      male,
      monthKey: monthKey(record, index),
      monthLabel: monthLabel(record, index),
      shortMonthLabel: monthLabel(record, index),
      total,
      unknown: Math.max(total - male - female, 0),
    };
  });
}

export function adaptDpiAgeMetrics(payload: unknown): DpiAgeMetric[] {
  const totals = new Map<string, DpiAgeMetric>();

  for (const record of asArray(payload)) {
    const rawAge = stringFrom(record, ["age_group", "age", "age_group_name"], "Unknown");
    const label = ageLabels[rawAge] ?? rawAge;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const current = totals.get(key) ?? { ageKey: key, ageLabel: label, total: 0 };
    current.total += numberFrom(record, ["total", "Total"]);
    totals.set(key, current);
  }

  return [...totals.values()].sort((a, b) => b.total - a.total);
}
