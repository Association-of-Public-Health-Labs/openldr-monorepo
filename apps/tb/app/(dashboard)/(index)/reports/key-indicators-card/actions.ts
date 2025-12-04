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

export const getLastTwelveMonths = (): TimeInterval => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 11);
  
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

    const response = await api(token).get(API_CONFIG.ENDPOINT, {
      params,
      timeout: API_CONFIG.TIMEOUT
    });

    return response.data || [];
  });
};

/**
 * Prepare chart data from API response
 */
export const prepareChartData = (data: Data[]): ChartData[] => {
  if (!data || data.length === 0) {
    return [];
  }

  return [
    // {
    //   Indicadores: "Amostras Registadas",
    //   ...data.reduce((acc, item) => {
    //     acc[item.Month_Name] = item.Registered_Samples;
    //     return acc;
    //   }, {} as Record<string, number>)
    // },
    {
      Indicadores: "Amostras Analizadas",
      ...data.reduce((acc, item) => {
        acc[item.Month_Name] = item.Analysed_Samples;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      Indicadores: "Resultados Positivos",
      ...data.reduce((acc, item) => {
        acc[item.Month_Name] = item.Detected_Samples;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      Indicadores: "Resultados Negativos",
      ...data.reduce((acc, item) => {
        acc[item.Month_Name] = item.Not_Detected_Samples;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      Indicadores: "Inválidos",
      ...data.reduce((acc, item) => {
        acc[item.Month_Name] = item.Invalid_Samples;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      Indicadores: "Erros",
      ...data.reduce((acc, item) => {
        acc[item.Month_Name] = item.Errors;
        return acc;
      }, {} as Record<string, number>)
    }
  ];
};

/**
 * Get column names from data
 */
export const getColumns = (data: Data[]): string[] => {
  if (!data || data.length === 0) {
    return ["Indicadores"];
  }
  
  return ["Indicadores", ...data.map(item => item.Month_Name)];
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