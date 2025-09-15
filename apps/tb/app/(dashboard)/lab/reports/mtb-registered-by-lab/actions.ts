import { AxiosError } from "axios";
import { API_CONFIG, CHART_CONFIG } from "./constants";
import { api } from "../../../../../config/api";

// ============================================================================
// TYPES
// ============================================================================
export type Data = {
  End_Date: string;
  Lab_Type: string;
  Resgistered_Samples: number;
  Start_Date: string;
  Testing_Facility: string;
  Type_Of_Result: string;
}

export interface FacilityOptions {
  value: string;
  label: string;
  district: string;
  province: string;
}

export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export interface PatientDataParams {
  interval_dates: string;
  province: string;
  district: string;
  health_facility: string;
  genexpert_result_type: string;
}

export interface ChartData {
  labels: string[];
  series: Array<{
    name: string;
    data: number[];
    group: string;
  }>;
}

export type FacilityType = "province" | "district" | "clinic" | "patients";
export type ActiveTab = "ultra" | "xdr";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the last 12 months date range
 */
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
 * Get Genexpert result type based on active tab
 */
export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  const resultTypes = {
    ultra: "Ultra 6 Cores",
    xdr: "XDR 10 Cores"
  } as const;
  
  return resultTypes[activeTab];
};

/**
 * Get report name based on active tab
 */
export const getReportName = (activeTab: ActiveTab): string => {
  const reportNames = {
    ultra: "Relatório de amostras registadas por laboratório - Ultra",
    xdr: "Relatório de amostras registadas por laboratório - XDR"
  } as const;
  
  return reportNames[activeTab];
};

/**
 * Get next facility type in the hierarchy
 */
export const getNextFacilityType = (currentType: FacilityType): FacilityType => {
  const facilityTypeHierarchy: Record<FacilityType, FacilityType> = {
    province: "district",
    district: "clinic",
    clinic: "province", // Reset to province for demo
    patients: "province"
  };
  
  return facilityTypeHierarchy[currentType];
};

/**
 * Retry function with exponential backoff
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
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Build API parameters for facility data request
 */
export const buildApiParams = (
  timeInterval: TimeInterval,
  activeTab: ActiveTab,
  facilities: FacilityOptions[],
  facilityType: FacilityType,
  disaggregation: boolean
): Record<string, any> => {
  const baseParams = {
    interval_dates: `${timeInterval.startDate},${timeInterval.endDate}`,
    genexpert_result_type: getGenexpertResultType(activeTab),
    disaggregation: disaggregation ? "True" : "False"
  };

  const facilityParams = {
    ...(facilityType === "province" || facilityType === "district") && {
      province: facilities.map(facility => facility.province)
    },
    ...(facilityType === "district" && {
      province: facilities.map(facility => facility.province),
    }),
    ...(facilityType === "clinic" && {
      province: facilities.map(facility => facility.province),
      district: facilities.map(facility => facility.district),
      facility_type: "health_facility"
    }),
  };

  return { ...baseParams, ...facilityParams };
};

/**
 * Fetch facility data from API with retry mechanism
 */
export const fetchFacilityData = async (
  params: Record<string, any>,
  token: string
): Promise<Data[]> => {
  const fetchData = async (): Promise<Data[]> => {
    try {
      const response = await api(token).get(API_CONFIG.BASE_URL, {
        params,
        paramsSerializer: { indexes: null },
        timeout: API_CONFIG.TIMEOUT
      });

      if (!response.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Tempo limite excedido. Tente novamente.');
        }
        if (error.response?.status === 404) {
          throw new Error('Dados não encontrados para os critérios selecionados.');
        }
        if (error.response?.status >= 500) {
          throw new Error('Erro do servidor. Tente novamente em alguns minutos.');
        }
        throw new Error(error.response?.data?.message || error.message);
      }
      throw new Error(error instanceof Error ? error.message : "Erro desconhecido");
    }
  };

  return retryWithBackoff(fetchData, 3, 1000);
};

/**
 * Fetch patient data from API with retry mechanism
 */
export const fetchPatientData = async (params: PatientDataParams, token: string): Promise<any[]> => {
  const fetchData = async (): Promise<any[]> => {
    try {
      const queryParams = new URLSearchParams({
        disaggregation: "True",
        interval_dates: params.interval_dates,
        province: params.province,
        district: params.district,
        health_facility: params.health_facility,
        genexpert_result_type: params.genexpert_result_type,
      });

      const response = await api(token).get(
        `${API_CONFIG.BASE_URL}?${queryParams.toString()}`,
        {
          params: queryParams,
          paramsSerializer: { indexes: null },
          timeout: API_CONFIG.TIMEOUT  
        }
      );

      if (!response.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Tempo limite excedido ao buscar dados do paciente.');
        }
        if (error.response?.status === 404) {
          throw new Error('Dados do paciente não encontrados.');
        }
        if (error.response?.status >= 500) {
          throw new Error('Erro do servidor ao buscar dados do paciente.');
        }
        throw new Error(error.response?.data?.message || error.message);
      }
      throw new Error(error instanceof Error ? error.message : "Erro desconhecido");
    }
  };

  return retryWithBackoff(fetchData, 2, 1000);
};

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Prepare chart data from API response
 */
export const prepareChartData = (data: Data[]): ChartData => {
  if (!data?.length) {
    return { labels: [], series: [] };
  }

  const labels = data.map(item => item.Testing_Facility);
  const series = [{
    name: CHART_CONFIG.SERIES_NAME,
    data: data.map(item => item.Resgistered_Samples),
    group: 'apexcharts-axis-0'
  }];

  return { labels, series };
};

/**
 * Create new facility options from clicked label
 */
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