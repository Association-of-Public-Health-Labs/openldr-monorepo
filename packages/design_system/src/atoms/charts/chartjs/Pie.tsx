
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
  ArcElement,
  Filler,
  defaults
} from "chart.js";
import "chartjs-plugin-style";
import "chartjs-plugin-datalabels";
import { Pie as PieChart } from "react-chartjs-2";
import annotationPlugin, {AnnotationOptions} from "chartjs-plugin-annotation";
// @ts-ignore
import { merge } from "merge-anything";
import {useTheme} from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
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
    "Routine",
    "STF",
    "Not Specified"
  ],
  datasets: [{
    label: "My First Dataset",
    data: [300, 50, 100],
    backgroundColor: [
      "rgb(255, 99, 132)",
      "rgb(54, 162, 235)",
      "rgb(255, 205, 86)"
    ],
    borderColor: "white",
    hoverOffset: 4
  }]
};

export const Pie = ({options, height=300, ...props}: Props) => {
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
        display: true,
        position: "bottom",
        labels: {
          color: palette.text.secondary,
          font: {
            family: typography.fontFamily
          }
        }
      },
      datalabels: {
        display: true,
        color: "white",
      },
    },
  };
  
  return (
    <PieChart 
      data={data} 
      height={height} 
      options={merge(defaultOptions, options || {})} 
      {...props} 
    />
   )
 }
