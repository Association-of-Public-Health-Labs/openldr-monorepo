"use client"

import { Pie, PieChart } from "recharts"
import { useEffect, useState } from "react"
import {
  ChartConfig,
  ChartContainer,
} from "../../../../../components/ui/chart"
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { TbMessage2Question } from "react-icons/tb";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { VscDebugRestart } from "react-icons/vsc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import Docs from "./docs";
import { getLastTwelveMonths } from "./actions";
import { useUser } from "@clerk/nextjs";

export type Data = {
  Analysed_Samples: number;
  Detected_Samples: number;
  End_Date: string;
  Errors: number;
  Invalid_Samples: number;
  Lab: string;
  Month: number;
  Month_Name: string;
  Not_Detected_Samples: number;
  Registered_Samples: number;
  Start_Date: string;
  Type_Of_Result: string;
  Year: number;
}

export const description = ""

const endpoint = `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/summary/positivity_by_month/`;

const ultraChartConfig = {
  mtb_not_detected: {
    label: "MTB não detectado",
    color: "var(--chart-1)",
  },
  mtb_detected: {
    label: "MTB detectado",
    color: "var(--chart-2)",
  },
  invalid: {
    label: "Inválidos",
    color: "var(--chart-3)",
  },
  errors: {
    label: "Erros",
    color: "var(--chart-4)",
  },
  not_analysed: {
    label: "Não analisados",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const xdrChartConfig = {
  mtb_not_detected: {
    label: "MTB não detectado",
    color: "#22c55e",
  },
  mtb_detected: {
    label: "MTB detectado",
    color: "#3b82f6",
  },
  invalid: {
    label: "Inválidos",
    color: "#f59e0b",
  },
  errors: {
    label: "Erros",
    color: "#ef4444",
  },
  not_analysed: {
    label: "Não analisados",
    color: "#6b7280",
  },
} satisfies ChartConfig

// Custom Legend Component
interface LegendItemProps {
  color: string;
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 'fit-content' }}>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.75rem' }}>
        {label}
      </Typography>
    </Box>
  );
}

interface CustomLegendProps {
  config: ChartConfig;
}

function CustomLegend({ config }: CustomLegendProps) {
  const categories = Object.entries(config).filter(([key]) => key !== 'trace');
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
        padding: 1,
        backgroundColor: 'transparent',
        width: '100%',
      }}
    >
      {categories.map(([key, value]) => (
        <LegendItem
          key={key}
          color={value.color || '#000000'}
          label={String(value.label || '')}
        />
      ))}
    </Box>
  );
}

export function MTBXpertPieChartReport() {
  const [activeTab, setActiveTab] = useState("ultra");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data[]>([]);
  const [timeInterval, setTimeInterval] = useState(getLastTwelveMonths());
  const { isLoaded, isSignedIn, user } = useUser();

  const fetchDataFromApi = async (startDate: string, endDate: string, activeTab: string) => {
    try {
      setLoading(true);

      const response = await axios.get(endpoint, {
        params: {
          interval_dates: `${startDate}, ${endDate}`,
          genexpert_result_type: activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores"
        },
      });

      if(response.data?.length > 0) {
        setData(response.data || []);
        return;
      }

      setError(null);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching data:", error.response?.data || error.message);
        setError(error.response?.data?.message || error.message || "An error occurred");
      } else {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, activeTab);
  }, [timeInterval, activeTab]);
  

  const getCurrentConfig = () => {
    return activeTab === "ultra" ? ultraChartConfig : xdrChartConfig;
  };

  const prepareChartData = () => {
    const mtb_not_detected = data?.reduce((sum, item) => sum + (item?.Not_Detected_Samples || 0), 0);
    const mtb_detected = data?.reduce((sum, item) => sum + (item?.Detected_Samples || 0), 0);
    const invalid = data?.reduce((sum, item) => sum + (item?.Invalid_Samples || 0), 0);
    const errors = data?.reduce((sum, item) => sum + (item?.Errors || 0), 0);
    const not_analysed = data?.reduce((sum, item) => sum + (item?.Analysed_Samples || 0), 0);

    const chartData = [
      { label: "mtb_not_detected", data: mtb_not_detected, fill: "var(--chart-1)" },
      { label: "mtb_detected", data: mtb_detected, fill: "var(--chart-2)" },
      { label: "invalid", data: invalid, fill: "var(--chart-3)" },
      { label: "errors", data: errors, fill: "var(--chart-4)" },
      { label: "not_analysed", data: 0, fill: "var(--chart-5)" },
    ]

    return chartData;
  }

  const chartData = prepareChartData();
  
  return (
    <MainCard
      additionalOptions={[
        {
          action: () => {},
          icon: <PiMicrosoftExcelLogoFill size={20} />,
          label: "Exportar para Excel",
          type: "primary"
        },
        {
          action: () => {},
          icon: <IoImageOutline size={20} />,
          label: "Exportar imagem",
          type: "primary"
        },
        {
          action: () => {
            setTimeInterval(getLastTwelveMonths());
          },
          icon: <VscDebugRestart size={20} />,
          label: "Reiniciar o relatorio",
          type: "primary"
        },
      ]}
      chartId="tb-stacked-chart"
      documentation={<Docs />}
      headerProps={{
        sx: {
          padding: 2
        }
      }}
      loading={loading}
      height="auto"
      id="tb-main-card"
      labType="poc"
      reportType="national"
      subtitle="Últimos 12 meses"
      title={`Amostras Testadas de TB ${activeTab === "ultra" ? "ULTRA" : "XDR"}`}
      user={{
        email: user?.emailAddresses[0]?.emailAddress,
        name: user?.fullName
      }}
      width="100%"
      handleSubmit={(values) => {
        setTimeInterval({
          startDate: values[0],
          endDate: values[1]
        });
      }}
      footerComponent={
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <CustomLegend config={getCurrentConfig()} />
        </Box>
      }
    >
      <Tabs 
        defaultValue="ultra" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="mx-4 ml-auto">
          <TabsTrigger value="ultra" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950  text-xs">
            Ultra
          </TabsTrigger>
          <TabsTrigger value="xdr" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950  text-xs">
            XDR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ultra" className="px-4 pb-4">
          <ChartContainer
            config={ultraChartConfig}
            className="mx-auto aspect-square max-h-[320px]"
          >
            <PieChart>
              <Pie data={chartData} dataKey="data" />
            </PieChart>
          </ChartContainer>
        </TabsContent>
        <TabsContent value="xdr" className="px-4 pb-4">
          <ChartContainer
            config={xdrChartConfig}
            className="mx-auto aspect-square max-h-[320px]"
          >
            <PieChart>
              <Pie data={chartData} dataKey="data" />
            </PieChart>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </MainCard>
  )
}
