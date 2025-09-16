import axios, { AxiosError } from "axios";
import { 
    API_CONFIG, 
    CHART_CONFIG, 
    FacilityType, 
    ActiveTab, 
    TimeIntervalType,
    TimeInterval,
    FacilityOptions,
    ResponseTimeData,
    TimeIntervalData,
    PatientDataParams,
    ChartData
} from "./constants";
import { api } from "../../../../../config/api";

// ============================================================================
// TYPES
// ============================================================================

// Removed duplicate type definitions

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
 * Get report name based on active tab and time interval type
 */
export const getReportName = (activeTab: ActiveTab, timeIntervalType: TimeIntervalType): string => {
    const intervalNames = {
        colheita_us__recepcao_lab: "Colheita → Recepção",
        recepcao_lab__registo_no_lab: "Recepção → Registo",
        registo_no_lab__analise_no_lab: "Registo → Análise",
        analise_no_lab__validacao_no_lab: "Análise → Validação"
    };

    const tabSuffix = activeTab === "ultra" ? "Ultra" : "XDR";
    return `Tempo de Resposta ${intervalNames[timeIntervalType]} - ${tabSuffix}`;
};

/**
 * Get next facility type in the hierarchy
 */
export const getNextFacilityType = (currentType: FacilityType): FacilityType => {
    const facilityTypeHierarchy: Record<FacilityType, FacilityType> = {
        province: "district",
        district: "clinic",
        clinic: "patients",
        patients: "province"
    };

    return facilityTypeHierarchy[currentType];
};

/**
 * Format date in Portuguese
 */
export const formatDateInPortuguese = (dateString: string): string => {
    const date = new Date(dateString);
    const months = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} de ${year}`;
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
                break;
            }
            
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError!;
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Build API parameters for facility data request
 */
export const buildApiParams = (
    timeInterval: TimeInterval,
    activeTab: ActiveTab,
    facilities: FacilityOptions[],
    facilityType: FacilityType,
    disaggregation: boolean
): Record<string, any> => {
    const baseParams: Record<string, any> = {
        interval_dates: `${timeInterval.startDate},${timeInterval.endDate}`,
        genexpert_result_type: getGenexpertResultType(activeTab),
        disaggregation: disaggregation ? "True" : "False"
    };

    // If we have facilities selected, add facility parameter for disaggregation
    if (facilities.length > 0) {
        const facility = facilities[0]; // Use the first facility
        baseParams.facility = facility.value;
    }

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
        }
    } else if (facilityType === "clinic") {
        // When viewing clinics, include province, district, and health_facility
        if (facilities.length > 0) {
            if (facilities[0].province) {
                facilityParams.province = facilities.map(facility => facility.province);
            }
            if (facilities[0].district) {
                facilityParams.district = facilities.map(facility => facility.district);
            }
            facilityParams.health_facility = facilities.map(facility => facility.value);
        }
    }

    return { ...baseParams, ...facilityParams };
};

/**
 * Fetch facility data from API with retry mechanism
 */
export const fetchFacilityData = async (
    params: Record<string, any>,
    token: string
): Promise<ResponseTimeData[]> => {
    return retryWithBackoff(async () => {
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
            if (error instanceof AxiosError) {
                if (error.code === 'ECONNABORTED') {
                    throw new Error('Tempo limite excedido. Tente novamente.');
                }
                if (error.response?.status === 404) {
                    throw new Error('Dados não encontrados para os parâmetros selecionados.');
                }
                if (error.response?.status >= 500) {
                    throw new Error('Erro no servidor. Tente novamente em alguns minutos.');
                }
                throw new Error(error.response?.data?.message || error.message);
            }
            throw new Error('Erro de rede. Verifique sua conexão.');
        }
    }, 3, 1000);
};

/**
 * Fetch patient data from API with retry mechanism
 */
export const fetchPatientData = async (params: PatientDataParams, token: string): Promise<any[]> => {
    return retryWithBackoff(async () => {
        try {
            const queryParams = new URLSearchParams({
                disaggregation: "True",
                interval_dates: params.interval_dates,
                province: params.province,
                district: params.district,
                health_facility: params.health_facility,
                genexpert_result_type: params.genexpert_result_type,
                time_interval_type: params.time_interval_type,
            });

            const response = await api(token).get(
                `${API_CONFIG.BASE_URL}?${queryParams.toString()}`,
                {
                    timeout: API_CONFIG.TIMEOUT
                }
            );

            if (!response.data?.length) {
                return [];
            }

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.code === 'ECONNABORTED') {
                    throw new Error('Tempo limite excedido ao buscar dados dos pacientes.');
                }
                if (error.response?.status === 404) {
                    throw new Error('Dados de pacientes não encontrados.');
                }
                if (error.response?.status >= 500) {
                    throw new Error('Erro no servidor ao buscar dados dos pacientes.');
                }
            }
            throw error;
        }
    }, 2, 1000);
};

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Prepare chart data from API response for stacked bar chart
 */
export const prepareChartData = (data: ResponseTimeData[], timeIntervalType: TimeIntervalType): ChartData => {
    if (!data?.length) {
        return { labels: [], series: [] };
    }

    const labels = data.map(item => item.Laboratory);
    
    const series = [
        {
            name: CHART_CONFIG.SERIES_NAMES.LESS_THAN_7,
            data: data.map(item => item[timeIntervalType]?.less_than_7 || 0),
            group: "response_time"
        },
        {
            name: CHART_CONFIG.SERIES_NAMES.BETWEEN_7_15,
            data: data.map(item => item[timeIntervalType]?.between_7_15 || 0),
            group: "response_time"
        },
        {
            name: CHART_CONFIG.SERIES_NAMES.BETWEEN_16_21,
            data: data.map(item => item[timeIntervalType]?.between_16_21 || 0),
            group: "response_time"
        },
        {
            name: CHART_CONFIG.SERIES_NAMES.GREATER_THAN_21,
            data: data.map(item => item[timeIntervalType]?.greater_than_21 || 0),
            group: "response_time"
        }
    ];

    return { labels, series };
};

/**
 * Prepare data for Excel export
 */
export const prepareExcelData = (data: ResponseTimeData[], timeIntervalType: TimeIntervalType) => {
    if (!data?.length) {
        return [];
    }

    return data.map(item => ({
        Laboratório: item.Laboratory,
        Total: item.Total,
        "Menos de 7 dias": item[timeIntervalType]?.less_than_7 || 0,
        "7-15 dias": item[timeIntervalType]?.between_7_15 || 0,
        "16-21 dias": item[timeIntervalType]?.between_16_21 || 0,
        "Mais de 21 dias": item[timeIntervalType]?.greater_than_21 || 0,
    }));
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

export const getFacilityProperty = (facilityType: FacilityType, label: string) => {
    const facilityMap = {
        province: 'Provincia',
        district: 'Distrito',
        clinic: 'Unidade Sanitária',
    };

    return { [facilityMap[facilityType]]: label };
};
