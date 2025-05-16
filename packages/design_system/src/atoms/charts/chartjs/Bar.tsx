import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  defaults,
  ChartEvent,
  ActiveElement,
  Chart
} from "chart.js";
import "chartjs-plugin-style";
import "chartjs-plugin-datalabels";
import { Bar as BarChart, getDatasetAtEvent } from "react-chartjs-2";
import annotationPlugin, { AnnotationOptions, AnnotationTypeRegistry } from "chartjs-plugin-annotation";
import {useTheme} from "@mui/material/styles";
import { merge } from "../../../utils/utilities";

ChartJS.register(
  CategoryScale,
  LinearScale,    
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export type SerieProps = {
  labels: string[];
  datasets: any[];
}

export type Props = {
  data: SerieProps;
  options?: ChartOptions | any;
  height?: number;
  annotations?: Record<string, AnnotationOptions<keyof AnnotationTypeRegistry>>;
  id?: string;
  onClick?: (label: string) => void;
}

export function Bar({ data, options, height = 300, annotations, id, onClick,...props}: Props) {
  const { palette, typography } = useTheme();
  
  defaults.font.family = typography.fontFamily;

  const defaultOptions = {
    responsive: true,
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    onClick: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
      if (elements.length > 0) {
        onClick && onClick(data.labels[elements[0].index]);
      }
    },
    // indexAxis: "y",
    borderColor: "transparent",
    barPercentage: 0.8,
    borderRadius: 3,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          color: palette.text.primary,
          font: {
            family: typography.fontFamily
          }
        }
      },
      title: {
        display: false,
        text: "Title",
      },
      autocolors: true,
      annotation: {
        annotations: annotations || {}
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: true,
          lineWidth: 0.5,
          borderColor: "transparent",
        },
        ticks: { 
          color: palette.text.primary,
          font: {
            family: typography.fontFamily
          }
        },
      },
      y: {
        grid: {
          display: true,
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false,
          lineWidth: 1,
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
    <BarChart 
      data={data} 
      height={height} 
      options={merge(defaultOptions, options || {})} 
      {...props} 
    />
   )
}
 
export default Bar;
