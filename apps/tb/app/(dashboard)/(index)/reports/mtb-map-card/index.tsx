"use client"

import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { periodLabel } from "@repo/design_system/lib/period";
import { TbMessage2Question } from "react-icons/tb";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { VscDebugRestart } from "react-icons/vsc";
import { Tabs, TabsContent } from "@repo/design_system/components/ui/tabs";
import { SegmentedTabsList, SegmentedTabsTrigger } from "@repo/design_system/components/ui/segmented-tabs";
import { MapLegend } from "@repo/design_system/app/atoms/maps/MapLegend";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Niassa, Inhambane, Gaza, MaputoProvincia, MaputoCidade, Tete, Zambezia, Nampula, CaboDelgado, Sofala, Manica } from "@repo/design_system/app/atoms/maps/Provinces";
import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import { DrillBreadcrumb } from "@repo/design_system/app/molecules/maps/DrillBreadcrumb";
import { MousePointerClick } from "lucide-react";
import { BarValue, SortableTable, type SortableColumn } from "@repo/design_system/app/molecules/tables/SortableTable";
import { formatNumber } from "@repo/design_system/lib/format-number";
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
  UI_CONFIG,
  PROVINCE_LABELS,
  FacilityTableState
} from "./constants";
import {
  fetchNationalMapData,
  fetchDistrictData,
  fetchFacilityData,
  positivity,
  sumCounts,
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
    selectedDistrict: null,
    loading: false,
    error: null,
    data: [],
    districtData: [],
  });
  const [facilities, setFacilities] = useState<FacilityTableState>({ rows: [], loading: false, error: null });

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
    periodLabel(reportState.timeInterval.startDate, reportState.timeInterval.endDate, () => formatDateRange(reportState.timeInterval)),
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
      selectedDistrict: null,
      loading: true, // Set to true to trigger loading state
      error: null,
      data: [], // Will be populated by useEffect
      districtData: [],
    });
    setFacilities({ rows: [], loading: false, error: null });
  }, []);

  const handleExportToExcel = useCallback(() => {
    try {
      if (reportState.selectedProvince && reportState.selectedDistrict && facilities.rows.length > 0) {
        exportDistrictDataToExcel(
          facilities.rows,
          reportState.timeInterval,
          reportState.activeTab,
          `${PROVINCE_LABELS[reportState.selectedProvince]} - ${reportState.selectedDistrict}`,
          "Unidade Sanitária"
        );
      } else if (reportState.selectedProvince && reportState.districtData.length > 0) {
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
    reportState.selectedDistrict,
    facilities.rows,
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

  const fetchFacilityDataFromApi = useCallback(async (
    timeInterval: TimeInterval,
    activeTab: ActiveTab,
    selectedProvince: ProvinceName,
    district: string
  ) => {
    setFacilities(prev => ({ ...prev, loading: true, error: null }));
    try {
      const token = await getToken();
      const rows = await fetchFacilityData(token, timeInterval, activeTab, selectedProvince, district);
      setFacilities({ rows, loading: false, error: null });
    } catch (error: any) {
      console.error("Error fetching facility data:", error);
      setFacilities({ rows: [], loading: false, error: getErrorMessage(error) });
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
      selectedDistrict: null,
      districtData: [] // Clear previous district data
    }));
  }, []);

  const handleDistrictSelect = useCallback((district: string) => {
    setFacilities({ rows: [], loading: true, error: null });
    setReportState(prev => ({ ...prev, selectedDistrict: district }));
  }, []);

  const handleDistrictDeselect = useCallback(() => {
    setReportState(prev => ({ ...prev, selectedDistrict: null }));
  }, []);

  const handleProvinceDeselect = useCallback(() => {
    setReportState(prev => ({ 
      ...prev, 
      selectedProvince: null,
      selectedDistrict: null,
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

  useEffect(() => {
    if (reportState.selectedProvince && reportState.selectedDistrict) {
      fetchFacilityDataFromApi(
        reportState.timeInterval,
        reportState.activeTab,
        reportState.selectedProvince,
        reportState.selectedDistrict
      );
    }
  }, [
    reportState.timeInterval,
    reportState.activeTab,
    reportState.selectedProvince,
    reportState.selectedDistrict,
    fetchFacilityDataFromApi
  ]);

  // Health-facility table: counts grouped, positivity as on the map, district total at the bottom.
  const facilityColumns = useMemo<SortableColumn<MapData>[]>(() => {
    const total = sumCounts(facilities.rows);
    const count = (key: "Tested_Samples" | "Detected" | "Not_Detected" | "Invalid" | "Errors", header: string, secondary = false): SortableColumn<MapData> => ({
      key,
      header,
      align: "right",
      secondary,
      cell: (row) => formatNumber(row[key] || 0),
      sortValue: (row) => row[key] || 0,
      footer: formatNumber(total[key]),
    });
    return [
      {
        key: "Facility",
        header: "Unidade sanitária",
        cell: (row) => row.Facility,
        sortValue: (row) => row.Facility,
        footer: UI_CONFIG.LABELS.FACILITY_TOTAL,
        className: "min-w-[130px]",
      },
      count("Tested_Samples", "Testadas"),
      count("Detected", "Positivas"),
      count("Not_Detected", "Negativas"),
      // Hidden on narrow cards; always in the Excel export.
      count("Invalid", "Inválidas", true),
      count("Errors", "Erros", true),
      {
        key: "Positivity",
        header: "Positividade",
        align: "right",
        cell: (row) => <BarValue value={positivity(row)} color={selectedColor} />,
        sortValue: positivity,
        footer: <BarValue value={positivity(total)} color={selectedColor} />,
      },
    ];
  }, [facilities.rows, selectedColor]);

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
      loading={reportState.loading || facilities.loading}
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
            <DrillBreadcrumb
              items={[
                { label: UI_CONFIG.LABELS.BREADCRUMB_HOME, onSelect: handleProvinceDeselect },
                {
                  label: PROVINCE_LABELS[reportState.selectedProvince] ?? reportState.selectedProvince,
                  onSelect: reportState.selectedDistrict ? handleDistrictDeselect : undefined,
                },
                ...(reportState.selectedDistrict ? [{ label: reportState.selectedDistrict }] : []),
              ]}
            />
          ) : (
            <p className="flex min-w-0 items-center gap-1.5 text-xs leading-[18px] text-[#637381] dark:text-[#919EAB]">
              <MousePointerClick aria-hidden className="size-4 shrink-0" />
              <span>{UI_CONFIG.LABELS.CLICK_INSTRUCTION}</span>
            </p>
          )}
          <SegmentedTabsList className="ml-auto">
            {UI_CONFIG.TABS.map((tab) => (
              <SegmentedTabsTrigger 
                key={tab.value}
                value={tab.value}
              >
                {tab.label}
              </SegmentedTabsTrigger>
            ))}
          </SegmentedTabsList>
        </div>

        {UI_CONFIG.TABS.map((tab) => (
          <TabsContent 
            key={tab.value}
            value={tab.value} 
            className="px-4 pb-4 flex flex-col items-center justify-center"
          >
            {reportState.selectedProvince && reportState.selectedDistrict ? (
              <SortableTable
                id={CHART_CONFIG.CHART_ID}
                className="mt-3 min-h-[400px]"
                label={`${UI_CONFIG.LABELS.FACILITY_TABLE}: ${reportState.selectedDistrict}`}
                columns={facilityColumns}
                rows={facilities.rows}
                rowKey={(row) => row.Facility}
                defaultSort={{ key: "Positivity", direction: "desc" }}
                search={{ placeholder: UI_CONFIG.LABELS.FACILITY_SEARCH, text: (row) => row.Facility }}
                loading={facilities.loading}
                emptyMessage={UI_CONFIG.LABELS.FACILITY_EMPTY}
                error={facilities.error ? {
                  message: facilities.error,
                  onRetry: () => fetchFacilityDataFromApi(
                    reportState.timeInterval,
                    reportState.activeTab,
                    reportState.selectedProvince!,
                    reportState.selectedDistrict!
                  ),
                } : null}
                maxHeight={352}
              />
            ) : (
              <MapVisualization
                nationalChartData={nationalChartData}
                districtChartData={districtChartData}
                highlightedColor={selectedColor}
                activeTab={reportState.activeTab}
                selectedProvince={reportState.selectedProvince}
                onProvinceSelect={handleProvinceSelect}
                onDistrictSelect={handleDistrictSelect}
                timeInterval={reportState.timeInterval}
              />
            )}
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
  onDistrictSelect: (district: string) => void;
  timeInterval: TimeInterval;
}

function MapVisualization({
  nationalChartData,
  districtChartData,
  highlightedColor,
  activeTab,
  selectedProvince,
  onProvinceSelect,
  onDistrictSelect,
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
      <div id={CHART_CONFIG.CHART_ID} className="relative" style={{ minHeight: '400px' }}>
        <ProvinceComponent
          districtRatios={districtChartData}
          highlightedColor={highlightedColor}
          onDistrictClick={onDistrictSelect}
          showPopover
          legend={UI_CONFIG.LABELS.LEGEND}
          height="400px"
        />
        <p className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
          <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-xs leading-[18px] text-[#637381] backdrop-blur-sm dark:bg-[#1d232a]/85 dark:text-[#919EAB]">
            <MousePointerClick aria-hidden className="size-4 shrink-0" />
            {UI_CONFIG.LABELS.DISTRICT_HINT}
          </span>
        </p>
      </div>
    );
  }

  // National map view
  return (
    <div id={CHART_CONFIG.CHART_ID} style={{ minHeight: '400px' }}>
      <InteractiveSvgMap
        clickHint={UI_CONFIG.LABELS.CLICK_HINT}
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