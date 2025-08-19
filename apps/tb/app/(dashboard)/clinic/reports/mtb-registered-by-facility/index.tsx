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
            console.log('Attempting to export chart with ID:', CHART_CONFIG.CHART_ID);
            
            // Debug: Log all possible chart elements
            const allChartElements = document.querySelectorAll('[id*="chart"], [class*="apexcharts"], svg');
            console.log('All chart-related elements found:', allChartElements);
            
            // Try multiple selector strategies
            const selectors = [
                `#${CHART_CONFIG.CHART_ID} svg`,
                `#${CHART_CONFIG.CHART_ID} .apexcharts-svg`,
                `[id="${CHART_CONFIG.CHART_ID}"] svg`,
                `.apexcharts-canvas svg`,
                `div[id*="${CHART_CONFIG.CHART_ID}"] svg`,
                `#apexcharts-${CHART_CONFIG.CHART_ID} svg`,
                `.apexcharts-svg`
            ];
            
            let chartSvg = null;
            for (const selector of selectors) {
                chartSvg = document.querySelector(selector);
                console.log(`Trying selector "${selector}":`, chartSvg);
                if (chartSvg) break;
            }
            
            if (chartSvg) {
                console.log('Found SVG element:', chartSvg);
                
                // Clone the SVG to avoid modifying the original
                const svgClone = chartSvg.cloneNode(true) as SVGElement;
                
                // Remove any external references that might cause CORS issues
                svgClone.querySelectorAll('*').forEach(el => {
                    // Remove any external links or references
                    el.removeAttribute('href');
                    el.removeAttribute('xlink:href');
                    
                    // Convert CSS custom properties to actual values
                    const computedStyle = window.getComputedStyle(el);
                    if (el instanceof HTMLElement || el instanceof SVGElement) {
                        // Apply computed styles directly to avoid CSS variable issues
                        const importantStyles = ['fill', 'stroke', 'color', 'font-family', 'font-size'];
                        importantStyles.forEach(prop => {
                            const value = computedStyle.getPropertyValue(prop);
                            if (value && !value.includes('var(')) {
                                (el as any).style[prop] = value;
                            }
                        });
                    }
                });
                
                // Get SVG dimensions
                const svgRect = chartSvg.getBoundingClientRect();
                const svgWidth = svgRect.width || 800;
                const svgHeight = svgRect.height || 400;
                
                // Set explicit dimensions on the cloned SVG
                svgClone.setAttribute('width', svgWidth.toString());
                svgClone.setAttribute('height', svgHeight.toString());
                svgClone.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
                
                // Create a clean SVG string
                const svgData = new XMLSerializer().serializeToString(svgClone);
                const cleanSvgData = svgData.replace(/xmlns="[^"]*"/g, '').replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                
                // Create canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = svgWidth * 2; // 2x for better quality
                canvas.height = svgHeight * 2;
                
                const img = new Image();
                
                img.onload = () => {
                    try {
                        if (ctx) {
                            // Set white background
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            
                            // Scale and draw
                            ctx.scale(2, 2);
                            ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
                            
                            // Export to PNG
                            const link = document.createElement('a');
                            link.href = canvas.toDataURL('image/png');
                            const fileName = `Amostras Registadas ${reportState.activeTab.toUpperCase()} ${reportState.timeInterval.startDate} à ${reportState.timeInterval.endDate}.png`;
                            link.download = fileName;
                            link.click();
                            
                            console.log('Image exported successfully');
                        }
                    } catch (canvasError) {
                        console.error('Canvas export error:', canvasError);
                        // Fallback: download SVG directly
                        const svgBlob = new Blob([cleanSvgData], { type: 'image/svg+xml' });
                        const svgUrl = URL.createObjectURL(svgBlob);
                        const link = document.createElement('a');
                        link.href = svgUrl;
                        link.download = `Amostras Registadas ${reportState.activeTab.toUpperCase()} ${reportState.timeInterval.startDate} à ${reportState.timeInterval.endDate}.svg`;
                        link.click();
                        URL.revokeObjectURL(svgUrl);
                        console.log('SVG exported as fallback');
                    }
                };
                
                img.onerror = () => {
                    console.error('Failed to load SVG image');
                    // Fallback: download SVG directly
                    const svgBlob = new Blob([cleanSvgData], { type: 'image/svg+xml' });
                    const svgUrl = URL.createObjectURL(svgBlob);
                    const link = document.createElement('a');
                    link.href = svgUrl;
                    link.download = `Amostras Registadas ${reportState.activeTab.toUpperCase()} ${reportState.timeInterval.startDate} à ${reportState.timeInterval.endDate}.svg`;
                    link.click();
                    URL.revokeObjectURL(svgUrl);
                    console.log('SVG exported as fallback');
                };
                
                // Use data URL to avoid CORS issues
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(cleanSvgData)));
                return;
            }
            
            // Fallback: Try to find chart container and use different approach
            const chartContainerSelectors = [
                `#${CHART_CONFIG.CHART_ID}`,
                `[id="${CHART_CONFIG.CHART_ID}"]`,
                `div[id*="${CHART_CONFIG.CHART_ID}"]`,
                `.apexcharts-canvas`,
                `#apexcharts-${CHART_CONFIG.CHART_ID}`
            ];
            
            let chartElement = null;
            for (const selector of chartContainerSelectors) {
                chartElement = document.querySelector(selector);
                console.log(`Trying container selector "${selector}":`, chartElement);
                if (chartElement) break;
            }
            
            if (chartElement) {
                console.log('Found chart container, trying chart instance access');
                
                // Try different ways to access the chart instance
                const possibleCharts = [
                    (chartElement as any)._chart,
                    (chartElement as any).chart,
                    (window as any).ApexCharts?.getChartByID?.(CHART_CONFIG.CHART_ID)
                ];
                
                for (const chart of possibleCharts) {
                    if (chart && typeof chart.dataURI === 'function') {
                        console.log('Found chart instance, attempting export');
                        const fileName = `Amostras Registadas ${reportState.activeTab.toUpperCase()} ${reportState.timeInterval.startDate} à ${reportState.timeInterval.endDate}`;
                        
                        chart.dataURI().then((uri: { imgURI: string }) => {
                            const link = document.createElement('a');
                            link.href = uri.imgURI;
                            link.download = `${fileName}.png`;
                            link.click();
                            console.log('Chart exported via dataURI');
                        }).catch((error: Error) => {
                            console.error('Chart export error:', error);
                            alert('Failed to export image. Please try again.');
                        });
                        return;
                    }
                }
            }
            
            console.error('No chart elements found with any selector');
            alert('Chart not found. Please try again.');
            
        } catch (error) {
            console.error('Export to image error:', error);
            alert('Failed to export image. Please try again.');
        }
    }, [reportState.activeTab, reportState.timeInterval]);


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