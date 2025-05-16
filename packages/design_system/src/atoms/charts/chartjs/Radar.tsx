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
  RadialLinearScale,
  ChartOptions,
  PointElement,
  ArcElement,
  Filler,
  defaults
} from "chart.js";
import "chartjs-plugin-style";
import "chartjs-plugin-datalabels";
import { Radar as RadarChart } from "react-chartjs-2";
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation";
import { useTheme } from "@mui/material";
import { merge } from "../../../utils/utilities";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  Filler,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
);

export interface Props {
  options?: ChartOptions | any;
  height?: number;
  annotations?: AnnotationOptions;
}

const data = {
  labels: [
    "CAPCTM",
    "M2000",
    "ALINK",
    "C6800",
    "MPIMA",
    "GNXPERT",
  ],
  datasets: [{
    label: "Viral Load",
    data: [650, 590, 900, 810, 562, 552],
    fill: true,
    backgroundColor: "rgba(255, 99, 132, 0.2)",
    borderColor: "rgb(255, 99, 132)",
    pointBackgroundColor: "rgb(255, 99, 132)",
    pointBorderColor: "#fff",
    pointHoverBackgroundColor: "#fff",
    pointHoverBorderColor: "rgb(255, 99, 132)"
  }, {
    label: "EID",
    data: [28, 48, 40, 19, 96, 27, 100],
    fill: true,
    backgroundColor: "rgba(54, 162, 235, 0.2)",
    borderColor: "rgb(54, 162, 235)",
    pointBackgroundColor: "rgb(54, 162, 235)",
    pointBorderColor: "#fff",
    pointHoverBackgroundColor: "#fff",
    pointHoverBorderColor: "rgb(54, 162, 235)"
  }]
};

export const Radar = ({options, height=400, ...props}: Props) => {
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
    scales: {
      r: {
        ticks: {
          color: palette.text.primary,
          backdropColor: palette.background.paper
        },
        angleLines: {
          color: palette.divider,
        },
        grid: {
          color: palette.divider,
        },
        pointLabels: {
          color: palette.text.primary,
        }
      }
    },  
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: palette.text.primary,
          font: {
            family: typography.fontFamily
          }
        }
      },
      datalabels: {
        display: true,
        color: palette.text.primary,
      },
    },
  };
  
  return (
    <RadarChart 
      data={data} 
      height={height} 
      options={merge(defaultOptions, options || {})} 
      {...props} 
    />
   )
 }
