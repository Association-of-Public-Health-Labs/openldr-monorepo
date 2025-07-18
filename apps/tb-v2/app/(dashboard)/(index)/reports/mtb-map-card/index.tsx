"use client"

import {
  ChartConfig,
} from "../../../../../components/ui/chart"
import { MainCard } from "@repo/design_system/organisms/cards/MainCard";
import { TbMessage2Question } from "react-icons/tb";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { VscDebugRestart } from "react-icons/vsc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { SvgMap } from "@repo/design_system/atoms/maps/SvgMap";
import { MapLegend } from "@repo/design_system/atoms/maps/MapLegend";
import { HighlightsTable } from "@repo/design_system/atoms/tables/HighlightsTable";

export const description = "A pie chart with a legend"

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function MTBXpertMapReport() {
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
      // loading={loading}
      reportType="national"
      subtitle="Últimos 12 meses"
      title="Positividade de MTB"
      user={{
        email: "john.doe@example.com",
        name: "John Doe"
      }}
      width="100%"
      handleSubmit={(values) => {
      }}
      footerComponent={
        <div className="flex flex-row items-center justify-center py-4">
          <MapLegend baseColor="#00B000" size="small" />
        </div>
      }
    >
      <Tabs defaultValue="ultra" className="w-full ">
        <TabsList className="mx-4 ml-auto">
          <TabsTrigger value="ultra" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950">
            Ultra
          </TabsTrigger>
          <TabsTrigger value="xdr" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950">
            XDR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ultra" className="px-4 pb-4">
          <div className="flex flex-row items-center gap-2">
            {/* Table Column */}
            <div className="flex-1 hidden">
              <HighlightsTable
                columns={[
                  'Province',
                  'Ultra',
                  'XDR',
                ]}
                // highlightedColumn={1}
                rows={[
                  {
                    Province: 'Niassa',
                    Ultra: 100,
                    XDR: 200
                  },
                  {
                    Province: 'Cabo Delgado',
                    Ultra: 400,
                    XDR: 300
                  },
                  {
                    Province: 'Nampula',
                    Ultra: 100,
                    XDR: 200
                  },
                  {
                    Province: 'Zambezia',
                    Ultra: 100,
                    XDR: 200
                  },
                  {
                    Province: 'Tete',
                    Ultra: 100,
                    XDR: 200
                  },
                  {
                    Province: 'Manica',
                    Ultra: 100,
                    XDR: 200
                  },
                  {
                    Province: 'Sofala',
                    Ultra: 100,
                    XDR: 200
                  },
                  {
                    Province: 'Inhambane',
                    Ultra: 100,
                    XDR: 200
                  },
                  {
                    Province: 'Gaza',
                    Ultra: 100,
                    XDR: 200
                  },
                  {
                    Province: 'Maputo',
                    Ultra: 100,
                    XDR: 200
                  },
                  {
                    Province: 'Maputo',
                    Ultra: 100,
                    XDR: 200
                  },
                ]}
                dense={true}
              />
            </div>
            
            {/* Map Column */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <SvgMap
                height="400px"
                onClick={() => {}}
                pathDefaultBackgroundColor="#00B000"
                useShortName={true}
                provinces={{
                  cd: {
                    ratio: 0.9
                  },
                  gz: {
                    ratio: 0.4
                  },
                  ib: {
                    ratio: 0.2
                  },
                  mn: {
                    ratio: 0.5
                  },
                  mp: {
                    ratio: 0.1
                  },
                  np: {
                    ratio: 1
                  },
                  ns: {
                    ratio: 0.8
                  },
                  sf: {
                    ratio: 0.6
                  },
                  tt: {
                    ratio: 0.3
                  },
                  zb: {
                    ratio: 0.7
                  }
                }}
                showIndicators={[
                  true,
                  true
                ]}
                // width="100%"
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="xdr" className="px-4 pb-4">
        </TabsContent>
      </Tabs>
      
    </MainCard>
  )
}
