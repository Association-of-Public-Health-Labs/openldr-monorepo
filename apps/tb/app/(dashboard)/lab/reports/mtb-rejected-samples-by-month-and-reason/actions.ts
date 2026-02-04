
// Types
export type Data = {
  Month: number;
  Month_Name: string;
  Year: number;
  Rejected_Samples: number;
  Isuficient_Specimen: number;
  Specimen_Not_Received: number;
  Specimen_Unsuitable_For_Testing: number;
  Equipment_Failure: number;
  Repeat_Specimen_Collection: number;
  Specimen_Not_Labeled: number;
  Laboratory_Acident: number;
  Missing_Reagent: number;
  Double_Registration: number;
  Technical_Error: number;
  Other: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;
  Lab_Type: string;
  Facilities: string[];
}

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

export type FacilityOptions = {
  value: string;
  label: string;
  district: string;
  province: string;
}

export type LabType = "All" | "Conventional" | "Point_Of_Care";
export type ActiveTab = "ultra" | "xdr";

// Helper function to get last 12 months date range
export const getLastTwelveMonths = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 11);
  startDate.setDate(1); // Set to first day of the month
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // Returns "YYYY-MM-DD" format
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

// Helper functions
export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  return activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
};

export const getReportName = (activeTab: ActiveTab): string => {
  return activeTab === "ultra" 
    ? "Relatório Xpert MTB Ultra Rejeitadas por mês" 
    : "Relatório Xpert MTB XDR Rejeitadas por mês";
};  

export const buildApiParams = (
  timeInterval: { startDate: string; endDate: string },
  activeTab: ActiveTab,
  labs: FacilityOptions[],
  labType: LabType,
  disaggregation: boolean
) => {
  const baseParams = {
    interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
    genexpert_result_type: getGenexpertResultType(activeTab),
    disaggregation: disaggregation ? "True" : "False",
    type_of_laboratory: labType
  };

  const labParams = {
    // ...(facilityType === "province" || facilityType === "district") && {
    //   province: facilities.map(facility => facility.province)
    // },
    // ...(facilityType === "district" && {
    //   district: facilities.map(facility => facility.district)
    // }),
    // ...(facilityType === "clinic" && {
    //   clinic: facilities.map(facility => facility.value)
    // })
  };

  return { ...baseParams, ...labParams };
};


export const prepareChartData = (data: Data[]) => {
  if (data.length === 0) {
    return { labels: [], series: [] };
  }

  const includeYear = shouldShowYearInLabels(data);
  const labels = data.map(item => formatMonthLabel(item.Month_Name, item.Year, includeYear));
  const series = [{
    name: 'Amostra Insuficiente',
    data: data.map(item => item.Isuficient_Specimen),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Amostra Não Recebida',
    data: data.map(item => item.Specimen_Not_Received),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Amostra Inadequada para Teste',
    data: data.map(item => item.Specimen_Unsuitable_For_Testing),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Falha de Equipamento',
    data: data.map(item => item.Equipment_Failure),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Amostra Não Etiquetada',
    data: data.map(item => item.Specimen_Not_Labeled),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Acidente no Laboratório',
    data: data.map(item => item.Laboratory_Acident),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Reagente Ausente',
    data: data.map(item => item.Missing_Reagent),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Duplicação de Registo',
    data: data.map(item => item.Double_Registration),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Erro Técnico',
    data: data.map(item => item.Technical_Error),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Amostra Repetida',
    data: data.map(item => item.Repeat_Specimen_Collection),
    group: 'apexcharts-axis-0'
  }, {
    name: 'Outro',
    data: data.map(item => item.Other),
    group: 'apexcharts-axis-0'
  }];

  return { labels, series };
};
