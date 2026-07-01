import type {
  DpiEquipmentMonthly,
  DpiEquipmentMetric,
  DpiIndicatorSummary,
  DpiMonthlyPositivityPoint,
  DpiMonthlyRejectedPoint,
  DpiMonthlySamplePoint,
  DpiMonthlyPositivity,
  DpiMonthlyValue,
  DpiOverviewIndicators,
  DpiProvinceIndicator,
  DpiSamplesPositivity,
  DpiTatMonthlyPoint,
  DpiTatPoint,
  DpiTatSamples,
} from "../types/summary";

export const EQUIPMENT_KEYS = ["CAPCTM", "ALINITY", "M2000", "C6800", "PANTHER", "MPIMA", "MANUAL"] as const;

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

function asArray(payload: unknown): UnknownRecord[] {
  assertPayloadOk(payload);
  if (Array.isArray(payload)) return payload.filter((item): item is UnknownRecord => item !== null && typeof item === "object");
  if (payload && typeof payload === "object") {
    const objectPayload = payload as UnknownRecord;
    const nested = objectPayload.data ?? objectPayload.report ?? objectPayload.results;
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
    if (record.status === "error") {
      throw new Error("Não foi possível carregar este relatório de DPI.");
    }
  }
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

function monthKey(record: UnknownRecord, index: number): string {
  const year = stringFrom(record, ["year", "Year"], "");
  const rawMonth = stringFrom(record, ["month", "Month"], "");
  const name = monthName(record);
  const monthNumber = Number(rawMonth) || MONTHS[name.toLowerCase()] || index + 1;
  if (year) return `${year}-${String(monthNumber).padStart(2, "0")}`;
  return `${name}-${index}`;
}

function monthLabel(record: UnknownRecord, index: number): string {
  const year = stringFrom(record, ["year", "Year"], "");
  const name = monthName(record).slice(0, 3);
  return year ? `${name}/${String(year).slice(-2)}` : `${name}/${index + 1}`;
}

function enrichMonth<T extends UnknownRecord>(record: T, index: number) {
  return {
    monthKey: monthKey(record, index),
    monthLabel: monthLabel(record, index),
    shortMonthLabel: monthLabel(record, index),
  };
}

export function adaptIndicators(payload: unknown): DpiIndicatorSummary {
  const record = asObject(payload);
  const registered = numberFrom(record, ["registered", "Registados"]);
  const tested = numberFrom(record, ["tested", "Testados"]);
  const rejected = numberFrom(record, ["rejected", "Rejeitados"]);
  const pending = numberFrom(record, ["pending", "Pendentes"]);
  const positive = numberFrom(record, ["positive", "Positivos", "PositivosPCR"]);
  const negative = numberFrom(record, ["negative", "Negativos", "NegativosPCR"]);
  const totalSamples = numberFrom(record, ["total", "Total", "samples", "Samples"], registered + rejected);

  return {
    negative,
    pending,
    positive,
    registered: registered || totalSamples,
    rejected,
    tested,
    totalSamples,
  };
}

export function adaptOverviewIndicators(payload: unknown): DpiOverviewIndicators {
  const indicators = adaptIndicators(payload);
  const rejectionRate = indicators.registered ? (indicators.rejected / indicators.registered) * 100 : 0;
  const positivityRate = indicators.tested ? (indicators.positive / indicators.tested) * 100 : 0;

  return {
    ...indicators,
    positivityRate: Math.round(positivityRate * 10) / 10,
    rejectionRate: Math.round(rejectionRate * 10) / 10,
  };
}

export function adaptMonthlyValues(payload: unknown): DpiMonthlyValue[] {
  return asArray(payload).map((record, index) => ({
    year: stringFrom(record, ["year", "Year"]),
    month: stringFrom(record, ["month", "Month"]),
    ...enrichMonth(record, index),
    monthName: monthName(record),
    total: numberFrom(record, ["total", "Total", "Tested", "tested"]),
  }));
}

export function adaptMonthlySamplePoints(payload: unknown): DpiMonthlySamplePoint[] {
  return adaptMonthlyValues(payload).map((record, index) => ({
    monthKey: record.monthKey ?? `${record.monthName}-${index}`,
    monthLabel: record.shortMonthLabel ?? record.monthName,
    shortMonthLabel: record.shortMonthLabel ?? record.monthName,
    total: record.total,
  }));
}

export function adaptMonthlyPositivity(payload: unknown): DpiMonthlyPositivity[] {
  return asArray(payload).map((record, index) => {
    const total = numberFrom(record, ["total", "Total"]);
    const positive = numberFrom(record, ["positive", "PositivosPCR", "Positive", "Positivo"]);
    const negative = numberFrom(record, ["negative", "NegativosPCR", "Negative", "Negativo"]);
    const positivity = numberFrom(record, ["positivity", "Positivity"], total > 0 ? Math.round((positive / total) * 100) : 0);

    return {
      year: stringFrom(record, ["year", "Year"]),
      month: stringFrom(record, ["month", "Month"]),
      ...enrichMonth(record, index),
      monthName: monthName(record),
      total,
      positive,
      negative,
      positivity,
    };
  });
}

export function adaptMonthlyPositivityPoints(payload: unknown): DpiMonthlyPositivityPoint[] {
  return adaptMonthlyPositivity(payload).map((record, index) => ({
    monthKey: record.monthKey ?? `${record.monthName}-${index}`,
    monthLabel: record.shortMonthLabel ?? record.monthName,
    negative: record.negative,
    positive: record.positive,
    positivityRate: Math.round((record.positivity || (record.total ? (record.positive / record.total) * 100 : 0)) * 10) / 10,
    shortMonthLabel: record.shortMonthLabel ?? record.monthName,
    total: record.total,
  }));
}

export function adaptMonthlyRejectedPoints(payload: unknown): DpiMonthlyRejectedPoint[] {
  return adaptMonthlyValues(payload).map((record, index) => ({
    monthKey: record.monthKey ?? `${record.monthName}-${index}`,
    monthLabel: record.shortMonthLabel ?? record.monthName,
    rejected: record.total,
    shortMonthLabel: record.shortMonthLabel ?? record.monthName,
  }));
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
  return asArray(payload).map((record, index) => ({
    ...enrichMonth(record, index),
    monthName: monthName(record),
    collectionReceiveHub: numberFrom(record, ["collection_receiveHub", "collection_to_hub_reception"]),
    receiveHubRegistrationHub: numberFrom(record, ["receiveHub_registrationHub", "hub_reception_to_hub_registration"]),
    registrationHubReceiveLab: numberFrom(record, ["registrationHub_receiveLab", "hub_registration_to_lab_reception"]),
    receiveLabRegistrationLab: numberFrom(record, ["receiveLab_registrationLab", "lab_reception_to_registration"]),
    registrationLabAnalyseLab: numberFrom(record, ["registrationLab_analyseLab", "lab_registration_to_analysis"]),
    analyseLabValidationLab: numberFrom(record, ["analyseLab_validationLab", "lab_analysis_to_validation"]),
  }));
}

export function adaptTatMonthlyPoints(payload: unknown): DpiTatMonthlyPoint[] {
  return adaptTat(payload).map((record, index) => {
    const segments = [
      { key: "collection-receive-hub", label: "Colheita à recepção no Hub", value: record.collectionReceiveHub },
      { key: "receive-register-hub", label: "Recepção ao registo no Hub", value: record.receiveHubRegistrationHub },
      { key: "register-hub-receive-lab", label: "Registo Hub à recepção Lab", value: record.registrationHubReceiveLab },
      { key: "receive-register-lab", label: "Recepção Lab ao registo Lab", value: record.receiveLabRegistrationLab },
      { key: "register-analysis", label: "Registo à análise", value: record.registrationLabAnalyseLab },
      { key: "analysis-validation", label: "Análise à validação", value: record.analyseLabValidationLab },
    ];
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);

    return {
      averageTat: Math.round(total * 10) / 10,
      monthKey: record.monthKey ?? `${record.monthName}-${index}`,
      monthLabel: record.shortMonthLabel ?? record.monthName,
      segments,
      shortMonthLabel: record.shortMonthLabel ?? record.monthName,
      total,
    };
  });
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
  return asArray(payload).map((record, index) => ({
    ...enrichMonth(record, index),
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

export function adaptEquipmentMetrics(payload: unknown): DpiEquipmentMetric[] {
  const record = asObject(payload);
  return EQUIPMENT_KEYS.map((equipment) => ({
    equipmentKey: equipment.toLowerCase(),
    equipmentName: equipment,
    total: numberFrom(record, [equipment]),
  })).filter((item) => item.total > 0);
}
