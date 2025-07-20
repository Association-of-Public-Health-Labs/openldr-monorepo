
type AgeProps = {
  "0_to_4": number;
  "5_to_9": number;
  "10_to_14": number;
  "15_to_19": number;
  "20_to_24": number;
  "25_to_29": number;
  "30_to_34": number;
  "35_to_39": number;
  "40_to_44": number;
  "45_to_49": number;
  "50_to_54": number;
  "55_to_59": number;
  "60_to_64": number;
  "65_plus": number;
  "Age_Not_Specified": number;
}

export type Data = {
  Month: number;
  Month_Name: string;
  Year: number;
  Specimen_Types: {
    Sputum: AgeProps;
    Feces: AgeProps;
    Urine: AgeProps;
    Blood: AgeProps;
    Other: AgeProps;
  };
  Type_Of_Result: string;
  Lab: string;
  Start_Date: string;
  End_Date: string;
}

export const prepareChartData = (data: Data[]) => {
  if (data.length === 0) return {
    labels: [],
    series: []
  };

  const labels = data?.map((item) => item?.Month_Name);

  const series = [
    {
      name: 'Sputum',
      data: data?.map((item) => {
        const sputumData = item?.Specimen_Types?.Sputum;
        return Object.values(sputumData || {}).reduce((sum, value) => sum + (value || 0), 0);
      }),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Feces',
      data: data?.map((item) => {
        const fecesData = item?.Specimen_Types?.Feces;
        return Object.values(fecesData || {}).reduce((sum, value) => sum + (value || 0), 0);
      }),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Urine',
      data: data?.map((item) => {
        const urineData = item?.Specimen_Types?.Urine;
        return Object.values(urineData || {}).reduce((sum, value) => sum + (value || 0), 0);
      }),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Blood',
      data: data?.map((item) => {
        const bloodData = item?.Specimen_Types?.Blood;
        return Object.values(bloodData || {}).reduce((sum, value) => sum + (value || 0), 0);
      }),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Other',
      data: data?.map((item) => {
        const otherData = item?.Specimen_Types?.Other;
        return Object.values(otherData || {}).reduce((sum, value) => sum + (value || 0), 0);
      }),
      group: 'apexcharts-axis-0'
    },
  ];

  return {
    labels,
    series
  };
}
