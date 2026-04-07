import { getLastTwelveMonths } from "./actions";

export const API_CONFIG = {
  PATIENTS_BY_FACILITY: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/patients/by_facility/`,
  PATIENTS_BY_NAME: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/patients/by_name/`,
  PATIENTS_BY_SAMPLE_TYPE: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/patients/by_sample_type/`,
  PATIENTS_BY_RESULT_TYPE: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/patients/by_result_type/`,
  TIMEOUT: 30000,
} as const;

export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  SEARCH_MODE: "facility" as const,
  GENEXPERT_RESULT_TYPE: "All" as const,
  PER_PAGE: 50,
  REPORT_NAME: "Resultados de Pacientes",
} as const;

export const SEARCH_TABS = [
  { value: "facility", label: "Por US" },
  { value: "name", label: "Por Nome" },
  { value: "sample_type", label: "Por Amostra" },
  { value: "result_type", label: "Por Resultado" },
] as const;

export const GENEXPERT_OPTIONS = [
  { value: "All", label: "Todos" },
  { value: "Ultra 6 Cores", label: "Ultra 6 Cores" },
  { value: "XDR 10 Cores", label: "XDR 10 Cores" },
] as const;

export const SAMPLE_TYPE_OPTIONS = [
  { value: "sputum", label: "Escarro" },
  { value: "feces", label: "Fezes" },
  { value: "urine", label: "Urina" },
  { value: "blood", label: "Sangue" },
] as const;

export const RESULT_TYPE_OPTIONS = [
  { value: "detected", label: "Detectado" },
  { value: "not_detected", label: "Não Detectado" },
  { value: "indeterminate", label: "Indeterminado" },
  { value: "error", label: "Erro" },
  { value: "invalid", label: "Inválido" },
] as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
