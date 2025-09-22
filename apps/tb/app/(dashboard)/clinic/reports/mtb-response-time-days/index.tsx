"use client"
import { useEffect, useState, useCallback, useMemo } from "react";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { DEFAULTS, CHART_CONFIG, UI_CONFIG, TIME_INTERVAL_OPTIONS, ReportState, PatientDialogState, PatientDataParams, formatDateInPortuguese, getReportName, getNextFacilityType, getGenexpertResultType, FacilityOptions, FacilityType, ActiveTab, TimeIntervalType } from "./constants";
import { buildApiParams, prepareChartData, prepareExcelData, TimeInterval, fetchPatientData, fetchFacilityData, createFacilityOptions } from "./actions";
import { PatientsDataDialog } from "../../../../../components/patients-data-dialog";
import { useAuth, useUser } from "@clerk/nextjs";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "./chart-export-utils";
import Docs from "./docs";
import { Box, Typography, Button } from "@mui/material";

export default function MTBResponseTimeInDays() {
    const { user } = useUser();
    const { getToken } = useAuth();

    const [reportState, setReportState] = useState<ReportState>({
        timeInterval: DEFAULTS.TIME_INTERVAL,
        activeTab: DEFAULTS.ACTIVE_TAB,
        loading: true,
        error: null,
        data: [],
        facilities: [],
        facilityType: DEFAULTS.FACILITY_TYPE,
        disaggregation: DEFAULTS.DISAGGREGATION,
        timeIntervalType: DEFAULTS.TIME_INTERVAL_TYPE,
    });

    const [patientDialog, setPatientDialog] = useState<PatientDialogState>({
        open: false,
        data: [],
        loading: false,
    });

    const [clickedLabels, setClickedLabels] = useState<string[]>([]);

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
        prepareChartData(reportState.data, reportState.timeIntervalType),
        [reportState.data, reportState.timeIntervalType]
    );

    const reportName = useMemo(() => getReportName(reportState.timeIntervalType), [reportState.timeIntervalType]);
    const excelData = useMemo(() => prepareExcelData(reportState.data, reportState.timeIntervalType), [reportState.data, reportState.timeIntervalType]);

    const fetchDataFromApi = useCallback(async (
        timeInterval: TimeInterval,
        facilities: FacilityOptions[],
        facilityType: FacilityType,
        disaggregation: boolean,
        activeTab: ActiveTab
    ) => {
        try {
            setReportState(prev => ({ ...prev, loading: true, error: null }));

            const token = await getToken();
            if (!token) {
                throw new Error('Token de autenticação não disponível');
            }

            const params = buildApiParams(timeInterval, facilities, facilityType, disaggregation, activeTab);
            const data = await fetchFacilityData(params, token);
            setReportState(prev => ({ ...prev, data, loading: false, timeInterval, facilities, facilityType, disaggregation, activeTab }));
        } catch (error) {
            console.error('Error fetching data:', error);
            setReportState(prev => ({ ...prev, loading: false, error: 'Erro ao carregar dados' }));
        }
    }, [getToken]);

    const handleSubmit = useCallback((timeInterval, facilities, facilityType, disaggregation) => {
        const convertedFacilities = facilities.map(f => ({ value: f.value, label: f.label }));
        fetchDataFromApi(timeInterval, convertedFacilities, facilityType, disaggregation, reportState.activeTab);
    }, [fetchDataFromApi, reportState.activeTab]);

    const handleTabChange = useCallback((value) => {
        fetchDataFromApi(reportState.timeInterval, reportState.facilities, reportState.facilityType, reportState.disaggregation, value);
    }, [fetchDataFromApi, reportState]);

    const handleTimeIntervalTypeChange = useCallback((value) => {
        setReportState(prev => ({ ...prev, timeIntervalType: value }));
    }, []);

    const handleChartClick = useCallback(async (label: string) => {
        if (!label) return;

        setReportState(prev => ({ ...prev, loading: true }));

        if (reportState.facilityType === "clinic") {
            setPatientDialog(prev => ({ ...prev, open: true }));
            
            try {
                // Build patient data parameters
                const patientParams: PatientDataParams = {
                    health_facility: label,
                    genexpert_result_type: getGenexpertResultType(reportState.activeTab),
                    interval_dates: `${reportState.timeInterval.startDate}, ${reportState.timeInterval.endDate}`,
                    time_interval_type: reportState.timeIntervalType,
                };

                // Add province and district context if available
                if (reportState.facilities.length > 0) {
                    const facility = reportState.facilities[0];
                    if (facility.province) {
                        patientParams.province = facility.province;
                    }
                    if (facility.district) {
                        patientParams.district = facility.district;
                    }
                }

                // Get authentication token
                const token = await getToken();
                if (!token) {
                    throw new Error("Token de autenticação não disponível");
                }

                // Fetch patient data with correct parameters
                const patientData = await fetchPatientData(patientParams, token);
                setPatientDialog(prev => ({ ...prev, data: patientData, loading: false }));
            } catch (error) {
                console.error("Error fetching patient data:", error);
                setPatientDialog(prev => ({ ...prev, data: [], loading: false }));
                setReportState(prev => ({ 
                    ...prev, 
                    loading: false, 
                    error: error instanceof Error ? error.message : "Erro ao carregar dados dos pacientes" 
                }));
            }
            return;
        }

        const newFacilityType = getNextFacilityType(reportState.facilityType);
        const newFacility = createFacilityOptions(
            label,
            reportState.facilityType,
            clickedLabels  // Use current clickedLabels (before adding new label)
        );

        const newFacilities = [newFacility];
        const newDisaggregation = true;

        // Update clicked labels for breadcrumb tracking AFTER creating facility options
        setClickedLabels(prev => [...prev, label]);

        setReportState(prev => ({
            ...prev,
            facilityType: newFacilityType,
            facilities: newFacilities,
            disaggregation: newDisaggregation,
        }));

        await fetchDataFromApi(
            reportState.timeInterval,
            newFacilities,
            newFacilityType,
            newDisaggregation,
            reportState.activeTab
        );

        setReportState(prev => ({ ...prev, loading: false }));
    }, [reportState, clickedLabels, getToken, fetchDataFromApi, fetchPatientData]);

    const handleClosePatientDialog = useCallback(() => {
        setPatientDialog({ open: false, data: [], loading: false });
        // Clear main loading state when closing patient dialog
        setReportState(prev => ({ ...prev, loading: false }));
    }, []);

    const handleRestart = useCallback(() => {
        setClickedLabels([]);
        fetchDataFromApi(DEFAULTS.TIME_INTERVAL, [], DEFAULTS.FACILITY_TYPE, DEFAULTS.DISAGGREGATION, reportState.activeTab);
    }, [fetchDataFromApi, reportState.activeTab]);

    const handleExportToExcel = useCallback(() => {
        try {
            exportChartToExcel(excelData, reportName, reportName, TIME_INTERVAL_OPTIONS.find(opt => opt.value === reportState.timeIntervalType)?.label || reportState.timeIntervalType, dynamicSubtitle, reportState.facilityType);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
    }, [excelData, reportName, dynamicSubtitle, reportState]);

    const handleExportToImage = useCallback(() => {
        try {
            const filename = `tempo_resposta_${reportState.timeIntervalType.toLowerCase().replace(/__/g, '_')}`;
            exportChart(CHART_CONFIG.CHART_ID, filename, 'png');
        } catch (error) {
            console.error('Error exporting image:', error);
        }
    }, [reportState.timeIntervalType]);

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
    ], [handleRestart, handleExportToExcel, handleExportToImage]);

    useEffect(() => {
        fetchDataFromApi(reportState.timeInterval, reportState.facilities, reportState.facilityType, reportState.disaggregation, reportState.activeTab);
    }, []);

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
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Selecionar intervalo de tempo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Intervalos de Tempo</SelectLabel>
                                {TIME_INTERVAL_OPTIONS.map((option) => (
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
                        {UI_CONFIG.TAB_OPTIONS.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {UI_CONFIG.TAB_OPTIONS.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value} className="px-4 pb-4">
                            {reportState.loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="text-lg">Carregando dados...</div>
                                </div>
                            ) : reportState.error ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="text-lg text-red-600">{reportState.error}</div>
                                </div>
                            ) : (
                                <Stacked
                                    id={CHART_CONFIG.CHART_ID}
                                    labels={chartData.labels}
                                    series={chartData.series}
                                    onClick={handleChartClick}
                                    height={CHART_CONFIG.HEIGHT}
                                    width={"100%"}
                                />
                            )}
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
}
