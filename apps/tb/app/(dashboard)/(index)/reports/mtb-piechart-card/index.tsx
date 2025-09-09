"use client"

import { useEffect, useState, useCallback, useMemo } from "react";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Box, Typography } from "@mui/material";
import { useAuth, useUser } from "@clerk/nextjs";
import { ChartjsPie } from "@repo/design_system_mui";
import Docs from "./docs";
import {
    DEFAULTS,
    CHART_CONFIG,
    UI_CONFIG,
    ActiveTab,
    ChartConfig
} from "./constants";
import {
    Data,
    ChartData,
    TimeInterval,
    fetchDataFromApi,
    prepareChartDataForChartJs,
    prepareChartData,
    getReportName,
    formatDateRange,
    formatNumber
} from "./actions";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "./chart-export-utils";

// ============================================================================
// TYPES
// ============================================================================

interface ReportState {
    data: Data[];
    loading: boolean;
    error: string | null;
    activeTab: ActiveTab;
    timeInterval: TimeInterval;
}

// ============================================================================
// CUSTOM COMPONENTS
// ============================================================================

interface LegendItemProps {
    color: string;
    label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
    return (
        <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 'fit-content' }}>
            <Box
                sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0,
                }}
            />
            <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                {label}
            </Typography>
        </Box>
    );
}

interface CustomLegendProps {
    config: ChartConfig;
    activeTab: ActiveTab;
}

function CustomLegend({ config, activeTab }: CustomLegendProps) {
    const tabKey = activeTab.toUpperCase() as keyof typeof config.COLORS;
    const colors = config.COLORS[tabKey];
    const labels = config.LABELS;

    const categories = Object.keys(colors).map(key => ({
        key,
        color: colors[key as keyof typeof colors],
        label: labels[key as keyof typeof labels]
    }));

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                padding: 1,
                backgroundColor: 'transparent',
                width: '100%',
            }}
        >
            {categories.map(({ key, color, label }) => (
                <LegendItem
                    key={key}
                    color={color || '#000000'}
                    label={label || ''}
                />
            ))}
        </Box>
    );
}

// Custom label function for pie chart
const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / entry.payload.total) * 100).toFixed(1);
    return `${percent}%`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MTBXpertPieChartReport() {
    // ============================================================================
    // STATE
    // ============================================================================

    const [reportState, setReportState] = useState<ReportState>({
        data: [],
        loading: false,
        error: null,
        activeTab: DEFAULTS.ACTIVE_TAB,
        timeInterval: DEFAULTS.TIME_INTERVAL,
    });

    const { isLoaded, isSignedIn, user } = useUser();
    const { getToken } = useAuth();

    // ============================================================================
    // MEMOIZED VALUES
    // ============================================================================

    const chartData = useMemo(() => 
        prepareChartDataForChartJs(reportState.data, reportState.activeTab), 
        [reportState.data, reportState.activeTab]
    );

    const rawChartData = useMemo(() => 
        prepareChartData(reportState.data, reportState.activeTab), 
        [reportState.data, reportState.activeTab]
    );

    const chartConfig = useMemo(() => 
        CHART_CONFIG, 
        []
    );

    const reportName = useMemo(() => 
        getReportName(reportState.activeTab), 
        [reportState.activeTab]
    );

    const dynamicSubtitle = useMemo(() => 
        formatDateRange(reportState.timeInterval), 
        [reportState.timeInterval]
    );

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleTabChange = useCallback((value: string) => {
        setReportState(prev => ({
            ...prev,
            activeTab: value as ActiveTab
        }));
    }, []);

    const handleTimeIntervalChange = useCallback((values: string[]) => {
        setReportState(prev => ({
            ...prev,
            timeInterval: {
                startDate: values[0],
                endDate: values[1]
            }
        }));
    }, []);

    const handleRestart = useCallback(() => {
        setReportState(prev => ({
            ...prev,
            timeInterval: DEFAULTS.TIME_INTERVAL
        }));
    }, []);

    const handleExportToExcel = useCallback(async () => {
        try {
            // Use prepareChartData() for Excel export (returns ChartData[] format)
            const excelChartData = prepareChartData(reportState.data, reportState.activeTab);
            
            exportChartToExcel(
                excelChartData,
                reportState.data,
                reportName,
                reportState.activeTab
            );
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
    }, [chartData, reportState.data, reportName, reportState.activeTab]);

    const handleExportToImage = useCallback(async () => {
        try {
            await exportChart(reportName, reportState.activeTab);
        } catch (error) {
            console.error('Error exporting chart image:', error);
        }
    }, [reportName, reportState.activeTab]);

    const mainCardOptions = useMemo(() => [
        {
            action: handleExportToExcel,
            icon: <PiMicrosoftExcelLogoFill size={20} />,
            label: UI_CONFIG.EXPORT_OPTIONS.EXCEL_LABEL,
            type: "primary" as const
        },
        {
            action: handleExportToImage,
            icon: <IoImageOutline size={20} />,
            label: UI_CONFIG.EXPORT_OPTIONS.IMAGE_LABEL,
            type: "primary" as const
        },
        {
            action: handleRestart,
            icon: <VscDebugRestart size={20} />,
            label: UI_CONFIG.EXPORT_OPTIONS.RESTART_LABEL,
            type: "primary" as const
        },
    ], [handleExportToExcel, handleExportToImage, handleRestart]);

    // Add total to chart data for percentage calculations
    const chartDataWithTotal = useMemo(() => {
        const total = chartData.datasets[0]?.data.reduce((sum: number, value: number) => sum + value, 0) || 0;
        return rawChartData.map(item => ({ ...item, total }));
    }, [chartData, rawChartData]);

    // ============================================================================
    // API FUNCTIONS
    // ============================================================================

    const fetchDataFromApiCallback = useCallback(async (
        timeInterval: TimeInterval,
        activeTab: ActiveTab
    ) => {
        if (!isLoaded || !isSignedIn) return;

        setReportState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const token = await getToken();
            if (!token) throw new Error("No authentication token available");

            const data = await fetchDataFromApi(timeInterval, activeTab, token);
            
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
    }, [isLoaded, isSignedIn, getToken]);

    // ============================================================================
    // EFFECTS
    // ============================================================================

    useEffect(() => {
        fetchDataFromApiCallback(reportState.timeInterval, reportState.activeTab);
    }, [
        reportState.timeInterval,
        reportState.activeTab,
        fetchDataFromApiCallback
    ]);

    // ============================================================================
    // RENDER
    // ============================================================================

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
            loading={reportState.loading}
            height={UI_CONFIG.MAIN_CARD_OPTIONS.HEIGHT}
            id="tb-main-card"
            labType={UI_CONFIG.MAIN_CARD_OPTIONS.LAB_TYPE}
            reportType={UI_CONFIG.MAIN_CARD_OPTIONS.REPORT_TYPE}
            subtitle={dynamicSubtitle}
            title={reportName}
            user={{
                email: user?.emailAddresses[0]?.emailAddress,
                name: user?.fullName
            }}
            width="100%"
            handleSubmit={handleTimeIntervalChange}
        >
            <Tabs 
                defaultValue="ultra" 
                className="w-full"
                onValueChange={handleTabChange}
            >
                <TabsList className="mx-4 ml-auto">
                    {UI_CONFIG.TAB_OPTIONS.map(tab => (
                        <TabsTrigger 
                            key={tab.value}
                            value={tab.value} 
                            className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                
                {UI_CONFIG.TAB_OPTIONS.map(tab => (
                    <TabsContent key={tab.value} value={tab.value} className="px-4 pb-4">
                        <ChartjsPie
                            data={chartData}
                            options={{
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'bottom' as const,
                                        labels: {
                                            usePointStyle: true,
                                            pointStyle: 'circle',
                                            padding: 20,
                                            font: {
                                                size: 12,
                                                weight: '500'
                                            }
                                        }
                                    },
                                    datalabels: {
                                        display: true,
                                        color: 'white',
                                        font: {
                                            weight: 'bold',
                                            size: 12
                                        },
                                        formatter: (value: number, context: any) => {
                                            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                            const label = context.chart.data.labels[context.dataIndex];
                                            
                                            // Only show label and percentage if the slice is large enough (>5%)
                                            if (parseFloat(percentage) < 5) {
                                                return `${percentage}%`;
                                            }
                                            
                                            // return `${label}\n${percentage}%`;
                                            return `${percentage}%`;

                                        },
                                        textAlign: 'center' as const,
                                        anchor: 'center' as const,
                                        align: 'center' as const
                                    }
                                }
                            }}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </MainCard>
    );
}
