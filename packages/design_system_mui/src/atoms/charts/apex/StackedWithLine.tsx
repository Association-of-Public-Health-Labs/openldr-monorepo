import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";

import chartTheme from "../../../themes/charts";

export type StackedWithLineSerieProps = {
  name?: string;
  data: number[] | any[];
}

export type StackedWithLineProps = {
  labels: string[];
  series: StackedWithLineSerieProps[];
  yLabel?: string;
  width?: number | string;
  height?: number | string;
  id?: string;
  onClick?: (label: string) => void;
  colors?: string[];
  lineValue: number;
  lineLabel?: string;
  lineColor?: string;
  lineDashArray?: number;
}

/**
 * StackedWithLine chart component
 *
 * Renders a stacked bar chart with a horizontal annotation line representing
 * a reference/threshold value. Visually identical to the Stacked chart with
 * the addition of the annotation line.
 */
export function StackedWithLine({
  labels,
  series,
  yLabel,
  width,
  height,
  id,
  onClick,
  colors,
  lineValue,
  lineLabel,
  lineColor = "#FF4560",
  lineDashArray = 5,
}: StackedWithLineProps) {
  const theme = useTheme();

  const options = {
    colors: colors || chartTheme.theme1,
    chart: {
      id: id,
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      events: {
        click: function (event: any, chartContext: any, config: any) {
          if (config.dataPointIndex > -1) {
            const label = labels[config.dataPointIndex];
            if (label) {
              onClick && onClick(label);
            }
          }
        },
      },
    },
    annotations: {
      yaxis: [
        {
          y: lineValue,
          borderColor: lineColor,
          strokeDashArray: lineDashArray,
          borderWidth: 2,
          label: {
            text: lineLabel || `${lineValue}%`,
            position: "left" as const,
            borderColor: lineColor,
            style: {
              color: "#fff",
              background: lineColor,
              fontSize: "11px",
              fontFamily: theme.typography.fontFamily,
              padding: {
                left: 6,
                right: 6,
                top: 2,
                bottom: 2,
              },
            },
          },
        },
      ],
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 1,
        columnWidth: "40%",
      },
    },
    dataLabels: {
      enabled: false,
      distributed: false,
      offsetX: 0,
      offsetY: 0,
      style: {
        fontSize: '8px',
        fontWeight: 'normal',
        colors: ['#fff']
      },
      formatter: function (val: number) {
        return val > 0 ? val.toString() : '';
      }
    },
    stroke: {
      width: 0,
      colors: ["#fff"],
    },
    xaxis: {
      categories: labels,
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
        offsetY: 0,
      },
      axisTicks: {
        show: false,
        borderType: "solid",
        height: 6,
        offsetX: 0,
        offsetY: 0,
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
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.text.primary,
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
      },
      lines: {
        show: true,
      },
    },
    tooltip: {
      y: {
        formatter: function (val: string) {
          return val;
        },
      },
      x: {
        show: false,
      },
    },
    fill: {
      opacity: 1,
    },
    grid: {
      borderColor: "#cdcdcd",
      strokeDashArray: 3,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      colors: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
      fontWeight: 400,
      offsetY: 6,
      labels: {
        colors: theme.palette.text.primary,
        useSeriesColors: false,
      },
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 6,
        offsetX: 0,
        offsetY: 0,
      },
    },
  };

  return (
    <div id={id}>
      {/* @ts-ignore */}
      <Chart options={options} series={series} type="bar" width={width} height={height} />
    </div>
  );
}

export default StackedWithLine;
