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
    getGenexpertResultType
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

export const fetchPatientData = async (
    params: PatientDataParams,
    token: string
): Promise<PatientDataParams[]> => {
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

    // Build series for rejected samples
    const series = [
        {
            name: "Amostras Rejeitadas",
            data: data.map(item => item.Rejected_Samples || 0),
            group: "apexcharts-axis-0"
        }
    ];

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
