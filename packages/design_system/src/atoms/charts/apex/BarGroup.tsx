import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";
import chartTheme from "../../../themes/charts";
import { Typography } from "@mui/material";

export type SerieProps = {
  name: string;
  data: number[] | any[];
}

export type Props = {
  labels: string[];
  series: SerieProps[];
  yLabel?: string;
  width?: string | number;
  height?: string | number;
  id?: string;
  onClick?: (label: string) => void;
}

export function BarGroup({labels, series, yLabel, height, width, id, onClick}: Props) {
  const theme = useTheme();

  const options = {
    colors: chartTheme.theme1,
    chart: {
      id: id,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      },
      events: {
        click: function (event, chartContext, config) {
          if (config.dataPointIndex > -1) {
            onClick && onClick(labels[config.dataPointIndex])
          }
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"]
    },
    xaxis: {
      categories: labels,
      labels: {
          show: true,
          style: {
              colors: theme.palette.text.primary,
              fontFamily: theme.typography.fontFamily,
              fontWeight: 400,
              cssClass: "apexcharts-xaxis-label",
          },
      },
      axisBorder: {
        show: false,
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
    yaxis: {
      title: {
        text: yLabel,
        style:{
          fontSize: "12px",
          fontWeight: "bold",
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.text.primary
        }
      },
      labels: {
        show: true,
        style: {
          colors: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
          fontWeight: 400,
          cssClass: "apexcharts-xaxis-label",
        },
      },
      lines: {
        show: true,
      }
    },
    grid: {
      borderColor: "#cdcdcd",
      strokeDashArray: 3,
    },
    fill: {
      opacity: 1
    },
    legend: {
      labels: {
        colors: theme.palette.text.primary,
        useSeriesColors: false,
      },
      offsetY: 6,
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
      theme: theme.palette.mode,
      style: {
        fontSize: '12px',
        fontFamily: theme.typography.fontFamily,
        colors: theme.palette.text.primary,
        background: theme.palette.background.paper,
      },
    }
  };

  return (
    // @ts-ignore
    <Chart options={options} series={series} type="bar" width={width} height={height} />
  )
}

export default BarGroup;