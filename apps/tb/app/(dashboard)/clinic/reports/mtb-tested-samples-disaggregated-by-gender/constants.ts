import { FacilityType } from "./actions";
import { getLastTwelveMonths } from "./actions";

// API Configuration
export const API_CONFIG = {
  BASE_URL: "https://dev.openldr.org.mz/tb/gx/facilities/tested_samples_disaggregated_by_gender/",
  TIMEOUT: 30000,
} as const;

// Default Values
export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  ACTIVE_TAB: "ultra" as const,
  DISAGGREGATION: false,
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  HEIGHT: 350,
  CHART_ID: "tb-stacked-chart",
  SERIES_NAME: "Amostras Testadas Rifampicina",
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