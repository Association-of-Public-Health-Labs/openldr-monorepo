import React from "react";
import Chart from "react-apexcharts";
import { withMinimalsChart } from "../../../themes/minimals-chart";
import { useTheme } from "@mui/material/styles";

import chartTheme from "../../../themes/charts";

export type SimpleLineSerieProps = {
  name: string;
  data: number[];
}

export type SimpleLineProps = {
  labels: string[];
  series: SimpleLineSerieProps[];
  width?: number | string;
  height?: number | string;
  colors?: string[];
}


export function SimpleLine({labels, series, width, height, colors=chartTheme.theme1}: SimpleLineProps) {
  const theme = useTheme();

  const options = {
    colors: colors,
    chart: {
      id: 'apexchart-simple-line',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      },
      dropShadow: {
        enabled: false,
        top: 10,
        left: 0,
        blur: 0,
        opacity: 0.03
      },   
      sparkline: {
        enabled: true
      } 
    },
    xaxis: {
      categories: labels,
      labels: {
          show: false,
          style: {
              colors: [],
              fontFamily: theme.typography.fontFamily,
              fontWeight: 400,
              cssClass: 'apexcharts-xaxis-label',
          },
      },
      axisBorder: {
          show: false,
          color: '#78909C',
      },
      axisTicks: {
          show: false,
          borderType: 'solid',
      },
      tooltip: {
        enabled: false,
        formatter: undefined,
        offsetY: 0,
      },
    },
    yaxis: {
      labels: {
        show: false,
        style: {
            colors: [],
            fontFamily: theme.typography.fontFamily,
            fontWeight: 400,
            cssClass: 'apexcharts-xaxis-label',
        },
      },
      lines: {
        show: false,
      }
    },
    grid: {
      show: false,
      padding: {
        top: 0,
        left: 0,
        right: 0,
      }
    },
    legend: {
      show: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    tooltip: {
    }
  }

  return (
    // @ts-ignore
    <Chart options={withMinimalsChart(options, "area")} series={series} type="area" width={width} height={height} />
  )
}

export default SimpleLine;
