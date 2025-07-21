
// Types
export type Data = {
  Facility: string;
  Rifampicin_Null: number;
  "0_4": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "5_9": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "10_14": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "15_19": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "20_24": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "25_29": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "30_34": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "35_39": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "40_44": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "45_49": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "50_54": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "55_59": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "60_64": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "65+": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  "Not_Specified": {
    Resistance_Detected: number;
    Resistance_Not_Detected: number;
    Resistance_Indeterminate: number;
  };
  Start_Date: string;
  End_Date: string;
  Disaggregation: boolean;
  Facility_Type: string;
  Type_Of_Result: string;
  Drug: string;
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
  disaggregation: boolean,
  drug: string
) => {
  const baseParams = {
    interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
    disaggregation: disaggregation ? "True" : "False",
    drug: drug
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
  drug: string 
) => {
  const ageGroups = [
    "0_4", "5_9", "10_14", "15_19", "20_24", "25_29", "30_34", "35_39",
    "40_44", "45_49", "50_54", "55_59", "60_64", "65+"
  ];

  const labels = ageGroups.map(group => group.replace("_", "-"));

  type ResistanceType = "Resistance_Detected" | "Resistance_Not_Detected" | "Resistance_Indeterminate";

  function sumByAgeGroupAndType(
    ageGroup: string,
    resistanceType: ResistanceType
  ) {
    return data.reduce((sum, item) => {
      if (
        item.Drug === drug &&
        ageGroup in item &&
        typeof (item as Record<string, any>)[ageGroup]?.[resistanceType] === "number"
      ) {
        return sum + (item as Record<string, any>)[ageGroup][resistanceType];
      }
      return sum;
    }, 0);
  }

  const series = [
    {
      name: "Resistente",
      data: ageGroups.map(ageGroup => sumByAgeGroupAndType(ageGroup, "Resistance_Detected")),
      group: "apexcharts-axis-0"
    },
    {
      name: "Sensível",
      data: ageGroups.map(ageGroup => sumByAgeGroupAndType(ageGroup, "Resistance_Not_Detected")),
      group: "apexcharts-axis-0"
    },
    {
      name: "Indeterminado",
      data: ageGroups.map(ageGroup => sumByAgeGroupAndType(ageGroup, "Resistance_Indeterminate")),
      group: "apexcharts-axis-0"
    }
  ];

  return { labels, series };
};