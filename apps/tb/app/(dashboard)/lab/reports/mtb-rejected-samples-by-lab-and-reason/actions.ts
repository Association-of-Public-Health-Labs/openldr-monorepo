
// Types
export type Data = {
  Testing_Facility: string;
  Testing_Facility_code: string;
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
    ? "Relatório Xpert MTB Ultra Rejeitadas por Laboratório" 
    : "Relatório Xpert MTB XDR Rejeitadas por Laboratório";
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

  const labels = data.map(item => item.Testing_Facility);
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
