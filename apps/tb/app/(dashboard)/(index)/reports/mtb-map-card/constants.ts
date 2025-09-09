export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export type ActiveTab = "ultra" | "xdr";

export type ProvinceName = "Niassa" | "Inhambane" | "Gaza" | "Maputo Provincia" | "Maputo Cidade" | "Nampula" | "Cabo Delgado" | "Zambezia" | "Sofala" | "Manica" | "Tete";

export interface MapData {
  Facility: string;
  Tested_Samples: number;
  Detected: number;
  Not_Detected: number;
  Invalid: number;
  Errors: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;
  Disaggregation: boolean;
  Facility_Type: string;
}

export interface ReportState {
  timeInterval: TimeInterval;
  activeTab: ActiveTab;
  selectedProvince: ProvinceName | null;
  loading: boolean;
  error: string | null;
  data: MapData[];
  districtData: MapData[];
}

// API Configuration
export const API_CONFIG = {
  ENDPOINT: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/tested_samples/`,
  TIMEOUT: 60000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000,
} as const;

// Default Values
export const DEFAULTS = {
  ACTIVE_TAB: "ultra" as ActiveTab,
  TIME_INTERVAL: (() => {
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
  })(),
  SELECTED_PROVINCE: null,
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  CHART_ID: "mtb-map-chart",
  COLORS: {
    ULTRA: "#00B000",
    XDR: "#fd9a00",
  },
  PROVINCE_CODES: {
    "Tete": "tt", 
    "Maputo Provincia": "mp", 
    "Maputo Cidade": "mc", 
    "Nampula": "np",   
    "Cabo Delgado": "cd", 
    "Zambezia": "zb", 
    "Inhambane": "ib", 
    "Gaza": "gz", 
    "Sofala": "sf", 
    "Manica": "mn",  
    "Niassa": "ns",
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  TABS: [
    { value: "ultra", label: "Ultra" },
    { value: "xdr", label: "XDR" }
  ],
  LABELS: {
    TITLE: "Relatório de Positividade a Nível Nacional",
    SUBTITLE_DEFAULT: "Últimos 12 meses",
    BREADCRUMB_HOME: "Moçambique",
    CLICK_INSTRUCTION: "Clique sobre a Província para mais detalhes",
    LEGEND: "Positividade",
    EXPORT_EXCEL: "Exportar para Excel",
    EXPORT_IMAGE: "Exportar imagem",
    RESTART_REPORT: "Reiniciar o relatorio",
  },
  ERROR_MESSAGES: {
    NETWORK_ERROR: "Erro de rede. Verifique sua conexão.",
    TIMEOUT: "Tempo limite excedido. Tente novamente.",
    SERVER_ERROR: "Erro do servidor. Tente novamente mais tarde.",
    NOT_FOUND: "Dados não encontrados.",
    GENERIC: "Ocorreu um erro inesperado.",
  },
} as const;

// Utility Functions
export const getLastTwelveMonths = (): TimeInterval => {
  return DEFAULTS.TIME_INTERVAL;
};

export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  return activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
};

export const getTabColor = (activeTab: ActiveTab): string => {
  return activeTab === "ultra" ? CHART_CONFIG.COLORS.ULTRA : CHART_CONFIG.COLORS.XDR;
};

export const formatDateRange = (timeInterval: TimeInterval): string => {
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const months = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    return `${formatDate(timeInterval.startDate)} à ${formatDate(timeInterval.endDate)}`;
};
