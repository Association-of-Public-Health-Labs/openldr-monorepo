import React from "react";
import Chart from "react-apexcharts";
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
      // @ts-ignore
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        // Get the color of the current series
        const seriesColor = w.globals.colors[seriesIndex];

        return `
          <div style="
            padding: 0;
            border-radius: 0px;
            font-family: 'Open Sans', 'Nunito Sans', sans-serif;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: ${theme.palette.background.paper};
            min-width: 100px;
          ">
            <div style="
              color: ${theme.palette.text.primary};
              padding: 4px 8px;
              border-radius: 0px;
              font-family: 'Open Sans', 'Nunito Sans', sans-serif;
              text-align: center;
              font-size: 12px;
              margin-bottom: 2px;
              font-weight: 600;
            ">
              ${labels[dataPointIndex]}
            </div>
            <div style="width: 100%; background-color: ${theme.palette.background.default}; display: flex; align-items: center; justify-content: center;">
              <div 
                style="
                  font-family: 'Open Sans', 'Nunito Sans', sans-serif;
                  font-size: 12px;
                  color: ${theme.palette.text.primary};
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: start;
                  gap: 10px;
                  padding: 8px 8px;
                "
              >
                <span style="display: block; background-color: ${seriesColor}; border-radius: 50%; width: 10px; height: 10px;"></span>
                <span style="">
                  ${series[seriesIndex][dataPointIndex]}
                </span>
              </div>
            </div>
          </div>
        `;
      },
    }
  }

  return (
    // @ts-ignore
    <Chart options={options} series={series} type="line" width={width} height={height} />
  )
}

export default SimpleLine;
