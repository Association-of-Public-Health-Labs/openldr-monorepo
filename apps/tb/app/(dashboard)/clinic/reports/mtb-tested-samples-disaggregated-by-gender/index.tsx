"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import {
    DEFAULTS,
    CHART_CONFIG,
    UI_CONFIG
} from "./constants";
import {
    FacilityType,
    FacilityOptions,
    ActiveTab,
    Data,
    buildApiParams,
    prepareChartData,
    fetchPatientData,
    fetchFacilityData,
    getNextFacilityType,
    getGenexpertResultType,
    createFacilityOptions,
    TimeInterval
} from "./actions";
import { PatientsDataDialog } from "../../../../../components/patients-data-dialog";
import { useAuth, useUser } from "@clerk/nextjs";
import { exportChart } from "../shared/chart-export-utils";
import Docs from "./docs";

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

export default function MTBTestedByFacilityByGender() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const reportName = "Relatório de Sensibilidade aos Medicamentos por Sexo";

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

    const [clickedLabels, setClickedLabels] = useState<string[]>([]);

    // ============================================================================
    // MEMOIZED VALUES
    // ============================================================================

    // Dynamic subtitle with formatted dates and facility context
    const dynamicSubtitle = useMemo(() => {
        const { startDate, endDate } = reportState.timeInterval;
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
                data: data,
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
        facilityType: FacilityType,
    ) => {
        console.log('handleSubmit called with:', { dates, facilities, facilityType });
        // Reset clicked labels when submitting new query
        setClickedLabels([]);

        // Use the passed facilityType parameter, not getNextFacilityType
        const disaggregation = facilityType === "province" || facilityType === "district" || facilityType === "clinic";

        // Update state with new values - useEffect will handle data fetching
        setReportState(prev => ({
            ...prev,
            facilities,
            facilityType,
            timeInterval: { startDate: dates[0], endDate: dates[1] },
            disaggregation,
            activeTab: reportState.activeTab
        }));
    }, [reportState.activeTab]);

    const handleDialogClose = useCallback(() => {
        setPatientDialog({ open: false, data: [], loading: false });
    }, []);

    const handleExportToExcel = useCallback(async () => {
        try {
            const { utils, writeFile } = await import('xlsx');

            const worksheetData = [
                [reportName], // Title row
                [`Período: ${dynamicSubtitle}`], // Period information
                [''], // Empty row for spacing
                ['Unidade Sanitária', 'Masculino Resistente', 'Masculino Sensível',
                    'Feminino Resistente', 'Feminino Sensível'],
                ...chartData.labels.map((label, index) => [
                    label,
                    ...chartData.series.map(s => s.data[index] || 0)
                ])
            ];

            const worksheet = utils.aoa_to_sheet(worksheetData);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Sensibilidade por Sexo');

            const fileName = `${reportName}_${dynamicSubtitle}.xlsx`;
            writeFile(workbook, fileName);
        } catch (error) {
            console.error("Failed to export to Excel:", error);
        }
    }, [chartData, reportName, dynamicSubtitle]);

    const handleExportToImage = useCallback(async () => {
        try {
            const filename = `${reportName}_${dynamicSubtitle}`;
            await exportChart({
                chartId: CHART_CONFIG.CHART_ID,
                fileName: filename
            });
        } catch (error) {
            console.error("Failed to export image:", error);
        }
    }, [reportName, dynamicSubtitle]);

    // Main card options with export functionality
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
        reportState.timeInterval.startDate,
        reportState.timeInterval.endDate,
        reportState.disaggregation,
        reportState.facilityType,
        reportState.facilities,
        reportState.activeTab,
        fetchDataFromApi
    ]);

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <MainCard
            additionalOptions={mainCardOptions}
            chartId={CHART_CONFIG.CHART_ID}
            documentation={<Docs />}
            headerProps={{ sx: { padding: 2 } }}
            height="auto"
            id="tb-main-card"
            labType="poc"
            loading={reportState.loading}
            reportType="facility"
            subtitle={dynamicSubtitle}
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

            {patientDialog.open && (
                <PatientsDataDialog
                    data={patientDialog.data}
                    open={patientDialog.open}
                    setOpen={handleDialogClose}
                    loading={patientDialog.loading}
                />
            )}
        </MainCard>
    );
}