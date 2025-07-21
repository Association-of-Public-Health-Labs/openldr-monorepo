
// Types
export type Data = {
  Facility: string;
  Rifampicin_Null: number;
  Rifampicin: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Isoniazid: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Fluoroquinolona: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Kanamicin: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Amikacin: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Capreomicin: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Ethionamide: {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
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

export const buildApiParams = (
  timeInterval: { startDate: string; endDate: string },
  facilities: FacilityOptions[],
  facilityType: FacilityType,
  disaggregation: boolean
) => {
  const baseParams = {
    interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
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

export const prepareChartData = (
  data: Data[],
  facility?: string
) => {
  if (data.length === 0) {
    return { labels: [], series: [] };
  }

  const drugKeyMap: Record<string, keyof Data> = {
    "Rifampicina": "Rifampicin",
    "Isoniazida": "Isoniazid",
    "Fluoroquinolona": "Fluoroquinolona",
    "Kanamicina": "Kanamicin",
    "Amicacina": "Amikacin",
    "Capreomicina": "Capreomicin",
    "Etionamida": "Ethionamide"
  };

  const labels = Object.keys(drugKeyMap);

  // Helper to sum values for a given drug and resistance type
  function sumByDrugAndType(
    label: string,
    resistanceType: "Resistance_Detected" | "Resistance_Not_Detected" | "Resistance_Indeterminate"
  ) {
    const drug = drugKeyMap[label];
    return data
      .filter(item => !facility || item.Facility === facility)
      .reduce((sum, item) => {
        const drugData = item[drug];
        if (
          drugData &&
          typeof drugData === "object" &&
          "Resistance_Detected" in drugData &&
          typeof (drugData as any)[resistanceType] === "number"
        ) {
          return sum + (drugData as any)[resistanceType];
        }
        return sum;
      }, 0);
  }

  // Build series for each resistance category
  const series = [
    {
      name: "Resistente",
      data: labels.map(label => sumByDrugAndType(label, "Resistance_Detected")),
      group: "apexcharts-axis-0"
    },
    {
      name: "Sensível",
      data: labels.map(label => sumByDrugAndType(label, "Resistance_Not_Detected")),
      group: "apexcharts-axis-0"
    },
    {
      name: "Indeterminado",
      data: labels.map(label => sumByDrugAndType(label, "Resistance_Indeterminate")),
      group: "apexcharts-axis-0"
    }
  ];

  return { labels, series };
};
