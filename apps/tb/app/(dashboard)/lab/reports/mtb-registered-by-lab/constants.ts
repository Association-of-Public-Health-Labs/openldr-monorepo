import { FacilityType } from "./actions";
import { getLastTwelveMonths } from "./actions";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format date in Portuguese
 */
export const formatDateInPortuguese = (dateString: string): string => {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month} de ${year}`;
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/registered_samples/`,
  TIMEOUT: 60000, // Increased to 60 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // Base delay in milliseconds
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  ACTIVE_TAB: "ultra" as const,
  DISAGGREGATION: false,
  REPORT_NAME: "Relatório de Amostras Registadas por laboratório",
} as const;

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

export const CHART_CONFIG = {
  HEIGHT: 350,
  CHART_ID: "tb-stacked-chart",
  SERIES_NAME: "Amostras Registadas",
  COLORS: {
    ULTRA: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
    XDR: ["#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
  }
} as const;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  TAB_OPTIONS: [
    { value: "ultra", label: "Ultra" },
    { value: "xdr", label: "XDR" },
  ] as const,
  MAIN_CARD_OPTIONS: {
    HEIGHT: "auto",
    LAB_TYPE: "poc",
    REPORT_TYPE: "facility",
    SUBTITLE: "Últimos 12 meses", // Will be replaced by dynamic subtitle
  } as const,
} as const;