// Utility function moved from actions.ts to break circular dependency
export const getLastTwelveMonths = (): TimeInterval => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
};

// API Configuration
export const API_CONFIG = {
    BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/trl_samples_by_lab_in_days/`,
    TIMEOUT: 60000,
} as const;

// Default Values
export const DEFAULTS = {
    TIME_INTERVAL: getLastTwelveMonths(),
    FACILITY_TYPE: "province" as FacilityType,
    ACTIVE_TAB: "ultra" as const,
    DISAGGREGATION: false,
    REPORT_NAME: "Relatório do Tempo de Resposta em Dias",
    TIME_INTERVAL_TYPE: "colheita_us__recepcao_lab" as const,
} as const;

// Time Interval Options for the combobox
export const TIME_INTERVAL_OPTIONS = [
    { 
        value: "colheita_us__recepcao_lab", 
        label: "Colheita na US → Recepção no Lab",
        description: "Tempo entre colheita na unidade sanitária e recepção no laboratório"
    },
    { 
        value: "recepcao_lab__registo_no_lab", 
        label: "Recepção no Lab → Registo no Lab",
        description: "Tempo entre recepção e registo no laboratório"
    },
    { 
        value: "registo_no_lab__analise_no_lab", 
        label: "Registo no Lab → Análise no Lab",
        description: "Tempo entre registo e análise no laboratório"
    },
    { 
        value: "analise_no_lab__validacao_no_lab", 
        label: "Análise no Lab → Validação no Lab",
        description: "Tempo entre análise e validação no laboratório"
    },
] as const;

// Chart Configuration
export const CHART_CONFIG = {
    HEIGHT: 350,
    CHART_ID: "clinic_response_time_chart",
    SERIES_NAMES: {
        LESS_THAN_7: "Menos de 7 dias",
        BETWEEN_7_15: "7-15 dias",
        BETWEEN_16_21: "16-21 dias",
        GREATER_THAN_21: "Mais de 21 dias",
    },
    COLORS: {
        LESS_THAN_7: "#22c55e",      // Green - Good performance
        BETWEEN_7_15: "#eab308",     // Yellow - Acceptable
        BETWEEN_16_21: "#f97316",    // Orange - Concerning
        GREATER_THAN_21: "#ef4444",  // Red - Poor performance
    },
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

// TypeScript Interfaces
export interface ReportState {
    timeInterval: TimeInterval;
    activeTab: ActiveTab;
    timeIntervalType: TimeIntervalType;
    facilities: FacilityOptions[];
    facilityType: FacilityType;
    disaggregation: boolean;
    loading: boolean;
    error: string | null;
    data: ResponseTimeData[];
}

export interface PatientDialogState {
    open: boolean;
    data: any[];
    loading: boolean;
}

export interface ResponseTimeData {
    Laboratory: string;
    Total: number;
    Start_Date: string;
    End_Date: string;
    Type_Of_Result: string;
    Role: string;
    Analysis_Datetime_Null: number;
    Authorised_Datetime_Null: number;
    Received_Datetime_Null: number;
    Registered_Datetime_Null: number;
    Specimen_Datetime_Null: number;
    colheita_us__recepcao_lab: TimeIntervalData;
    recepcao_lab__registo_no_lab: TimeIntervalData;
    registo_no_lab__analise_no_lab: TimeIntervalData;
    analise_no_lab__validacao_no_lab: TimeIntervalData;
}

export interface TimeIntervalData {
    less_than_7: number;
    between_7_15: number;
    between_16_21: number;
    greater_than_21: number;
}

export interface FacilityOptions {
    value: string;
    label: string;
    district: string;
    province: string;
}

export interface PatientDataParams {
    interval_dates: string;
    province: string;
    district: string;
    health_facility: string;
    genexpert_result_type: string;
    time_interval_type: string;
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
export type ActiveTab = "ultra" | "xdr";
export type TimeIntervalType = "colheita_us__recepcao_lab" | "recepcao_lab__registo_no_lab" | "registo_no_lab__analise_no_lab" | "analise_no_lab__validacao_no_lab";
