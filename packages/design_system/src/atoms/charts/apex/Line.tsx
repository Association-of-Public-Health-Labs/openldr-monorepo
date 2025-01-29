import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";

import chartTheme from "../../../themes/charts";

export type SerieProps = {
  name: string;
  data: number[];
}

export type Props = {
  labels: string[];
  series: SerieProps[];
  yLabel?: string,
  width?: string | number;
  height?: string | number;
}


export function Line({labels, series, yLabel, width, height}: Props) {
  const theme = useTheme();

  const options = {
    colors: chartTheme.theme1,
    chart: {
      id: 'apexchart-line',
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
    },
    xaxis: {
      categories: labels,
      labels: {
          show: true,
          style: {
              colors: theme.palette.text.secondary,
              fontFamily: theme.typography.fontFamily,
              fontWeight: 400,
              cssClass: 'apexcharts-xaxis-label',
          },
      },
      axisBorder: {
          show: false,
          color: '#78909C',
          height: 1,
          width: '100%',
          offsetX: 0,
          offsetY: 0
      },
      axisTicks: {
          show: false,
          borderType: 'solid',
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
    yaxis: {
      title: {
        text: yLabel,
        style:{
          fontSize:  "12px",
          fontWeight:  "bold",
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.text.primary
        }
      },
      labels: {
        show: true,
        style: {
            colors: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
            fontWeight: 400,
            cssClass: 'apexcharts-xaxis-label',
        },
      },
      lines: {
        show: true,
      }
    },
    grid: {
      borderColor: '#cdcdcd',
      strokeDashArray: 3,
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
    stroke: {
      curve: 'smooth',
      width: 4
    },
    tooltip: {
      x: {
        show: false,
      },
    }
  }

  return (
    // @ts-ignore
    <Chart options={options} series={series} type="line" width={width} height={height} />
  )
}

export default Line;