import axios, { AxiosError } from "axios";
import { API_CONFIG, CHART_CONFIG } from "./constants";
import { api } from "../../../../../config/api";

// ============================================================================
// TYPES
// ============================================================================

export interface Data {
    Analysed_Samples: number;
    Detected_Samples: number;
    End_Date: string;
    Errors: number;
    Invalid_Samples: number;
    Lab: string;
    Month: number;
    Month_Name: string;
    Not_Detected_Samples: number;
    Registered_Samples: number;
    Start_Date: string;
    Type_Of_Result: string;
    Year: number;
}

export interface TimeInterval {
    startDate: string;
    endDate: string;
}

export interface ChartData {
    label: string;
    data: number;
    fill: string;
}

export interface PieChartConfig {
    [key: string]: {
        label: string;
        color: string;
    };
}

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

/**
 * Get report name based on active tab
 */
export const getReportName = (activeTab: ActiveTab): string => {
    const reportNames = {
        ultra: "Relatório de Distribuição de Amostras - Ultra",
        xdr: "Relatório de Distribuição de Amostras - XDR"
    } as const;

    return reportNames[activeTab];
};

/**
 * Format date range for subtitle
 */
export const formatDateRange = (timeInterval: TimeInterval): string => {
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const months = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    return `${formatDate(timeInterval.startDate)} à ${formatDate(timeInterval.endDate)}`;
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Build API parameters for data request
 */
export const buildApiParams = (
    timeInterval: TimeInterval,
    activeTab: ActiveTab
): Record<string, any> => {
    return {
        interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
        genexpert_result_type: getGenexpertResultType(activeTab)
    };
};

/**
 * Retry function with exponential backoff
 */
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
            lastError = error instanceof Error ? error : new Error(String(error));
            
            if (attempt === maxRetries) {
                throw lastError;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};

/**
 * Fetch data from API with retry mechanism
 */
export const fetchDataFromApi = async (
    timeInterval: TimeInterval,
    activeTab: ActiveTab,
    token: string
): Promise<Data[]> => {
    const params = buildApiParams(timeInterval, activeTab);

    return retryWithBackoff(async () => {
        try {
            const response = await api(token).get(API_CONFIG.BASE_URL, {
                params,
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

            console.error("Error fetching data:", errorMessage);
            throw new Error(errorMessage);
        }
    }, 3, 1000);
};

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Get chart configuration based on active tab
 */
export const getChartConfig = (activeTab: ActiveTab): PieChartConfig => {
    const colors = activeTab === "ultra" ? CHART_CONFIG.COLORS.ULTRA : CHART_CONFIG.COLORS.XDR;
    
    return {
        detected: {
            label: CHART_CONFIG.LABELS.DETECTED,
            color: colors.DETECTED,
        },
        not_detected: {
            label: CHART_CONFIG.LABELS.NOT_DETECTED,
            color: colors.NOT_DETECTED,
        },
        invalid: {
            label: CHART_CONFIG.LABELS.INVALID,
            color: colors.INVALID,
        },
        errors: {
            label: CHART_CONFIG.LABELS.ERRORS,
            color: colors.ERRORS,
        },
        not_analysed: {
            label: CHART_CONFIG.LABELS.NOT_ANALYSED,
            color: colors.NOT_ANALYSED,
        },
    };
};

/**
 * Prepare chart data from API response
 */
export const prepareChartData = (data: Data[], activeTab: ActiveTab): ChartData[] => {
    if (!data?.length) {
        return [];
    }

    const colors = activeTab === "ultra" ? CHART_CONFIG.COLORS.ULTRA : CHART_CONFIG.COLORS.XDR;

    // Sum all data across months
    const detected = data.reduce((sum, item) => sum + (item?.Detected_Samples || 0), 0);
    const not_detected = data.reduce((sum, item) => sum + (item?.Not_Detected_Samples || 0), 0);
    const invalid = data.reduce((sum, item) => sum + (item?.Invalid_Samples || 0), 0);
    const errors = data.reduce((sum, item) => sum + (item?.Errors || 0), 0);
    const not_analysed = data.reduce((sum, item) => sum + ((item?.Registered_Samples || 0) - (item?.Analysed_Samples || 0)), 0);

    return [
        { 
            label: "Resultados Positivos", 
            data: detected, 
            fill: colors.DETECTED 
        },
        { 
            label: "Resultados Negativos", 
            data: not_detected, 
            fill: colors.NOT_DETECTED 
        },
        { 
            label: "Resultados Inválidos", 
            data: invalid, 
            fill: colors.INVALID 
        },
        { 
            label: "Resultados com Erros", 
            data: errors, 
            fill: colors.ERRORS 
        },
        { 
            label: "Resultados Não Analisados", 
            data: not_analysed, 
            fill: colors.NOT_ANALYSED 
        },
    ].filter(item => item.data > 0); // Only include categories with data
};

/**
 * Prepare chart data for Chart.js pie chart
 */
export const prepareChartDataForChartJs = (data: Data[], activeTab: ActiveTab) => {
    if (!data?.length) {
        return {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderColor: "white",
                hoverOffset: 4
            }]
        };
    }

    const colors = activeTab === "ultra" ? CHART_CONFIG.COLORS.ULTRA : CHART_CONFIG.COLORS.XDR;

    // Sum all data across months
    const detected = data.reduce((sum, item) => sum + (item?.Detected_Samples || 0), 0);
    const not_detected = data.reduce((sum, item) => sum + (item?.Not_Detected_Samples || 0), 0);
    const invalid = data.reduce((sum, item) => sum + (item?.Invalid_Samples || 0), 0);
    const errors = data.reduce((sum, item) => sum + (item?.Errors || 0), 0);
    const not_analysed = data.reduce((sum, item) => sum + ((item?.Registered_Samples || 0) - (item?.Analysed_Samples || 0)), 0);

    const chartData = [
        { label: CHART_CONFIG.LABELS.DETECTED, value: detected, color: colors.DETECTED },
        { label: CHART_CONFIG.LABELS.NOT_DETECTED, value: not_detected, color: colors.NOT_DETECTED },
        { label: CHART_CONFIG.LABELS.INVALID, value: invalid, color: colors.INVALID },
        { label: CHART_CONFIG.LABELS.ERRORS, value: errors, color: colors.ERRORS },
        { label: CHART_CONFIG.LABELS.NOT_ANALYSED, value: not_analysed, color: colors.NOT_ANALYSED },
    ].filter(item => item.value > 0); // Only include categories with data

    return {
        labels: chartData.map(item => item.label),
        datasets: [{
            data: chartData.map(item => item.value),
            backgroundColor: chartData.map(item => item.color),
            borderColor: "white",
            hoverOffset: 4
        }]
    };
};

/**
 * Calculate total samples for percentage calculations
 */
export const calculateTotalSamples = (data: Data[]): number => {
    if (!data?.length) return 0;
    
    return data.reduce((sum, item) => sum + (item?.Registered_Samples || 0), 0);
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-PT').format(num);
};