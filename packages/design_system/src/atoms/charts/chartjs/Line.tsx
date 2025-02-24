
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  PointElement,
  Filler,
  defaults
} from "chart.js";
import "chartjs-plugin-style";
import "chartjs-plugin-datalabels";
import { Line as LineChart } from "react-chartjs-2";
import annotationPlugin, {AnnotationOptions} from "chartjs-plugin-annotation";
// @ts-ignore
import { merge } from "merge-anything";
import hexToRgba from "hex-to-rgba";
import {useTheme} from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  annotationPlugin,
  Filler
);

export interface Props {
  options?: ChartOptions | any;
  height?: number;
  annotations?: AnnotationOptions;
}

const data = () => {
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

  
  const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const values = {
    labels,
    datasets: {
      label: "Suppressed",
      data: [12, 19, 3, 5, 2, 3, 10, 12, 19, 3, 5, 2],
      color: "#00b000",
    }
  };
  
  let gradientFill = ctx.createLinearGradient(0, 200, 0, 50);

  gradientFill = ctx.createLinearGradient(0, 170, 0, 50);
  gradientFill.addColorStop(0, hexToRgba(values.datasets.color, "0"));
  gradientFill.addColorStop(1, hexToRgba(values.datasets.color, "0.2"));

  return {
    labels: values.labels,
    datasets: [
      {
        label: values.datasets.label,
        borderColor: values.datasets.color,
        pointBorderColor: "#FFF",
        pointBackgroundColor: values.datasets.color,
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        backgroundColor: gradientFill,
        tension: 0.4,
        borderWidth: 2,
        shadowColor: "rgba(0,0,0,0.08)",
        shadowOffsetX: 0,
        shadowOffsetY: 7,
        data: values.datasets.data,
      },
    ],
  };
};

export const Line = ({options, height=300, annotations, ...props}: Props) => {
  const {palette, typography} = useTheme();

  defaults.font.family = typography.fontFamily;

  const defaultOptions = {
    maintainAspectRatio: false,
    responsive: true,
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    borderColor: "transparent",
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: "Title",
      },
      // autocolors: false,
      annotation: {
        annotations: annotations
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: true,
          lineWidth: 0.4,
          borderColor: "transparent",
        },
        ticks: {
          color: palette.text.primary,
          font: {
            family: typography.fontFamily
          }
        }
      },
      y: {
        grid: {
          display: true,
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: true,
          lineWidth: 0.4,
          borderColor: "transparent",
        },
        ticks: {
          display: true,
          padding: 10,
          color: palette.text.primary,
          font: {
            family: typography.fontFamily
          }
        },
      },
    },
  };
  
  return (
    <LineChart 
      data={data()} 
      height={height} 
      options={merge(defaultOptions, options || {})} 
      {...props} 
    />
   )
 }
