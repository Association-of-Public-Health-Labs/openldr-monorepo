import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { useEffect, useState, useMemo, useCallback } from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { TbMessage2Question } from "react-icons/tb";
import { VscDebugRestart } from "react-icons/vsc";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { useAuth, useUser } from "@clerk/nextjs";
import Docs from "./docs";

// Import utilities and constants
import {
  DEFAULTS,
  CHART_CONFIG,
  UI_CONFIG,
  ReportState,
  ActiveTab,
  TimeInterval,
  formatDateInPortuguese,
  getReportName,
} from './constants';
import {
  fetchSpecimenTypeData,
  prepareChartData,
  formatErrorMessage,
  getLastTwelveMonths,
} from './actions';
import { exportSpecimenTypeToExcel } from './excel-export-utils';
import { exportChart } from './chart-export-utils';

// ============================================================================
// TYPES
// ============================================================================
// All types are imported from constants.ts

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function MTBXpertBySpecimenType() {
  const { user } = useUser();
  const { getToken } = useAuth();

  // ============================================================================
  // STATE
  // ============================================================================
  const [reportState, setReportState] = useState<ReportState>({
    timeInterval: DEFAULTS.TIME_INTERVAL,
    activeTab: DEFAULTS.ACTIVE_TAB,
    loading: false,
    error: null,
    data: [],
  });

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================
  const subtitle = useMemo(() => {
    const startDate = formatDateInPortuguese(reportState.timeInterval.startDate);
    const endDate = formatDateInPortuguese(reportState.timeInterval.endDate);
    return `${startDate} à ${endDate}`;
  }, [reportState.timeInterval]);

  const reportName = useMemo(() => {
    return getReportName(reportState.activeTab);
  }, [reportState.activeTab]);

  const chartData = useMemo(() => {
    return prepareChartData(reportState.data);
  }, [reportState.data]);


  // ============================================================================
  // API FUNCTIONS
  // ============================================================================
  const fetchDataFromApi = useCallback(async (
    timeInterval: TimeInterval,
    activeTab: ActiveTab
  ) => {
    try {
      setReportState(prev => ({ ...prev, loading: true, error: null }));

      const token = await getToken();
      const data = await fetchSpecimenTypeData(token, timeInterval, activeTab);

      setReportState(prev => ({
        ...prev,
        data: data || [],
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage = formatErrorMessage(error);
      setReportState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        data: [],
      }));
    }
  }, [getToken]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleExportToExcel = useCallback(() => {
    try {
      if (!reportState.data || reportState.data.length === 0) {
        throw new Error('Nenhum dado disponível para exportação');
      }

      exportSpecimenTypeToExcel(reportState.data, reportName, subtitle);
    } catch (error: any) {
      console.error('Erro ao exportar para Excel:', error);
      setReportState(prev => ({
        ...prev,
        error: error.message || 'Erro ao exportar dados para Excel'
      }));
    }
  }, [reportState.data, reportName, subtitle]);

  const handleExportToImage = useCallback(async () => {
    try {
      if (!reportState.data || reportState.data.length === 0) {
        throw new Error('Nenhum dado disponível para exportação');
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}.png`;
      
      await exportChart(CHART_CONFIG.CHART_ID, filename);
    } catch (error: any) {
      console.error('Erro ao exportar imagem:', error);
      setReportState(prev => ({
        ...prev,
        error: error.message || 'Erro ao exportar gráfico como imagem'
      }));
    }
  }, [reportState.data, reportName]);

  const handleRestart = useCallback(() => {
    const defaultTimeInterval = getLastTwelveMonths();
    setReportState(prev => ({
      ...prev,
      timeInterval: defaultTimeInterval,
      activeTab: DEFAULTS.ACTIVE_TAB,
      error: null,
    }));
  }, []);

  const handleTabChange = useCallback((value: string) => {
    const newActiveTab = value as ActiveTab;
    setReportState(prev => ({
      ...prev,
      activeTab: newActiveTab,
      error: null,
    }));
  }, []);

  const handleSubmit = useCallback((values: string[]) => {
    if (values && values.length >= 2) {
      const newTimeInterval: TimeInterval = {
        startDate: values[0],
        endDate: values[1],
      };
      setReportState(prev => ({
        ...prev,
        timeInterval: newTimeInterval,
        error: null,
      }));
    }
  }, []);

  const tabsConfig = useMemo(() => ({
    tabs: UI_CONFIG.TABS,
    activeTab: reportState.activeTab,
    handleTabChange: handleTabChange,
  }), [reportState.activeTab]);

  const mainCardOptions = useMemo(() => [
    {
      action: handleExportToExcel,
      icon: <PiMicrosoftExcelLogoFill size={20} />,
      label: 'Exportar para Excel',
      type: 'primary' as const
    },
    {
      action: handleExportToImage,
      icon: <IoImageOutline size={20} />,
      label: 'Exportar imagem',
      type: 'primary' as const
    },
    {
      action: handleRestart,
      icon: <VscDebugRestart size={20} />,
      label: 'Reiniciar o relatório',
      type: 'primary' as const
    },
  ], []);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    fetchDataFromApi(reportState.timeInterval, reportState.activeTab);
  }, [reportState.timeInterval, reportState.activeTab, fetchDataFromApi]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div>
      <MainCard
        additionalOptions={mainCardOptions}
        chartId={CHART_CONFIG.CHART_ID}
        documentation={<Docs />}
        headerProps={{
          sx: {
            padding: 2
          }
        }}
        height="auto"
        id={UI_CONFIG.MAIN_CARD.ID}
        loading={reportState.loading}
        reportType={UI_CONFIG.MAIN_CARD.REPORT_TYPE}
        subtitle={subtitle}
        title={reportName}
        user={{
          email: user?.emailAddresses[0]?.emailAddress,
          name: user?.fullName
        }}
        width="100%"
        handleSubmit={handleSubmit}
      >
        <Tabs 
          defaultValue={DEFAULTS.ACTIVE_TAB}
          value={reportState.activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="mx-4 ml-auto">
            {UI_CONFIG.TABS.map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {UI_CONFIG.TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="px-4 pb-4">
              <Stacked
                id={CHART_CONFIG.CHART_ID}
                height={CHART_CONFIG.HEIGHT}
                labels={chartData.labels}
                onClick={() => {}} // No drill-down functionality for this report
                series={chartData.series}
                yLabel={CHART_CONFIG.Y_LABEL}
              />
            </TabsContent>
          ))}
        </Tabs>
      </MainCard>
    </div>
  );
}