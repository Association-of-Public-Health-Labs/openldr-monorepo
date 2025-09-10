
// Types
export type Data = {
  Analysis_Datetime_Null: number;
  Authorised_Datetime_Null: number;
  End_Date: string;
  Laboratory: string;
  Received_Datetime_Null: number;
  Registered_Datetime_Null: number;
  Specimen_Datetime_Null: number;
  Start_Date: string;
  Total: number;
  Type_Of_Result: string;
  analise_no_lab__validacao_no_lab: {
    between_16_21: number;
    between_7_15: number;
    greater_than_21: number;
    less_than_7: number;
  }
  colheita_us__recepcao_lab: {
    between_16_21: number;
    between_7_15: number;
    greater_than_21: number;
    less_than_7: number;
  }
  recepcao_lab__registo_no_lab: {
    between_16_21: number;
    between_7_15: number;
    greater_than_21: number;
    less_than_7: number;
  }
  registo_no_lab__analise_no_lab: {
    between_16_21: number;
    between_7_15: number;
    greater_than_21: number;
    less_than_7: number;
  }
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
    ? "Relatório Xpert MTB Ultra por mês" 
    : "Relatório Xpert MTB XDR por mês";
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

  return { ...baseParams };
};

export const prepareChartData = (data: Data[]) => {
  
};
