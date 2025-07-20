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
import { useEffect, useState } from "react";
import axios from "axios";

export type Data = {
  Facility: string;
  Tested_Samples: number;
  Detected: number;
  Not_Detected: number;
  Invalid: number;
  Errors: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;
  Disaggregation: boolean;
  Facility_Type: string;
}

const provinceCodes = {
  "Tete": "tt",
  "Maputo Provincia": "mp",
  "Maputo Cidade": "mc",
  "Nampula": "np",
  "Cabo Delgado": "cd",
  "Zambezia": "zb",
  "Inhambane": "ib",
  "Gaza": "gz",
  "Sofala": "sf",
  "Manica": "mn",
  "Niassa": "ns",
}

export const description = "A pie chart with a legend"
const endpoint = "https://api.openldr.org.mz/tb/gx/facilities/tested_samples/";

export function MTBXpertMapReport() {
  const [activeTab, setActiveTab] = useState<("ultra" | "xdr")>("ultra");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data[]>([]);
  const [timeInterval, setTimeInterval] = useState({
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  });
  const colors = {ultra: "#00B000", xdr: "#fd9a00"};
  const selectedColor = colors[activeTab];

  const fetchDataFromApi = async () => {
    try {
      setLoading(true);

      const response = await axios.get(endpoint, {
        params: {
          interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
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
    fetchDataFromApi();
  }, [timeInterval]);


  const prepareChartData = () => {
    const chartData = data?.map((item) => ({
      province: provinceCodes[item?.Facility as keyof typeof provinceCodes], 
      positivity: (item?.Not_Detected/item?.Tested_Samples)
    }))
    console.log("chartData", chartData);
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
              tt: {ratio: chartData?.find((item) => item.province === "tt")?.positivity},
              mp: {ratio: chartData?.find((item) => item.province === "mp")?.positivity},
              mc: {ratio: chartData?.find((item) => item.province === "mc")?.positivity},
              np: {ratio: chartData?.find((item) => item.province === "np")?.positivity},
              cd: {ratio: chartData?.find((item) => item.province === "cd")?.positivity},
              zb: {ratio: chartData?.find((item) => item.province === "zb")?.positivity},
              ib: {ratio: chartData?.find((item) => item.province === "ib")?.positivity},
              mn: {ratio: chartData?.find((item) => item.province === "mn")?.positivity},
              sf: {ratio: chartData?.find((item) => item.province === "sf")?.positivity},
              ns: {ratio: chartData?.find((item) => item.province === "ns")?.positivity},
              gz: {ratio: chartData?.find((item) => item.province === "gz")?.positivity},
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
              tt: {ratio: chartData?.find((item) => item.province === "tt")?.positivity},
              mp: {ratio: chartData?.find((item) => item.province === "mp")?.positivity},
              mc: {ratio: chartData?.find((item) => item.province === "mc")?.positivity},
              np: {ratio: chartData?.find((item) => item.province === "np")?.positivity},
              cd: {ratio: chartData?.find((item) => item.province === "cd")?.positivity},
              zb: {ratio: chartData?.find((item) => item.province === "zb")?.positivity},
              ib: {ratio: chartData?.find((item) => item.province === "ib")?.positivity},
              mn: {ratio: chartData?.find((item) => item.province === "mn")?.positivity},
              sf: {ratio: chartData?.find((item) => item.province === "sf")?.positivity},
              ns: {ratio: chartData?.find((item) => item.province === "ns")?.positivity},
              gz: {ratio: chartData?.find((item) => item.province === "gz")?.positivity},
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
