import { Data } from ".";

export const prepareChartData = (data: Data[]) => {
  if (data.length === 0) return {
    labels: [],
    series: []
  };

  const labels = ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39"];

  // Create a map to store data by age group
  const ageGroupData = data.reduce((acc, item) => {
    // Find the age group key (e.g., "0-4", "5-9", etc.)
    const ageGroupKey = Object.keys(item).find(key => 
      key !== "Type_Of_Result" && 
      key !== "Lab" && 
      key !== "Start_Date" && 
      key !== "End_Date"
    );
    
    if (ageGroupKey && item[ageGroupKey as keyof Data]) {
      acc[ageGroupKey] = item[ageGroupKey as keyof Data];
    }
    return acc;
  }, {} as Record<string, any>);

  const series = [
    {
      name: 'MTB Detetado',
      data: labels.map(label => ageGroupData[label]?.Detected_Samples || 0),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'MTB Não Detetado',
      data: labels.map(label => ageGroupData[label]?.Not_Detected_Samples || 0),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Erros',
      data: labels.map(label => ageGroupData[label]?.Errors || 0),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Inválido',
      data: labels.map(label => ageGroupData[label]?.Invalid_Samples || 0),
      group: 'apexcharts-axis-0'
    },
  ];

  return {
    labels,
    series
  };
}


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