// API Configuration
export const API_CONFIG = {
  ENDPOINT: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/summary/positivity_by_month/`,
  TIMEOUT: 60000, // 60 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay
};

// Default Values
export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  ACTIVE_TAB: 'ultra' as ActiveTab,
  REPORT_NAME: {
    ULTRA: 'Relatório de Amostras Testadas por Mês - Ultra',
    XDR: 'Relatório de Amostras Testadas por Mês - XDR'
  }
};

// Chart Configuration
export const CHART_CONFIG = {
  CHART_ID: 'mtb-xpert-ultra-chart',
  HEIGHT: 350,
  Y_LABEL: 'Número de Casos',
  COLORS: {
    ULTRA: ['#10b981', '#ef4444', '#f59e0b', '#6b7280'],
    XDR: ['#059669', '#dc2626', '#d97706', '#4b5563']
  }
};

// UI Configuration
export const UI_CONFIG = {
  LOADING_MESSAGE: 'Carregando dados...',
  ERROR_MESSAGES: {
    NETWORK: 'Erro de rede. Verifique sua conexão.',
    TIMEOUT: 'Tempo limite excedido. Tente novamente.',
    SERVER: 'Erro do servidor. Tente novamente mais tarde.',
    NOT_FOUND: 'Dados não encontrados.',
    GENERIC: 'Ocorreu um erro inesperado.'
  },
  SUCCESS_MESSAGES: {
    EXCEL_EXPORT: 'Dados exportados para Excel com sucesso!',
    IMAGE_EXPORT: 'Gráfico exportado como imagem com sucesso!'
  }
};

// TypeScript Interfaces
export interface ReportState {
  timeInterval: TimeInterval;
  activeTab: ActiveTab;
  loading: boolean;
  error: string | null;
  data: Data[];
  reportName: string;
}

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

export interface ChartData {
  month: string;
  detected: number;
  notDetected: number;
  invalid: number;
  errors: number;
  total: number;
}

export type ActiveTab = 'ultra' | 'xdr';

export interface TimeInterval {
  startDate: string;
  endDate: string;
}

// Utility Functions
export function getLastTwelveMonths(): TimeInterval {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

export function getGenexpertResultType(activeTab: ActiveTab): string {
  return activeTab === 'ultra' ? 'Ultra 6 Cores' : 'XDR 10 Cores';
}

export function formatDateInPortuguese(date: Date): string {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month} de ${year}`;
}

export function getReportName(activeTab: ActiveTab): string {
  return activeTab === 'ultra' ? DEFAULTS.REPORT_NAME.ULTRA : DEFAULTS.REPORT_NAME.XDR;
}
