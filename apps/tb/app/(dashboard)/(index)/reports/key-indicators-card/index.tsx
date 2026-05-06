"use client"
import { useEffect, useState, useMemo, useCallback } from "react";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { MdOutlineFileDownload } from "react-icons/md";
import { useAuth, useUser } from "@clerk/nextjs";
import { VscDebugRestart } from "react-icons/vsc";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { KeyIndicatorsCard } from "@repo/design_system/app/organisms/cards/KeyIndicatorsCard";
import Docs from "./docs";
import { 
  DEFAULTS, 
  UI_CONFIG, 
  CHART_CONFIG,
  type ReportState,
  formatDateInPortuguese,
  getReportName
} from './constants';
import { 
  fetchKeyIndicatorsData, 
  prepareChartData, 
  getColumns, 
  handleApiError,
  getLastTwelveMonths
} from './actions';
import { exportChartToExcel } from './excel-export-utils';
import { exportChart } from './chart-export-utils';

export default function KeyIndicatorsReport() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [reportState, setReportState] = useState<ReportState>({
    timeInterval: DEFAULTS.TIME_INTERVAL,
    activeTab: DEFAULTS.ACTIVE_TAB,
    loading: DEFAULTS.LOADING,
    error: DEFAULTS.ERROR,
    data: DEFAULTS.DATA
  });

  // Memoized values
  const subtitle = useMemo(() => {
    const startFormatted = formatDateInPortuguese(reportState.timeInterval.startDate);
    const endFormatted = formatDateInPortuguese(reportState.timeInterval.endDate);
    return `${startFormatted} à ${endFormatted}`;
  }, [reportState]);

  const chartData = useMemo(() => prepareChartData(reportState.data), [reportState.data]);
  const columns = useMemo(() => getColumns(reportState.data), [reportState.data]);

  // Event handlers
  const handleExportToExcel = useCallback(() => {
    try {
      exportChartToExcel(chartData, getReportName(), subtitle);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
    }
  }, [chartData, subtitle]);

  const handleTimeIntervalChange = useCallback((values: string[]) => {
    setReportState(prev => ({ 
      ...prev, 
      timeInterval: { startDate: values[0], endDate: values[1] }
    }));
  }, []);

  const handleRestart = useCallback(() => {
    setReportState(prev => ({ 
      ...prev, 
      timeInterval: getLastTwelveMonths(),
      activeTab: DEFAULTS.ACTIVE_TAB,
      data: DEFAULTS.DATA,
      error: null
    }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setReportState(prev => ({ ...prev, loading: true, error: null }));
      const data = await fetchKeyIndicatorsData(getToken, reportState.timeInterval, reportState.activeTab);
      setReportState(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      setReportState(prev => ({ ...prev, loading: false, error: handleApiError(error) }));
    }
  }, [getToken, reportState.timeInterval, reportState.activeTab]);

  const mainCardOptions = useMemo(() => [
          {
              action: handleExportToExcel,
              icon: <PiMicrosoftExcelLogoFill size={20} />,
              label: UI_CONFIG.EXPORT_OPTIONS.EXCEL_LABEL,
              type: "primary" as const
          },
          {
              action: handleRestart,
              icon: <VscDebugRestart size={20} />,
              label: UI_CONFIG.EXPORT_OPTIONS.RESTART_LABEL,
              type: "primary" as const
          },
      ], [handleExportToExcel, handleRestart]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <MainCard
      user={{
        email: user?.emailAddresses[0]?.emailAddress,
        name: user?.fullName
      }}
      reportType="national"
      headerProps={{
        sx: {
            padding: 2
        }
    }}
      additionalOptions={mainCardOptions}
      chartId={CHART_CONFIG.CHART_ID}
      documentation={<Docs />}
      loading={reportState.loading}
      subtitle={subtitle}
      title={getReportName()}
      handleSubmit={handleTimeIntervalChange}
    >
      <KeyIndicatorsCard
        labels={UI_CONFIG.TABS}
        onValueChange={(value) => setReportState(prev => ({ ...prev, activeTab: value as any }))}
        columns={columns}
        tab1={chartData}
        tab2={chartData}
        tab3={chartData}
      />
    </MainCard>
  );
}