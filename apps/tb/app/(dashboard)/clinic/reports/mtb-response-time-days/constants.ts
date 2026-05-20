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
  Role?: string;
  Total: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;
  colheita_us__recepcao_lab: BucketData5;
  colheita_us__validacao_no_lab: BucketData7;
  recepcao_lab__validacao_no_lab: BucketData2;
}

export interface BucketData5 {
  "<5": number;
  ">5": number;
  [key: string]: number;
}

export interface BucketData7 {
  "<7": number;
  ">7": number;
  [key: string]: number;
}

export interface BucketData2 {
  "<2": number;
  ">2": number;
  [key: string]: number;
}

export type TimeIntervalData = BucketData5 | BucketData7 | BucketData2;

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
  goodLabel: string;
  badLabel: string;
  good: number;
  bad: number;
  Total: number;
}

export type ActiveTab = "ultra" | "xdr";
export type FacilityType = "province" | "district" | "clinic" | "patients";
export type TimeIntervalType =
  | "colheita_us__recepcao_lab"
  | "colheita_us__validacao_no_lab"
  | "recepcao_lab__validacao_no_lab";

export interface IntervalBucketConfig {
  goodKey: string;
  badKey: string;
  goodLabel: string;
  badLabel: string;
}

export const INTERVAL_BUCKETS: Record<TimeIntervalType, IntervalBucketConfig> = {
  colheita_us__recepcao_lab: {
    goodKey: "<5",
    badKey: ">5",
    goodLabel: "≤ 5 dias",
    badLabel: "> 5 dias",
  },
  colheita_us__validacao_no_lab: {
    goodKey: "<7",
    badKey: ">7",
    goodLabel: "≤ 7 dias",
    badLabel: "> 7 dias",
  },
  recepcao_lab__validacao_no_lab: {
    goodKey: "<2",
    badKey: ">2",
    goodLabel: "≤ 2 dias",
    badLabel: "> 2 dias",
  },
};

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
  BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/trl_samples_by_days_tb/`,
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
    GOOD: "#009689", // Green - dentro do alvo
    BAD: "#ef4444", // Red - fora do alvo
  },
  PERFORMANCE_COLORS: [
    "#009689", // Green - dentro do alvo
    "#ef4444", // Red - fora do alvo
  ] as string[],
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
    value: "colheita_us__validacao_no_lab" as TimeIntervalType,
    label: "Colheita US → Validação no Lab",
  },
  {
    value: "recepcao_lab__validacao_no_lab" as TimeIntervalType,
    label: "Recepção Lab → Validação no Lab",
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
  const intervalLabels: Record<TimeIntervalType, string> = {
    "colheita_us__recepcao_lab": "Colheita US → Recepção Lab",
    "colheita_us__validacao_no_lab": "Colheita US → Validação no Lab",
    "recepcao_lab__validacao_no_lab": "Recepção Lab → Validação no Lab",
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
