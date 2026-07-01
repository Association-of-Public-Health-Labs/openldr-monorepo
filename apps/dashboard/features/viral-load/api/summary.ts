import { api } from "@/config/api";
import { formatReportIntervalDates } from "../../shared/reporting/dateRange";
import type { ViralLoadDateInterval } from "../types/common";
import type {
  VlHeaderIndicatorsResponse,
  VlMonthlyTotalResponse,
  VlProvinceSuppressionResponse,
  VlSuppressionMonthlyResponse,
  VlTatMonthlyResponse,
} from "../types/summary";
import { viralLoadSummaryEndpoints } from "./endpoints";

type RequestOptions = {
  interval: ViralLoadDateInterval;
  token: string;
};

function buildSummaryParams(interval: ViralLoadDateInterval) {
  return {
    interval_dates: formatReportIntervalDates(interval),
  };
}

async function getSummary<T>(endpoint: string, { interval, token }: RequestOptions): Promise<T> {
  const response = await api(token).get<T>(endpoint, {
    params: buildSummaryParams(interval),
  });

  return response.data;
}

export function getVlHeaderIndicators(options: RequestOptions) {
  return getSummary<VlHeaderIndicatorsResponse>(
    viralLoadSummaryEndpoints.headerIndicatorsByMonth,
    options,
  );
}

export function getVlNumberOfSamplesByMonth(options: RequestOptions) {
  return getSummary<VlMonthlyTotalResponse[]>(
    viralLoadSummaryEndpoints.numberOfSamplesByMonth,
    options,
  );
}

export function getVlViralSuppressionByMonth(options: RequestOptions) {
  return getSummary<VlSuppressionMonthlyResponse[]>(
    viralLoadSummaryEndpoints.viralSuppressionByMonth,
    options,
  );
}

export function getVlTatByMonth(options: RequestOptions) {
  return getSummary<VlTatMonthlyResponse[]>(
    viralLoadSummaryEndpoints.tatByMonth,
    options,
  );
}

export function getVlSuppressionByProvinceByMonth(options: RequestOptions) {
  return getSummary<VlProvinceSuppressionResponse[]>(
    viralLoadSummaryEndpoints.suppressionByProvinceByMonth,
    options,
  );
}

export function getVlSamplesHistory(options: RequestOptions) {
  return getSummary<VlMonthlyTotalResponse[]>(
    viralLoadSummaryEndpoints.samplesHistory,
    options,
  );
}
