import { getLastTwelveMonths, FacilityType } from "./actions";

// Import design system chart colors for consistency
const chartTheme = {
  theme1: [
    "#f54a00", // chart-1 (orange-red)
    "#009689", // chart-2 (teal)
    "#104e64", // chart-3 (dark blue)
    "#ffba00", // chart-4 (yellow)
    "#fd9a00", // chart-5 (orange)
    "#00E396", 
    "#FEB019", 
    "#FF4560", 
    "#775DD0", 
    "#008FFB"
  ]
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/tested_samples_disaggregated_by_drug_type_by_age/`,
  TIMEOUT: 30000,
} as const;

// Default Values
export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  DRUG: "Rifampicin",
  DISAGGREGATION: false,
  REPORT_NAME: "Relatório de Sensibilidade aos Medicamentos por Idade",
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  HEIGHT: 350,
  CHART_ID: "clinic_tested_samples_disaggregated_by_drug_and_age_chart",
  SERIES_NAME: "Sensibilidade aos Medicamentos por Idade",
  COLORS: chartTheme.theme1,
  SERIES_COLORS: {
    MTB_DETECTADO: chartTheme.theme1[0], // #f54a00 (orange-red)
    MTB_NAO_DETECTADO: chartTheme.theme1[1], // #009689 (teal)
    ERROS: chartTheme.theme1[2], // #104e64 (dark blue)
    INVALIDO: chartTheme.theme1[3], // #ffba00 (yellow)
  }
} as const;

// Legacy exports for backward compatibility
export const ENDPOINT = API_CONFIG.BASE_URL;
export const DEFAULT_TIME_INTERVAL = DEFAULTS.TIME_INTERVAL;
export const DEFAULT_FACILITY_TYPE = DEFAULTS.FACILITY_TYPE;
export const DEFAULT_DRUG = DEFAULTS.DRUG;