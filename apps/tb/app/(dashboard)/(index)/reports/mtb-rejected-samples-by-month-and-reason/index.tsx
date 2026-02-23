"use client"
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { StackedWithLine } from "@repo/design_system/app/atoms/charts/apex/StackedWithLine";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { DEFAULT_LAB_TYPE, DEFAULT_TIME_INTERVAL, ENDPOINT, UI_CONFIG } from "./constants";
import {
  LabType,
  getReportName,
  FacilityOptions,
  ActiveTab,
  Data,
  buildApiParams,
  prepareChartData,
  retryWithBackoff
} from "./actions";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "./chart-export-utils";
import Docs from "./docs";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "../../../../../config/api";

// Helper function for Portuguese date formatting
const formatDateInPortuguese = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} de ${month} de ${year}`;
};

// Main component
export default function MTBRejectedSamplesByMonthAndReason() {
  // State
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ultra");
  const [timeInterval, setTimeInterval] = useState(DEFAULT_TIME_INTERVAL);
  const [labs, setLabs] = useState<FacilityOptions[]>([]);
  const [labType, setLabType] = useState<LabType>(DEFAULT_LAB_TYPE);
  const [disaggregation, setDisaggregation] = useState(false);
  const { user } = useUser();
  const { getToken } = useAuth();

  // Memoized values
  const subtitle = useMemo(() => {
    const startFormatted = formatDateInPortuguese(timeInterval.startDate);
    const endFormatted = formatDateInPortuguese(timeInterval.endDate);
    return `${startFormatted} à ${endFormatted}`;
  }, [timeInterval]);

  const reportName = useMemo(() => getReportName(activeTab), [activeTab]);

   // API call with retry mechanism
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
      setError(null);

      const params = buildApiParams(
        { startDate, endDate },
        activeTab,
        labs,
        labType,
        disaggregation
      );

      const token = await getToken();

      const response = await retryWithBackoff(async () => {
        return await api(token).get(ENDPOINT, {
          params,
          paramsSerializer: { indexes: null },
          timeout: 60000
        });
      }, 3, 1000);

      if (response.data?.length > 0) {
        setData(response.data);
        setError(null);
      } else {
        setData([]);
        setError("Nenhum dado encontrado para o período selecionado.");
      }
    } catch (error: any) {
      let errorMessage = "Erro desconhecido";

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage = "Tempo limite excedido. O servidor demorou muito para responder. Tente novamente.";
        } else if (error.response?.status === 404) {
          errorMessage = "Endpoint não encontrado. Verifique a configuração da API.";
        } else if (error.response?.status >= 500) {
          errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos.";
        } else if (error.message.includes('Network Error')) {
          errorMessage = "Erro de rede. Verifique sua conexão com a internet.";
        } else {
          errorMessage = error.response?.data?.message || error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Error fetching data:", errorMessage);
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

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
        // Chart click functionality can be implemented here if needed
      }, []);

      const handleSubmit = useCallback((dates: string[], labs: FacilityOptions[], labType: LabType) => {
        setLabs(labs);
        setLabType(labType);
        setTimeInterval({ startDate: dates[0], endDate: dates[1] });
      }, []);

  // Data preparation
  const { labels, series } = useMemo(() => prepareChartData(data), [data]);

  // Export handlers
  const handleExportToExcel = useCallback(async () => {
    try {
      await exportChartToExcel(data, reportName, subtitle);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      alert('Erro ao exportar dados para Excel. Tente novamente.');
    }
  }, [data, reportName, subtitle]);

  const handleExportToImage = useCallback(async () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}.png`;
      await exportChart('tb-stacked-chart', filename, 'png');
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      alert('Erro ao exportar imagem do gráfico. Tente novamente.');
    }
  }, [reportName]);

   const mainCardOptions = useMemo(() => [
          {
              action: handleExportToExcel,
              icon: <PiMicrosoftExcelLogoFill size={20} />,
              label: UI_CONFIG.EXPORT_OPTIONS.EXCEL_LABEL,
              type: "primary" as const
          },
          {
              action: handleExportToImage,
              icon: <IoImageOutline size={20} />,
              label: UI_CONFIG.EXPORT_OPTIONS.IMAGE_LABEL,
              type: "primary" as const
          },
          {
              action: handleRestart,
              icon: <VscDebugRestart size={20} />,
              label: UI_CONFIG.EXPORT_OPTIONS.RESTART_LABEL,
              type: "primary" as const
          },
      ], [handleExportToExcel, handleExportToImage, handleRestart]);

  // Effects
  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, disaggregation, activeTab, labs, labType);
  }, [timeInterval, disaggregation, activeTab, labs, labType, fetchDataFromApi]);

  return (
    <MainCard
      additionalOptions={mainCardOptions}
      chartId="tb-stacked-chart"
      documentation={<Docs />}
      headerProps={{ sx: { padding: 2 } }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      loading={loading}
      reportType="national"
      subtitle={subtitle}
      title={reportName}
      user={{
        email: user?.emailAddresses[0]?.emailAddress,
        name: user?.fullName
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
            className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
          >
            XDR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ultra" className="px-4 pb-4">
          <StackedWithLine
            id="tb-stacked-chart"
            height={350}
            labels={labels}
            onClick={handleChartClick}
            series={series}
            lineValue={5}
            lineLabel="Limiar (5%)"
            lineColor="#FF4560"
            lineDashArray={5}
          />
        </TabsContent>

        <TabsContent value="xdr" className="px-4 pb-4">
          <StackedWithLine
            id="tb-stacked-chart"
            height={350}
            labels={labels}
            onClick={handleChartClick}
            series={series}
            lineValue={5}
            lineLabel="Limiar (5%)"
            lineColor="#FF4560"
            lineDashArray={5}
          />
        </TabsContent>
      </Tabs>
    </MainCard>
  );
}
