import axios, { AxiosError } from "axios";
import { API_CONFIG, CHART_CONFIG } from "./constants";
import { api } from "../../../../../config/api";

// ============================================================================
// TYPES
// ============================================================================
export type Data = {
    Disaggregation: boolean;
    End_Date: string;
    Facility: string;
    Facility_Type: string | null;
    Rif_Det_Female: number;
    Rif_Det_Indet: number;
    Rif_Det_Male: number;
    Rif_NotDet_Female: number;
    Rif_NotDet_Indet: number;
    Rif_NotDet_Male: number;
    Rif_Null_Female: number;
    Rif_Null_Indet: number;
    Rif_Null_Male: number;
    Role: string;
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
        color?: string;
        group?: string;
    }>;
}

export type FacilityType = "province" | "district" | "clinic" | "patients";
export type ActiveTab = "ultra" | "xdr";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getLastTwelveMonths = () => {
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

export const getGenexpertResultType = (activeTab: ActiveTab): string => {
    const resultTypes = {
        ultra: "Ultra 6 Cores",
        xdr: "XDR 10 Cores"
    } as const;

    return resultTypes[activeTab];
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

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

export const prepareChartData = (data: Data[]): ChartData => {
    if (!data || data.length === 0) {
        return { labels: [], series: [] };
    }

    const labels = data.map(item => item.Facility);

    // Create grouped stacked series for ApexCharts with custom colors
    const series = [
        // Male Group - Stacked (Orange/Red variations)
        {
            name: "Masculino - Resistente",
            data: data.map(item => item.Rif_Det_Male),
            group: "masculino",
            color: "#00695c", // Darker orange/red for better contrast
        },
        {
            name: "Masculino - Sensível",
            data: data.map(item => item.Rif_NotDet_Male),
            group: "masculino",
            color: "#4db6ac", // Lighter orange/red
        },
        // Female Group - Stacked (Teal/Blue variations)
        {
            name: "Feminino - Resistente",
            data: data.map(item => item.Rif_Det_Female),
            group: "feminino",
            color: "#d63900", // Darker teal for better contrast 
        },
        {
            name: "Feminino - Sensível",
            data: data.map(item => item.Rif_NotDet_Female),
            group: "feminino",
            color: "#ff7a47", // Lighter teal 
        },
    ];

    return { labels, series };
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const buildApiParams = (
    timeInterval: TimeInterval,
    activeTab: ActiveTab,
    facilities: FacilityOptions[],
    facilityType: FacilityType,
    disaggregation: boolean = false
) => {
    const baseParams: any = {
        interval_dates: `${timeInterval.startDate},${timeInterval.endDate}`,
        genexpert_result_type: getGenexpertResultType(activeTab),
        disaggregation: disaggregation ? "True" : "False"
    };

    // If we have facilities selected, add facility parameter for disaggregation
    if (facilities.length > 0) {
        const facility = facilities[0]; // Use the first facility
        baseParams.facility = facility.value;
    }

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
