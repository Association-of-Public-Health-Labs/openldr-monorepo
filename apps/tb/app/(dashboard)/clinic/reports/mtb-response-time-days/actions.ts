import axios, { AxiosError } from "axios";
import { api } from "../../../../../config/api";
import { 
  API_CONFIG, 
  Data, 
  TimeInterval, 
  FacilityType, 
  ActiveTab, 
  FacilityOptions, 
  ChartData, 
  TimeIntervalType,
  PatientDataParams,
  TimeIntervalData,
  ExcelData,
  getGenexpertResultType,
  formatDateInPortuguese,
  getReportName,
  getNextFacilityType,
  CHART_CONFIG,
  StackedSerieProps
} from "./constants";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error as Error;
      
      console.error(`❌ MTB Response Time API Error (attempt ${i + 1}/${maxRetries + 1}):`, {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        params: error?.config?.params,
        timeout: error?.code === 'ECONNABORTED' ? 'Timeout' : 'No'
      });
      
      if (i === maxRetries) {
        // Provide user-friendly error message
        if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
          throw new Error('Tempo limite excedido. Tente novamente.');
        } else if (error?.message?.includes('Network Error')) {
          throw new Error('Erro de rede. Verifique sua conexão e tente novamente.');
        } else if (error?.response?.status === 404) {
          throw new Error('Dados não encontrados para os filtros selecionados.');
        } else if (error?.response?.status >= 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        } else {
          throw new Error(`Erro na API: ${error?.message || 'Erro desconhecido'}`);
        }
      }
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Build API parameters for facility data requests
 */
export const buildApiParams = (
  timeInterval: TimeInterval,
  facilities: FacilityOptions[],
  facilityType: FacilityType,
  disaggregation: boolean,
  activeTab: ActiveTab
) => {
  const baseParams: any = {
    interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
    disaggregation: disaggregation ? "True" : "False",
    genexpert_result_type: getGenexpertResultType(activeTab),
  };

    const facilityParams: Record<string, any> = {};

    if (facilities.length > 0) {
        if (facilityType === "province" || facilityType === "district") {
            facilityParams.province = facilities.map(facility => facility.province || facility.value).filter(Boolean);
        }
        if (facilityType === "district") {
            const districtValues = facilities.map(facility => facility.district).filter(Boolean);
            if (districtValues.length > 0) {
                facilityParams.district = districtValues;
            }
        }
        if (facilityType === "clinic") {
            const provinceValues = facilities.map(facility => facility.province || facility.value).filter(Boolean);
            if (provinceValues.length > 0) {
                facilityParams.province = provinceValues;
            }
            const districtValues = facilities.map(facility => facility.district).filter(Boolean);
            if (districtValues.length > 0) {
                facilityParams.district = districtValues;
            }
            facilityParams.facility_type = "health_facility";
        }
    }

    return { ...baseParams, ...facilityParams };
}

/**
 * Fetch facility data from API
 */
export const fetchFacilityData = async (
  params: Record<string, any>,
  token: string
): Promise<Data[]> => {
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
    const errorMessage = error instanceof AxiosError
      ? error.response?.data?.message || error.message
      : error instanceof Error ? error.message : "An error occurred";
    throw new Error(errorMessage);
  }
};

/**
 * Fetch patient data for clinic-level drill-down
 */
export const fetchPatientData = async (params: PatientDataParams, token: string): Promise<any[]> => {
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
        throw error;
    }
};

/**
 * Create facility options for drill-down functionality
 */
export function createFacilityOptions(
  label: string,
  currentFacilityType: FacilityType,
  currentFacilities: FacilityOptions[]
): FacilityOptions {
  const facility: FacilityOptions = {
    value: label,
    label: label,
  };

  // Build facility hierarchy based on current facility type and clicked labels
  if (currentFacilityType === "province") {
    // Clicking on a province - set this as the province for district drill-down
    facility.province = label;
  } else if (currentFacilityType === "district") {
    // Clicking on a district - preserve province from previous level, set district
    if (currentFacilities.length > 0) {
      facility.province = currentFacilities[0].province; // Previous province click
    }
    facility.district = label;
  } else if (currentFacilityType === "clinic") {
    // Clicking on a clinic - preserve province and district from previous levels
    if (currentFacilities.length > 0) {
      facility.province = currentFacilities[0].province; // Previous province click
    }
    if (currentFacilities.length > 1) {
      facility.district = currentFacilities[1].district; // Previous district click
    }
    facility.clinic = label;
  }

  return facility;
}

/**
 * Prepare chart data for stacked bar chart
 */
export function prepareChartData(
  data: Data[],
  timeIntervalType: TimeIntervalType
): { labels: string[], series: StackedSerieProps[] } {
  if (!data || data.length === 0) {
    return { labels: [], series: [] };
  }

  // Filter out items that don't have valid time interval data
  const validData = data.filter(item => {
    const timeIntervalData = item[timeIntervalType];
    return timeIntervalData && 
           typeof timeIntervalData === 'object' &&
           typeof timeIntervalData.less_than_7 === 'number' &&
           typeof timeIntervalData.between_7_15 === 'number' &&
           typeof timeIntervalData.between_16_21 === 'number' &&
           typeof timeIntervalData.greater_than_21 === 'number';
  });

  if (validData.length === 0) {
    console.warn('No valid data found for chart preparation');
    return { labels: [], series: [] };
  }

  const labels = validData.map(item => item.Facility);

  const series: StackedSerieProps[] = [
    {
      name: "< 7 dias",
      data: validData.map(item => item[timeIntervalType].less_than_7),
    },
    {
      name: "7-15 dias",
      data: validData.map(item => item[timeIntervalType].between_7_15),
    },
    {
      name: "16-21 dias", 
      data: validData.map(item => item[timeIntervalType].between_16_21),
    },
    {
      name: "> 21 dias",
      data: validData.map(item => item[timeIntervalType].greater_than_21),
    },
  ];

  console.log('Prepared chart data:', { labels, series });
  return { labels, series };
}

/**
 * Prepare Excel data
 */
export function prepareExcelData(
  data: Data[],
  timeIntervalType: TimeIntervalType
): ExcelData[] {
  if (!data || data.length === 0) {
    return [];
  }

  // Filter out items that don't have valid time interval data
  const validData = data.filter(item => {
    const timeIntervalData = item[timeIntervalType];
    return timeIntervalData && 
           typeof timeIntervalData === 'object' &&
           typeof timeIntervalData.less_than_7 === 'number' &&
           typeof timeIntervalData.between_7_15 === 'number' &&
           typeof timeIntervalData.between_16_21 === 'number' &&
           typeof timeIntervalData.greater_than_21 === 'number';
  });

  return validData.map(item => {
    const intervalData = item[timeIntervalType];
    return {
      Facility: item.Facility,
      "< 7 dias": intervalData.less_than_7,
      "7-15 dias": intervalData.between_7_15,
      "16-21 dias": intervalData.between_16_21,
      "> 21 dias": intervalData.greater_than_21,
      Total: intervalData.less_than_7 + intervalData.between_7_15 + intervalData.between_16_21 + intervalData.greater_than_21,
    };
  });
}

// ============================================================================
// EXPORT TYPES AND FUNCTIONS
// ============================================================================

export type { 
  Data, 
  TimeInterval, 
  FacilityType, 
  ActiveTab, 
  FacilityOptions, 
  ChartData, 
  TimeIntervalType,
  TimeIntervalData,
  PatientDataParams,
  ExcelData
};

export { 
  getGenexpertResultType,
  formatDateInPortuguese,
  getReportName,
  getNextFacilityType
};
