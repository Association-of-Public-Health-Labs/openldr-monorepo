// Types
export type Data = {
    Facility: string;
    Rejected_Samples: number;
    Double_Registration: number;
    Equipment_Failure: number;
    Isuficient_Specimen: number;
    Laboratory_Acident: number;
    Missing_Reagent: number;
    Other: number;
    Repeat_Specimen_Collection: number;
    Specimen_Not_Labeled: number;
    Specimen_Not_Received: number;
    Specimen_Unsuitable_For_Testing: number;
    Technical_Error: number;
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

// Rejection Reason Categories
export const REJECTION_REASONS = [
    { key: 'Double_Registration', label: 'Registo Duplo', color: '#FF6B6B' },
    { key: 'Equipment_Failure', label: 'Falha do Equipamento', color: '#4ECDC4' },
    { key: 'Isuficient_Specimen', label: 'Amostra Insuficiente', color: '#45B7D1' },
    { key: 'Laboratory_Acident', label: 'Acidente Laboratorial', color: '#96CEB4' },
    { key: 'Missing_Reagent', label: 'Reagente em Falta', color: '#FFEAA7' },
    { key: 'Other', label: 'Outros', color: '#DDA0DD' },
    { key: 'Repeat_Specimen_Collection', label: 'Repetir Colheita', color: '#98D8C8' },
    { key: 'Specimen_Not_Labeled', label: 'Amostra Não Rotulada', color: '#F7DC6F' },
    { key: 'Specimen_Not_Received', label: 'Amostra Não Recebida', color: '#BB8FCE' },
    { key: 'Specimen_Unsuitable_For_Testing', label: 'Amostra Inadequada', color: '#85C1E9' },
    { key: 'Technical_Error', label: 'Erro Técnico', color: '#F8C471' },
] as const;

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
  BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/rejected_samples_by_reason/`,
  TIMEOUT: 60000,
} as const;

// Default Values
export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  DISAGGREGATION: false,
  REPORT_NAME: "Relatório de Amostras Rejeitadas por Motivo",
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
  CHART_ID: "clinic_rejected_samples_by_reason_chart",
  SERIES_NAME: "Amostras Rejeitadas por Motivo",
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
