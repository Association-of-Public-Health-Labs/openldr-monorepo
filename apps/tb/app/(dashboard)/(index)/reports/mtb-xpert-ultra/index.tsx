"use client"
import { useAIChat } from "@repo/ai/src/context/ai-chat-provider";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbMessage2Question } from "react-icons/tb";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import Docs from "./docs";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "../../../../../config/api";

// Import utilities and constants
import { 
  API_CONFIG, 
  DEFAULTS, 
  CHART_CONFIG, 
  UI_CONFIG,
  ReportState,
  Data,
  ActiveTab,
  TimeInterval,
  getLastTwelveMonths,
  getGenexpertResultType,
  formatDateInPortuguese,
  getReportName
} from './constants';
import { exportChartToExcel } from './excel-export-utils';
import { exportChart } from './chart-export-utils';

// ============================================================================
// TYPES
// ============================================================================

// ============================================================================
// STATE
// ============================================================================

export function MTBXpertUltra() {
  const [reportState, setReportState] = useState<ReportState>({
    timeInterval: DEFAULTS.TIME_INTERVAL,
    activeTab: DEFAULTS.ACTIVE_TAB,
    loading: true,
    error: null,
    data: [],
    reportName: DEFAULTS.REPORT_NAME.ULTRA
  });

  const { user } = useUser();
  const { getToken } = useAuth();

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const subtitle = useMemo(() => {
    const startDate = new Date(reportState.timeInterval.startDate);
    const endDate = new Date(reportState.timeInterval.endDate);
    return `${formatDateInPortuguese(startDate)} à ${formatDateInPortuguese(endDate)}`;
  }, [reportState.timeInterval]);

  const chartData = useMemo(() => {
    if (reportState.data.length === 0) return {
      labels: [],
      series: []
    };

    const labels = reportState.data?.map((item) => item?.Month_Name);
    const series = [
      {
        name: 'Resultado Positivo',
        data: reportState.data?.map((item) => item?.Detected_Samples),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'Resultado Negativo',
        data: reportState.data?.map((item) => item?.Not_Detected_Samples),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'Inválido',
        data: reportState.data?.map((item) => item?.Invalid_Samples),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'Erros',
        data: reportState.data?.map((item: any) => item?.Errors),
        group: 'apexcharts-axis-0'
      }
    ];

    return { labels, series };
  }, [reportState.data]);

  const aiChatParams = useMemo(() => ({
    reportName: reportState.reportName,
    endpoint: API_CONFIG.ENDPOINT,
    facilityType: "national",
    description: `
        Este relatório faz parte do painel de controle de Tuberculose (TB) e apresenta dados mensais sobre os resultados dos testes de TB realizados. O relatório inclui informações detalhadas sobre:
        - Número de casos onde MTB (Mycobacterium tuberculosis) foi detectado
        - Número de casos onde MTB não foi detectado
        - Casos com resultados inválidos
        - Casos sem resultados
        - Número de erros ocorridos
        - Total de testes realizados por mês
        
        Os dados são organizados cronologicamente por mês e ano, permitindo análise de tendências e padrões ao longo do tempo. Este relatório é fundamental para monitorar a eficácia dos testes de TB e identificar possíveis áreas que necessitam de melhorias no processo de diagnóstico.
      `,
    data: []
  }), [reportState.reportName]);

  const { openChat } = useAIChat(aiChatParams);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const retryWithBackoff = useCallback(async (
    fn: () => Promise<any>,
    maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
    baseDelay: number = API_CONFIG.RETRY_DELAY
  ): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, []);

  const fetchDataFromApi = useCallback(async (startDate: string, endDate: string, activeTab: ActiveTab) => {
    const apiCall = async () => {
      const token = await getToken();
      const response = await api(token).get(API_CONFIG.ENDPOINT, {
        params: {
          interval_dates: `${startDate}, ${endDate}`,
          genexpert_result_type: getGenexpertResultType(activeTab)
        },
        timeout: API_CONFIG.TIMEOUT
      });
      return response;
    };

    try {
      setReportState(prev => ({ ...prev, loading: true, error: null }));

      const response = await retryWithBackoff(apiCall);

      if (response.data?.length > 0) {
        setReportState(prev => ({ 
          ...prev, 
          data: response.data || [],
          loading: false,
          error: null
        }));
        return;
      }

      setReportState(prev => ({ 
        ...prev, 
        data: [],
        loading: false,
        error: null
      }));
    } catch (error: any) {
      let errorMessage = UI_CONFIG.ERROR_MESSAGES.GENERIC;
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = UI_CONFIG.ERROR_MESSAGES.TIMEOUT;
        } else if (error.response?.status === 404) {
          errorMessage = UI_CONFIG.ERROR_MESSAGES.NOT_FOUND;
        } else if (error.response?.status >= 500) {
          errorMessage = UI_CONFIG.ERROR_MESSAGES.SERVER;
        } else if (!error.response) {
          errorMessage = UI_CONFIG.ERROR_MESSAGES.NETWORK;
        }
      }

      console.error("Error fetching data:", error.response?.data || error.message);
      setReportState(prev => ({ 
        ...prev, 
        loading: false,
        error: errorMessage
      }));
    }
  }, [getToken, retryWithBackoff]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleExportToExcel = useCallback(() => {
    try {
      exportChartToExcel(reportState.data, reportState.reportName, reportState.activeTab);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      setReportState(prev => ({ 
        ...prev, 
        error: 'Falha na exportação para Excel' 
      }));
    }
  }, [reportState.data, reportState.reportName, reportState.activeTab]);

  const handleExportToImage = useCallback(async () => {
    try {
      await exportChart(CHART_CONFIG.CHART_ID, reportState.reportName, reportState.activeTab);
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      setReportState(prev => ({ 
        ...prev, 
        error: 'Falha na exportação da imagem' 
      }));
    }
  }, [reportState.reportName, reportState.activeTab]);

  const handleRestart = useCallback(() => {
    const newTimeInterval = getLastTwelveMonths();
    setReportState(prev => ({ 
      ...prev, 
      timeInterval: newTimeInterval,
      activeTab: DEFAULTS.ACTIVE_TAB,
      reportName: DEFAULTS.REPORT_NAME.ULTRA
    }));
  }, []);

  const handleTabChange = useCallback((value: string) => {
    const newActiveTab = value as ActiveTab;
    const newReportName = getReportName(newActiveTab);
    
    setReportState(prev => ({ 
      ...prev, 
      activeTab: newActiveTab,
      reportName: newReportName
    }));
  }, []);

  const handleSubmit = useCallback((values: string[]) => {
    setReportState(prev => ({ 
      ...prev, 
      timeInterval: { startDate: values?.[0], endDate: values?.[1] }
    }));
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchDataFromApi(
      reportState.timeInterval.startDate, 
      reportState.timeInterval.endDate, 
      reportState.activeTab
    );
  }, [reportState.timeInterval, reportState.activeTab, fetchDataFromApi]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <MainCard
      additionalOptions={[
        {
          action: handleExportToExcel,
          icon: <PiMicrosoftExcelLogoFill size={20} />,
          label: "Exportar para Excel",
          type: "primary"
        },
        {
          action: handleExportToImage,
          icon: <IoImageOutline size={20} />,
          label: "Exportar imagem",
          type: "primary"
        },
        {
          action: handleRestart,
          icon: <VscDebugRestart size={20} />,
          label: "Reiniciar o relatorio",
          type: "primary"
        },
      ]}
      chartId={CHART_CONFIG.CHART_ID}
      documentation={<Docs />}
      headerProps={{
        sx: {
          padding: 2
        }
      }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      loading={reportState.loading}
      reportType="national"
      subtitle={subtitle}
      title={reportState.reportName}
      user={{
        email: user?.emailAddresses[0]?.emailAddress,
        name: user?.fullName
      }}
      width="100%"
      handleSubmit={handleSubmit}
    >
      <Tabs 
        defaultValue="ultra" 
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="mx-4 ml-auto">
          <TabsTrigger value="ultra" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs">
            Ultra
          </TabsTrigger>
          <TabsTrigger value="xdr" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs">
            XDR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ultra" className="px-4 pb-4">
          <Stacked
            id={CHART_CONFIG.CHART_ID}
            height={CHART_CONFIG.HEIGHT}
            width={"100%"}
            labels={chartData.labels}
            onClick={() => {}}
            series={chartData.series}
            yLabel={CHART_CONFIG.Y_LABEL}
          />
        </TabsContent>
        <TabsContent value="xdr" className="px-4 pb-4">
          <Stacked
            id={CHART_CONFIG.CHART_ID}
            height={CHART_CONFIG.HEIGHT}
            width={"100%"}
            labels={chartData.labels}
            onClick={() => {}}
            series={chartData.series}
            yLabel={CHART_CONFIG.Y_LABEL}
          />
        </TabsContent>
      </Tabs>
    </MainCard>
  );
}