import { api } from "../../../../../config/api";
import { 
    Data, 
    ActiveTab, 
    TimeInterval, 
    API_CONFIG, 
    DEFAULTS,
    CHART_CONFIG,
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
        
        return response.data || [];
    });
};

// =============================================================================
// DATA PROCESSING FUNCTIONS
// =============================================================================

export const prepareChartData = (data: Data[]) => {
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

    // Create a map to store data by age group
    const ageGroupData = data.reduce((acc, item) => {
        // Find the age group key (e.g., "0_4", "5_9", etc.)
        const ageGroupKey = Object.keys(item).find(key =>
            key !== "Type_Of_Result" &&
            key !== "Lab" &&
            key !== "Start_Date" &&
            key !== "End_Date" &&
            key !== "Facility"
        );

        if (ageGroupKey && item[ageGroupKey as keyof Data]) {
            // Convert underscore format to dash format for consistency
            const dashKey = ageGroupKey.replace('_', '-');
            acc[dashKey] = item[ageGroupKey as keyof Data];
        }
        return acc;
    }, {} as Record<string, any>);

    const series = [
        {
            name: CHART_CONFIG.SERIES_NAMES.DETECTED,
            data: labels.map(label => ageGroupData[label]?.Detected_Samples || 0),
            group: 'apexcharts-axis-0'
        },
        {
            name: CHART_CONFIG.SERIES_NAMES.NOT_DETECTED,
            data: labels.map(label => ageGroupData[label]?.Not_Detected_Samples || 0),
            group: 'apexcharts-axis-0'
        },
        {
            name: CHART_CONFIG.SERIES_NAMES.ERRORS,
            data: labels.map(label => ageGroupData[label]?.Errors || 0),
            group: 'apexcharts-axis-0'
        },
        {
            name: CHART_CONFIG.SERIES_NAMES.INVALID,
            data: labels.map(label => ageGroupData[label]?.Invalid_Samples || 0),
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

    // Create a map to store data by age group
    const ageGroupData = data.reduce((acc, item) => {
        const ageGroupKey = Object.keys(item).find(key =>
            key !== "Type_Of_Result" &&
            key !== "Lab" &&
            key !== "Start_Date" &&
            key !== "End_Date" &&
            key !== "Facility"
        );

        if (ageGroupKey && item[ageGroupKey as keyof Data]) {
            const dashKey = ageGroupKey.replace('_', '-');
            acc[dashKey] = item[ageGroupKey as keyof Data];
        }
        return acc;
    }, {} as Record<string, any>);

    return DEFAULTS.AGE_GROUPS.map(ageGroup => {
        const groupData = ageGroupData[ageGroup];
        const detected = groupData?.Detected_Samples || 0;
        const notDetected = groupData?.Not_Detected_Samples || 0;
        const errors = groupData?.Errors || 0;
        const invalid = groupData?.Invalid_Samples || 0;
        
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