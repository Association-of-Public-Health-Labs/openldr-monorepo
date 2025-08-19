"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import Docs from "./docs";
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
    TimeInterval,
    getFacilityProperty
} from "./actions";
import { PatientsDataDialog } from "@repo/utilities/components/patients-data-dialog";
import { useAuth, useUser } from "@clerk/nextjs";
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

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
    }, [reportState.timeInterval, clickedLabels]);


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
            const token = await getToken();

            setReportState(prev => ({ ...prev, loading: true, error: null }));
            
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

            console.log("reportState", reportState);

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
        const token = await getToken();
        try {
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
        // Reset clicked labels when restarting
        setClickedLabels([]);

        setReportState(prev => ({
            ...prev,
            disaggregation: DEFAULTS.DISAGGREGATION,
            facilities: [],
            facilityType: DEFAULTS.FACILITY_TYPE,
            timeInterval: DEFAULTS.TIME_INTERVAL,
            activeTab: DEFAULTS.ACTIVE_TAB,
        }));

    }, []);

    const handleTabChange = useCallback((value: string) => {
        const newActiveTab = value as ActiveTab;
        setReportState(prev => ({ ...prev, activeTab: newActiveTab }));
    }, []);

    const handleChartClick = useCallback(async (label: string) => {

        // console.log("clicked", label);
        
        if (!label) return;

        setReportState(prev => ({ ...prev, loading: true }));

        if (reportState.facilityType === "clinic") {
            setPatientDialog(prev => ({ ...prev, open: true }));
            await fetchPatientDataFromApi(label);
            setReportState(prev => ({ ...prev, loading: false }));
            return;
        }

        // Add clicked label to the breadcrumb trail
        setClickedLabels(prev => [...prev, label]);

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
    }, [reportState.facilityType, reportState.facilities, reportState.timeInterval, reportState.disaggregation, fetchDataFromApi, fetchPatientDataFromApi]);

    const handleSubmit = useCallback((
        dates: string[],
        facilities: FacilityOptions[],
        facilityType: FacilityType
    ) => {

        // Reset clicked labels when submitting new query
        setClickedLabels([]);
        
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

    const handleExportToExcel = useCallback(() => {
        try {

            // Check if we have data
            if (!chartData.labels || chartData.labels.length === 0) {
                alert('No data available to export');
                return;
            }

            // Prepare data for Excel export
            const exportData = chartData.labels.map((label, index) => ({
                ...getFacilityProperty(reportState.facilityType, label),
                'Amostras Registadas': chartData.series[0]?.data[index] || 0,
                'Tipo de Resultado': reportState.activeTab.toUpperCase(),
                'Período': `${reportState.timeInterval.startDate} à ${reportState.timeInterval.endDate}`,
            }));

            // Check if exportData is empty
            if (exportData.length === 0) {
                alert('No data to export');
                return;
            }

            // Add title in row 1
            const titleText = `${DEFAULTS.REPORT_NAME} - ${reportState.activeTab.toUpperCase()}`;

            // Create data array
            const newData: any[][] = [];

            // Add title row
            newData.push([titleText]);
            // Add empty row
            newData.push([]);

            // Add headers
            const headers = Object.keys(exportData[0] || {});
            newData.push(headers);

            // Add data rows
            exportData.forEach(row => {
                newData.push(Object.values(row));
            });

            // Create new worksheet with all data
            const newWs = XLSX.utils.aoa_to_sheet(newData);

            // Get the range of data
            const newRange = XLSX.utils.decode_range(newWs['!ref'] || 'A1');
            const numCols = newRange.e.c + 1;

            // Merge cells for title (A1 to last column)
            if (!newWs['!merges']) newWs['!merges'] = [];
            newWs['!merges'].push({
                s: { r: 0, c: 0 }, // Start: A1
                e: { r: 0, c: numCols - 1 } // End: Last column, row 1
            });

            // Style the title cell (simplified for debugging)
            newWs['A1'] = newWs['A1'] || { v: titleText, t: 's' };

            // Set column widths
            const colWidths = [
                { wch: 25 }, // Facility
                { wch: 18 }, // Registered_Samples
                { wch: 15 }, // Report_Type
                { wch: 25 }, // Date_Range
                // { wch: 15 }, // Facility_Type
                // { wch: 15 }  // Disaggregation
            ];
            newWs['!cols'] = colWidths;

            // Create workbook and add worksheet
            const wb = XLSX.utils.book_new();
            const sheetName = DEFAULTS.REPORT_NAME.length > 31 
                ? DEFAULTS.REPORT_NAME.substring(0, 31) 
                : DEFAULTS.REPORT_NAME;
            
            XLSX.utils.book_append_sheet(wb, newWs, sheetName);
            
            const fileName = `${sheetName}_${reportState.activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            XLSX.writeFile(wb, fileName);
            
        } catch (error) {
            alert(`Failed to export to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [chartData, reportState]);

    const handleExportToImage = useCallback(() => {
        try {
            const chartContainer = document.getElementById(`apexcharts${CHART_CONFIG.CHART_ID}`);
            if (!chartContainer) {
                alert('Chart not found. Please try again.');
                return;
            }
            
            html2canvas(chartContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            }).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                const fileName = `Amostras Registadas ${reportState.activeTab.toUpperCase()} ${reportState.timeInterval.startDate} à ${reportState.timeInterval.endDate}.png`;
                link.download = fileName;
                link.click();
            }).catch(error => {
                alert('Failed to export image. Please try again.');
            });
        } catch (error) {
            alert('Failed to export image. Please try again.');
        }
    }, [reportState.activeTab]);

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