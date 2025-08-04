import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";

import chartTheme from "../../../themes/charts";

export type MixedLineBarSerieProps = {
  name: string;
  type: string;
  data: number[];
}

export type MixedLineBarProps = {
  labels: string[];
  series: MixedLineBarSerieProps[];
  width?: string | number;
  height?: string | number;
}


export function MixedLineBar({labels, series, width, height}: MixedLineBarProps) {
  const theme = useTheme();

  const options = { 
    colors: chartTheme.theme1,
    chart: {
      height: 350,
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      },
    },
    dataLabels: {
      enabled: false,
      enabledOnSeries: [1]
    },
    labels: labels,
    xaxis: {
      labels: {
        show: true,
        style: {
            colors: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
            fontWeight: 400,
            cssClass: "apexcharts-xaxis-label",
        },
      },
      axisBorder: {
          show: false,
          color: "#78909C",
          height: 1,
          width: "100%",
          offsetX: 0,
          offsetY: 0
      },
      axisTicks: {
          show: false,
          borderType: "solid",
          height: 6,
          offsetX: 0,
          offsetY: 0
      },
      tooltip: {
        enabled: true,
        formatter: undefined,
        offsetY: 0,
      },
    },
    yaxis: [{
      title: {
        text: series[0].name,
        style: {
          fontSize:  "12px",
          fontWeight:  "bold",
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.text.primary
        },
      },
      labels: {
        show: true,
        style: {
            colors: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
            fontWeight: 400,
            cssClass: "apexcharts-xaxis-label",
        },
      }
    }, {
      labels: {
        show: true,
        style: {
            colors: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
            fontWeight: 400,
            cssClass: "apexcharts-xaxis-label",
        },
      },
      opposite: true,
      title: {
        text: series[1].name,
        style: {
          fontSize:  "12px",
          fontWeight:  "bold",
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.text.primary
        },
      }
    }],
    grid: {
      borderColor: "#cdcdcd",
      strokeDashArray: 3,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '40%',
      },
    },
    stroke: {
      curve: "smooth",
      width: [0, 4]
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: theme.palette.text.primary,
        useSeriesColors: false
      },
      colors: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
      fontWeight: 400,
      itemMargin: {
          horizontal: 10,
          vertical: 0
      },
    },
    tooltip: {
      x: {
        show: false,
      },
    }
  };

  return (
    // @ts-ignore
    <Chart options={options} series={series} type="line" width={width} height={height} />
  )
}

export default MixedLineBar;

