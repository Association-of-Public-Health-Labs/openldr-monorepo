"use client"

import { Pie, PieChart } from "recharts"
import { useState } from "react"
import {
  ChartConfig,
  ChartContainer,
} from "../../../../../components/ui/chart"
import { MainCard } from "@repo/design_system/organisms/cards/MainCard";
import { TbMessage2Question } from "react-icons/tb";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { VscDebugRestart } from "react-icons/vsc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Box, Typography } from "@mui/material";

export const description = "A pie chart with a legend"

const chartData = [
  { browser: "mtb_not_detected", visitors: 275, fill: "var(--chart-1)" },
  { browser: "mtb_detected", visitors: 200, fill: "var(--chart-2)" },
  { browser: "invalid", visitors: 187, fill: "var(--chart-3)" },
  { browser: "errors", visitors: 173, fill: "var(--chart-4)" },
  { browser: "not_analysed", visitors: 90, fill: "var(--chart-5)" },
]

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
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
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
        padding: 2,
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

  const getCurrentConfig = () => {
    return activeTab === "ultra" ? ultraChartConfig : xdrChartConfig;
  };

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
          action: () => {},
          icon: <VscDebugRestart size={20} />,
          label: "Reiniciar o relatorio",
          type: "primary"
        },
        {
          action: () => {},
          icon: <HiOutlineDocumentText size={20} />,
          label: "Ver a Documentação",
          type: "secondary"
        },
        {
          action: () => {},
          icon: <TbMessage2Question size={20} />,
          label: "Duvidas e Sugestões",
          type: "secondary"
        }
      ]}
      chartId="tb-stacked-chart"
      documentation={<div><h3>Documentation</h3><p>This section contains the documentation for the MainCard component.</p></div>}
      headerProps={{
        sx: {
          padding: 2
        }
      }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      reportType="national"
      subtitle="Últimos 12 meses"
      title="Principais Indicadores das Amostras"
      user={{
        email: "john.doe@example.com",
        name: "John Doe"
      }}
      width="100%"
      handleSubmit={(values) => {
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
          <TabsTrigger value="ultra" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950">
            Ultra
          </TabsTrigger>
          <TabsTrigger value="xdr" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950">
            XDR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ultra" className="px-4 pb-4">
          <ChartContainer
            config={ultraChartConfig}
            className="mx-auto aspect-square max-h-[400px]"
          >
            <PieChart>
              <Pie data={chartData} dataKey="visitors" />
            </PieChart>
          </ChartContainer>
        </TabsContent>
        <TabsContent value="xdr" className="px-4 pb-4">
          <ChartContainer
            config={xdrChartConfig}
            className="mx-auto aspect-square max-h-[400px]"
          >
            <PieChart>
              <Pie data={chartData} dataKey="visitors" />
            </PieChart>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </MainCard>
  )
}
