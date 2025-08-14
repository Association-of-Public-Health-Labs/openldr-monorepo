"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { 
  DEFAULTS, 
  CHART_CONFIG, 
  UI_CONFIG, 
  API_CONFIG 
} from "./constants";
import { 
  FacilityType,
  getReportName,
  FacilityOptions,
  ActiveTab,
  Data,
  buildApiParams, 
  prepareChartData,
  fetchPatientData,
  fetchFacilityData,
  getGenexpertResultType,
  getNextFacilityType,
  createFacilityOptions,
  TimeInterval
} from "./actions";
import { PatientsDataDialog } from "../../../../../components/patients-data-dialog";
import Docs from "./docs";
import { useAuth, useUser } from "@clerk/nextjs";

// ============================================================================
// TYPES
// ============================================================================

interface ReportState {
  data: Data[];
  loading: boolean;
  error: string | null;
  activeTab: ActiveTab;
  timeInterval: TimeInterval;
  facilities: FacilityOptions[];
  facilityType: FacilityType;
  disaggregation: boolean;
}

interface PatientDialogState {
  open: boolean;
  data: any[];
  loading: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MTBRegisteredByFacility() {
  const { user } = useUser();
  const { getToken } = useAuth();
  // ============================================================================
  // STATE
  // ============================================================================

  
  const [reportState, setReportState] = useState<ReportState>({
    data: [],
    loading: true,
    error: null,
    activeTab: DEFAULTS.ACTIVE_TAB,
    timeInterval: DEFAULTS.TIME_INTERVAL,
    facilities: [],
    facilityType: DEFAULTS.FACILITY_TYPE,
    disaggregation: DEFAULTS.DISAGGREGATION,
  });

  const [patientDialog, setPatientDialog] = useState<PatientDialogState>({
    open: false,
    data: [],
    loading: false,
  });

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const chartData = useMemo(() => 
    prepareChartData(reportState.data), 
    [reportState.data]
  );

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const fetchDataFromApi = useCallback(async (
    startDate: string, 
    endDate: string, 
    disaggregation: boolean,
    facilities: FacilityOptions[],
    facilityType?: FacilityType
  ) => {
    try {
      setReportState(prev => ({ ...prev, loading: true, error: null }));
      const token = await getToken();
      const params = buildApiParams(
        { startDate, endDate },
        reportState.activeTab,
        facilities,
        facilityType || reportState.facilityType,
        disaggregation
      );

      const data = await fetchFacilityData(params, token);
      
      setReportState(prev => ({ 
        ...prev, 
        data, 
        loading: false,
        error: null 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setReportState(prev => ({ 
        ...prev, 
        loading: false,
        error: errorMessage 
      }));
    }
  }, [reportState.activeTab, reportState.facilityType]);

  const fetchPatientDataFromApi = useCallback(async (label: string) => {
    try {
      const token = await getToken();
      setPatientDialog(prev => ({ ...prev, loading: true }));
      
      const currentFacility = reportState.facilities[0];
      
      const params = {
        interval_dates: `${reportState.timeInterval.startDate},${reportState.timeInterval.endDate}`,
        province: currentFacility?.province || "Zambezia",
        district: currentFacility?.district || "Quelimane", 
        health_facility: label,
        genexpert_result_type: getGenexpertResultType(reportState.activeTab),
      };
      
      const patients = await fetchPatientData(params, token);
      
      setPatientDialog(prev => ({ 
        ...prev, 
        data: patients,
        loading: false 
      }));
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setPatientDialog(prev => ({ 
        ...prev, 
        data: [],
        loading: false 
      }));
    }
  }, [reportState.facilities, reportState.timeInterval, reportState.activeTab]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRestart = useCallback(() => {
    setReportState(prev => ({
      ...prev,
      disaggregation: DEFAULTS.DISAGGREGATION,
      facilities: [],
      facilityType: DEFAULTS.FACILITY_TYPE,
    }));
  }, []);

  const handleTabChange = useCallback((value: string) => {
    const newActiveTab = value as ActiveTab;
    setReportState(prev => ({ ...prev, activeTab: newActiveTab }));
  }, []);

  const handleChartClick = useCallback(async (label: string) => {
    if (!label) return;

    setReportState(prev => ({ ...prev, loading: true }));

    if (reportState.facilityType === "clinic") {
      setPatientDialog(prev => ({ ...prev, open: true }));
      await fetchPatientDataFromApi(label);
      setReportState(prev => ({ ...prev, loading: false }));
      return;
    }

    const newFacilityType = getNextFacilityType(reportState.facilityType);
    const newFacility = createFacilityOptions(
      label, 
      reportState.facilityType, 
      reportState.facilities
    );

    setReportState(prev => ({
      ...prev,
      facilityType: newFacilityType,
      facilities: [newFacility],
      disaggregation: true,
    }));

    await fetchDataFromApi(
      reportState.timeInterval.startDate, 
      reportState.timeInterval.endDate, 
      reportState.disaggregation, 
      reportState.facilities,
      newFacilityType
    );
    
    setReportState(prev => ({ ...prev, loading: false }));
  }, [reportState.facilityType, reportState.facilities, reportState.timeInterval, reportState.disaggregation, fetchDataFromApi, fetchPatientDataFromApi]);

  const handleSubmit = useCallback((
    dates: string[], 
    facilities: FacilityOptions[], 
    facilityType: FacilityType
  ) => {
    setReportState(prev => ({
      ...prev,
      facilities,
      facilityType,
      timeInterval: { startDate: dates[0], endDate: dates[1] },
      disaggregation: facilityType === "district" || facilityType === "clinic",
    }));
  }, []);

  const handleDialogClose = useCallback(() => {
    setPatientDialog({ open: false, data: [], loading: false });
  }, []);

  // ============================================================================
  // MEMOIZED VALUES (moved after function definitions)
  // ============================================================================

  const mainCardOptions = useMemo(() => [
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
      action: handleRestart,
      icon: <VscDebugRestart size={20} />,
      label: "Reiniciar o relatorio",
      type: "primary" as const
    },
  ], [handleRestart]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchDataFromApi(
      reportState.timeInterval.startDate, 
      reportState.timeInterval.endDate, 
      reportState.disaggregation, 
      reportState.facilities, 
      reportState.facilityType
    );
  }, [
    reportState.timeInterval, 
    reportState.disaggregation, 
    reportState.facilities, 
    reportState.facilityType,
    fetchDataFromApi
  ]);


  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <MainCard
        additionalOptions={mainCardOptions}
        chartId={CHART_CONFIG.CHART_ID}
        documentation={<Docs />}
        headerProps={{ sx: { padding: 2 } }}
        height={UI_CONFIG.MAIN_CARD_OPTIONS.HEIGHT}
        id="tb-main-card"
        labType={UI_CONFIG.MAIN_CARD_OPTIONS.LAB_TYPE}
        loading={reportState.loading}
        reportType={"lab"}
        subtitle={UI_CONFIG.MAIN_CARD_OPTIONS.SUBTITLE}
        title={DEFAULTS.REPORT_NAME}
        user={{
          email: user?.emailAddresses[0].emailAddress,
          name: user?.fullName || ""
        }}
        width="100%"
        handleSubmit={handleSubmit as any}
      >
        <Tabs 
          defaultValue={DEFAULTS.ACTIVE_TAB} 
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="mx-4 ml-auto">
            {UI_CONFIG.TAB_OPTIONS.map(option => (
              <TabsTrigger 
                key={option.value}
                value={option.value} 
                className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {UI_CONFIG.TAB_OPTIONS.map(option => (
            <TabsContent key={option.value} value={option.value} className="px-4 pb-4">
              <Stacked
                id={CHART_CONFIG.CHART_ID}
                height={CHART_CONFIG.HEIGHT}
                labels={chartData.labels}
                onClick={option.value === "ultra" ? handleChartClick : () => {}}
                series={chartData.series}
              />
            </TabsContent>
          ))}
        </Tabs>
      </MainCard>
      
      {patientDialog.open && (
        <PatientsDataDialog
          data={patientDialog.data}
          open={patientDialog.open}
          setOpen={handleDialogClose}
          loading={patientDialog.loading}
        />
      )}
    </>
  );
}