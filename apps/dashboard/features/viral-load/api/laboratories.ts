import { api } from "@/config/api";
import { formatReportIntervalDates } from "../../shared/reporting/dateRange";
import type { ViralLoadDateInterval } from "../types/common";
import type {
  ViralLoadLaboratoryRequest,
  VlLaboratoryMetricResponse,
  VlLaboratoryMonthlyResponse,
  VlLaboratoryReasonResponse,
} from "../types/laboratory";
import { viralLoadLaboratoryEndpoints } from "./endpoints";

type RequestOptions = ViralLoadLaboratoryRequest & {
  interval: ViralLoadDateInterval;
  token: string;
};

function buildLaboratoryParams({
  disaggregation,
  district,
  facilityType = "province",
  healthFacility,
  interval,
  province,
}: RequestOptions) {
  return {
    interval_dates: formatReportIntervalDates(interval),
    facility_type: facilityType,
    disaggregation: disaggregation ? "True" : "False",
    province,
    district,
    health_facility: healthFacility,
  };
}

async function getLaboratory<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const response = await api(options.token).get<T>(endpoint, {
    params: buildLaboratoryParams(options),
  });

  return response.data;
}

export function getVlLaboratoryTestedSamples(options: RequestOptions) {
  return getLaboratory<VlLaboratoryMetricResponse[]>(viralLoadLaboratoryEndpoints.testedSamples, options);
}

export function getVlLaboratoryTestedSamplesByMonth(options: RequestOptions) {
  return getLaboratory<VlLaboratoryMonthlyResponse[]>(viralLoadLaboratoryEndpoints.testedSamplesByMonth, options);
}

export function getVlLaboratoryTatByLab(options: RequestOptions) {
  return getLaboratory<VlLaboratoryMetricResponse[]>(viralLoadLaboratoryEndpoints.tatByLab, options);
}

export function getVlLaboratoryTatByMonth(options: RequestOptions) {
  return getLaboratory<VlLaboratoryMonthlyResponse[]>(viralLoadLaboratoryEndpoints.tatByMonth, options);
}

export function getVlLaboratoryRejectedSamples(options: RequestOptions) {
  return getLaboratory<VlLaboratoryMetricResponse[]>(viralLoadLaboratoryEndpoints.rejectedSamples, options);
}

export function getVlLaboratoryRejectedSamplesByMonth(options: RequestOptions) {
  return getLaboratory<VlLaboratoryMonthlyResponse[]>(viralLoadLaboratoryEndpoints.rejectedSamplesByMonth, options);
}

export function getVlLaboratoryTestedSamplesByTestReason(options: RequestOptions) {
  return getLaboratory<VlLaboratoryReasonResponse[]>(viralLoadLaboratoryEndpoints.testedSamplesByTestReason, options);
}
