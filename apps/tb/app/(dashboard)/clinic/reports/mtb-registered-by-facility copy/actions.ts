
// Types
export type Data = {
  Facility: string;
  Registered_Samples: number;
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

export type FacilityType = "province" | "district" | "clinic" | "patients";
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
      province: facilities.map(facility => facility.province),
    }),
    ...(facilityType === "clinic" && {
      // health_facility: facilities[0]?.value,
      province: facilities.map(facility => facility.province),
      district: facilities.map(facility => facility.district),
      facility_type: "health_facility"
    }),
  };

  return { ...baseParams, ...facilityParams };

};

export const prepareChartData = (data: Data[]) => {
  if (data.length === 0) {
    return { labels: [], series: [] };
  }

  const labels = data.map(item => item.Facility);
  const series = [{
    name: 'Amostras Registadas',
    data: data.map(item => item.Registered_Samples),
    group: 'apexcharts-axis-0'
  }];

  return { labels, series };
};

export async function fetchPatientData(params: {
  interval_dates: string;
  province: string;
  district: string;
  health_facility: string;
  genexpert_result_type: string;
}) {
  try {
    const queryParams = new URLSearchParams({
      disaggregation: "True",
      interval_dates: params.interval_dates,
      province: params.province,
      district: params.district,
      health_facility: params.health_facility,
      genexpert_result_type: params.genexpert_result_type,
    });

    const response = await fetch(
      `https://dev.openldr.org.mz/tb/gx/facilities/registered_samples/?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "accept": "application/json",
        },
      }
    );

    console.log("RESPONSE", response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching patient data:", error);
    throw error;
  }
}
