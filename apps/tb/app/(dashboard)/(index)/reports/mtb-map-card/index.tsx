"use client"

import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { TbMessage2Question } from "react-icons/tb";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { VscDebugRestart } from "react-icons/vsc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { MapLegend } from "@repo/design_system/app/atoms/maps/MapLegend";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Niassa, Inhambane, Gaza, MaputoProvincia, MaputoCidade, Tete, Zambezia, Nampula, CaboDelgado, Sofala, Manica } from "@repo/design_system/app/atoms/maps/Provinces";
import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import { Breadcrumb } from "@repo/design_system/app/atoms/breadcrumbs";
import { Text } from "@repo/design_system/app/atoms/typography/Text";
import Docs from "./docs";
import {
  DEFAULTS,
  CHART_CONFIG,
  ReportState,
  ActiveTab,
  ProvinceName,
  MapData,
  TimeInterval,
  getLastTwelveMonths,
  getTabColor,
  formatDateRange,
  UI_CONFIG
} from "./constants";
import {
  fetchNationalMapData,
  fetchDistrictData,
  prepareNationalChartData,
  prepareDistrictChartData,
  getErrorMessage,
} from "./actions";
import { exportMapToExcel, exportDistrictDataToExcel } from "./excel-export-utils";
import { exportMapAsPNG } from "./chart-export-utils";

// =============================================================================
// TYPES
// =============================================================================

export type Data = MapData; // For backward compatibility

export const description = "A map visualization showing TB positivity rates";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MTBXpertMapReport() {
  // =============================================================================
  // STATE
  // =============================================================================
  
  const { getToken } = useAuth();
  const { user } = useUser();

  const [reportState, setReportState] = useState<ReportState>({
    timeInterval: DEFAULTS.TIME_INTERVAL,
    activeTab: DEFAULTS.ACTIVE_TAB,
    selectedProvince: DEFAULTS.SELECTED_PROVINCE,
    loading: false,
    error: null,
    data: [],
    districtData: [],
  });

  // =============================================================================
  // MEMOIZED VALUES
  // =============================================================================

  const selectedColor = useMemo(() => getTabColor(reportState.activeTab), [reportState.activeTab]);

  const nationalChartData = useMemo(() => 
    prepareNationalChartData(reportState.data), 
    [reportState.data]
  );

  const districtChartData = useMemo(() => 
    prepareDistrictChartData(reportState.districtData), 
    [reportState.districtData]
  );

  const dynamicSubtitle = useMemo(() => 
    formatDateRange(reportState.timeInterval), 
    [reportState.timeInterval]
  );

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleRestart = useCallback(() => {
    const newTimeInterval = getLastTwelveMonths();
    setReportState({
      timeInterval: newTimeInterval,
      activeTab: DEFAULTS.ACTIVE_TAB,
      selectedProvince: null,
      loading: true, // Set to true to trigger loading state
      error: null,
      data: [], // Will be populated by useEffect
      districtData: [],
    });
  }, []);

  const handleExportToExcel = useCallback(() => {
    try {
      if (reportState.selectedProvince && reportState.districtData.length > 0) {
        exportDistrictDataToExcel(
          reportState.districtData,
          reportState.timeInterval,
          reportState.activeTab,
          reportState.selectedProvince
        );
      } else if (reportState.data.length > 0) {
        exportMapToExcel(
          reportState.data,
          reportState.timeInterval,
          reportState.activeTab
        );
      } else {
        console.warn('Nenhum dado disponível para exportar');
      }
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
    }
  }, [
    reportState.selectedProvince,
    reportState.districtData,
    reportState.data,
    reportState.timeInterval,
    reportState.activeTab
  ]);

  const handleExportToImage = useCallback(async () => {
    try {
      await exportMapAsPNG(reportState.activeTab);
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
    }
  }, [reportState.activeTab]);

  const mainCardOptions = useMemo(() => [
    {
      action: handleExportToExcel,
      icon: <PiMicrosoftExcelLogoFill size={20} />,
      label: UI_CONFIG.LABELS.EXPORT_EXCEL,
      type: "primary" as const
    },
    {
      action: handleExportToImage,
      icon: <IoImageOutline size={20} />,
      label: UI_CONFIG.LABELS.EXPORT_IMAGE,
      type: "primary" as const
    },
    {
      action: handleRestart,
      icon: <VscDebugRestart size={20} />,
      label: UI_CONFIG.LABELS.RESTART_REPORT,
      type: "primary" as const
    },
  ], [handleExportToExcel, handleExportToImage, handleRestart]);

  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  const fetchDataFromApi = useCallback(async (
    timeInterval: TimeInterval,
    activeTab: ActiveTab
  ) => {
    try {
      setReportState(prev => ({ ...prev, loading: true, error: null }));

      const token = await getToken();
      const data = await fetchNationalMapData(token, timeInterval, activeTab);

      setReportState(prev => ({
        ...prev,
        data: data || [],
        loading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      console.error("Error fetching national data:", error);
      setReportState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [getToken]);

  const fetchDistrictDataFromApi = useCallback(async (
    timeInterval: TimeInterval,
    activeTab: ActiveTab,
    selectedProvince: ProvinceName
  ) => {
    try {
      setReportState(prev => ({ ...prev, loading: true, error: null }));

      const token = await getToken();
      const data = await fetchDistrictData(token, timeInterval, activeTab, selectedProvince);

      setReportState(prev => ({
        ...prev,
        districtData: data || [],
        loading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      console.error("Error fetching district data:", error);
      setReportState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [getToken]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleTabChange = useCallback((value: string) => {
    const newActiveTab = value as ActiveTab;
    // Update the chart title when the tab changes
    setReportState(prev => ({ ...prev, activeTab: newActiveTab }));
  }, []);

  const handleProvinceSelect = useCallback((province: ProvinceName) => {
    setReportState(prev => ({ 
      ...prev, 
      selectedProvince: province,
      districtData: [] // Clear previous district data
    }));
  }, []);

  const handleProvinceDeselect = useCallback(() => {
    setReportState(prev => ({ 
      ...prev, 
      selectedProvince: null,
      districtData: []
    }));
  }, []);

  const handleTimeIntervalChange = useCallback((values: string[]) => {
    const newTimeInterval = {
      startDate: values[0],
      endDate: values[1]
    };
    setReportState(prev => ({ ...prev, timeInterval: newTimeInterval }));
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    fetchDataFromApi(reportState.timeInterval, reportState.activeTab);
  }, [reportState.timeInterval, reportState.activeTab, fetchDataFromApi]);

  useEffect(() => {
    if (reportState.selectedProvince) {
      fetchDistrictDataFromApi(
        reportState.timeInterval,
        reportState.activeTab,
        reportState.selectedProvince
      );
    }
  }, [
    reportState.timeInterval,
    reportState.activeTab,
    reportState.selectedProvince,
    fetchDistrictDataFromApi
  ]);

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
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
      id="tb-main-card"
      labType="poc"
      loading={reportState.loading}
      reportType="national"
      subtitle={dynamicSubtitle}
      title={UI_CONFIG.LABELS.TITLE}
      user={{
        email: user?.emailAddresses[0]?.emailAddress,
        name: user?.fullName
      }}
      width="100%"
      handleSubmit={handleTimeIntervalChange}
      footerComponent={
        <div className="flex flex-row items-center justify-center py-1">
          <MapLegend baseColor={selectedColor} size="small" />
        </div>
      }
    >
      <Tabs 
        defaultValue={DEFAULTS.ACTIVE_TAB}
        className="w-full" 
        onValueChange={handleTabChange}
        value={reportState.activeTab}
      >
        <div className="flex flex-row items-center justify-between px-4">
          {reportState.selectedProvince ? (
            <Breadcrumb 
              links={[
                { 
                  label: UI_CONFIG.LABELS.BREADCRUMB_HOME, 
                  href: "/",
                  onClick: handleProvinceDeselect
                }, 
                { 
                  label: reportState.selectedProvince, 
                  href: "/",
                },
              ]} 
            />
          ) : (
            <Text variant="subtitle2">{UI_CONFIG.LABELS.CLICK_INSTRUCTION}</Text>
          )}
          <TabsList className="ml-auto">
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
        </div>

        {UI_CONFIG.TABS.map((tab) => (
          <TabsContent 
            key={tab.value}
            value={tab.value} 
            className="px-4 pb-4 flex flex-col items-center justify-center"
          >
            <MapVisualization 
              nationalChartData={nationalChartData}
              districtChartData={districtChartData}
              highlightedColor={selectedColor}
              activeTab={reportState.activeTab}
              selectedProvince={reportState.selectedProvince}
              onProvinceSelect={handleProvinceSelect}
              timeInterval={reportState.timeInterval}
            />
          </TabsContent>
        ))}
      </Tabs>
    </MainCard>
  );
}

// =============================================================================
// MAP VISUALIZATION COMPONENT
// =============================================================================

interface MapVisualizationProps {
  nationalChartData: any;
  districtChartData: Record<string, number>;
  highlightedColor: string;
  activeTab: ActiveTab;
  selectedProvince: ProvinceName | null;
  onProvinceSelect: (province: ProvinceName) => void;
  timeInterval: TimeInterval;
}

function MapVisualization({
  nationalChartData,
  districtChartData,
  highlightedColor,
  activeTab,
  selectedProvince,
  onProvinceSelect,
  timeInterval
}: MapVisualizationProps) {
  
  // Province-specific map components
  const ProvinceMapComponents = {
    "Niassa": Niassa,
    "Inhambane": Inhambane,
    "Cabo Delgado": CaboDelgado,
    "Zambezia": Zambezia,
    "Gaza": Gaza,
    "Maputo Cidade": MaputoCidade,
    "Manica": Manica,
    "Maputo Provincia": MaputoProvincia,
    "Nampula": Nampula,
    "Sofala": Sofala,
    "Tete": Tete,
  };

  if (selectedProvince && ProvinceMapComponents[selectedProvince]) {
    const ProvinceComponent = ProvinceMapComponents[selectedProvince];

    return (
      <div id={CHART_CONFIG.CHART_ID} style={{ minHeight: '450px' }}>
        <ProvinceComponent
          districtRatios={districtChartData}
          highlightedColor={highlightedColor}
          onDistrictClick={() => {}} // No district drill-down for now
          showPopover
          legend={UI_CONFIG.LABELS.LEGEND}
          height="400px"
        />
      </div>
    );
  }

  // National map view
  return (
    <div id={CHART_CONFIG.CHART_ID} style={{ minHeight: '450px' }}>
      <InteractiveSvgMap
        height="400px"
        onClick={(province) => {
          onProvinceSelect(province.key as ProvinceName);
        }}
        pathDefaultBackgroundColor={highlightedColor}
        useShortName={true}
        provinces={nationalChartData}
        highlightedColor={highlightedColor}
      />
    </div>
  );
}