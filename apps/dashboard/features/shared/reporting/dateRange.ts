export type ReportDateRange = {
  displayLabel: string;
  endDate: Date;
  endDateIso: string;
  intervalDates: string;
  startDate: Date;
  startDateIso: string;
};

export type ReportDateInterval = {
  endDate: string;
  startDate: string;
};

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function getDefaultReportDateRange(referenceDate = new Date()): ReportDateRange {
  const endDate = toLocalDate(referenceDate);
  const startDate = subtractYearsClamped(endDate, 1);
  const startDateIso = formatReportDateIso(startDate);
  const endDateIso = formatReportDateIso(endDate);

  return {
    displayLabel: formatReportDateRangeLabel({ startDate: startDateIso, endDate: endDateIso }),
    endDate,
    endDateIso,
    intervalDates: `${startDateIso},${endDateIso}`,
    startDate,
    startDateIso,
  };
}

export function getDefaultReportDateInterval(): ReportDateInterval {
  const range = getDefaultReportDateRange();
  return {
    endDate: range.endDateIso,
    startDate: range.startDateIso,
  };
}

export function formatReportIntervalDates(interval: ReportDateInterval) {
  return `${interval.startDate},${interval.endDate}`;
}

export function formatReportDateRangeLabel(interval: ReportDateInterval) {
  return `De ${formatReportDisplayDate(interval.startDate)} a ${formatReportDisplayDate(interval.endDate)}`;
}

export function formatReportDisplayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${String(day).padStart(2, "0")} de ${MONTHS_PT[month - 1] ?? String(month).padStart(2, "0")} de ${year}`;
}

export function formatReportDateIso(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function toLocalDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function subtractYearsClamped(date: Date, years: number) {
  const targetYear = date.getFullYear() - years;
  const targetMonth = date.getMonth();
  const targetDay = date.getDate();
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  return new Date(targetYear, targetMonth, Math.min(targetDay, lastDayOfTargetMonth));
}
