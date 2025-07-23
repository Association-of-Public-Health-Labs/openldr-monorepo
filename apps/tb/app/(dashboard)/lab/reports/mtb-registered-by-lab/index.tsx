"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { Stacked } from "@repo/design_system/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MainCard } from "@repo/design_system/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { DEFAULT_LAB_TYPE, DEFAULT_TIME_INTERVAL, ENDPOINT } from "./constants";
import { 
  LabType,
  getReportName,
  FacilityOptions,
  ActiveTab,
  Data,
  buildApiParams, 
  prepareChartData
} from "./actions";

const createMainCardOptions = (
  onRestart: () => void
) => [
  {
    action: () => {},
    icon: <PiMicrosoftExcelLogoFill size={20} />,
    label: "Exportar para Excel",
    type: "primary" as const
  },
  {
    action: () => {},
    icon: <IoImageOutline size={20} />,
    label: "Exportar imagem",
    type: "primary" as const
  },
  {
    action: onRestart,
    icon: <VscDebugRestart size={20} />,
    label: "Reiniciar o relatorio",
    type: "primary" as const
  },
  {
    action: () => {},
    icon: <HiOutlineDocumentText size={20} />,
    label: "Ver a Documentação",
    type: "secondary" as const
  },
];

// Main component
export default function MTBRegisteredByFacility() {
  // State
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ultra");
  const [timeInterval, setTimeInterval] = useState(DEFAULT_TIME_INTERVAL);
  const [labs, setLabs] = useState<FacilityOptions[]>([]);
  const [labType, setLabType] = useState<LabType>(DEFAULT_LAB_TYPE);
  const [disaggregation, setDisaggregation] = useState(false);

  // API call
  const fetchDataFromApi = async (
    startDate: string, 
    endDate: string, 
    disaggregation: boolean
  ) => {
    try {
      setLoading(true);

      const params = buildApiParams(
        { startDate, endDate },
        activeTab,
        labs,
        labType,
        disaggregation
      );

      const response = await axios.get(ENDPOINT, {
        params,
        paramsSerializer: { indexes: null }
      });

      if (response.data?.length > 0) {
        setData(response.data);
        setError(null);
      }
    } catch (error: any) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error ? error.message : "An error occurred";
      
      console.error("Error fetching data:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, disaggregation);
  }, [timeInterval, disaggregation]);

  // Event handlers
  const handleRestart = () => {
    setDisaggregation(false);
    setLabs([]);
    setLabType(DEFAULT_LAB_TYPE);
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, false);
  };

  const handleTabChange = (value: string) => {
    const newActiveTab = value as ActiveTab;
    setActiveTab(newActiveTab);
  };

  const handleChartClick = (label: string) => {
    if (!label) return;

    
  };

  const handleSubmit = (dates: string[], labs: FacilityOptions[], labType: LabType) => {
    setLabs(labs);
    setLabType(labType);
    setTimeInterval({ startDate: dates[0], endDate: dates[1] });
  };

  // Data preparation
  const { labels, series } = prepareChartData(data);

  return (
    <MainCard
      additionalOptions={createMainCardOptions(handleRestart)}
      chartId="tb-stacked-chart"
      headerProps={{ sx: { padding: 2 } }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      loading={loading}
      reportType="facility"
      subtitle="Últimos 12 meses"
      title={getReportName(activeTab)}
      user={{
        email: "john.doe@example.com",
        name: "John Doe"
      }}
      width="100%"
      handleSubmit={handleSubmit as any}
    >
      <Tabs 
        defaultValue="ultra" 
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="mx-4 ml-auto">
          <TabsTrigger 
            value="ultra" 
            className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
          >
            Ultra
          </TabsTrigger>
          <TabsTrigger 
            value="xdr" 
            className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950"
          >
            XDR
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ultra" className="px-4 pb-4">
          <Stacked
            id="tb-stacked-chart"
            height={350}
            labels={labels}
            onClick={handleChartClick}
            series={series}
          />
        </TabsContent>
        
        <TabsContent value="xdr" className="px-4 pb-4">
          <Stacked
            id="tb-stacked-chart"
            height={350}
            labels={labels}
            onClick={() => {}}
            series={series}
          />
        </TabsContent>
      </Tabs>
    </MainCard>
  );
}