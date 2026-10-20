import axios from 'axios';
import { 
  API_CONFIG, 
  type Data, 
  type TimeInterval, 
  type ActiveTab,
  type ChartData,
  getGenexpertResultType 
} from './constants';
import { api } from '../../../../../config/api';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

type ApiResponse =
  | Data[]
  | { data?: unknown; results?: unknown; items?: unknown; records?: unknown; detail?: unknown; message?: unknown };

const getApiErrorMessage = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    const detail = value as { detail?: unknown; message?: unknown; error?: unknown };
    return getApiErrorMessage(detail.detail ?? detail.message ?? detail.error ?? JSON.stringify(value));
  }

  return 'Erro ao carregar dados';
};

const extractDataArray = (payload: ApiResponse): Data[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Resposta inválida da API: formato de dados inesperado.');
  }

  const apiError = payload.detail ?? payload.message;
  if (apiError) {
    throw new Error(getApiErrorMessage(apiError));
  }

  const candidate = payload.data ?? payload.results ?? payload.items ?? payload.records;
  if (Array.isArray(candidate)) {
    return candidate as Data[];
  }

  throw new Error('Resposta inválida da API: era esperado um array de indicadores.');
};

const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

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

/**
 * Build API parameters for data request
 */
export const buildApiParams = (
  timeInterval: TimeInterval,
  activeTab: ActiveTab
): Record<string, any> => {
  const params: Record<string, any> = {
    interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`
  };

  if (activeTab !== "Todos") {
    params.genexpert_result_type = getGenexpertResultType(activeTab);
  }

  return params;
};

/**
 * Retry mechanism with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = API_CONFIG.MAX_RETRIES,
  delays: number[] = API_CONFIG.RETRY_DELAYS
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        const delay = delays[i] || delays[delays.length - 1];
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

/**
 * Fetch key indicators data from API
 */
export const fetchKeyIndicatorsData = async (
  getToken: () => Promise<string | null>,
  timeInterval: TimeInterval,
  activeTab: ActiveTab
): Promise<Data[]> => {
  return retryWithBackoff(async () => {
    const token = await getToken();
    const params = buildApiParams(timeInterval, activeTab);

    const response = await api(token).get<ApiResponse>(API_CONFIG.ENDPOINT, {
      params,
      timeout: API_CONFIG.TIMEOUT
    });

    return extractDataArray(response.data);
  });
};

// Portuguese month names mapping
const MONTH_NAMES_PT: Record<string, { full: string; short: string }> = {
  "January": { full: "Janeiro", short: "Jan" },
  "February": { full: "Fevereiro", short: "Fev" },
  "March": { full: "Março", short: "Mar" },
  "April": { full: "Abril", short: "Abr" },
  "May": { full: "Maio", short: "Mai" },
  "June": { full: "Junho", short: "Jun" },
  "July": { full: "Julho", short: "Jul" },
  "August": { full: "Agosto", short: "Ago" },
  "September": { full: "Setembro", short: "Set" },
  "October": { full: "Outubro", short: "Out" },
  "November": { full: "Novembro", short: "Nov" },
  "December": { full: "Dezembro", short: "Dez" },
};

/**
 * Convert month name to Portuguese (full or abbreviated)
 */
const formatMonthPT = (monthName: string, useShort: boolean): string => {
  const month = MONTH_NAMES_PT[monthName];
  if (month) {
    return useShort ? month.short : month.full;
  }
  // If already in Portuguese or unknown, try to shorten if needed
  if (useShort && monthName.length > 3) {
    return monthName.substring(0, 3);
  }
  return monthName;
};

/**
 * Get formatted month key for data (Portuguese, with year)
 */
const getMonthKey = (item: Data, useShort: boolean): string => {
  return `${formatMonthPT(item.Month_Name, useShort)} ${item.Year}`;
};

/**
 * Prepare chart data from API response
 */
export const prepareChartData = (data: Data[]): ChartData[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const useShortNames = data.length > 12;

  return [
    // {
    //   Indicadores: "Amostras Registadas",
    //   ...data.reduce((acc, item) => {
    //     acc[getMonthKey(item, useShortNames)] = item.Registered_Samples;
    //     return acc;
    //   }, {} as Record<string, number>)
    // },
    {
      Indicadores: "Amostras Analisadas",
      ...data.reduce((acc, item) => {
        acc[getMonthKey(item, useShortNames)] = toNumber(item.Analysed_Samples);
        return acc;
      }, {} as Record<string, number>)
    },
    {
      Indicadores: "Resultados Positivos",
      ...data.reduce((acc, item) => {
        acc[getMonthKey(item, useShortNames)] = toNumber(item.Detected_Samples);
        return acc;
      }, {} as Record<string, number>)
    },
    {
      Indicadores: "Resultados Negativos",
      ...data.reduce((acc, item) => {
        acc[getMonthKey(item, useShortNames)] = toNumber(item.Not_Detected_Samples);
        return acc;
      }, {} as Record<string, number>)
    },
    {
      Indicadores: "Inválidos",
      ...data.reduce((acc, item) => {
        acc[getMonthKey(item, useShortNames)] = toNumber(item.Invalid_Samples);
        return acc;
      }, {} as Record<string, number>)
    },
    {
      Indicadores: "Erros",
      ...data.reduce((acc, item) => {
        acc[getMonthKey(item, useShortNames)] = toNumber(item.Errors);
        return acc;
      }, {} as Record<string, number>)
    }
  ];
};

/**
 * Get column names from data with Portuguese month names
 * Shortens month names if there are more than 12 months
 */
export const getColumns = (data: Data[]): string[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return ["Indicadores"];
  }
  
  const useShortNames = data.length > 12;
  
  return [
    "Indicadores", 
    ...data.map(item => `${formatMonthPT(item.Month_Name, useShortNames)} ${item.Year}`)
  ];
};

/**
 * Handle API errors with user-friendly messages
 */
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return "Tempo limite excedido. Tente novamente.";
    } else if (error.response?.status === 404) {
      return "Dados não encontrados para o período selecionado.";
    } else if (error.response?.status >= 500) {
      return "Erro no servidor. Tente novamente mais tarde.";
    } else if (error.message?.toLowerCase().includes('network')) {
      return "Erro de rede. Verifique sua conexão.";
    } else {
      return error.response?.data?.message || error.message || "Erro ao carregar dados";
    }
  }

  return error instanceof Error ? error.message : "Erro desconhecido";
};
