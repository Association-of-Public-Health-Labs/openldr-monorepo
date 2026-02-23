import { API_CONFIG } from "./constants";
import { api } from "../../../../../config/api";
import { AxiosError } from "axios";

// Types
export type Data = {
  Month: number;
  Month_Name: string;
  Year: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;
  Role: string;
  Facilities: string[];
  colheita_us__recepcao_lab: number;
  recepcao_lab__registo_no_lab: number;
  registo_no_lab__analise_no_lab: number;
  analise_no_lab__validacao_no_lab: number;
}

export interface FacilityOptions {
  value: string;
  label: string;
  district: string;
  province: string;
}

export type FacilityType = "province" | "district" | "clinic" | "patients";
export type ActiveTab = "ultra" | "xdr";

export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export interface ChartData {
  labels: string[];
  series: Array<{ name: string; data: number[]; group: string }>;
}

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

const formatMonthLabel = (monthName: string, year: number, shouldIncludeYear: boolean): string => {
  const monthData = PORTUGUESE_MONTHS[monthName];

  if (!monthData) {
    return shouldIncludeYear ? `${monthName.substring(0, 3)} ${year}` : monthName;
  }

  return shouldIncludeYear ? `${monthData.short} ${year}` : monthData.full;
};

const shouldShowYearInLabels = (data: Array<{ Year: number }>): boolean => {
  if (data.length === 0) return false;
  if (data.length > 13) return true;
  const years = new Set(data.map(item => item.Year));
  return years.size > 1;
};

// Retry mechanism with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
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

// Helper function to get last 12 months date range
export const getLastTwelveMonths = (): TimeInterval => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  return activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
};

export const getReportName = (activeTab: ActiveTab): string => {
  return activeTab === "ultra"
    ? "Relatório de Tempo de Resposta por Mês - Ultra"
    : "Relatório de Tempo de Resposta por Mês - XDR";
};

export const buildApiParams = (
  timeInterval: TimeInterval,
  activeTab: ActiveTab,
  facilities: FacilityOptions[],
  facilityType: FacilityType,
  disaggregation: boolean
): Record<string, any> => {
  const baseParams: Record<string, any> = {
    interval_dates: `${timeInterval.startDate},${timeInterval.endDate}`,
    genexpert_result_type: getGenexpertResultType(activeTab),
    disaggregation: disaggregation ? "True" : "False",
  };

  const facilityParams: Record<string, any> = {};

  if ((facilityType === "province" || facilityType === "district") && facilities.length > 0) {
    facilityParams.province = facilities.map(f => f.province);
  }
  if (facilityType === "clinic" && facilities.length > 0) {
    facilityParams.province = facilities.map(f => f.province);
    facilityParams.district = facilities.map(f => f.district);
  }

  return { ...baseParams, ...facilityParams };
};

export const fetchTurnaroundData = async (
  params: Record<string, any>,
  token: string | null
): Promise<Data[]> => {
  try {
    const response = await api(token).get(API_CONFIG.ENDPOINT, {
      params,
      paramsSerializer: { indexes: null },
      timeout: API_CONFIG.TIMEOUT
    });
    return response.data?.length ? response.data : [];
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? error.response?.data?.message || error.message
      : error instanceof Error ? error.message : "An error occurred";
    throw new Error(errorMessage);
  }
};

export const prepareChartData = (data: Data[]): ChartData => {
  if (data.length === 0) {
    return { labels: [], series: [] };
  }

  const includeYear = shouldShowYearInLabels(data);
  const labels = data.map(item => formatMonthLabel(item.Month_Name, item.Year, includeYear));

  const series = [
    {
      name: 'Colheita US → Recepção Lab',
      data: data.map(item => item.colheita_us__recepcao_lab || 0),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Recepção Lab → Registo no Lab',
      data: data.map(item => item.recepcao_lab__registo_no_lab || 0),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Registo no Lab → Análise no Lab',
      data: data.map(item => item.registo_no_lab__analise_no_lab || 0),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Análise no Lab → Validação no Lab',
      data: data.map(item => item.analise_no_lab__validacao_no_lab || 0),
      group: 'apexcharts-axis-0'
    },
  ];

  return { labels, series };
};

export const getNextFacilityType = (currentType: FacilityType): FacilityType => {
  const hierarchy: Record<FacilityType, FacilityType> = {
    province: "district",
    district: "clinic",
    clinic: "province",
    patients: "province"
  };
  return hierarchy[currentType];
};

export const createFacilityOptions = (
  label: string,
  currentFacilityType: FacilityType,
  currentFacilities: FacilityOptions[]
): FacilityOptions => {
  const currentFacility = currentFacilities[0];
  return {
    value: label,
    label,
    district: currentFacilityType === "district" ? label : currentFacility?.district || "",
    province: currentFacilityType === "province" ? label : currentFacility?.province || ""
  };
};
