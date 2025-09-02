import { FacilityType } from "./actions";
import { getLastTwelveMonths } from "./actions";

// API Configuration
export const API_CONFIG = {
  BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/tested_samples_disaggregated_by_drug_type/`,
  TIMEOUT: 30000,
} as const;

export const DEFAULT_DRUG = "Rifampicin";

// Default Values
export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  ACTIVE_TAB: "ultra" as const,
  DISAGGREGATION: false,
  REPORT_NAME: "Relatório de Sensibilidade aos Medicamentos",
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  HEIGHT: 350,
  CHART_ID: "clinic_tested_samples_disaggregated_by_drug_chart",
  SERIES_NAME: "Sensibilidade aos Medicamentos",
} as const;

// UI Configuration
export const UI_CONFIG = {
  TAB_OPTIONS: [
    { value: "ultra", label: "Ultra" },
    { value: "xdr", label: "XDR" },
  ] as const,
  MAIN_CARD_OPTIONS: {
    HEIGHT: "auto",
    LAB_TYPE: "poc",
    REPORT_TYPE: "facility",
    SUBTITLE: "Últimos 12 meses",
  } as const,
} as const;

// Legacy exports for backward compatibility
export const ENDPOINT = API_CONFIG.BASE_URL;
export const DEFAULT_TIME_INTERVAL = DEFAULTS.TIME_INTERVAL;
export const DEFAULT_FACILITY_TYPE = DEFAULTS.FACILITY_TYPE;