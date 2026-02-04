import { Data } from "./constants";

// Portuguese month names mapping
const PORTUGUESE_MONTHS: Record<string, { full: string; short: string }> = {
  'January': { full: 'Janeiro', short: 'Jan' },
  'February': { full: 'Fevereiro', short: 'Fev' },
  'March': { full: 'Março', short: 'Mar' },
  'April': { full: 'Abril', short: 'Abr' },
  'May': { full: 'Maio', short: 'Mai' },
  'June': { full: 'Junho', short: 'Jun' },
  'July': { full: 'Julho', short: 'Jul' },
  'August': { full: 'Agosto', short: 'Ago' },
  'September': { full: 'Setembro', short: 'Set' },
  'October': { full: 'Outubro', short: 'Out' },
  'November': { full: 'Novembro', short: 'Nov' },
  'December': { full: 'Dezembro', short: 'Dez' },
  'Janeiro': { full: 'Janeiro', short: 'Jan' },
  'Fevereiro': { full: 'Fevereiro', short: 'Fev' },
  'Março': { full: 'Março', short: 'Mar' },
  'Abril': { full: 'Abril', short: 'Abr' },
  'Maio': { full: 'Maio', short: 'Mai' },
  'Junho': { full: 'Junho', short: 'Jun' },
  'Julho': { full: 'Julho', short: 'Jul' },
  'Agosto': { full: 'Agosto', short: 'Ago' },
  'Setembro': { full: 'Setembro', short: 'Set' },
  'Outubro': { full: 'Outubro', short: 'Out' },
  'Novembro': { full: 'Novembro', short: 'Nov' },
  'Dezembro': { full: 'Dezembro', short: 'Dez' },
};

/**
 * Format month label based on data span
 */
const formatMonthLabel = (monthName: string, year: number, shouldIncludeYear: boolean): string => {
  const monthData = PORTUGUESE_MONTHS[monthName];

  if (!monthData) {
    return shouldIncludeYear ? `${monthName.substring(0, 3)} ${year}` : monthName;
  }

  return shouldIncludeYear ? `${monthData.short} ${year}` : monthData.full;
};

/**
 * Check if chart data should include year in labels
 */
const shouldShowYearInLabels = (data: Array<{ Year: number }>): boolean => {
  if (data.length === 0) return false;
  if (data.length > 13) return true;
  const years = new Set(data.map(item => item.Year));
  return years.size > 1;
};

export const prepareChartData = (data: Data[]) => {
  if (data.length === 0) return {
    labels: [],
    series: []
  };

  const includeYear = shouldShowYearInLabels(data);
  const labels = data?.map((item) => formatMonthLabel(item?.Month_Name, item?.Year, includeYear));
  const series = [
    {
      name: 'MTB Detectado',
      data: data?.map((item) => item?.Detected_Samples),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'MTB Não Detectado',
      data: data?.map((item) => item?.Not_Detected_Samples),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Inválido',
      data: data?.map((item) => item?.Invalid_Samples),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Erros',
      data: data?.map((item: any) => item?.Errors),
      group: 'apexcharts-axis-0'
    }
  ];

  return { labels, series };
};



export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export const getLastTwelveMonths = (): TimeInterval => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 11);
  startDate.setDate(1);
  
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};