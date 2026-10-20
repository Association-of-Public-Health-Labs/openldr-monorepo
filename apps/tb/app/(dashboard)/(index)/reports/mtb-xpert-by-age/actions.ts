import { api } from "../../../../../config/api";
import { 
    Data, 
    ActiveTab, 
    TimeInterval, 
    API_CONFIG, 
    DEFAULTS,
    CHART_CONFIG,
    ChartData,
    getGenexpertResultType 
} from "./constants";

// =============================================================================
// API FUNCTIONS
// =============================================================================

export const buildApiParams = (
    timeInterval: TimeInterval,
    activeTab: ActiveTab
) => {
    return {
        interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
        genexpert_result_type: getGenexpertResultType(activeTab)
    };
};


export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
    baseDelay: number = API_CONFIG.RETRY_DELAY
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

export const fetchDataFromApi = async (
    timeInterval: TimeInterval,
    activeTab: ActiveTab,
    getToken: () => Promise<string | null>
): Promise<Data[]> => {
    const params = buildApiParams(timeInterval, activeTab);
    
    return retryWithBackoff(async () => {
        const token = await getToken();
        
        const response = await api(token).get(API_CONFIG.ENDPOINT, {
            params,
            timeout: API_CONFIG.TIMEOUT,
        });
        
        return extractDataArray(response.data);
    });
};

// =============================================================================
// DATA PROCESSING FUNCTIONS
// =============================================================================

type ApiResponse =
    | Data[]
    | { data?: unknown; results?: unknown; items?: unknown; records?: unknown; detail?: unknown; message?: unknown };

type AgeGroupTotals = {
    detected: number;
    notDetected: number;
    errors: number;
    invalid: number;
};

const EMPTY_AGE_GROUP_TOTALS: AgeGroupTotals = {
    detected: 0,
    notDetected: 0,
    errors: 0,
    invalid: 0,
};

const getApiErrorMessage = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }

    if (value && typeof value === "object") {
        const detail = value as { detail?: unknown; message?: unknown; error?: unknown };
        return getApiErrorMessage(detail.detail ?? detail.message ?? detail.error ?? JSON.stringify(value));
    }

    return "Erro ao carregar dados";
};

const extractDataArray = (payload: ApiResponse): Data[] => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (!payload || typeof payload !== "object") {
        throw new Error("Resposta inválida da API: formato de dados inesperado.");
    }

    const apiError = payload.detail || payload.message;
    if (apiError) {
        throw new Error(getApiErrorMessage(apiError));
    }

    const candidate = payload.data ?? payload.results ?? payload.items ?? payload.records;
    if (Array.isArray(candidate)) {
        return candidate as Data[];
    }

    throw new Error("Resposta inválida da API: era esperado um array de registos por faixa etária.");
};

const toNumber = (value: number | string | null | undefined): number => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
};

const normalizeAgeGroup = (ageGroup: string | undefined): string | null => {
    if (!ageGroup) {
        return null;
    }

    const normalized = ageGroup.replace("_", "-").trim();
    return DEFAULTS.AGE_GROUPS.includes(normalized as typeof DEFAULTS.AGE_GROUPS[number])
        ? normalized
        : null;
};

const buildAgeGroupTotals = (data: Data[]): Record<string, AgeGroupTotals> => {
    return data.reduce<Record<string, AgeGroupTotals>>((accumulator, item) => {
        const ageGroup = normalizeAgeGroup(item.Age_Group ?? item.age_group);

        if (!ageGroup) {
            return accumulator;
        }

        const current = accumulator[ageGroup] ?? { ...EMPTY_AGE_GROUP_TOTALS };

        accumulator[ageGroup] = {
            detected: current.detected + toNumber(item.Detected_Samples),
            notDetected: current.notDetected + toNumber(item.Not_Detected_Samples),
            errors: current.errors + toNumber(item.Errors),
            invalid: current.invalid + toNumber(item.Invalid_Samples),
        };

        return accumulator;
    }, {});
};

export const prepareChartData = (data: Data[]): ChartData => {
    if (data.length === 0) {
        return {
            labels: [...DEFAULTS.AGE_GROUPS],
            series: [
                {
                    name: CHART_CONFIG.SERIES_NAMES.DETECTED,
                    data: new Array(DEFAULTS.AGE_GROUPS.length).fill(0),
                    group: 'apexcharts-axis-0'
                },
                {
                    name: CHART_CONFIG.SERIES_NAMES.NOT_DETECTED,
                    data: new Array(DEFAULTS.AGE_GROUPS.length).fill(0),
                    group: 'apexcharts-axis-0'
                },
                {
                    name: CHART_CONFIG.SERIES_NAMES.ERRORS,
                    data: new Array(DEFAULTS.AGE_GROUPS.length).fill(0),
                    group: 'apexcharts-axis-0'
                },
                {
                    name: CHART_CONFIG.SERIES_NAMES.INVALID,
                    data: new Array(DEFAULTS.AGE_GROUPS.length).fill(0),
                    group: 'apexcharts-axis-0'
                },
            ]
        };
    }

    const labels = [...DEFAULTS.AGE_GROUPS];
    const ageGroupData = buildAgeGroupTotals(data);

    const series = [
        {
            name: CHART_CONFIG.SERIES_NAMES.DETECTED,
            data: labels.map(label => ageGroupData[label]?.detected || 0),
            group: 'apexcharts-axis-0'
        },
        {
            name: CHART_CONFIG.SERIES_NAMES.NOT_DETECTED,
            data: labels.map(label => ageGroupData[label]?.notDetected || 0),
            group: 'apexcharts-axis-0'
        },
        {
            name: CHART_CONFIG.SERIES_NAMES.ERRORS,
            data: labels.map(label => ageGroupData[label]?.errors || 0),
            group: 'apexcharts-axis-0'
        },
        {
            name: CHART_CONFIG.SERIES_NAMES.INVALID,
            data: labels.map(label => ageGroupData[label]?.invalid || 0),
            group: 'apexcharts-axis-0'
        },
    ];

    return {
        labels,
        series
    };
};

export const prepareExcelData = (data: Data[], activeTab: ActiveTab) => {
    if (data.length === 0) {
        return DEFAULTS.AGE_GROUPS.map(ageGroup => ({
            'Faixa Etária': ageGroup,
            'MTB Detetado': 0,
            'MTB Não Detetado': 0,
            'Erros': 0,
            'Inválido': 0,
            'Total': 0
        }));
    }

    const ageGroupData = buildAgeGroupTotals(data);

    return DEFAULTS.AGE_GROUPS.map(ageGroup => {
        const groupData = ageGroupData[ageGroup];
        const detected = groupData?.detected || 0;
        const notDetected = groupData?.notDetected || 0;
        const errors = groupData?.errors || 0;
        const invalid = groupData?.invalid || 0;
        
        return {
            'Faixa Etária': ageGroup,
            'MTB Detetado': detected,
            'MTB Não Detetado': notDetected,
            'Erros': errors,
            'Inválido': invalid,
            'Total': detected + notDetected + errors + invalid
        };
    });
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getLastTwelveMonths = (): TimeInterval => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    // startDate.setDate(1);

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
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
