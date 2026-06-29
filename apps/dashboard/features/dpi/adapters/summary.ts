import type {
  DpiEquipmentMonthly,
  DpiIndicatorSummary,
  DpiMonthlyPositivity,
  DpiMonthlyValue,
  DpiProvinceIndicator,
  DpiSamplesPositivity,
  DpiTatPoint,
  DpiTatSamples,
} from "../types/summary";

export const EQUIPMENT_KEYS = ["CAPCTM", "ALINITY", "M2000", "C6800", "PANTHER", "MPIMA", "MANUAL"] as const;

type UnknownRecord = Record<string, unknown>;

function asArray(payload: unknown): UnknownRecord[] {
  if (Array.isArray(payload)) return payload.filter((item): item is UnknownRecord => item !== null && typeof item === "object");
  if (payload && typeof payload === "object") {
    const objectPayload = payload as UnknownRecord;
    const nested = objectPayload.data ?? objectPayload.report ?? objectPayload.results;
    if (Array.isArray(nested)) return nested.filter((item): item is UnknownRecord => item !== null && typeof item === "object");
  }
  return [];
}

function asObject(payload: unknown): UnknownRecord {
  if (Array.isArray(payload)) return (payload[0] as UnknownRecord) ?? {};
  if (payload && typeof payload === "object") return payload as UnknownRecord;
  return {};
}

function numberFrom(record: UnknownRecord, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function stringFrom(record: UnknownRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function monthName(record: UnknownRecord): string {
  return stringFrom(record, ["month_name", "MonthName", "monthName", "month", "Month"], "Sem mês");
}

export function adaptIndicators(payload: unknown): DpiIndicatorSummary {
  const record = asObject(payload);

  return {
    registered: numberFrom(record, ["registered", "Registados", "total", "Total"]),
    tested: numberFrom(record, ["tested", "Testados"]),
    rejected: numberFrom(record, ["rejected", "Rejeitados"]),
    pending: numberFrom(record, ["pending", "Pendentes"]),
    positive: numberFrom(record, ["positive", "Positivos", "PositivosPCR"]),
    negative: numberFrom(record, ["negative", "Negativos", "NegativosPCR"]),
  };
}

export function adaptMonthlyValues(payload: unknown): DpiMonthlyValue[] {
  return asArray(payload).map((record) => ({
    year: stringFrom(record, ["year", "Year"]),
    month: stringFrom(record, ["month", "Month"]),
    monthName: monthName(record),
    total: numberFrom(record, ["total", "Total", "Tested", "tested"]),
  }));
}

export function adaptMonthlyPositivity(payload: unknown): DpiMonthlyPositivity[] {
  return asArray(payload).map((record) => {
    const total = numberFrom(record, ["total", "Total"]);
    const positive = numberFrom(record, ["positive", "PositivosPCR", "Positive"]);
    const negative = numberFrom(record, ["negative", "NegativosPCR", "Negative"]);
    const positivity = numberFrom(record, ["positivity", "Positivity"], total > 0 ? Math.round((positive / total) * 100) : 0);

    return {
      year: stringFrom(record, ["year", "Year"]),
      month: stringFrom(record, ["month", "Month"]),
      monthName: monthName(record),
      total,
      positive,
      negative,
      positivity,
    };
  });
}

export function adaptProvinceIndicators(payload: unknown): DpiProvinceIndicator[] {
  return asArray(payload).map((record) => {
    const conventional = numberFrom(record, ["conventional", "Conventional", "total_conventional"]);
    const poc = numberFrom(record, ["poc", "Poc", "total_poc"]);
    const positive = numberFrom(record, ["positive"], numberFrom(record, ["conventional_positive"]) + numberFrom(record, ["poc_positive"]));

    return {
      province: stringFrom(record, ["province", "ResultRequestingProvinceName", "Province"], "Sem província"),
      total: numberFrom(record, ["total", "Total"]),
      tested: numberFrom(record, ["tested", "Testados"]),
      positive,
      conventional,
      poc,
    };
  });
}

export function adaptSamplesPositivity(payload: unknown): DpiSamplesPositivity {
  const record = asObject(payload);

  return {
    total: numberFrom(record, ["total", "Total"]),
    positive: numberFrom(record, ["positive", "PositivosPCR"]),
    negative: numberFrom(record, ["negative", "NegativosPCR"]),
    femalePositive: numberFrom(record, ["female_positive"]),
    malePositive: numberFrom(record, ["male_positive"]),
    femaleNegative: numberFrom(record, ["female_negative"]),
    maleNegative: numberFrom(record, ["male_negative"]),
  };
}

export function adaptTat(payload: unknown): DpiTatPoint[] {
  return asArray(payload).map((record) => ({
    monthName: monthName(record),
    collectionReceiveHub: numberFrom(record, ["collection_receiveHub", "collection_to_hub_reception"]),
    receiveHubRegistrationHub: numberFrom(record, ["receiveHub_registrationHub", "hub_reception_to_hub_registration"]),
    registrationHubReceiveLab: numberFrom(record, ["registrationHub_receiveLab", "hub_registration_to_lab_reception"]),
    receiveLabRegistrationLab: numberFrom(record, ["receiveLab_registrationLab", "lab_reception_to_registration"]),
    registrationLabAnalyseLab: numberFrom(record, ["registrationLab_analyseLab", "lab_registration_to_analysis"]),
    analyseLabValidationLab: numberFrom(record, ["analyseLab_validationLab", "lab_analysis_to_validation"]),
  }));
}

export function adaptTatSamples(payload: unknown): DpiTatSamples[] {
  return asArray(payload).map((record) => ({
    category: stringFrom(record, ["category"], "TAT"),
    less7: numberFrom(record, ["less_7", "<7"]),
    between7And14: numberFrom(record, ["between_7_14", "7-15"]),
    between15And21: numberFrom(record, ["between_15_21", "16-21"]),
    greater21: numberFrom(record, ["greater_21", ">21"]),
  }));
}

export function adaptEquipmentMonthly(payload: unknown): DpiEquipmentMonthly[] {
  return asArray(payload).map((record) => ({
    monthName: monthName(record),
    CAPCTM: numberFrom(record, ["CAPCTM"]),
    ALINITY: numberFrom(record, ["ALINITY"]),
    M2000: numberFrom(record, ["M2000"]),
    C6800: numberFrom(record, ["C6800"]),
    PANTHER: numberFrom(record, ["PANTHER"]),
    MPIMA: numberFrom(record, ["MPIMA"]),
    MANUAL: numberFrom(record, ["MANUAL"]),
  }));
}
