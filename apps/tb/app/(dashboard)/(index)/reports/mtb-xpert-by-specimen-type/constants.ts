// ============================================================================
// API CONFIGURATION
// ============================================================================
export const API_CONFIG = {
  ENDPOINT: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/summary/sample_types_by_month/`,
  TIMEOUT: 60000, // 60 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay
} as const;

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================
export type ActiveTab = 'ultra' | 'xdr';

export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export interface AgeProps {
  "0_to_4": number;
  "5_to_9": number;
  "10_to_14": number;
  "15_to_19": number;
  "20_to_24": number;
  "25_to_29": number;
  "30_to_34": number;
  "35_to_39": number;
  "40_to_44": number;
  "45_to_49": number;
  "50_to_54": number;
  "55_to_59": number;
  "60_to_64": number;
  "65_plus": number;
  "Age_Not_Specified": number;
}

export interface Data {
  Month: number;
  Month_Name: string;
  Year: number;
  Specimen_Types: {
    Sputum: AgeProps;
    Feces: AgeProps;
    Urine: AgeProps;
    Blood: AgeProps;
    PL: AgeProps;
    Other: AgeProps;
  };
  Type_Of_Result: string;
  Lab: string;
  Start_Date: string;
  End_Date: string;
}

export interface SpecimenTypeData {
  name: string;
  data: number[];
  group: string;
}

export interface ChartData {
  labels: string[];
  series: SpecimenTypeData[];
}

export interface ReportState {
  timeInterval: TimeInterval;
  activeTab: ActiveTab;
  loading: boolean;
  error: string | null;
  data: Data[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
export const getLastTwelveMonths = (): TimeInterval => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);
  // startDate.setMonth(endDate.getMonth() - 11);
  
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  return activeTab === 'ultra' ? 'Ultra 6 Cores' : 'XDR 10 Cores';
};

export const formatDateInPortuguese = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month} de ${year}`;
};

export const getReportName = (activeTab: ActiveTab): string => {
  return activeTab === 'ultra' ? DEFAULTS.REPORT_NAME.ULTRA : DEFAULTS.REPORT_NAME.XDR;
};

// ============================================================================
// DEFAULTS
// ============================================================================
export const DEFAULTS = {
  ACTIVE_TAB: 'ultra' as ActiveTab,
  TIME_INTERVAL: getLastTwelveMonths(),
  REPORT_NAME: {
    ULTRA: 'Relatório de Tipo de Amostras por Mês - Ultra',
    XDR: 'Relatório de Tipo de Amostras por Mês - XDR',
  },
} as const;

// ============================================================================
// CHART CONFIGURATION
// ============================================================================
export const CHART_CONFIG = {
  CHART_ID: 'mtb-specimen-type-chart',
  HEIGHT: 350,
  Y_LABEL: 'Número de Casos',
  COLORS: ['#f54a00', '#009689', '#104e64', '#ffba00', '#7B2D8E', '#7f7f7f'],
  SPECIMEN_TYPES: {
    SPUTUM: { label: 'Expectoração', color: '#1f77b4' },
    FECES: { label: 'Fezes', color: '#ff7f0e' },
    URINE: { label: 'Urina', color: '#2ca02c' },
    BLOOD: { label: 'Sangue', color: '#d62728' },
    PLEURAL_FLUID: { label: 'Líquido Pleural', color: '#8e44ad' },
    OTHER: { label: 'Outro', color: '#9467bd' },
  },
} as const;

// ============================================================================
// UI CONFIGURATION
// ============================================================================
export const UI_CONFIG = {
  TABS: [
    { value: 'ultra', label: 'Ultra' },
    { value: 'xdr', label: 'XDR' },
  ],
  MAIN_CARD: {
    ID: 'mtb-specimen-type-main-card',
    REPORT_TYPE: 'national' as const,
  },
} as const;
