
// Types
export type Data = {
  Facility: string;
  Tested_Samples: number;
  Detected: number;
  Not_Detected: number;
  Invalid: number;
  Errors: number;
  Start_Date: string;
  End_Date: string;
  Disaggregation: boolean;
  Facility_Type: string;
  Type_Of_Result: string;
}

export type FacilityOptions = {
  value: string;
  label: string;
  district: string;
  province: string;
}

export type FacilityType = "province" | "district" | "clinic";
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
    ? "Relatório de Amostras Testadas - MTB Ultra" 
    : "Relatório de Amostras Testadas - MTB XDR";
};  

export const buildApiParams = (
  timeInterval: { startDate: string; endDate: string },
  activeTab: ActiveTab,
  facilities: FacilityOptions[],
  facilityType: FacilityType,
  disaggregation: boolean
) => {
  const baseParams = {
    interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
    genexpert_result_type: getGenexpertResultType(activeTab),
    disaggregation: disaggregation ? "True" : "False"
  };

  const facilityParams = {
    ...(facilityType === "province" || facilityType === "district") && {
      province: facilities.map(facility => facility.province)
    },
    ...(facilityType === "district" && {
      district: facilities.map(facility => facility.district)
    }),
    ...(facilityType === "clinic" && {
      clinic: facilities.map(facility => facility.value)
    })
  };

  return { ...baseParams, ...facilityParams };
};

export const prepareChartData = (data: Data[]) => {
  if (data.length === 0) {
    return { labels: [], series: [] };
  }

  const labels = data.map(item => item.Facility);
  const series = [{
      name: 'Amostras Testadas',
      data: data.map(item => item.Detected),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Amostras Não Detetadas',
      data: data.map(item => item.Not_Detected),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Amostras Inválidas',
      data: data.map(item => item.Invalid),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Amostras com Erros',
      data: data.map(item => item.Errors),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Outros',
      data: data.map(item => item.Tested_Samples - item.Detected - item.Not_Detected - item.Invalid - item.Errors),
      group: 'apexcharts-axis-0'
    }
  ];

  return { labels, series };
};
