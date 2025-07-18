import { Data } from ".";

export const prepareChartData = (data: Data[]) => {
  if (data.length === 0) return {
    labels: [],
    series: []
  };

  const labels = data?.map((item) => item?.Month_Name);
  const series = [
    {
      name: 'MTB Detectado',
      data: data?.map((item) => item?.Detected_Samples),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'MTB Não Detectado',
      data: data?.map((item) => item?.Not_Detected_Samples),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Inválido',
      data: data?.map((item) => item?.Invalid_Samples),
      group: 'apexcharts-axis-0'
    },
    {
      name: 'Erros',
      data: data?.map((item: any) => item?.Errors),
      group: 'apexcharts-axis-0'
    }
  ];

  return { labels, series };
};
