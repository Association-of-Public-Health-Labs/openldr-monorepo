import axios, { AxiosError } from "axios";
import { api } from "../../../../../config/api";
import { 
    API_CONFIG, 
    Data, 
    FacilityOptions, 
    TimeInterval, 
    ChartData, 
    FacilityType,
    ActiveTab,
    PatientDataParams,
    getGenexpertResultType,
    REJECTION_REASONS
} from "./constants";

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const buildApiParams = (
    timeInterval: TimeInterval,
    activeTab: ActiveTab,
    facilities: FacilityOptions[],
    facilityType: FacilityType,
    disaggregation: boolean
): Record<string, any> => {
    const baseParams = {
        interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
        genexpert_result_type: getGenexpertResultType(activeTab),
        disaggregation: disaggregation ? "True" : "False"
    };

    const facilityParams: Record<string, any> = {};

    // Only include parameters relevant to the current facility type
    if (facilityType === "province") {
        if (facilities.length > 0) {
            facilityParams.province = facilities.map(facility => facility.province || facility.value).filter(Boolean);
        }
    } else if (facilityType === "district") {
        if (facilities.length > 0) {
            const provinceValues = facilities.map(facility => facility.province || facility.value).filter(Boolean);
            if (provinceValues.length > 0) {
                facilityParams.province = provinceValues;
            }
            const districtValues = facilities.map(facility => facility.district).filter(Boolean);
            if (districtValues.length > 0) {
                facilityParams.district = districtValues;
            }
        }
    } else if (facilityType === "clinic") {
        if (facilities.length > 0) {
            const provinceValues = facilities.map(facility => facility.province || facility.value).filter(Boolean);
            if (provinceValues.length > 0) {
                facilityParams.province = provinceValues;
            }
            const districtValues = facilities.map(facility => facility.district).filter(Boolean);
            if (districtValues.length > 0) {
                facilityParams.district = districtValues;
            }
            facilityParams.clinic = facilities.map(facility => facility.value);
        }
    }

    return { ...baseParams, ...facilityParams };
};

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

export const fetchFacilityData = async (
    params: Record<string, any>,
    token: string
): Promise<Data[]> => {
    return retryWithBackoff(async () => {
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
    }, 3, 1000);
};

export const fetchPatientData = async (
    params: PatientDataParams,
    token: string
): Promise<PatientDataParams[]> => {
    return retryWithBackoff(async () => {
        try {
            const queryParams = new URLSearchParams({
                disaggregation: "True",
                interval_dates: params.interval_dates,
                province: params.province,
                district: params.district,
                health_facility: params.health_facility,
                genexpert_result_type: params.genexpert_result_type,
            });

            const response = await api(token).get(API_CONFIG.BASE_URL, {
                params: queryParams,
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

            console.error("Error fetching patient data:", errorMessage);
            throw new Error(errorMessage);
        }
    }, 2, 1000);
};

// ============================================================================
// DATA PROCESSING
// ============================================================================

export const prepareChartData = (data: Data[]): ChartData => {
    if (data.length === 0) {
        return { labels: [], series: [] };
    }

    // Get facility labels
    const labels = data.map(item => item.Facility);

    // Build series for each rejection reason
    const series = REJECTION_REASONS.map(reason => ({
        name: reason.label,
        data: data.map(item => (item as any)[reason.key] || 0),
        group: "apexcharts-axis-0"
    }));

    return { labels, series };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

export const getFacilityProperty = (facilityType: FacilityType, label: string) => {
    const facilityMap = {
      province: 'Provincia',
      district: 'Distrito',
      clinic: 'Unidade de Sanitária',
    };
  
    return { [facilityMap[facilityType]]: label };
};
