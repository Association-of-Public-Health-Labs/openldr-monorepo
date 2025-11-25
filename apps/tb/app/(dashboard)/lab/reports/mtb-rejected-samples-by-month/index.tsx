"use client"
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { DEFAULT_LAB_TYPE, DEFAULT_TIME_INTERVAL, ENDPOINT, REPORT_NAME } from "./constants";
import { 
  LabType,
  getReportName,
  FacilityOptions,
  ActiveTab,
  Data,
  buildApiParams, 
  prepareChartData
} from "./actions";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "../../../../../config/api";
import { exportChartToExcel } from "./excel-export-utils";

const createMainCardOptions = (
  onRestart: () => void,
  onExportToExcel: () => void
) => [
  {
    action: onExportToExcel,
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
];

// Main component
export default function MTBRejectedSamplesByMonth() {
  const { user } = useUser();
  const { getToken } = useAuth();
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
  const fetchDataFromApi = useCallback(async (
    startDate: string, 
    endDate: string, 
    disaggregation: boolean,
    activeTab: ActiveTab,
    labs: FacilityOptions[],
    labType: LabType
  ) => {
    try {
      setLoading(true);
      const token = await getToken();
      const params = buildApiParams(
        { startDate, endDate },
        activeTab,
        labs,
        labType,
        disaggregation
      );

      const response = await api(token).get(ENDPOINT, {
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
  }, [getToken]);

  // Effects
  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, disaggregation, activeTab, labs, labType);
  }, [timeInterval, disaggregation, activeTab, labs, labType, fetchDataFromApi]);

  // Event handlers
  const handleRestart = useCallback(() => {
    setDisaggregation(false);
    setLabs([]);
    setLabType(DEFAULT_LAB_TYPE);
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, false, activeTab, [], DEFAULT_LAB_TYPE);
  }, [timeInterval, activeTab, fetchDataFromApi]);

  const handleTabChange = useCallback((value: string) => {
    const newActiveTab = value as ActiveTab;
    setActiveTab(newActiveTab);
  }, []);

  const handleChartClick = useCallback((label: string) => {
    if (!label) return;

    
  }, []);

  const handleSubmit = useCallback((dates: string[], labs: FacilityOptions[], labType: LabType) => {
    setLabs(labs);
    setLabType(labType);
    setTimeInterval({ startDate: dates[0], endDate: dates[1] });
  }, []);

  const getLabProperty = (labType: string, label: string) => {
    switch (labType) {
      case 'province':
          return { Província: label };
      case 'district':
          return { Distrito: label };
      case 'lab':
          return { 'Laboratório': label };
      default:
          return { Localização: label };
    }
  };

  const handleExportToExcel = async () => {
    try {
      const chartData = { labels, series };
      const reportState = {
        data,
        activeTab,
        timeInterval,
        labs,
        labType
      };
      
      await exportChartToExcel(
        chartData,
        reportState,
        REPORT_NAME,
        getLabProperty
      );
    } catch (error) {
      console.error("Failed to export to Excel:", error);
    }
  };

  // Data preparation
  const { labels, series } = prepareChartData(data);

  return (
    <MainCard
      additionalOptions={createMainCardOptions(handleRestart, handleExportToExcel)}
      chartId="tb-stacked-chart"
      headerProps={{ sx: { padding: 2 } }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      loading={loading}
      reportType="facility"
      subtitle="Últimos 12 meses"
      title={REPORT_NAME}
      user={{
        email: user?.emailAddresses[0].emailAddress,
        name: user?.fullName || ""
      }}
      width="100%"
      handleSubmit={handleSubmit as any}
    >
      <Tabs 
        defaultValue="ultra" 
        value={activeTab}
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
            className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
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