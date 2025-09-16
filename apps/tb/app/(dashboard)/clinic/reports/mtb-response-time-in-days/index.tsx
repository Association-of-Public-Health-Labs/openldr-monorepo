"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PatientsDataDialog } from "@repo/utilities/components/patients-data-dialog";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { 
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../../../../../components/ui/select";
import Docs from "./docs";
import { 
    API_CONFIG, 
    DEFAULTS, 
    CHART_CONFIG, 
    UI_CONFIG, 
    TIME_INTERVAL_OPTIONS,
    type ReportState, 
    type PatientDialogState, 
    type FacilityType, 
    type ActiveTab,
    type TimeIntervalType, 
    type TimeInterval, 
    type FacilityOptions, 
    type ResponseTimeData,
    type PatientDataParams
} from "./constants";
import { 
    fetchFacilityData, 
    fetchPatientData,
    buildApiParams,
    prepareChartData,
    prepareExcelData,
    createFacilityOptions,
    getNextFacilityType,
    getReportName,
    formatDateInPortuguese
} from "./actions";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "./chart-export-utils";
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import { IoImageOutline } from 'react-icons/io5';
import { VscDebugRestart } from 'react-icons/vsc';

// ============================================================================
// TYPES
// ============================================================================

interface MTBResponseTimeReportProps { }

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MTBResponseTimeReport: React.FC<MTBResponseTimeReportProps> = () => {
    // ========================================================================
    // STATE
    // ========================================================================

    const { user } = useUser();
    const { getToken } = useAuth();

    const [reportState, setReportState] = useState<ReportState>({
        timeInterval: DEFAULTS.TIME_INTERVAL,
        activeTab: DEFAULTS.ACTIVE_TAB,
        timeIntervalType: DEFAULTS.TIME_INTERVAL_TYPE,
        facilities: [],
        facilityType: DEFAULTS.FACILITY_TYPE,
        disaggregation: DEFAULTS.DISAGGREGATION,
        loading: false,
        error: null,
        data: []
    });

    const [patientDialog, setPatientDialog] = useState<{
        open: boolean;
        data: any[];
        loading: boolean;
    }>({
        open: false,
        data: [],
        loading: false,
    });

    // ========================================================================
    // MEMOIZED VALUES
    // ========================================================================

    const dynamicSubtitle = useMemo(() => {
        if (reportState.timeInterval) {
            const startDate = formatDateInPortuguese(reportState.timeInterval.startDate);
            const endDate = formatDateInPortuguese(reportState.timeInterval.endDate);
            return `${startDate} à ${endDate}`;
        }
        return UI_CONFIG.MAIN_CARD_OPTIONS.SUBTITLE;
    }, [reportState.timeInterval]);

    const reportName = useMemo(() => {
        return getReportName(reportState.activeTab, reportState.timeIntervalType);
    }, [reportState.activeTab, reportState.timeIntervalType]);

    const chartData = useMemo(() => {
        return prepareChartData(reportState.data, reportState.timeIntervalType);
    }, [reportState.data, reportState.timeIntervalType]);

    const breadcrumbText = useMemo(() => {
        if (reportState.facilities.length === 0) return "";
        return reportState.facilities.map(f => f.label).join(" > ");
    }, [reportState.facilities]);

    const selectedTimeIntervalOption = useMemo(() => {
        return TIME_INTERVAL_OPTIONS.find(option => option.value === reportState.timeIntervalType);
    }, [reportState.timeIntervalType]);

    // ========================================================================
    // API FUNCTIONS
    // ========================================================================

    const fetchDataFromApi = useCallback(async (
        timeInterval = reportState.timeInterval,
        activeTab = reportState.activeTab,
        facilities = reportState.facilities,
        facilityType = reportState.facilityType,
        disaggregation = reportState.disaggregation
    ) => {
        if (!user) return;

        const token = await getToken();

        setReportState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const params = buildApiParams(timeInterval, activeTab, facilities, facilityType, disaggregation);
            const data = await fetchFacilityData(params, token);

            setReportState(prev => ({
                ...prev,
                data,
                loading: false,
                error: null
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao carregar dados";
            setReportState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
                data: []
            }));
        }
    }, [user, getToken, reportState.timeInterval, reportState.activeTab, reportState.facilities, reportState.facilityType, reportState.disaggregation]);

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    const handleExportToExcel = useCallback(() => {
        try {
            const excelData = prepareExcelData(reportState.data, reportState.timeIntervalType);
            const selectedOption = TIME_INTERVAL_OPTIONS.find(opt => opt.value === reportState.timeIntervalType);
            const filename = `${reportName}_${new Date().toISOString().split('T')[0]}`;

            exportChartToExcel(
                excelData,
                filename,
                reportName,
                selectedOption?.label || "Tempo de Resposta",
                dynamicSubtitle
            );
        } catch (error) {
            console.error("Erro ao exportar para Excel:", error);
        }
    }, [reportState.data, reportState.timeIntervalType, reportName, dynamicSubtitle]);

    const handleExportToImage = useCallback(() => {
        try {
            const filename = `${reportName}_${new Date().toISOString().split('T')[0]}`;
            exportChart(CHART_CONFIG.CHART_ID, filename);
        } catch (error) {
            console.error("Erro ao exportar imagem:", error);
        }
    }, [reportName]);

    const handleRestart = useCallback(() => {
        setReportState(prev => ({
            ...prev,
            facilities: [],
            facilityType: DEFAULTS.FACILITY_TYPE,
            disaggregation: DEFAULTS.DISAGGREGATION,
            error: null
        }));
    }, []);

    const handleTabChange = useCallback((newTab: ActiveTab) => {
        setReportState(prev => ({ ...prev, activeTab: newTab }));
    }, []);

    const handleTimeIntervalTypeChange = useCallback((newType: TimeIntervalType) => {
        setReportState(prev => ({ ...prev, timeIntervalType: newType }));
    }, []);

    const handleChartClick = useCallback(async (label: string) => {
        if (!user || reportState.loading) return;

        const token = await getToken();

        const nextFacilityType = getNextFacilityType(reportState.facilityType);

        if (nextFacilityType === "patients") {
            // Open patient dialog for clinic level
            const facility = reportState.facilities[0];
            if (!facility) return;

            setPatientDialog(prev => ({
                ...prev,
                open: true,
                loading: true,
            }));

            try {
                const patientParams: PatientDataParams = {
                    interval_dates: `${reportState.timeInterval.startDate},${reportState.timeInterval.endDate}`,
                    province: facility.province,
                    district: facility.district,
                    health_facility: label,
                    genexpert_result_type: reportState.activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores",
                    time_interval_type: reportState.timeIntervalType
                };

                const patientData = await fetchPatientData(patientParams, token);
                setPatientDialog(prev => ({
                    ...prev,
                    data: patientData,
                    loading: false
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Erro ao carregar dados dos pacientes";
                setPatientDialog(prev => ({
                    ...prev,
                    loading: false,
                    error: errorMessage
                }));
            }
        } else {
            // Continue drill-down
            const newFacility = createFacilityOptions(label, reportState.facilityType, reportState.facilities);
            const newFacilities = [...reportState.facilities, newFacility];

            setReportState(prev => ({
                ...prev,
                facilities: newFacilities,
                facilityType: nextFacilityType,
                disaggregation: true,
                error: null
            }));
        }
    }, [user, getToken, reportState.loading, reportState.facilityType, reportState.facilities, reportState.timeInterval, reportState.activeTab]);

    const handleClosePatientDialog = useCallback(() => {
        setPatientDialog(prev => ({
            ...prev,
            open: false,
            data: [],
            loading: false,
        }));
    }, []);

    const handleSubmit = useCallback((timeInterval: any) => {
        setReportState(prev => ({ ...prev, timeInterval }));
    }, []);

    // ========================================================================
    // EFFECTS
    // ========================================================================

    useEffect(() => {
        fetchDataFromApi(
            reportState.timeInterval,
            reportState.activeTab,
            reportState.facilities,
            reportState.facilityType,
            reportState.disaggregation
        );
    }, [
        reportState.timeInterval,
        reportState.activeTab,
        reportState.facilities,
        reportState.facilityType,
        reportState.disaggregation,
        fetchDataFromApi
    ]);

    // ========================================================================
    // RENDER
    // ========================================================================

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
                footerComponent={
                    <Select value={reportState.timeIntervalType} onValueChange={handleTimeIntervalTypeChange}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Selecionar intervalo de tempo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Intervalos de Tempo</SelectLabel>
                                {TIME_INTERVAL_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                }
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
                                height={CHART_CONFIG.HEIGHT}
                                id={CHART_CONFIG.CHART_ID}
                                labels={chartData.labels}
                                onClick={handleChartClick}
                                series={chartData.series}
                                width={"100%"}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </MainCard>

            {patientDialog.open && (
                <PatientsDataDialog
                    data={patientDialog.data}
                    open={patientDialog.open}
                    setOpen={handleClosePatientDialog}
                    loading={patientDialog.loading}
                />
            )}
        </>
    );
};

export default MTBResponseTimeReport;
