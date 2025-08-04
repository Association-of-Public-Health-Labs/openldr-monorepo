import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";

import chartTheme from "../../../themes/charts";
import { custom, z } from "zod";

export type StackedSerieProps = {
  name?: string;
  data: number[] | any[];
}

export type StackedProps = {
  labels: string[];
  series: StackedSerieProps[];
  yLabel?: string;
  width?: number | string;
  height?: number | string;
  id?: string;
  onClick?: (label: string) => void
}

const schema = z.object({
  labels: z.array(z.string()),
  series: z.array(z.object({
    name: z.string(),
    data: z.array(z.number()),
  })),
})


export function Stacked({ labels, series, yLabel, width, height, id, onClick}: StackedProps) {
  const theme = useTheme();

  const options = {
    colors: chartTheme.theme1,
    chart: {
      id: id,
      type: "bar",
      height: 350,
      stacked: true,
      // stackType: "50%",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      },
      events: {
        click: function(event: any, chartContext: any, config: any) {
          if(config.dataPointIndex > -1) {
            const label = labels[config.dataPointIndex]
            if(label) {
              onClick && onClick(label)  
            }
          }
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "30%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
      colors: ["#fff"]
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
            cssClass: "apexcharts-xaxis-label",
        },
      },
      lines: {
        show: true,
      }
    },
    tooltip: {
      y: {
        formatter: function (val: string) {
          return val //+ "K"
        }
      },
      x: {
        show: false,
      },
    },
    fill: {
      opacity: 1
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
        useSeriesColors: false
      },
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        // strokeColor: '#000',
        radius: 6,
        offsetX: 0,
        offsetY: 0
      },
    },
  };

  return (
    // @ts-ignore
    <Chart options={options} series={series} type="bar" width={width} height={height} />
  )
}

export default Stacked;

