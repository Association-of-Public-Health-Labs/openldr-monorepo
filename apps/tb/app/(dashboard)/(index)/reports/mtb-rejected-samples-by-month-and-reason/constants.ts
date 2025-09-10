import { LabType } from "./actions";
import { getLastTwelveMonths } from "./actions";

// API Configuration
export const API_CONFIG = {
  ENDPOINT: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/rejected_samples_by_reason_by_month/`,
  TIMEOUT: 60000,
  MAX_RETRIES: 3,
} as const;

// Default Values
export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  LAB_TYPE: "Conventional" as LabType,
  ACTIVE_TAB: "Ultra" as const,
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  CHART_ID: "rejected_samples_by_month_reason_chart",
  HEIGHT: 400,
  COLORS: {
    REJECTION_REASONS: [
      "#e74c3c", // Amostra Insuficiente
      "#3498db", // Amostra Não Recebida  
      "#f39c12", // Amostra Inadequada para Teste
      "#9b59b6", // Falha de Equipamento
      "#1abc9c", // Amostra Não Etiquetada
      "#e67e22", // Acidente no Laboratório
      "#34495e", // Reagente Ausente
      "#95a5a6", // Duplicação de Registo
      "#2ecc71", // Erro Técnico
      "#f1c40f", // Amostra Repetida
      "#8e44ad", // Outro
    ],
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  REPORT_NAME: "Amostras Rejeitadas por Mês e Motivo",
  TABS: [
    { value: "Ultra", label: "Ultra" },
    { value: "XDR", label: "XDR" },
  ],
  EXPORT_OPTIONS: {
    EXCEL_LABEL: "Exportar para Excel",
    IMAGE_LABEL: "Exportar como Imagem",
    RESTART_LABEL: "Reiniciar",
  },
  BUTTONS: {
    EXPORT_EXCEL: {
      icon: "PiMicrosoftExcelLogoFill",
      tooltip: "Exportar para Excel",
    },
    EXPORT_IMAGE: {
      icon: "IoImageOutline", 
      tooltip: "Exportar como Imagem",
    },
    RESTART: {
      icon: "VscDebugRestart",
      tooltip: "Reiniciar",
    },
    DOCS: {
      icon: "HiOutlineDocumentText",
      tooltip: "Documentação",
    },
  },
} as const;

// Legacy exports for backward compatibility
export const ENDPOINT = API_CONFIG.ENDPOINT;
export const DEFAULT_TIME_INTERVAL = DEFAULTS.TIME_INTERVAL;
export const DEFAULT_LAB_TYPE = DEFAULTS.LAB_TYPE;

// TypeScript Types
export type ActiveTab = "Ultra" | "XDR";

// Utility Functions
export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  return activeTab === "Ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
};

export const formatDateInPortuguese = (dateString: string): string => {
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  
  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month} de ${year}`;
};