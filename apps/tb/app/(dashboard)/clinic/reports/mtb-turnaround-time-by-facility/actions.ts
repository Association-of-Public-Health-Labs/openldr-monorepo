import { API_CONFIG } from "./constants";
import { api } from "../../../../../config/api";
import { AxiosError } from "axios";

// Types
export type Data = {
  Facility: string;
  Total: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;
  Role: string;
  Facilities: string[];
  colheita_us__recepcao_lab: number;
  recepcao_lab__registo_no_lab: number;
  registo_no_lab__analise_no_lab: number;
  analise_no_lab__validacao_no_lab: number;
}

export interface FacilityOptions {
  value: string;
  label: string;
  district: string;
  province: string;
}

export type FacilityType = "province" | "district" | "clinic" | "patients";
export type ActiveTab = "ultra" | "xdr";

export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export interface ChartData {
  labels: string[];
  series: Array<{ name: string; data: number[]; group: string }>;
}

// Helper function to get last 12 months date range
export const getLastTwelveMonths = (): TimeInterval => {
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

export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  return activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
};

export const getReportName = (activeTab: ActiveTab): string => {
  return activeTab === "ultra"
    ? "Relatório de Tempo de Resposta por Província - Ultra"
    : "Relatório de Tempo de Resposta por Província - XDR";
};

export const getNextFacilityType = (currentType: FacilityType): FacilityType => {
  const hierarchy: Record<FacilityType, FacilityType> = {
    province: "district",
    district: "clinic",
    clinic: "province",
    patients: "province"
  };
  return hierarchy[currentType];
};

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
    disaggregation: disaggregation ? "True" : "False",
  };

  const facilityParams: Record<string, any> = {};

  if ((facilityType === "province" || facilityType === "district") && facilities.length > 0) {
    facilityParams.province = facilities.map(f => f.province);
  }
  if (facilityType === "clinic" && facilities.length > 0) {
    facilityParams.province = facilities.map(f => f.province);
    facilityParams.district = facilities.map(f => f.district);
  }

  return { ...baseParams, ...facilityParams };
};

export const fetchTurnaroundData = async (
  params: Record<string, any>,
  token: string | null
): Promise<Data[]> => {
  try {
    const response = await api(token).get(API_CONFIG.ENDPOINT, {
      params,
      paramsSerializer: { indexes: null },
      timeout: API_CONFIG.TIMEOUT
    });
    return response.data?.length ? response.data : [];
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? error.response?.data?.message || error.message
      : error instanceof Error ? error.message : "An error occurred";
    throw new Error(errorMessage);
  }
};

export const prepareChartData = (data: Data[]): ChartData => {
  if (data.length === 0) {
    return { labels: [], series: [] };
  }

  const labels = data.map(item => item.Facility);

  const series = [
    {
      name: 'Colheita US → Recepção Lab',
      data: data.map(item => item.colheita_us__recepcao_lab || 0),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Recepção Lab → Registo no Lab',
      data: data.map(item => item.recepcao_lab__registo_no_lab || 0),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Registo no Lab → Análise no Lab',
      data: data.map(item => item.registo_no_lab__analise_no_lab || 0),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Análise no Lab → Validação no Lab',
      data: data.map(item => item.analise_no_lab__validacao_no_lab || 0),
      group: 'apexcharts-axis-0'
    },
  ];

  return { labels, series };
};

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
