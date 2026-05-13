import axios from 'axios';
import { api } from '../../../../../config/api';
import {
  API_CONFIG,
  Data,
  ChartData,
  SpecimenTypeData,
  TimeInterval,
  ActiveTab,
  getGenexpertResultType,
  CHART_CONFIG,
  AgeProps
} from './constants';

// Portuguese month names mapping
const PORTUGUESE_MONTHS: Record<string, { full: string; short: string }> = {
  'January': { full: 'Janeiro', short: 'Jan' },
  'February': { full: 'Fevereiro', short: 'Fev' },
  'March': { full: 'Março', short: 'Mar' },
  'April': { full: 'Abril', short: 'Abr' },
  'May': { full: 'Maio', short: 'Mai' },
  'June': { full: 'Junho', short: 'Jun' },
  'July': { full: 'Julho', short: 'Jul' },
  'August': { full: 'Agosto', short: 'Ago' },
  'September': { full: 'Setembro', short: 'Set' },
  'October': { full: 'Outubro', short: 'Out' },
  'November': { full: 'Novembro', short: 'Nov' },
  'December': { full: 'Dezembro', short: 'Dez' },
  'Janeiro': { full: 'Janeiro', short: 'Jan' },
  'Fevereiro': { full: 'Fevereiro', short: 'Fev' },
  'Março': { full: 'Março', short: 'Mar' },
  'Abril': { full: 'Abril', short: 'Abr' },
  'Maio': { full: 'Maio', short: 'Mai' },
  'Junho': { full: 'Junho', short: 'Jun' },
  'Julho': { full: 'Julho', short: 'Jul' },
  'Agosto': { full: 'Agosto', short: 'Ago' },
  'Setembro': { full: 'Setembro', short: 'Set' },
  'Outubro': { full: 'Outubro', short: 'Out' },
  'Novembro': { full: 'Novembro', short: 'Nov' },
  'Dezembro': { full: 'Dezembro', short: 'Dez' },
};

/**
 * Format month label based on data span
 */
const formatMonthLabel = (monthName: string, year: number, shouldIncludeYear: boolean): string => {
  const monthData = PORTUGUESE_MONTHS[monthName];

  if (!monthData) {
    return shouldIncludeYear ? `${monthName.substring(0, 3)} ${year}` : monthName;
  }

  return shouldIncludeYear ? `${monthData.short} ${year}` : monthData.full;
};

/**
 * Check if chart data should include year in labels
 */
const shouldShowYearInLabels = (data: Array<{ Year: number }>): boolean => {
  if (data.length === 0) return false;
  if (data.length > 13) return true;
  const years = new Set(data.map(item => item.Year));
  return years.size > 1;
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Builds API parameters for the specimen type report
 */
export const buildApiParams = (
  timeInterval: TimeInterval,
  activeTab: ActiveTab
) => {
  return {
    interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
    genexpert_result_type: getGenexpertResultType(activeTab),
  };
};

/**
 * Retry mechanism with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
  baseDelay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Fetches specimen type data from the API with retry mechanism
 */
export const fetchSpecimenTypeData = async (
  token: string | null,
  timeInterval: TimeInterval,
  activeTab: ActiveTab
): Promise<Data[]> => {
  const params = buildApiParams(timeInterval, activeTab);

  return retryWithBackoff(async () => {
    const response = await api(token).get(API_CONFIG.ENDPOINT, {
      params,
      timeout: API_CONFIG.TIMEOUT,
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Dados inválidos recebidos da API');
    }

    return response.data;
  });
};

// ============================================================================
// DATA PROCESSING FUNCTIONS
// ============================================================================

/**
 * Calculates total specimens for a given specimen type across all age groups
 */
const calculateSpecimenTotal = (specimenData: AgeProps | null | undefined): number => {
  if (!specimenData || typeof specimenData !== 'object') {
    return 0;
  }
  
  return Object.values(specimenData).reduce((sum: number, value: number) => {
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
};

/**
 * Prepares chart data for the stacked chart component
 */
export const prepareChartData = (data: Data[]): ChartData => {
  if (!data || data.length === 0) {
    return {
      labels: [],
      series: []
    };
  }

  const includeYear = shouldShowYearInLabels(data);
  const labels = data.map((item) => formatMonthLabel(item?.Month_Name || '', item?.Year, includeYear));

  const series: SpecimenTypeData[] = [
    {
      name: CHART_CONFIG.SPECIMEN_TYPES.SPUTUM.label,
      data: data.map((item) => calculateSpecimenTotal(item?.Specimen_Types?.Sputum)),
      group: 'apexcharts-axis-0'
    },
    {
      name: CHART_CONFIG.SPECIMEN_TYPES.FECES.label,
      data: data.map((item) => calculateSpecimenTotal(item?.Specimen_Types?.Feces)),
      group: 'apexcharts-axis-0'
    },
    {
      name: CHART_CONFIG.SPECIMEN_TYPES.URINE.label,
      data: data.map((item) => calculateSpecimenTotal(item?.Specimen_Types?.Urine)),
      group: 'apexcharts-axis-0'
    },
    {
      name: CHART_CONFIG.SPECIMEN_TYPES.BLOOD.label,
      data: data.map((item) => calculateSpecimenTotal(item?.Specimen_Types?.Blood)),
      group: 'apexcharts-axis-0'
    },
    {
      name: CHART_CONFIG.SPECIMEN_TYPES.PLEURAL_FLUID.label,
      data: data.map((item) => calculateSpecimenTotal(item?.Specimen_Types?.PL)),
      group: 'apexcharts-axis-0'
    },
    {
      name: CHART_CONFIG.SPECIMEN_TYPES.OTHER.label,
      data: data.map((item) => calculateSpecimenTotal(item?.Specimen_Types?.Other)),
      group: 'apexcharts-axis-0'
    },
  ];

  return {
    labels,
    series
  };
};

/**
 * Prepares data for Excel export
 */
export const prepareExcelData = (data: Data[]): any[] => {
  if (!data || data.length === 0) {
    return [];
  }

  return data.map((item) => ({
    'Mês': item.Month_Name || '',
    'Ano': item.Year || '',
    'Expectoração': calculateSpecimenTotal(item?.Specimen_Types?.Sputum),
    'Fezes': calculateSpecimenTotal(item?.Specimen_Types?.Feces),
    'Urina': calculateSpecimenTotal(item?.Specimen_Types?.Urine),
    'Sangue': calculateSpecimenTotal(item?.Specimen_Types?.Blood),
    'Líquido Pleural': calculateSpecimenTotal(item?.Specimen_Types?.PL),
    'Outro': calculateSpecimenTotal(item?.Specimen_Types?.Other),
    'Total': [
      calculateSpecimenTotal(item?.Specimen_Types?.Sputum),
      calculateSpecimenTotal(item?.Specimen_Types?.Feces),
      calculateSpecimenTotal(item?.Specimen_Types?.Urine),
      calculateSpecimenTotal(item?.Specimen_Types?.Blood),
      calculateSpecimenTotal(item?.Specimen_Types?.PL),
      calculateSpecimenTotal(item?.Specimen_Types?.Other),
    ].reduce((sum, value) => sum + value, 0)
  }));
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Formats error messages for user display
 */
export const formatErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Tempo limite excedido. Tente novamente.';
    }
    
    if (error.response?.status === 404) {
      return 'Dados não encontrados para o período selecionado.';
    }
    
    if (error.response?.status >= 500) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    
    if (error.message.includes('Network Error')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return error.response?.data?.message || error.message || 'Erro ao carregar dados';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido ao carregar dados';
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the last twelve months time interval
 */
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
 * Validates if data is available and properly formatted
 */
export const validateData = (data: any): data is Data[] => {
  return Array.isArray(data) && data.length > 0 && data.every(item => 
    item && 
    typeof item.Month_Name === 'string' && 
    typeof item.Year === 'number' &&
    item.Specimen_Types &&
    typeof item.Specimen_Types === 'object'
  );
};