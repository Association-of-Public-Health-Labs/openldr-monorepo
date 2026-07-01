import { api } from "@/config/api";
import { AxiosError } from "axios";
import { adaptViralLoadPatientsResponse } from "../adapters/patients";
import type { ViralLoadDateInterval } from "../types/common";
import type { ViralLoadPatientsPagination, ViralLoadPatientsSearchResult, VlPatientsRawResponse } from "../types/patients";
import { viralLoadPatientEndpoints } from "./endpoints";

type SearchOptions = {
  interval: ViralLoadDateInterval;
  page: number;
  perPage: number;
  token: string;
};

type NameSearchOptions = SearchOptions & {
  name: string;
};

type FacilitySearchOptions = SearchOptions & {
  facility: string;
};

type ResultTypeSearchOptions = SearchOptions & {
  resultType: string;
};

type TestReasonSearchOptions = SearchOptions & {
  testReason: string;
};

const TEST_REASON_API_VALUES: Record<string, string[]> = {
  reason_not_specified: ["Não preenchido", "No", "Reason Not Specified", "Yes", ""],
  repeat: ["Repeat after breastfeeding", "Repeat"],
  routine: ["Routine"],
  suspected_treatment_failure: ["Suspected treatment failure"],
};

async function getPatients(
  endpoint: string,
  options: SearchOptions,
  params: Record<string, string | number | string[] | undefined>
): Promise<ViralLoadPatientsSearchResult> {
  try {
    const response = await api(options.token).get<VlPatientsRawResponse>(endpoint, {
      params: {
        interval_dates: `${options.interval.startDate},${options.interval.endDate}`,
        page: options.page,
        per_page: options.perPage,
        ...params,
      },
      paramsSerializer: { indexes: null },
    });

    if (!Array.isArray(response.data) && response.data.status === "error") {
      return failureResult(options, getFriendlyApiError(endpoint, response.data.code, response.data.message));
    }

    return {
      ...adaptViralLoadPatientsResponse(response.data, options.page, options.perPage),
      ok: true,
    };
  } catch (error) {
    return failureResult(options, getFriendlySearchError(endpoint, error));
  }
}

export function searchPatientsByFacility(options: FacilitySearchOptions) {
  return getPatients(viralLoadPatientEndpoints.byFacility, options, {
    health_facility: options.facility,
  });
}

export function searchPatientsByName(options: NameSearchOptions) {
  const { firstName, surname } = splitPatientName(options.name);
  return getPatients(viralLoadPatientEndpoints.byName, options, {
    first_name: firstName,
    surname,
  });
}

export function searchPatientsByResultType(options: ResultTypeSearchOptions) {
  return getPatients(viralLoadPatientEndpoints.byResultType, options, {
    result_type: options.resultType,
  });
}

export function searchPatientsByTestReason(options: TestReasonSearchOptions) {
  const testReason = TEST_REASON_API_VALUES[options.testReason] ?? [options.testReason];
  return getPatients(viralLoadPatientEndpoints.byTestReason, options, {
    test_reason: testReason,
  });
}

function splitPatientName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? "", surname: "" };
  return {
    firstName: parts[0],
    surname: parts.slice(1).join(" "),
  };
}

function failureResult(options: SearchOptions, error: string): ViralLoadPatientsSearchResult {
  return {
    data: [],
    error,
    ok: false,
    pagination: emptyPagination(options.page, options.perPage),
  };
}

function emptyPagination(page: number, perPage: number): ViralLoadPatientsPagination {
  return {
    page,
    perPage,
    totalCount: 0,
    totalPages: 0,
  };
}

function getFriendlySearchError(endpoint: string, error: unknown) {
  if (error instanceof Error && isFriendlyError(error.message)) return error.message;

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const apiMessage = getApiMessage(error.response?.data);

    if (status === 403 || apiMessage.toLowerCase().includes("forbidden")) return "Sem permissão para consultar estes dados.";
    if (status === 404) return "Nenhum resultado encontrado para os filtros informados.";
    if (!error.response) return "Não foi possível conectar à API. Tente novamente.";
    return getFriendlyApiError(endpoint, status, apiMessage);
  }

  return "Não foi possível realizar a pesquisa. Verifique os filtros e tente novamente.";
}

function getFriendlyApiError(endpoint: string, status?: number, message = "") {
  const lowerMessage = message.toLowerCase();
  if (status === 403 || lowerMessage.includes("forbidden") || lowerMessage.includes("permiss")) {
    return "Sem permissão para consultar estes dados.";
  }
  if (status === 404) return "Nenhum resultado encontrado para os filtros informados.";
  if (endpoint === viralLoadPatientEndpoints.byTestReason && lowerMessage.includes("hl7resultstatuscode")) {
    return "Não foi possível concluir a pesquisa por motivo de teste neste momento. A equipa técnica deve rever este endpoint.";
  }
  if (isTechnicalMessage(message)) return "Não foi possível realizar a pesquisa. Verifique os filtros e tente novamente.";
  return message || "Não foi possível realizar a pesquisa. Verifique os filtros e tente novamente.";
}

function getApiMessage(data: unknown) {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }
  return "";
}

function isFriendlyError(message: string) {
  return (
    message === "Sem permissão para consultar estes dados." ||
    message === "Nenhum resultado encontrado para os filtros informados." ||
    message === "Não foi possível conectar à API. Tente novamente." ||
    message === "Não foi possível realizar a pesquisa. Verifique os filtros e tente novamente." ||
    message === "Não foi possível concluir a pesquisa por motivo de teste neste momento. A equipa técnica deve rever este endpoint."
  );
}

function isTechnicalMessage(message: string) {
  return /HL7ResultStatusCode|KeyError|TypeError|Traceback|stack|undefined|null|An error occurred/i.test(message);
}
