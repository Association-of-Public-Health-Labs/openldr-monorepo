
"use client"
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
  TimeInterval,
  fetchLabsFromApi
} from "./actions";
import { PatientsDataDialog } from "../../../../../components/patients-data-dialog";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "./chart-export-utils";
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

// Main component
export default function MTBRejectedSamplesByMonth() {
  // State
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

  // Track clicked labels for dynamic subtitle
  const [clickedLabels, setClickedLabels] = useState<string[]>([]);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

    // Dynamic subtitle that combines time interval and clicked labels
    const dynamicSubtitle = useMemo(() => {
        const { startDate, endDate } = reportState.timeInterval;

        // Format dates to dd-MMM-yyyy
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleDateString('pt-BR', { month: 'long' });
            const year = date.getFullYear();
            return `${day} de ${month} de ${year}`;
        };

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
        const dateRange = `${formattedStartDate} à ${formattedEndDate}`;

        if (clickedLabels.length === 0) {
            return dateRange;
        }

        const labelsText = clickedLabels.join(' → ');
        return `${dateRange} | ${labelsText}`;
    }, [reportState, clickedLabels]);

    const chartData = useMemo(() => 
        prepareChartData(reportState.data), 
        [reportState.data]
      );

    const reportName = useMemo(() => 
        getReportName(reportState.activeTab), 
        [reportState.activeTab]
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
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro";
      setReportState(prev => ({ 
        ...prev, 
        loading: false,
        error: errorMessage 
      }));
    }
  }, [reportState.activeTab, reportState.facilityType, getToken]);

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
  }, [reportState.facilities, reportState.timeInterval, reportState.activeTab, getToken]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleExportToImage = useCallback(async () => {
    try {
      await exportChart(CHART_CONFIG.CHART_ID, reportName);
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      // Could add toast notification here
    }
  }, [reportName]);

  const handleRestart = useCallback(() => {
    // Reset clicked labels when restarting
    setClickedLabels([]);

    setReportState(prev => ({
      ...prev,
      disaggregation: DEFAULTS.DISAGGREGATION,
      facilities: [],
      facilityType: DEFAULTS.FACILITY_TYPE,
      timeInterval: DEFAULTS.TIME_INTERVAL,
      activeTab: DEFAULTS.ACTIVE_TAB
    }));
  }, []);

    const handleTabChange = useCallback((newTab: ActiveTab) => {
        setReportState(prev => ({
            ...prev,
            activeTab: newTab
        }));
    }, []);

  const handleChartClick = useCallback(async (label: string) => {
    
    if (!label) return;

    setReportState(prev => ({ ...prev, loading: true }));

    // Add clicked label to the breadcrumb trail
    setClickedLabels(prev => [...prev, label]);

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

    const newFacilities = [newFacility];
    const newDisaggregation = true;

    setReportState(prev => ({
      ...prev,
      facilityType: newFacilityType,
      facilities: newFacilities,
      disaggregation: newDisaggregation,
    }));

    await fetchDataFromApi(
      reportState.timeInterval.startDate, 
      reportState.timeInterval.endDate, 
      newDisaggregation, 
      newFacilities,
      newFacilityType
    );
    
    setReportState(prev => ({ ...prev, loading: false }));
  }, [reportState.facilityType, reportState.facilities, reportState.timeInterval, fetchDataFromApi, fetchPatientDataFromApi]);

  const handleSubmit = useCallback(async (
    dates: string[], 
    facilities: FacilityOptions[], 
    facilityType: FacilityType
  ) => {

    // Reset clicked labels when submitting new query
    setClickedLabels([]);

    // Use the passed facilityType parameter, not getNextFacilityType
    const disaggregation = facilityType === "province" || facilityType === "district" || facilityType === "clinic";
    // Update state with new values - useEffect will handle data fetching
    setReportState(prev => ({
      ...prev,
      facilities,
      facilityType: "district",
      timeInterval: { startDate: dates[0], endDate: dates[1] },
      disaggregation,
      activeTab: DEFAULTS.ACTIVE_TAB
    }));
  }, []);

  const handleDialogClose = useCallback(() => {
    setPatientDialog({ open: false, data: [], loading: false });
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

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportChartToExcel(
          chartData,
          reportState,
          DEFAULTS.REPORT_NAME,
          getLabProperty
      );
    } catch (error) {
        console.error("Failed to export to Excel:", error);
    }
  }, [chartData, reportState]);

  // ============================================================================
  // MEMOIZED VALUES (moved after function definitions)
  // ============================================================================

  const mainCardOptions = useMemo(() => [
    {
      action: handleExportToExcel,
      icon: <PiMicrosoftExcelLogoFill size={20} />,
      label: "Exportar para Excel",
      type: "primary" as const
    },
    {
      action: handleExportToImage,
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
  ], [handleExportToExcel, handleExportToImage, handleRestart]);

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
    reportState.activeTab,
    fetchDataFromApi
  ]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const token = await getToken();
        const labs = await fetchLabsFromApi(token);
        // setReportState(prev => ({ ...prev, labs }));
        
      } catch (error) {
        console.error("Error fetching labs:", error);
      }
    };
    fetchLabs();
  }, [getToken]);

  // return (
  //   <MainCard
  //     additionalOptions={createMainCardOptions(handleRestart, handleExportToExcel)}
  //     chartId="tb-stacked-chart"
  //     headerProps={{ sx: { padding: 2 } }}
  //     height="auto"
  //     id="tb-main-card"
  //     labType="poc"
  //     loading={loading}
  //     reportType="facility"
  //     subtitle="Últimos 12 meses"
  //     title={REPORT_NAME}
  //     user={{
  //       email: user?.emailAddresses[0].emailAddress,
  //       name: user?.fullName || ""
  //     }}
  //     width="100%"
  //     handleSubmit={handleSubmit as any}
  //   >
  //     <Tabs 
  //       defaultValue="ultra" 
  //       value={activeTab}
  //       className="w-full"
  //       onValueChange={handleTabChange}
  //     >
  //       <TabsList className="mx-4 ml-auto">
  //         <TabsTrigger 
  //           value="ultra" 
  //           className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
  //         >
  //           Ultra
  //         </TabsTrigger>
  //         <TabsTrigger 
  //           value="xdr" 
  //           className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
  //         >
  //           XDR
  //         </TabsTrigger>
  //       </TabsList>
        
  //       <TabsContent value="ultra" className="px-4 pb-4">
  //         <Stacked
  //           id="tb-stacked-chart"
  //           height={350}
  //           labels={labels}
  //           onClick={handleChartClick}
  //           series={series}
  //         />
  //       </TabsContent>
        
  //       <TabsContent value="xdr" className="px-4 pb-4">
  //         <Stacked
  //           id="tb-stacked-chart"
  //           height={350}
  //           labels={labels}
  //           onClick={() => {}}
  //           series={series}
  //         />
  //       </TabsContent>
  //     </Tabs>
  //   </MainCard>
  // );

  return (
    <MainCard
      additionalOptions={mainCardOptions}
      chartId="tb-stacked-chart"
      headerProps={{ sx: { padding: 2 } }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      loading={reportState.loading}
      reportType="lab"
      subtitle={dynamicSubtitle}
      title={reportName}
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
            labels={chartData?.labels}
            // onClick={}
            series={chartData?.series}
          />
        </TabsContent>
        
        <TabsContent value="xdr" className="px-4 pb-4">
          <Stacked
            id="tb-stacked-chart"
            height={350}
            labels={chartData?.labels}
            // onClick={() => {}}
            series={chartData?.series}
          />
        </TabsContent>
      </Tabs>
    </MainCard>
  );
}