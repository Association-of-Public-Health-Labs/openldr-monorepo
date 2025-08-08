"use client"

import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { TbMessage2Question } from "react-icons/tb";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { VscDebugRestart } from "react-icons/vsc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { SvgMap } from "@repo/design_system/app/atoms/maps/SvgMap";
import { MapLegend } from "@repo/design_system/app/atoms/maps/MapLegend";
import { useEffect, useState } from "react";
import axios from "axios";
import Docs from "./docs";
import { getLastTwelveMonths } from "./actions";
import { useUser } from "@clerk/nextjs";
import { Niassa, Inhambane, Gaza, MaputoProvincia, Tete, Zambezia, Nampula, CaboDelgado, Sofala, Manica } from "@repo/design_system/app/atoms/maps/Provinces";
import { 
  InteractiveSvgMap 
} from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";

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
const endpoint = `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/tested_samples/`;

export function MTBXpertMapReport() {
  const [activeTab, setActiveTab] = useState<("ultra" | "xdr")>("ultra");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data[]>([]);
  const [timeInterval, setTimeInterval] = useState(getLastTwelveMonths());
  const colors = {ultra: "#00B000", xdr: "#fd9a00"};
  const selectedColor = colors[activeTab];
  const { user } = useUser();

  const fetchDataFromApi = async (startDate: string, endDate: string, activeTab: string) => {
    try {
      setLoading(true);

      const response = await axios.get(endpoint, {
        params: {
          interval_dates: `${startDate}, ${endDate}`,
          genexpert_result_type: (activeTab === "ultra") ? "Ultra 6 Cores" : "XDR 10 Cores"
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


  const prepareChartData = () => {
    const chartData = data?.map((item) => ({
      province: provinceCodes[item?.Facility as keyof typeof provinceCodes], 
      positivity: (item?.Not_Detected/item?.Tested_Samples)
    }))
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
      height="auto"
      id="tb-main-card"
      labType="poc"
      loading={loading}
      reportType="national"
      subtitle="Últimos 12 meses"
      title="Positividade de TB"
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
        <div className="flex flex-row items-center justify-center py-1">
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
          <TabsTrigger value="ultra" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs">
            Ultra
          </TabsTrigger>
          <TabsTrigger value="xdr" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950  text-xs">
            XDR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ultra" className="px-4 pb-4 flex flex-col items-center justify-center">
          <InteractiveSvgMap
            height="320px"
            onClick={() => {}}
            pathDefaultBackgroundColor={colors[activeTab]}
            useShortName={true}
            provinces={{
              tt: {ratio: 1 - chartData?.find((item) => item.province === "tt")?.positivity},
              mp: {ratio: 1 - chartData?.find((item) => item.province === "mp")?.positivity},
              mc: {ratio: 1 - chartData?.find((item) => item.province === "mc")?.positivity},
              np: {ratio: 1 - chartData?.find((item) => item.province === "np")?.positivity},
              cd: {ratio: 1 - chartData?.find((item) => item.province === "cd")?.positivity},
              zb: {ratio: 1 - chartData?.find((item) => item.province === "zb")?.positivity},
              ib: {ratio: 1 - chartData?.find((item) => item.province === "ib")?.positivity},
              mn: {ratio: 1 - chartData?.find((item) => item.province === "mn")?.positivity},
              sf: {ratio: 1 - chartData?.find((item) => item.province === "sf")?.positivity},
              ns: {ratio: 1 - chartData?.find((item) => item.province === "ns")?.positivity},
              gz: {ratio: 1 - chartData?.find((item) => item.province === "gz")?.positivity},
            }}
            highlightedColor={colors[activeTab]}
          />
        </TabsContent>
        <TabsContent value="xdr" className="px-4 pb-4 flex flex-col items-center justify-center">
          <InteractiveSvgMap
            height="320px"
            onClick={() => {}}
            pathDefaultBackgroundColor={colors[activeTab]}
            useShortName={true}
            provinces={{
              tt: {ratio: 1 - chartData?.find((item) => item.province === "tt")?.positivity},
              mp: {ratio: 1 - chartData?.find((item) => item.province === "mp")?.positivity},
              mc: {ratio: 1 - chartData?.find((item) => item.province === "mc")?.positivity},
              np: {ratio: 1 - chartData?.find((item) => item.province === "np")?.positivity},
              cd: {ratio: 1 - chartData?.find((item) => item.province === "cd")?.positivity},
              zb: {ratio: 1 - chartData?.find((item) => item.province === "zb")?.positivity},
              ib: {ratio: 1 - chartData?.find((item) => item.province === "ib")?.positivity},
              mn: {ratio: 1 - chartData?.find((item) => item.province === "mn")?.positivity},
              sf: {ratio: 1 - chartData?.find((item) => item.province === "sf")?.positivity},
              ns: {ratio: 1 - chartData?.find((item) => item.province === "ns")?.positivity},
              gz: {ratio: 1 - chartData?.find((item) => item.province === "gz")?.positivity},
            }}
            highlightedColor={colors[activeTab]}
          />
        </TabsContent>
      </Tabs>
      
    </MainCard>
  )
}

type MapProps = {
  selectedProvince: "Niassa" | "Inhambane" | "Gaza" | "Maputo Provincia" | "Tete" | "Zambezia" | "Nampula" | "Cabo Delgado" | "Sofala" | "Manica";
}

// function Map({selectedProvince}: MapProps) {
//   if(selectedProvince === "Niassa") {
//     return (
//       <Niassa
//         districtRatios={{
//           MZ0100N2: 0.1,
//           MZ0100N5: 0.8,
//           MZ0100N7: 0.9,
//           MZ0100N8: 0.3,
//           MZ0100O6: 0.6
//         }}  
//         highlightedColor="#00B000"
//         onDistrictClick={() => {}}
//         pathDefaultBackgroundColor="#32323c"
//         pathDefaultStrokeColor="#131313"
//         showPopover
//         legend="Positividade"
//       />
//     )
//   }
//   return (
//     <SvgMap
//       height="320px"
//       onClick={() => {}}
//       pathDefaultBackgroundColor={colors[activeTab]}
//       useShortName={true}
//       provinces={{
//         tt: {ratio: chartData?.find((item) => item.province === "tt")?.positivity},
//         mp: {ratio: chartData?.find((item) => item.province === "mp")?.positivity},
//         mc: {ratio: chartData?.find((item) => item.province === "mc")?.positivity},
//         np: {ratio: chartData?.find((item) => item.province === "np")?.positivity},
//         cd: {ratio: chartData?.find((item) => item.province === "cd")?.positivity},
//         zb: {ratio: chartData?.find((item) => item.province === "zb")?.positivity},
//         ib: {ratio: chartData?.find((item) => item.province === "ib")?.positivity},
//         mn: {ratio: chartData?.find((item) => item.province === "mn")?.positivity},
//         sf: {ratio: chartData?.find((item) => item.province === "sf")?.positivity},
//         ns: {ratio: chartData?.find((item) => item.province === "ns")?.positivity},
//         gz: {ratio: chartData?.find((item) => item.province === "gz")?.positivity},
//       }}
//       showIndicators={[
//         true,
//         true
//       ]}
//       // width="100%"
//     /> 
    
//   )
// }