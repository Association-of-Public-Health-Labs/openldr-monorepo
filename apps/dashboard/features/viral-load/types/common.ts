export type ViralLoadDateInterval = {
  startDate: string;
  endDate: string;
};

export type ViralLoadApiError = {
  code?: number;
  error?: string;
  message?: string;
  status?: "error" | string;
};

export function getDefaultViralLoadInterval(): ViralLoadDateInterval {
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);

  return {
    startDate: formatApiDate(start),
    endDate: formatApiDate(end),
  };
}

export function formatApiDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatViralLoadInterval(interval: ViralLoadDateInterval) {
  return `De ${formatDisplayDate(interval.startDate)} a ${formatDisplayDate(interval.endDate)}`;
}

export function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}
