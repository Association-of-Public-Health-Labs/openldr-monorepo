import { api } from "@/config/api";
import { formatReportIntervalDates } from "../../shared/reporting/dateRange";
import type { ViralLoadDateInterval } from "../types/common";
import type {
  ViralLoadFacilityRequest,
  VlFacilityAgeResponse,
  VlFacilityGenderResponse,
  VlFacilityMetricResponse,
  VlFacilityMonthlyResponse,
  VlFacilityTestReasonResponse,
} from "../types/facility";
import { viralLoadFacilityEndpoints } from "./endpoints";

type RequestOptions = ViralLoadFacilityRequest & {
  interval: ViralLoadDateInterval;
  token: string;
};

function buildFacilityParams({
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

async function getFacility<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const response = await api(options.token).get<T>(endpoint, {
    params: buildFacilityParams(options),
  });

  return response.data;
}

export function getVlFacilityRegisteredSamples(options: RequestOptions) {
  return getFacility<VlFacilityMetricResponse[]>(viralLoadFacilityEndpoints.registeredSamples, options);
}

export function getVlFacilityTestedSamplesByFacility(options: RequestOptions) {
  return getFacility<VlFacilityMetricResponse[]>(viralLoadFacilityEndpoints.testedSamplesByFacility, options);
}

export function getVlFacilityTestedSamplesByGenderByFacility(options: RequestOptions) {
  return getFacility<VlFacilityGenderResponse[]>(viralLoadFacilityEndpoints.testedSamplesByGenderByFacility, options);
}

export function getVlFacilityTestedSamplesByGenderByMonth(options: RequestOptions) {
  return getFacility<VlFacilityGenderResponse[]>(viralLoadFacilityEndpoints.testedSamplesByGenderByMonth, options);
}

export function getVlFacilityTestedSamplesByAgeByFacility(options: RequestOptions) {
  return getFacility<VlFacilityAgeResponse[]>(viralLoadFacilityEndpoints.testedSamplesByAgeByFacility, options);
}

export function getVlFacilityTestedSamplesByAgeByMonth(options: RequestOptions) {
  return getFacility<VlFacilityAgeResponse[]>(viralLoadFacilityEndpoints.testedSamplesByAgeByMonth, options);
}

export function getVlFacilityTestedSamplesByTestReasonByFacility(options: RequestOptions) {
  return getFacility<VlFacilityTestReasonResponse[]>(viralLoadFacilityEndpoints.testedSamplesByTestReasonByFacility, options);
}

export function getVlFacilityTestedSamplesByTestReasonByMonth(options: RequestOptions) {
  return getFacility<VlFacilityTestReasonResponse[]>(viralLoadFacilityEndpoints.testedSamplesByTestReasonByMonth, options);
}

export function getVlFacilityTestedSamplesPregnant(options: RequestOptions) {
  return getFacility<VlFacilityMonthlyResponse[]>(viralLoadFacilityEndpoints.testedSamplesPregnant, options);
}

export function getVlFacilityTestedSamplesBreastfeeding(options: RequestOptions) {
  return getFacility<VlFacilityMonthlyResponse[]>(viralLoadFacilityEndpoints.testedSamplesBreastfeeding, options);
}

export function getVlFacilityRejectedSamplesByFacility(options: RequestOptions) {
  return getFacility<VlFacilityMetricResponse[]>(viralLoadFacilityEndpoints.rejectedSamplesByFacility, options);
}

export function getVlFacilityRejectedSamplesByMonth(options: RequestOptions) {
  return getFacility<VlFacilityMonthlyResponse[]>(viralLoadFacilityEndpoints.rejectedSamplesByMonth, options);
}

export function getVlFacilityTatByFacility(options: RequestOptions) {
  return getFacility<VlFacilityMetricResponse[]>(viralLoadFacilityEndpoints.tatByFacility, options);
}

export function getVlFacilityTatByMonth(options: RequestOptions) {
  return getFacility<VlFacilityMonthlyResponse[]>(viralLoadFacilityEndpoints.tatByMonth, options);
}
