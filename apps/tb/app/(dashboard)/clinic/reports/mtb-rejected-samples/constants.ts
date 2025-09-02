// Types
export type Data = {
    Facility: string;
    Rejected_Samples: number;
    End_Date: string;
    Start_Date: string;
    Lab_Type: string;
    Type_Of_Result: string;
    Role: string;
}

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

export interface PatientDataParams {
    interval_dates: string;
    province: string;
    district: string;
    health_facility: string;
    genexpert_result_type: string;
}

// Utility Functions
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

// API Configuration
export const API_CONFIG = {
  BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/rejected_samples/`,
  TIMEOUT: 60000,
} as const;

// Default Values
export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  DISAGGREGATION: false,
  REPORT_NAME: "Relatório de Amostras Rejeitadas",
  ACTIVE_TAB: "ultra" as ActiveTab,
} as const;

// Tab Configuration
export const TABS = [
  { value: "ultra" as ActiveTab, label: "Ultra" },
  { value: "xdr" as ActiveTab, label: "XDR" },
] as const;

// Chart Configuration
export const CHART_CONFIG = {
  HEIGHT: 350,
  CHART_ID: "clinic_rejected_samples_chart",
  SERIES_NAME: "Amostras Rejeitadas",
} as const;

// UI Configuration
export const UI_CONFIG = {
    TAB_OPTIONS: [
        { value: "ultra", label: "Ultra" },
        { value: "xdr", label: "XDR" },
    ] as const,
    MAIN_CARD_OPTIONS: {
        HEIGHT: "auto",
        LAB_TYPE: "poc",
        REPORT_TYPE: "facility",
        SUBTITLE: "Últimos 12 meses",
    } as const,
} as const;
