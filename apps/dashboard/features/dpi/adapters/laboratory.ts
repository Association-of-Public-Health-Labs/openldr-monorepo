import type {
  DpiEquipmentMetric,
  DpiEquipmentMonthlyPoint,
  DpiLabMetric,
  DpiLabMonthlyMetric,
  DpiLabTatMetric,
  DpiLabTatSamplesPoint,
} from "../types/laboratory";

type UnknownRecord = Record<string, unknown>;

export const DPI_EQUIPMENT_KEYS = ["CAPCTM", "ALINITY", "M2000", "C6800", "PANTHER", "MPIMA", "MANUAL"] as const;

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

function asObject(payload: unknown): UnknownRecord {
  assertPayloadOk(payload);
  if (Array.isArray(payload)) return (payload[0] as UnknownRecord) ?? {};
  if (payload && typeof payload === "object") return payload as UnknownRecord;
  return {};
}

function assertPayloadOk(payload: unknown) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as UnknownRecord;
    if (record.status === "error") throw new Error("Não foi possível carregar este relatório de DPI.");
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

function labName(record: UnknownRecord) {
  return stringFrom(record, ["testing_facility", "lab", "laboratory", "laboratory_name", "lab_name", "facility"], "Não especificado");
}

function keyFromLabel(label: string, index: number) {
  return `${label || "sem-laboratorio"}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

export function adaptDpiLabMetrics(payload: unknown): DpiLabMetric[] {
  return asArray(payload).map((record, index) => {
    const name = labName(record);
    const total = numberFrom(record, ["total", "Total"]);
    const tested = numberFrom(record, ["tested", "Testadas", "Testados"], total);
    return {
      labKey: keyFromLabel(name, index),
      labName: name,
      negative: numberFrom(record, ["negative", "Negative", "Negativas"]),
      pending: numberFrom(record, ["pending", "Pendentes"]),
      positive: numberFrom(record, ["positive", "Positive", "Positivas"]),
      registered: numberFrom(record, ["registered", "Registadas", "Registados"], total),
      rejected: numberFrom(record, ["rejected", "Rejeitadas", "Rejeitados"], total),
      tested,
      total: total || tested,
    };
  });
}

export function adaptDpiLabTatMetrics(payload: unknown): DpiLabTatMetric[] {
  return asArray(payload).map((record, index) => {
    const name = labName(record);
    const total = tatTotal(record);
    return {
      labKey: keyFromLabel(name, index),
      labName: name,
      tatAvg: Math.round(numberFrom(record, ["tat", "avg_tat", "tatAvg", "value"], total) * 10) / 10,
      total,
    };
  });
}

export function adaptDpiLabMonthlyMetrics(payload: unknown): DpiLabMonthlyMetric[] {
  return asArray(payload).map((record, index) => {
    const total = numberFrom(record, ["total", "Total"]);
    return {
      monthKey: monthKey(record, index),
      monthLabel: monthLabel(record, index),
      registered: numberFrom(record, ["registered", "Registadas", "Registados"], total),
      rejected: numberFrom(record, ["rejected", "Rejeitadas", "Rejeitados"], total),
      shortMonthLabel: monthLabel(record, index),
      tatAvg: Math.round(tatTotal(record) * 10) / 10,
      tested: numberFrom(record, ["tested", "Testadas", "Testados"], total),
      total,
    };
  });
}

export function adaptDpiTatSamplesPoint(payload: unknown): DpiLabTatSamplesPoint {
  const record = asObject(payload);
  return {
    between16And21: numberFrom(record, ["between_15_21", "between_16_21", "16-21"]),
    between7And15: numberFrom(record, ["between_7_14", "between_7_15", "7-15"]),
    greaterThan21: numberFrom(record, ["greater_21", ">21"]),
    lessThan7: numberFrom(record, ["less_7", "<7"]),
    noDates: numberFrom(record, ["no_dates", "without_dates", "Sem datas"]),
  };
}

export function adaptDpiEquipmentMetrics(payload: unknown): DpiEquipmentMetric[] {
  const totals = new Map<string, DpiEquipmentMetric>();
  for (const record of asArray(payload)) {
    for (const equipment of DPI_EQUIPMENT_KEYS) {
      const current = totals.get(equipment) ?? { equipmentKey: equipment.toLowerCase(), equipmentName: equipment, total: 0 };
      current.total += numberFrom(record, [equipment]);
      totals.set(equipment, current);
    }
  }
  return [...totals.values()].filter((item) => item.total > 0).sort((a, b) => b.total - a.total);
}

export function adaptDpiEquipmentMonthlyPoints(payload: unknown): DpiEquipmentMonthlyPoint[] {
  return asArray(payload).map((record, index) => {
    const equipments = DPI_EQUIPMENT_KEYS.map((equipment) => ({
      equipmentKey: equipment.toLowerCase(),
      equipmentName: equipment,
      total: numberFrom(record, [equipment]),
    })).filter((item) => item.total > 0);
    return {
      equipments,
      monthKey: monthKey(record, index),
      monthLabel: monthLabel(record, index),
      shortMonthLabel: monthLabel(record, index),
      total: equipments.reduce((sum, item) => sum + item.total, 0),
    };
  });
}
