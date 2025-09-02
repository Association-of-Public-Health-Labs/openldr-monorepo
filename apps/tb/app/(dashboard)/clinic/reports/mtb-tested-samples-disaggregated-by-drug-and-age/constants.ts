import { getLastTwelveMonths, FacilityType } from "./actions";

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
} as const;

// Legacy exports for backward compatibility
export const ENDPOINT = API_CONFIG.BASE_URL;
export const DEFAULT_TIME_INTERVAL = DEFAULTS.TIME_INTERVAL;
export const DEFAULT_FACILITY_TYPE = DEFAULTS.FACILITY_TYPE;
export const DEFAULT_DRUG = DEFAULTS.DRUG;