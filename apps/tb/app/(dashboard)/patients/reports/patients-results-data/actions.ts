import { api } from "../../../../../config/api";
import { API_CONFIG } from "./constants";
import { AxiosError } from "axios";
import * as XLSX from "xlsx";

// ============================================================================
// TYPES
// ============================================================================

export type SearchMode = "facility" | "name" | "sample_type" | "result_type";

export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export interface PatientRecord {
  request_id: string;
  first_name: string;
  last_name: string;
  age_in_years: number;
  sex_code: string;
  province: string;
  district: string;
  health_facility: string;
  facility_national_code: string;
  final_result: string;
  mtb_trace: string;
  rifampicin: string;
  specimen_source_desc: string;
  specimen_datetime: string;
  analysis_datetime: string;
  registered_datetime: string;
  authorised_datetime: string;
  specimen_source_code: string;
  analyzer_code: string;
  reject_reason: string | null;
  reject_remark: string | null;
  remarks: string | null;
  telephone: string | null;
}

export interface PaginatedResponse {
  status: string;
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  data: PatientRecord[];
}

export interface SearchFilters {
  healthFacility: string;
  firstName: string;
  surname: string;
  sampleType: string;
  resultType: string;
  genexpertResultType: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getLastTwelveMonths = (): TimeInterval => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 11);
  startDate.setDate(1);
  const formatDate = (date: Date): string => date.toISOString().split("T")[0];
  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
};

export const formatDatePt = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

function getEndpointUrl(searchMode: SearchMode): string {
  const endpoints: Record<SearchMode, string> = {
    facility: API_CONFIG.PATIENTS_BY_FACILITY,
    name: API_CONFIG.PATIENTS_BY_NAME,
    sample_type: API_CONFIG.PATIENTS_BY_SAMPLE_TYPE,
    result_type: API_CONFIG.PATIENTS_BY_RESULT_TYPE,
  };
  return endpoints[searchMode];
}

function buildParams(
  searchMode: SearchMode,
  filters: SearchFilters,
  timeInterval: TimeInterval,
  page: number,
  perPage: number
): Record<string, any> {
  const params: Record<string, any> = {
    interval_dates: `${timeInterval.startDate},${timeInterval.endDate}`,
    page,
    per_page: perPage,
  };

  if (filters.genexpertResultType && filters.genexpertResultType !== "All") {
    params.genexpert_result_type = filters.genexpertResultType;
  }

  switch (searchMode) {
    case "facility":
      params.health_facility = filters.healthFacility;
      break;
    case "name":
      if (filters.firstName) params.first_name = filters.firstName;
      if (filters.surname) params.surname = filters.surname;
      break;
    case "sample_type":
      params.sample_type = filters.sampleType;
      if (filters.healthFacility) params.health_facility = filters.healthFacility;
      break;
    case "result_type":
      params.result_type = filters.resultType;
      if (filters.healthFacility) params.health_facility = filters.healthFacility;
      break;
  }

  return params;
}

export async function fetchPatients(
  searchMode: SearchMode,
  filters: SearchFilters,
  timeInterval: TimeInterval,
  page: number,
  perPage: number,
  token: string
): Promise<PaginatedResponse> {
  try {
    const url = getEndpointUrl(searchMode);
    const params = buildParams(searchMode, filters, timeInterval, page, perPage);

    const response = await api(token).get(url, {
      params,
      paramsSerializer: { indexes: null },
      timeout: API_CONFIG.TIMEOUT,
    });

    // Handle error responses that come with 200 status (like 403 from API)
    if (response.data?.status === "error") {
      const code = response.data.code || 500;
      const message =
        code === 403
          ? "Acesso restrito a utilizadores com permissao de Administrador."
          : response.data.message || "Ocorreu um erro.";
      throw new Error(message);
    }

    return {
      status: response.data.status || "success",
      page: response.data.page || page,
      per_page: response.data.per_page || perPage,
      total_count: response.data.total_count || 0,
      total_pages: response.data.total_pages || 0,
      data: response.data.data || [],
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Acesso restrito")) {
      throw error;
    }
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : "Ocorreu um erro.";
    throw new Error(errorMessage);
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateFilters(
  searchMode: SearchMode,
  filters: SearchFilters
): string | null {
  switch (searchMode) {
    case "facility":
      if (!filters.healthFacility.trim())
        return "Preencha o nome da Unidade Sanitaria.";
      break;
    case "name":
      if (!filters.firstName.trim() && !filters.surname.trim())
        return "Preencha pelo menos o primeiro nome ou o apelido.";
      break;
    case "sample_type":
      if (!filters.sampleType) return "Selecione o tipo de amostra.";
      break;
    case "result_type":
      if (!filters.resultType) return "Selecione o tipo de resultado.";
      break;
  }
  return null;
}

// ============================================================================
// EXCEL EXPORT
// ============================================================================

export function exportPatientsToExcel(
  data: PatientRecord[],
  reportName: string,
  timeInterval: TimeInterval
): void {
  if (!data || data.length === 0) return;

  const exportData = data.map((p) => ({
    Nome: `${p.first_name || ""} ${p.last_name || ""}`.trim(),
    Idade: p.age_in_years,
    Sexo: p.sex_code,
    Provincia: p.province,
    Distrito: p.district,
    "Unidade Sanitaria": p.health_facility,
    "Resultado de Xpert": p.final_result,
    "Tipo de Amostra": p.specimen_source_desc,
    "Data de Colheita": p.specimen_datetime
      ? new Date(p.specimen_datetime).toLocaleDateString("pt-BR")
      : "",
    "Data de Analise": p.analysis_datetime
      ? new Date(p.analysis_datetime).toLocaleDateString("pt-BR")
      : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 8 },
    { wch: 6 },
    { wch: 18 },
    { wch: 18 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes");

  const timestamp = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `${reportName}_${timestamp}.xlsx`);
}
