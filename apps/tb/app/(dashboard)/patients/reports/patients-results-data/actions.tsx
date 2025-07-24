import { API_CONFIG } from "./constants";



export interface PatientDataParams {
  interval_dates: string;
  province: string;
  district: string;
  health_facility: string;
  genexpert_result_type: string;
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
    ultra: "Amostras Testadas Xpert MTB Ultra",
    xdr: "Amostras Testadas Xpert MTB XDR"
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
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching patient data:", error);
    throw error;
  }
};
