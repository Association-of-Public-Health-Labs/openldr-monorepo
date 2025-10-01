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
        data: [],
        loading: true,
        error: null,
        activeTab: DEFAULTS.ACTIVE_TAB,
        timeInterval: DEFAULTS.TIME_INTERVAL,
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

            const params = buildApiParams(
                timeInterval, 
                facilities, 
                facilityType || reportState.facilityType, 
                disaggregation, 
                activeTab
            );
            const data = await fetchFacilityData(params, token);
            setReportState(prev => ({ ...prev, data, loading: false, timeInterval, facilities, facilityType, disaggregation, activeTab }));
        } catch (error) {
            setReportState(prev => ({ ...prev, loading: false, error: 'Erro ao carregar dados' }));
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
                setPatientDialog(prev => ({
                    ...prev,
                    data: [],
                    loading: false
                }));
            }
        }, [reportState.facilities, reportState.timeInterval, reportState.activeTab]);

    const handleRestart = useCallback(() => {
        // Reset clicked labels when restarting
        setClickedLabels([]);

        setReportState(prev => ({
            ...prev,
            disaggregation: DEFAULTS.DISAGGREGATION,
            facilities: [],
            facilityType: DEFAULTS.FACILITY_TYPE,
            timeInterval: DEFAULTS.TIME_INTERVAL,
            activeTab: DEFAULTS.ACTIVE_TAB,
            timeIntervalType: DEFAULTS.TIME_INTERVAL_TYPE
        }));

        fetchDataFromApi(DEFAULTS.TIME_INTERVAL, [], DEFAULTS.FACILITY_TYPE, DEFAULTS.DISAGGREGATION, DEFAULTS.ACTIVE_TAB);
    }, [fetchDataFromApi]);

    const handleTabChange = useCallback((value: ActiveTab) => {
        // setReportState(prev => ({ ...prev, activeTab: value }));
        fetchDataFromApi(reportState.timeInterval, reportState.facilities, reportState.facilityType, reportState.disaggregation, value);
    }, [fetchDataFromApi, reportState]);

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
            reportState.timeInterval,
            newFacilities,
            newFacilityType,
            newDisaggregation,
            reportState.activeTab
        );

        setReportState(prev => ({ ...prev, loading: false }));
    }, [reportState, fetchDataFromApi, fetchPatientDataFromApi]);

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

        // console.log('Setting state with disaggregation:', disaggregation);

        // Update state with new values - useEffect will handle data fetching
        setReportState(prev => ({
            ...prev,
            facilities,
            facilityType,
            timeInterval: { startDate: dates[0], endDate: dates[1] },
            disaggregation,
            activeTab: reportState.activeTab
        }));
    }, []);

    const handleTimeIntervalTypeChange = useCallback((value) => {
        setReportState(prev => ({ ...prev, timeIntervalType: value }));
    }, []);

    const handleClosePatientDialog = useCallback(() => {
        setPatientDialog({ open: false, data: [], loading: false });
        // Clear main loading state when closing patient dialog
        setReportState(prev => ({ ...prev, loading: false }));
    }, []);

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
        fetchDataFromApi(
            reportState.timeInterval, 
            reportState.facilities, 
            reportState.facilityType, 
            reportState.disaggregation, 
            reportState.activeTab);
    }, [
        reportState.timeInterval,
        reportState.facilities,
        reportState.facilityType,
        reportState.disaggregation,
        reportState.activeTab,
        fetchDataFromApi
    ]);

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
                        {UI_CONFIG.TAB_OPTIONS.map((option) => (
                            <TabsTrigger
                                key={option.value}
                                value={option.value}
                                className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
                            >
                                {option.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {UI_CONFIG.TAB_OPTIONS.map((option) => (
                        <TabsContent key={option.value} value={option.value} className="px-4 pb-4">
                            <Stacked
                                id={CHART_CONFIG.CHART_ID}
                                labels={chartData.labels}
                                series={chartData.series}
                                onClick={handleChartClick}
                                height={CHART_CONFIG.HEIGHT}
                                width={"100%"}
                                colors={CHART_CONFIG.PERFORMANCE_COLORS}
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
}
