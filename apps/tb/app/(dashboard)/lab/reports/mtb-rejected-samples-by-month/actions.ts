
// Types
export type Data = {
  Month: number;
  Month_Name: string;
  Year: number;
  Rejected_Samples: number;
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

  const labels = data.map(item => item.Month_Name);
  const series = [{
    name: 'Amostras Rejeitadas',
    data: data.map(item => item.Rejected_Samples),
    group: 'apexcharts-axis-0'
  }];

  return { labels, series };
};
