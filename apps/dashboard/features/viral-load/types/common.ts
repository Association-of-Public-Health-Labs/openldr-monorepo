import {
  formatReportDateRangeLabel,
  formatReportDisplayDate,
  getDefaultReportDateInterval,
  type ReportDateInterval,
} from "../../shared/reporting/dateRange";

export type ViralLoadDateInterval = ReportDateInterval;

export type ViralLoadApiError = {
  code?: number;
  error?: string;
  message?: string;
  status?: "error" | string;
};

export function getDefaultViralLoadInterval(): ViralLoadDateInterval {
  return getDefaultReportDateInterval();
}

export function formatApiDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatViralLoadInterval(interval: ViralLoadDateInterval) {
  return formatReportDateRangeLabel(interval);
}

export function formatDisplayDate(value: string) {
  return formatReportDisplayDate(value);
}
