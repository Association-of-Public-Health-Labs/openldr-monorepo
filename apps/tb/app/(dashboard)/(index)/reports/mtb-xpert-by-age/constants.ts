// =============================================================================
// TYPES
// =============================================================================

export interface SpecimenIndicatorsProps {
    Registered_Samples: number;
    Analysed_Samples: number;
    Detected_Samples: number;
    Not_Detected_Samples: number;
    Errors: number;
    Invalid_Samples: number;
}

export interface Data {
    Facility: string;
    "0_4": SpecimenIndicatorsProps;
    "5_9": SpecimenIndicatorsProps;
    "10_14": SpecimenIndicatorsProps;
    "15_19": SpecimenIndicatorsProps;
    "20_24": SpecimenIndicatorsProps;
    "25_29": SpecimenIndicatorsProps;
    "30_34": SpecimenIndicatorsProps;
    "35_39": SpecimenIndicatorsProps;
    "40_44": SpecimenIndicatorsProps;
    "45_49": SpecimenIndicatorsProps;
    "50_54": SpecimenIndicatorsProps;
    "55_59": SpecimenIndicatorsProps;
    "60_64": SpecimenIndicatorsProps;
    "65+": SpecimenIndicatorsProps;

}

export type ActiveTab = "ultra" | "xdr";

export interface TimeInterval {
    startDate: string;
    endDate: string;
}

export interface ReportState {
    timeInterval: TimeInterval;
    activeTab: ActiveTab;
    loading: boolean;
    error: string | null;
    data: Data[];
}

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API_CONFIG = {
    ENDPOINT: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/summary/positivity_by_lab_by_age/`,
    TIMEOUT: 60000, // 60 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second base delay
} as const;

// =============================================================================
// DEFAULTS
// =============================================================================

export const DEFAULTS = {
    ACTIVE_TAB: "ultra" as ActiveTab,
    REPORT_NAME: {
        ULTRA: "Relatório de Distribuição de Resultados por Faixa Etária - Ultra",
        XDR: "Relatório de Distribuição de Resultados por Faixa Etária - XDR",
    },
    SUBTITLE: "Últimos 12 meses",
    AGE_GROUPS: ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65+"],
} as const;

// =============================================================================
// CHART CONFIGURATION
// =============================================================================

export const CHART_CONFIG = {
    CHART_ID: "mtb-xpert-age-chart",
    HEIGHT: 350,
    Y_LABEL: "Número de Casos",
    SERIES_NAMES: {
        DETECTED: "Resultados Positivos",
        NOT_DETECTED: "Resultados Negativos",
        ERRORS: "Erros",
        INVALID: "Inválido",
    },
    COLORS: {
        ULTRA: ["#2563eb", "#16a34a", "#dc2626", "#ea580c"],
        XDR: ["#1d4ed8", "#15803d", "#b91c1c", "#c2410c"],
    },
} as const;

// =============================================================================
// UI CONFIGURATION
// =============================================================================

export const UI_CONFIG = {
    TABS: [
        { value: "ultra", label: "Ultra" },
        { value: "xdr", label: "XDR" },
    ],
    EXPORT_OPTIONS: {
        EXCEL: {
            LABEL: "Exportar para Excel",
            FILENAME_PREFIX: "MTB_Xpert_Por_Idade",
        },
        IMAGE: {
            LABEL: "Exportar imagem",
            FILENAME_PREFIX: "MTB_Xpert_Por_Idade_Chart",
            FORMAT: "png" as const,
        },
    },
    RESTART_LABEL: "Reiniciar o relatório",
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getLastTwelveMonths = (): TimeInterval => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 11);

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
};

export const getGenexpertResultType = (activeTab: ActiveTab): string => {
    return activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
};

export const formatDateInPortuguese = (dateString: string): string => {
    const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} de ${year}`;
};

export const getReportName = (activeTab: ActiveTab): string => {
    return activeTab === "ultra" ? DEFAULTS.REPORT_NAME.ULTRA : DEFAULTS.REPORT_NAME.XDR;
};
