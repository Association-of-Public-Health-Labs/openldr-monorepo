import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";

import chartTheme from "../../../themes/charts";

export type PieProps = {
  labels: string[];
  series: number[];
  width?: number | string;
  height?: number | string;
}


export function Pie({labels, series, width, height}: PieProps) {
  const theme = useTheme();

  const options = {
    colors: chartTheme.theme1,
    chart: {
      type: "pie",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      },
    },
    stroke: {
      width: 2,
      colors: ["#fff"]
    },
    tooltip: {
      y: {
        formatter: function (val: string) {
          return val + "K"
        }
      },
      x: {
        show: false,
      },
    },
    fill: {
      opacity: 1
    },
    labels: labels,
    legend: {
      verticalAlign: "center",
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
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    // @ts-ignore
    <Chart options={options} series={series} type="pie" width={width} />
  )
}

