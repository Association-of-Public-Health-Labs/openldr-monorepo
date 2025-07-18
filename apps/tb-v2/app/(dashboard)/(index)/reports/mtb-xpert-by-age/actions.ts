import { Data } from ".";

export const prepareChartData = (data: Data[]) => {
  if (data.length === 0) return {
    labels: [],
    series: []
  };

  const labels = data?.map((item) => item?.Facility);
  const series = [{
    name: "Sputum",
    data: data?.map((item) => item?.["0_4"]),
    group: "apexcharts-axis-0"
  }];

  return { labels, series };
};
