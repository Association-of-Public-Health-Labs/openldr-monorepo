"use client"

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
import { useState } from "react";

export const description = "A pie chart with a legend"

export function MTBXpertMapReport() {
  const [activeTab, setActiveTab] = useState<("ultra" | "xdr")>("ultra");
  const colors = {ultra: "#00B000", xdr: "#fd9a00"};
  const selectedColor = colors[activeTab];

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
          <MapLegend baseColor={selectedColor} size="small" />
        </div>
      }
    >
      <Tabs 
        defaultValue="ultra" 
        className="w-full " 
        onValueChange={(value) => setActiveTab(value as "ultra" | "xdr")}
      >
        <TabsList className="mx-4 ml-auto">
          <TabsTrigger value="ultra" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950">
            Ultra
          </TabsTrigger>
          <TabsTrigger value="xdr" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950">
            XDR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ultra" className="px-4 pb-4 flex flex-col items-center justify-center">
          <SvgMap
            height="400px"
            onClick={() => {}}
            pathDefaultBackgroundColor={colors[activeTab]}
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
        </TabsContent>
        <TabsContent value="xdr" className="px-4 pb-4 flex flex-col items-center justify-center">
          <SvgMap
            height="400px"
            onClick={() => {}}
            pathDefaultBackgroundColor={colors[activeTab]}
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
        </TabsContent>
      </Tabs>
      
    </MainCard>
  )
}
