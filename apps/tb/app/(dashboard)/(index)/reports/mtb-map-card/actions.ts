import axios, { AxiosResponse } from "axios";
import { api } from "../../../../../config/api";
import {
    API_CONFIG,
    UI_CONFIG,
    MapData,
    TimeInterval,
    ActiveTab,
    ProvinceName,
    getGenexpertResultType,
    CHART_CONFIG
} from "./constants";

// =============================================================================
// TYPES
// =============================================================================

export interface ApiParams {
    interval_dates: string;
    genexpert_result_type: string;
    disaggregation?: string;
    facility_type?: string;
    province?: string;
}

export interface MapChartData {
    [key: string]: { ratio: number };
}

type ApiResponse =
    | MapData[]
    | { data?: unknown; results?: unknown; items?: unknown; records?: unknown; detail?: unknown; message?: unknown };

const getApiErrorMessage = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }

    if (value && typeof value === "object") {
        const detail = value as { detail?: unknown; message?: unknown; error?: unknown };
        return getApiErrorMessage(detail.detail ?? detail.message ?? detail.error ?? JSON.stringify(value));
    }

    return UI_CONFIG.ERROR_MESSAGES.GENERIC;
};

const extractMapDataArray = (payload: ApiResponse): MapData[] => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (!payload || typeof payload !== "object") {
        throw new Error("Resposta inválida da API: formato de dados inesperado.");
    }

    const apiError = payload.detail ?? payload.message;
    if (apiError) {
        throw new Error(getApiErrorMessage(apiError));
    }

    const candidate = payload.data ?? payload.results ?? payload.items ?? payload.records;
    if (Array.isArray(candidate)) {
        return candidate as MapData[];
    }

    throw new Error("Resposta inválida da API: era esperado um array de dados do mapa.");
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

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Retry mechanism with exponential backoff
 */
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
    baseDelay: number = API_CONFIG.RETRY_DELAY_BASE
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

/**
 * Build API parameters for map data requests
 */
export const buildApiParams = (
    timeInterval: TimeInterval,
    activeTab: ActiveTab,
    selectedProvince?: ProvinceName | null
): ApiParams => {
    const baseParams: ApiParams = {
        interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
        genexpert_result_type: getGenexpertResultType(activeTab),
    };

    if (selectedProvince) {
        baseParams.disaggregation = "True";
        baseParams.facility_type = "province";
        baseParams.province = selectedProvince;
    }

    return baseParams;
};

/**
 * Fetch national map data
 */
export const fetchNationalMapData = async (
    token: string | null,
    timeInterval: TimeInterval,
    activeTab: ActiveTab
): Promise<MapData[]> => {

    const params = buildApiParams(timeInterval, activeTab);

    return retryWithBackoff(async () => {
        const response: AxiosResponse<ApiResponse> = await api(token).get(
            API_CONFIG.ENDPOINT,
            {
                params,
                timeout: API_CONFIG.TIMEOUT,
            }
        );

        return extractMapDataArray(response.data);
    });
};

/**
 * Fetch district data for selected province
 */
export const fetchDistrictData = async (
    token: string | null,
    timeInterval: TimeInterval,
    activeTab: ActiveTab,
    selectedProvince: ProvinceName
): Promise<MapData[]> => {
    const params = buildApiParams(timeInterval, activeTab, selectedProvince);

    return retryWithBackoff(async () => {
        const response: AxiosResponse<ApiResponse> = await api(token).get(
            API_CONFIG.ENDPOINT,
            {
                params,
                timeout: API_CONFIG.TIMEOUT,
            }
        );

        return extractMapDataArray(response.data);
    }, 2); // Fewer retries for district data
};

// =============================================================================
// DATA PROCESSING FUNCTIONS
// =============================================================================

/**
 * Prepare national chart data for map visualization
 */
export const prepareNationalChartData = (data: MapData[]): MapChartData => {
    const safeData = Array.isArray(data) ? data : [];
    const chartData = safeData.map((item) => {
        const testedSamples = toNumber(item?.Tested_Samples);
        const detected = toNumber(item?.Detected);

        return {
        province: CHART_CONFIG.PROVINCE_CODES[item?.Facility as keyof typeof CHART_CONFIG.PROVINCE_CODES],
        positivity: testedSamples > 0 ? detected / testedSamples : 0
        };
    });

    return {
        tt: { ratio: (chartData?.find((item) => item.province === "tt")?.positivity || 0) },
        mp: { ratio: (chartData?.find((item) => item.province === "mp")?.positivity || 0) },
        mc: { ratio: (chartData?.find((item) => item.province === "mc")?.positivity || 0) },
        np: { ratio: (chartData?.find((item) => item.province === "np")?.positivity || 0) },
        cd: { ratio: (chartData?.find((item) => item.province === "cd")?.positivity || 0) },
        zb: { ratio: (chartData?.find((item) => item.province === "zb")?.positivity || 0) },
        ib: { ratio: (chartData?.find((item) => item.province === "ib")?.positivity || 0) },
        mn: { ratio: (chartData?.find((item) => item.province === "mn")?.positivity || 0) },
        sf: { ratio: (chartData?.find((item) => item.province === "sf")?.positivity || 0) },
        ns: { ratio: (chartData?.find((item) => item.province === "ns")?.positivity || 0) },
        gz: { ratio: (chartData?.find((item) => item.province === "gz")?.positivity || 0) },
    };
};

/**
 * Prepare district chart data for province visualization
 */
export const prepareDistrictChartData = (data: MapData[]): Record<string, number> => {
    if (!Array.isArray(data) || data.length === 0) {
        return {};
    }

    const districtRatios: Record<string, number> = {};

    data.forEach((item) => {
        const testedSamples = toNumber(item?.Tested_Samples);

        if (item?.Facility && testedSamples > 0 && item?.Not_Detected !== undefined) {
            const districtName = item.Facility;
            const ratio = toNumber(item.Detected) / testedSamples;

            // Ensure ratio is between 0 and 1
            const normalizedRatio = Math.max(0, Math.min(1, ratio));

            districtRatios[districtName] = normalizedRatio;
        }
    });

    return districtRatios;
};

/**
 * Prepare data for Excel export
 */
export const prepareMapDataForExcel = (data: MapData[]): Array<{
    Provincia: string;
    "Amostras Testadas": number;
    "Detectado": number;
    "Não Detectado": number;
    "Inválido": number;
    "Erros": number;
    "Taxa de Positividade": string;
    "Data Início": string;
    "Data Fim": string;
    "Tipo de Resultado": string;
}> => {
    const safeData = Array.isArray(data) ? data : [];

    return safeData.map((item) => {
        const testedSamples = toNumber(item.Tested_Samples);
        const detected = toNumber(item.Detected);
        const positivity = testedSamples > 0 ? (detected / testedSamples) * 100 : 0;

        return {
            Provincia: item.Facility,
            "Amostras Testadas": testedSamples,
            "Detectado": detected,
            "Não Detectado": toNumber(item.Not_Detected),
            "Inválido": toNumber(item.Invalid),
            "Erros": toNumber(item.Errors),
            "Taxa de Positividade": `${positivity.toFixed(1)}%`,
            "Data Início": item.Start_Date,
            "Data Fim": item.End_Date,
            "Tipo de Resultado": item.Type_Of_Result,
        };
    });
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            return UI_CONFIG.ERROR_MESSAGES.TIMEOUT;
        }
        if (error.response?.status === 404) {
            return UI_CONFIG.ERROR_MESSAGES.NOT_FOUND;
        }
        if (error.response?.status >= 500) {
            return UI_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
        }
        if (!error.response) {
            return UI_CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
        }
        return error.response?.data?.message || error.message || UI_CONFIG.ERROR_MESSAGES.GENERIC;
    }

    return error instanceof Error ? error.message : UI_CONFIG.ERROR_MESSAGES.GENERIC;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get last twelve months time interval
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
