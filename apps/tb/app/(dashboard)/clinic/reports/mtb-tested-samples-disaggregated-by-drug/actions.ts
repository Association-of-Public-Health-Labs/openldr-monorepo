import axios, { AxiosError } from "axios";
import { api } from "../../../../../config/api";
import { API_CONFIG } from "./constants";

// Types
export type Data = {
  Facility: string;
  Rifampicin_Null: number;
  Rifampicin: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Isoniazid: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Fluoroquinolona: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Kanamicin: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Amikacin: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Capreomicin: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Ethionamide: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  End_Date: string;
  Disaggregation: boolean;
  Facility_Type: string;
  Type_Of_Result: string;
}

export const DEFAULT_DRUG = "Rifampicin";

export type FacilityOptions = {
  value: string;
  label: string;
  district: string;
  province: string;
}

export type TimeInterval = {
  startDate: string;
  endDate: string;
};

export type PatientDataParams = {
    interval_dates: string;
    province: string;
    district: string;
    health_facility: string;
    genexpert_result_type: string;
}

export type ChartData = {
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
 * Get Genexpert result type based on active tab
 */
export const getGenexpertResultType = (activeTab: ActiveTab): string => {
    const resultTypes = {
        ultra: "Ultra 6 Cores",
        xdr: "XDR 10 Cores"
    } as const;

    return resultTypes[activeTab];
};


export const getNextFacilityType = (currentType: FacilityType): FacilityType => {
    const facilityTypeHierarchy: Record<FacilityType, FacilityType> = {
        province: "district",
        district: "clinic",
        clinic: "province", // Reset to province for demo
        patients: "province"
    };

    return facilityTypeHierarchy[currentType];
};

export const buildApiParams = (
  timeInterval: TimeInterval,
  activeTab: ActiveTab,
  facilities: FacilityOptions[],
  facilityType: FacilityType,
  disaggregation: boolean
): Record<string, any> => {
  const baseParams = {
    interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
    disaggregation: disaggregation ? "True" : "False",
    genexpert_result_type: getGenexpertResultType(activeTab)
  };

  const facilityParams: Record<string, any> = {};

  // Only include parameters relevant to the current facility type
  if (facilityType === "province") {
    // When viewing provinces, only include province if we have specific provinces selected
    if (facilities.length > 0 && facilities[0].province) {
      facilityParams.province = facilities.map(facility => facility.province);
    }
  } else if (facilityType === "district") {
    // When viewing districts, include both province and district
    if (facilities.length > 0) {
      if (facilities[0].province) {
        facilityParams.province = facilities.map(facility => facility.province);
      }
      if (facilities[0].district) {
        facilityParams.district = facilities.map(facility => facility.district);
      }
    }
  } else if (facilityType === "clinic") {
    // When viewing clinics, include province, district, and clinic
    if (facilities.length > 0) {
      if (facilities[0].province) {
        facilityParams.province = facilities.map(facility => facility.province);
      }
      if (facilities[0].district) {
        facilityParams.district = facilities.map(facility => facility.district);
      }
      facilityParams.clinic = facilities.map(facility => facility.value);
    }
  }

  return { ...baseParams, ...facilityParams };
};

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

    console.error("Error fetching facility data:", errorMessage);
    throw new Error(errorMessage);
  }
};

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


export const prepareChartData = (
  data: Data[],
  selectedDrug?: string
): ChartData => {
  if (data.length === 0) {
    return { labels: [], series: [] };
  }

  // Available drugs in the data
  const availableDrugs = [
    "Rifampicin",
    "Isoniazid", 
    "Fluoroquinolona",
    "Kanamicin",
    "Amikacin",
    "Capreomicin",
    "Ethionamide"
  ];

  // Use selected drug or default to Rifampicin
  const drugToShow = selectedDrug || DEFAULT_DRUG;

  // Get facility labels
  const labels = data.map(item => item.Facility);

  // Helper function to get drug data safely
  const getDrugData = (item: Data, drug: string, type: 'Resistance_Detected' | 'Resistance_Not_Detected' | 'Resistance_Indeterminate') => {
    const drugData = item[drug as keyof Data];
    if (drugData && typeof drugData === 'object' && type in drugData) {
      return (drugData as any)[type] || 0;
    }
    return 0;
  };

  // Build series for the selected drug
  const series = [
    {
      name: "Resistente",
      data: data.map(item => getDrugData(item, drugToShow, 'Resistance_Detected')),
      group: "apexcharts-axis-0"
    },
    {
      name: "Sensível", 
      data: data.map(item => getDrugData(item, drugToShow, 'Resistance_Not_Detected')),
      group: "apexcharts-axis-0"
    },
    {
      name: "Indeterminado",
      data: data.map(item => getDrugData(item, drugToShow, 'Resistance_Indeterminate')),
      group: "apexcharts-axis-0"
    }
  ];

  return { labels, series };
};

/**
 * Get available drugs from data
 */
export const getAvailableDrugs = (): Array<{value: string, label: string}> => {
  return [
    { value: "Rifampicin", label: "Rifampicina" },
    { value: "Isoniazid", label: "Isoniazida" },
    { value: "Fluoroquinolona", label: "Fluoroquinolona" },
    { value: "Kanamicin", label: "Kanamicina" },
    { value: "Amikacin", label: "Amicacina" },
    { value: "Capreomicin", label: "Capreomicina" },
    { value: "Ethionamide", label: "Etionamida" }
  ];
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
