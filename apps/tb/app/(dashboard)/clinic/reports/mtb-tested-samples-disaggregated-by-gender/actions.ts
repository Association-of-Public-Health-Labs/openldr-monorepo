import axios, { AxiosError } from "axios";
import { API_CONFIG, CHART_CONFIG } from "./constants";

// ============================================================================
// TYPES
// ============================================================================
export type Data = {
  Disaggregation: boolean;
  End_Date: string;
  Facility: string;
  Facility_Type: string;
  Rif_Det_Female: number;
  Rif_Det_Indet: number;
  Rif_Det_Male: number;
  Rif_NotDet_Female: number;
  Rif_NotDet_Indet: number;
  Rif_NotDet_Male: number;
  Rif_Null_Female: number;
  Rif_Null_Indet: number;
  Rif_Null_Male: number;
  Start_Date: string;
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
  startDate.setDate(1);
  
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
    ultra: "Amostras Testadas Rifampicina Xpert MTB Ultra",
    xdr: "Amostras Testadas Rifampicina Xpert MTB XDR"
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
 * Fetch facility data from API
 */
export const fetchFacilityData = async (
  params: Record<string, any>
): Promise<Data[]> => {
  try {
    const response = await axios.get(API_CONFIG.BASE_URL, {
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
    
    console.error("Error fetching facility data:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Fetch patient data from API
 */
export const fetchPatientData = async (params: PatientDataParams): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams({
      disaggregation: "True",
      interval_dates: params.interval_dates,
      province: params.province,
      district: params.district,
      health_facility: params.health_facility,
      genexpert_result_type: params.genexpert_result_type,
    });

    const response = await fetch(
      `${API_CONFIG.BASE_URL}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching patient data:", error);
    throw error;
  }
};

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

export const prepareChartData = (data: Data[]): ChartData => {
  if (data.length === 0) {
    return { labels: [], series: [] };
  }

  const labels = data.map(item => item.Facility);
  
  // Create grouped stacked series
  const series = [
    // Male Group - Detected
    {
      name: "Masculino - Detetado",
      data: data.map(item => item.Rif_Det_Male),
      group: "male"
    },
    // Male Group - Not Detected
    {
      name: "Masculino - Não Detetado", 
      data: data.map(item => item.Rif_NotDet_Male),
      group: "male"
    },
    // Male Group - Null
    {
      name: "Masculino - Nulo",
      data: data.map(item => item.Rif_Null_Male),
      group: "male"
    },
    
    // Female Group - Detected
    {
      name: "Feminino - Detetado",
      data: data.map(item => item.Rif_Det_Female),
      group: "female"
    },
    // Female Group - Not Detected
    {
      name: "Feminino - Não Detetado",
      data: data.map(item => item.Rif_NotDet_Female),
      group: "female"
    },
    // Female Group - Null
    {
      name: "Feminino - Nulo",
      data: data.map(item => item.Rif_Null_Female),
      group: "female"
    },
    
    // Indetermined Group - Detected
    {
      name: "Não Informado - Detetado",
      data: data.map(item => item.Rif_Det_Indet),
      group: "indet"
    },
    // Indetermined Group - Not Detected
    {
      name: "Não Informado - Não Detetado",
      data: data.map(item => item.Rif_NotDet_Indet),
      group: "indet"
    },
    // Indetermined Group - Null
    {
      name: "Não Informado - Nulo",
      data: data.map(item => item.Rif_Null_Indet),
      group: "indet"
    }
  ];

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