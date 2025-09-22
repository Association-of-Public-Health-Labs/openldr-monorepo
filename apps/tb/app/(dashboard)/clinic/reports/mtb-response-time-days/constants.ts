// ============================================================================
// TYPES
// ============================================================================

export interface ReportState {
  timeInterval: TimeInterval;
  activeTab: ActiveTab;
  loading: boolean;
  error: string | null;
  data: Data[];
  facilities: FacilityOptions[];
  facilityType: FacilityType;
  disaggregation: boolean;
  timeIntervalType: TimeIntervalType;
}

export interface PatientDialogState {
  open: boolean;
  data: any[];
  loading: boolean;
}

export interface Data {
  Facility: string;
  Total: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;
  colheita_us__recepcao_lab: TimeIntervalData;
  recepcao_lab__registo_no_lab: TimeIntervalData;
  registo_no_lab__analise_no_lab: TimeIntervalData;
  analise_no_lab__validacao_no_lab: TimeIntervalData;
}

export interface TimeIntervalData {
  less_than_7: number;
  between_7_15: number;
  between_16_21: number;
  greater_than_21: number;
}

export interface ChartData {
  name: string;
  data: number[];
  group: string;
}

export interface StackedSerieProps {
  name?: string;
  data: number[] | any[];
}

export interface ExcelData {
  Facility: string;
  "< 7 dias": number;
  "7-15 dias": number;
  "16-21 dias": number;
  "> 21 dias": number;
  Total: number;
}

export type ActiveTab = "ultra" | "xdr";
export type FacilityType = "province" | "district" | "clinic" | "patients";
export type TimeIntervalType = "colheita_us__recepcao_lab" | "recepcao_lab__registo_no_lab" | "registo_no_lab__analise_no_lab" | "analise_no_lab__validacao_no_lab";

export interface FacilityOptions {
  value: string;
  label: string;
  district?: string;
  province?: string;
  clinic?: string;
}

export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export interface PatientDataParams {
  province?: string;
  district?: string;
  health_facility?: string;
  genexpert_result_type?: string;
  interval_dates?: string;
  time_interval_type?: TimeIntervalType;
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/trl_samples_by_days/`,
  PATIENT_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/patients/`,
  TIMEOUT: 60000,
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  ACTIVE_TAB: "ultra" as ActiveTab,
  DISAGGREGATION: false,
  REPORT_NAME: "Tempo de resposta em Dias",
  TIME_INTERVAL_TYPE: "colheita_us__recepcao_lab" as TimeIntervalType,
} as const;

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

export const CHART_CONFIG = {
  HEIGHT: 350,
  CHART_ID: "mtb_response_time_days_chart",
  SERIES_NAME: "Tempo de Resposta",
  COLORS: {
    LESS_THAN_7: "#22c55e", // Green - Good performance
    BETWEEN_7_15: "#eab308", // Yellow - Acceptable
    BETWEEN_16_21: "#f97316", // Orange - Concerning
    GREATER_THAN_21: "#ef4444", // Red - Poor performance
  },
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
    SUBTITLE: "Últimos 12 meses",
  } as const,
} as const;

// ============================================================================
// TIME INTERVAL OPTIONS
// ============================================================================

export const TIME_INTERVAL_OPTIONS = [
  {
    value: "colheita_us__recepcao_lab" as TimeIntervalType,
    label: "Colheita US → Recepção Lab",
  },
  {
    value: "recepcao_lab__registo_no_lab" as TimeIntervalType,
    label: "Recepção Lab → Registo no Lab",
  },
  {
    value: "registo_no_lab__analise_no_lab" as TimeIntervalType,
    label: "Registo no Lab → Análise no Lab",
  },
  {
    value: "analise_no_lab__validacao_no_lab" as TimeIntervalType,
    label: "Análise no Lab → Validação no Lab",
  },
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get last twelve months interval
 */
export function getLastTwelveMonths(): TimeInterval {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
}

/**
 * Get genexpert result type based on active tab
 */
export function getGenexpertResultType(activeTab: ActiveTab): string {
  return activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
}

/**
 * Format date in Portuguese
 */
export function formatDateInPortuguese(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month} de ${year}`;
}

/**
 * Get report name based on time interval type
 */
export function getReportName(timeIntervalType: TimeIntervalType): string {
  const intervalLabels = {
    "colheita_us__recepcao_lab": "Colheita US → Recepção Lab",
    "recepcao_lab__registo_no_lab": "Recepção Lab → Registo no Lab", 
    "registo_no_lab__analise_no_lab": "Registo no Lab → Análise no Lab",
    "analise_no_lab__validacao_no_lab": "Análise no Lab → Validação no Lab",
  };
  
  return `Tempo de Resposta - ${intervalLabels[timeIntervalType]}`;
}

/**
 * Get next facility type for drill-down
 */
export function getNextFacilityType(currentType: FacilityType): FacilityType {
  const facilityTypeHierarchy: Record<FacilityType, FacilityType> = {
    province: "district",
    district: "clinic",
    clinic: "province", // Reset to province for demo
    patients: "province"
  };

  return facilityTypeHierarchy[currentType];
}

// Legacy exports for backward compatibility
export const ENDPOINT = API_CONFIG.BASE_URL;
export const DEFAULT_TIME_INTERVAL = DEFAULTS.TIME_INTERVAL;
export const DEFAULT_FACILITY_TYPE = DEFAULTS.FACILITY_TYPE;
