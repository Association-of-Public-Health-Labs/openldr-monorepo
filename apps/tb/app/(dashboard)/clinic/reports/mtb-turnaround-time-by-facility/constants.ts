import { FacilityType, getLastTwelveMonths } from "./actions";

// API Configuration
export const API_CONFIG = {
  ENDPOINT: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/trl_samples_avg_by_days/`,
  TIMEOUT: 60000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Default Values
export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  ACTIVE_TAB: "ultra" as const,
  DISAGGREGATION: false,
  REPORT_NAME: "Relatório de Tempo de Resposta por Província",
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  CHART_ID: "turnaround-time-by-facility-chart",
  HEIGHT: 400,
  Y_LABEL: "Dias (média)",
  COLORS: [
    "#3498db", // Colheita US → Recepção Lab
    "#2ecc71", // Recepção Lab → Registo no Lab
    "#f39c12", // Registo no Lab → Análise no Lab
    "#e74c3c", // Análise no Lab → Validação no Lab
  ],
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
  EXPORT_OPTIONS: {
    EXCEL_LABEL: "Exportar para Excel",
    IMAGE_LABEL: "Exportar como Imagem",
    RESTART_LABEL: "Reiniciar",
  },
} as const;
