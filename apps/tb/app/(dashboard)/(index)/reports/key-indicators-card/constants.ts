// Utility Functions
export const getLastTwelveMonths = (): TimeInterval => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);
  
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

export const getGenexpertResultType = (activeTab: ActiveTab): string | undefined => {
  switch (activeTab) {
    case 'Ultra':
      return 'Ultra 6 Cores';
    case 'XDR':
      return 'XDR 10 Cores';
    default:
      return undefined;
  }
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

export const getReportName = (): string => {
  return UI_CONFIG.REPORT_NAME;
};

// TypeScript Interfaces (need to be declared before utility functions use them)
export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export type ActiveTab = 'Todos' | 'Ultra' | 'XDR';

export interface Data {
  Analysed_Samples: number;
  Detected_Samples: number;
  End_Date: string;
  Errors: number;
  Invalid_Samples: number;
  Lab: string;
  Month: number;
  Month_Name: string;
  Not_Detected_Samples: number;
  Registered_Samples: number;
  Start_Date: string;
  Type_Of_Result: string;
  Year: number;
}

export interface ReportState {
  timeInterval: TimeInterval;
  activeTab: ActiveTab;
  loading: boolean;
  error: string | null;
  data: Data[];
}

export interface ChartData {
  Indicadores: string;
  [key: string]: string | number;
}

// API Configuration
export const API_CONFIG = {
  ENDPOINT: '/tb/gx/summary/positivity_by_month/',
  TIMEOUT: 60000, // 60 seconds
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 2000, 4000] // Exponential backoff
};

// Default Values
export const DEFAULTS = {
  ACTIVE_TAB: 'Todos' as ActiveTab,
  TIME_INTERVAL: getLastTwelveMonths(),
  LOADING: false,
  ERROR: null as string | null,
  DATA: [] as Data[]
};

// Chart Configuration
export const CHART_CONFIG = {
  CHART_ID: 'key-indicators-chart',
  COLORS: {
    PRIMARY: '#1976d2',
    SECONDARY: '#dc004e',
    SUCCESS: '#2e7d32',
    WARNING: '#ed6c02',
    ERROR: '#d32f2f',
    INFO: '#0288d1'
  }
};

// UI Configuration
export const UI_CONFIG = {
  TABS: ['Todos', 'Ultra', 'XDR'],
  INDICATORS: [
    'Amostras Registadas',
    'Amostras Analizadas', 
    'Resultados Positivos',
    'Resultados Negativos',
    'Inválidas',
    'Erros'
  ],
  REPORT_NAME: 'Principais Indicadores das Amostras',
  TAB_OPTIONS: [
    { value: "ultra", label: "Ultra" },
    { value: "xdr", label: "XDR" },
] as const,
MAIN_CARD_OPTIONS: {
    HEIGHT: "auto",
    LAB_TYPE: "poc",
    REPORT_TYPE: "national",
    SUBTITLE: "Últimos 12 meses",
} as const,
EXPORT_OPTIONS: {
    EXCEL_LABEL: "Exportar para Excel",
    IMAGE_LABEL: "Exportar imagem",
    RESTART_LABEL: "Reiniciar o relatorio",
} as const,
};
