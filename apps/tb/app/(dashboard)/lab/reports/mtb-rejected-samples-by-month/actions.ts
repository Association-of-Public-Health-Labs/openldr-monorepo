
// // Types
// export type Data = {
//   Month: number;
//   Month_Name: string;
//   Year: number;
//   Rejected_Samples: number;
//   Start_Date: string;
//   End_Date: string;
//   Type_Of_Result: string;
//   Lab_Type: string;
//   Facilities: string[];
// }

// export type FacilityOptions = {
//   value: string;
//   label: string;
//   district: string;
//   province: string;
// }

// export type LabType = "All" | "Conventional" | "Point_Of_Care";
// export type ActiveTab = "ultra" | "xdr";

// // Helper function to get last 12 months date range
// export const getLastTwelveMonths = () => {
//   const endDate = new Date();
//   const startDate = new Date();
//   startDate.setMonth(endDate.getMonth() - 11);
//   startDate.setDate(1); // Set to first day of the month
  
//   const formatDate = (date: Date) => {
//     return date.toISOString().split('T')[0]; // Returns "YYYY-MM-DD" format
//   };

//   return {
//     startDate: formatDate(startDate),
//     endDate: formatDate(endDate)
//   };
// };

// // Helper functions
// export const getGenexpertResultType = (activeTab: ActiveTab): string => {
//   return activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
// };

// export const getReportName = (activeTab: ActiveTab): string => {
//   return activeTab === "ultra" 
//     ? "Relatório Xpert MTB Ultra Rejeitadas por mês" 
//     : "Relatório Xpert MTB XDR Rejeitadas por mês";
// };  

// export const buildApiParams = (
//   timeInterval: { startDate: string; endDate: string },
//   activeTab: ActiveTab,
//   labs: FacilityOptions[],
//   labType: LabType,
//   disaggregation: boolean
// ) => {
//   const baseParams = {
//     interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
//     genexpert_result_type: getGenexpertResultType(activeTab),
//     disaggregation: disaggregation ? "True" : "False",
//     type_of_laboratory: labType
//   };

//   const labParams = {
//     // ...(facilityType === "province" || facilityType === "district") && {
//     //   province: facilities.map(facility => facility.province)
//     // },
//     // ...(facilityType === "district" && {
//     //   district: facilities.map(facility => facility.district)
//     // }),
//     // ...(facilityType === "clinic" && {
//     //   clinic: facilities.map(facility => facility.value)
//     // })
//   };

//   return { ...baseParams, ...labParams };
// };

// export const prepareChartData = (data: Data[]) => {
//   if (data.length === 0) {
//     return { labels: [], series: [] };
//   }

//   const labels = data.map(item => item.Month_Name);
//   const series = [{
//     name: 'Amostras Rejeitadas',
//     data: data.map(item => item.Rejected_Samples),
//     group: 'apexcharts-axis-0'
//   }];

//   return { labels, series };
// };


import { API_CONFIG } from "./constants";
import { api } from "../../../../../config/api";
import { AxiosError } from "axios";

// Types
export interface FacilityOptions {
  value: string;
  label: string;
  district: string;
  province: string;
}

export type Data = {
  Month: number;
  Month_Name: string;
  Year: number;
  Rejected_Samples: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;
  Lab_Type: string;
  Facilities: string[];
}

export interface PatientDataParams {
  interval_dates: string;
  province: string;
  district: string;
  health_facility: string;
  genexpert_result_type: string;
}

export interface TimeInterval {
  startDate: string;
  endDate: string;
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
export type LabType = "All" | "Conventional" | "Point_Of_Care";
export type ActiveTab = "ultra" | "xdr";

// Helper function to get last 12 months date range
export const getLastTwelveMonths = (): TimeInterval => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 11);
  startDate.setDate(1);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

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
export const formatMonthLabel = (monthName: string, year: number, shouldIncludeYear: boolean): string => {
  const monthData = PORTUGUESE_MONTHS[monthName];

  if (!monthData) {
    return shouldIncludeYear ? `${monthName.substring(0, 3)} ${year}` : monthName;
  }

  return shouldIncludeYear ? `${monthData.short} ${year}` : monthData.full;
};

/**
 * Check if chart data should include year in labels
 */
export const shouldShowYearInLabels = (data: Array<{ Year: number }>): boolean => {
  if (data.length === 0) return false;
  if (data.length > 13) return true;
  const years = new Set(data.map(item => item.Year));
  return years.size > 1;
};


// Helper functions
export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  const resultTypes = {
    ultra: "Ultra 6 Cores",
    xdr: "XDR 10 Cores"
  } as const;
  
  return resultTypes[activeTab];
};

export const getReportName = (activeTab: ActiveTab): string => {
  const reportNames = {
    ultra: "Relatório Xpert MTB Ultra por mês",
    xdr: "Relatório Xpert MTB XDR por mês"
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

  const districtValues = [...new Set(facilities.map(facility => facility.district).filter(district => district != null && district != ""))]
  const provinceValues = [...new Set(facilities.map(facility => facility.province).filter(province => province != null && province != ""))]
  
  return { 
    ...baseParams, 
    ...(districtValues?.length > 0 && {district: districtValues}),
    ...(provinceValues?.length > 0 && {province: provinceValues}),
  };
};

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
      paramsSerializer: { 
        indexes: null 
      },
      timeout: API_CONFIG.TIMEOUT
    });
    console.log("response", response.data)

    if (!response.data?.length) {
      return [];
    }

    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? error.response?.data?.message || error.message
      : error instanceof Error ? error.message : "An error occurred";
    
    console.error("Error fetching facility data:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Fetch patient data from API
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
    console.error("Error fetching patient data:", error);
    throw error;
  }
};

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Prepare chart data from API response
 */
export const prepareChartData = (data: Data[]): ChartData => {
  if (data.length === 0) {
    return { labels: [], series: [] };
  }

  const includeYear = shouldShowYearInLabels(data);
  const labels = data.map(item => formatMonthLabel(item.Month_Name, item.Year, includeYear));
  const series = [{
    name: 'Amostras Rejeitadas',
    data: data.map(item => item.Rejected_Samples),
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

export async function fetchLabsFromApi(token: string) {
  const response = await api(token).get(`${process.env.NEXT_PUBLIC_OPENLDR_API}/dict/facilities/province/districts/`);
  return response.data;
}
