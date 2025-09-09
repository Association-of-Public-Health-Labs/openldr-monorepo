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
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation";
import { useTheme } from "@mui/material";
import { merge } from "../../../utils/utilities";
import ChartDataLabels from "chartjs-plugin-datalabels";
import chartTheme from "../../../themes/charts";

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
  ChartDataLabels 
);

export interface ChartjsPieProps {
  data?: any;
  options?: ChartOptions | any;
  height?: number;
  annotations?: AnnotationOptions;
}

const defaultData = {
  labels: [
    "Routine",
    "STF",
    "Not Specified"
  ],
  datasets: [{
    label: "My First Dataset",
    data: [300, 50, 100],
    backgroundColor: chartTheme.theme1.slice(0, 5), // Use first 5 colors from theme
    borderColor: "white",
    hoverOffset: 4
  }]
};

export const ChartjsPie = ({data, options, height=300, ...props}: ChartjsPieProps) => {
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
        color: "white",
      },
    },
  };
  
  return (
    <PieChart 
      data={data || defaultData} 
      height={height} 
      options={merge(defaultOptions, options || {})} 
      {...props} 
    />
   )
 }
