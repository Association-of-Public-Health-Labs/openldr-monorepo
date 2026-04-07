"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import Docs from "./docs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { PatientsDataDialog } from "../../../../../components/patients-data-dialog";
import {
    DEFAULTS,
    CHART_CONFIG,
    UI_CONFIG,
    FacilityType,
    FacilityOptions,
    Data,
    TimeInterval,
    ActiveTab,
    PatientDataParams,
    getGenexpertResultType
} from "./constants";
import {
    buildApiParams,
    prepareChartData,
    fetchFacilityData,
    getNextFacilityType,
    createFacilityOptions,
    fetchPatientData
} from "./actions";
import { useAuth, useUser } from "@clerk/nextjs";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "../shared/chart-export-utils";

// ============================================================================
// TYPES
// ============================================================================

interface ReportState {
    data: Data[];
    loading: boolean;
    error: string | null;
    timeInterval: TimeInterval;
    facilities: FacilityOptions[];
    facilityType: FacilityType;
    disaggregation: boolean;
    activeTab: ActiveTab;
}

interface PatientDialogState {
    open: boolean;
    data: any[];
    loading: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MTBRejectedSamples() {
    const { user } = useUser();
    const { getToken } = useAuth();
    
    // ============================================================================
    // STATE
    // ============================================================================

    const [reportState, setReportState] = useState<ReportState>({
        data: [],
        loading: true,
        error: null,
        timeInterval: DEFAULTS.TIME_INTERVAL,
        facilities: [],
        facilityType: DEFAULTS.FACILITY_TYPE,
        disaggregation: DEFAULTS.DISAGGREGATION,
        activeTab: DEFAULTS.ACTIVE_TAB
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
    }, [reportState.activeTab, reportState.facilityType, getToken]);

    const fetchPatientDataFromApi = useCallback(async (label: string) => {
        try {

            const token = await getToken();

            setPatientDialog(prev => ({ ...prev, loading: true }));

            const currentFacility = reportState.facilities[0];

            const params: PatientDataParams = {
                interval_dates: `${reportState.timeInterval.startDate}, ${reportState.timeInterval.endDate}`,
                province: currentFacility?.province || "Maputo Provincia",
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

    const getFacilityProperty = (facilityType: FacilityType, label: string) => {
        switch (facilityType) {
            case 'province':
                return { Província: label };
            case 'district':
                return { Distrito: label };
            case 'clinic':
                return { 'Unidade Sanitária': label };
            default:
                return { Localização: label };
        }
    };

    const handleSubmit = useCallback(async (
        dates: string[],
        facilities: FacilityOptions[],
        facilityType: FacilityType,
    ) => {
        // Reset clicked labels when submitting new query
        setClickedLabels([]);

        // Use the passed facilityType parameter, not getNextFacilityType
        const disaggregation = false;

        // Update state with new values - useEffect will handle data fetching
        setReportState(prev => ({
            ...prev,
            facilities,
            facilityType,
            timeInterval: { startDate: dates[0], endDate: dates[1] },
            disaggregation,
            activeTab: DEFAULTS.ACTIVE_TAB
        }));
    }, []);

    const handleDialogClose = useCallback(() => {
        setPatientDialog({ open: false, data: [], loading: false });
    }, []);

    const handleExportToExcel = useCallback(async () => {
        try {
            await exportChartToExcel(
                chartData,
                reportState,
                DEFAULTS.REPORT_NAME,
                getFacilityProperty
            );
        } catch (error) {
            console.error("Failed to export to Excel:", error);
        }
    }, [chartData, reportState]);

    const handleExportToImage = useCallback(async () => {
        try {
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
            const fileName = `${DEFAULTS.REPORT_NAME}_${dateRange}`;

            await exportChart({
                chartId: CHART_CONFIG.CHART_ID,
                fileName: fileName
            });
        } catch (error) {
            console.error("Failed to export chart:", error);
        }
    }, [reportState.timeInterval]);

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
                reportType={UI_CONFIG.MAIN_CARD_OPTIONS.REPORT_TYPE}
                subtitle={dynamicSubtitle || UI_CONFIG.MAIN_CARD_OPTIONS.SUBTITLE}
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
                                onClick={handleChartClick}
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
