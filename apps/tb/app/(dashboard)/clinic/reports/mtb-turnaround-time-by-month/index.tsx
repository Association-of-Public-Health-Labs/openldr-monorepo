"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { DEFAULTS, CHART_CONFIG, UI_CONFIG } from "./constants";
import {
    FacilityType,
    FacilityOptions,
    ActiveTab,
    Data,
    TimeInterval,
    buildApiParams,
    prepareChartData,
    fetchTurnaroundData,
    getNextFacilityType,
    createFacilityOptions,
    getReportName,
} from "./actions";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "../shared/chart-export-utils";
import Docs from "./docs";
import { useAuth, useUser } from "@clerk/nextjs";

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

export default function MTBTurnaroundTimeByMonth() {
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
    });

    const [clickedLabels, setClickedLabels] = useState<string[]>([]);

    const dynamicSubtitle = useMemo(() => {
        const { startDate, endDate } = reportState.timeInterval;
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleDateString('pt-BR', { month: 'long' });
            const year = date.getFullYear();
            return `${day} de ${month} de ${year}`;
        };

        const dateRange = `${formatDate(startDate)} à ${formatDate(endDate)}`;

        if (clickedLabels.length === 0) return dateRange;

        const labelsText = clickedLabels.join(' → ');
        return `${dateRange} | ${labelsText}`;
    }, [reportState.timeInterval, clickedLabels]);

    const chartData = useMemo(() =>
        prepareChartData(reportState.data),
        [reportState.data]
    );

    const reportName = useMemo(() => getReportName(reportState.activeTab), [reportState.activeTab]);

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

            const data = await fetchTurnaroundData(params, token);

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

    const handleRestart = useCallback(() => {
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
        setReportState(prev => ({ ...prev, activeTab: newTab }));
    }, []);

    const handleChartClick = useCallback(async (label: string) => {
        if (!label) return;

        setReportState(prev => ({ ...prev, loading: true }));
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
    }, [reportState.facilityType, reportState.facilities, reportState.timeInterval, fetchDataFromApi]);

    const handleSubmit = useCallback((
        dates: string[],
        facilities: FacilityOptions[],
        facilityType: FacilityType
    ) => {
        setClickedLabels([]);
        const disaggregation = facilityType === "province" || facilityType === "district" || facilityType === "clinic";

        setReportState(prev => ({
            ...prev,
            facilities,
            facilityType,
            timeInterval: { startDate: dates[0], endDate: dates[1] },
            disaggregation,
        }));
    }, []);

    const handleExportToExcel = useCallback(async () => {
        try {
            await exportChartToExcel(reportState.data, reportName, dynamicSubtitle);
        } catch (error) {
            console.error("Failed to export to Excel:", error);
        }
    }, [reportState.data, reportName, dynamicSubtitle]);

    const handleExportToImage = useCallback(async () => {
        try {
            const { startDate, endDate } = reportState.timeInterval;
            const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                const day = date.getDate().toString().padStart(2, '0');
                const month = date.toLocaleDateString('pt-BR', { month: 'long' });
                const year = date.getFullYear();
                return `${day} de ${month} de ${year}`;
            };

            const dateRange = `${formatDate(startDate)} à ${formatDate(endDate)}`;
            const fileName = `${DEFAULTS.REPORT_NAME}_${dateRange}`;

            await exportChart({
                chartId: CHART_CONFIG.CHART_ID,
                fileName: fileName
            });
        } catch (error) {
            console.error("Failed to export chart:", error);
        }
    }, [reportState.timeInterval]);

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
    ], [handleRestart, handleExportToExcel, handleExportToImage]);

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

    return (
        <MainCard
            additionalOptions={mainCardOptions}
            chartId={CHART_CONFIG.CHART_ID}
            documentation={<Docs />}
            headerProps={{ sx: { padding: 2 } }}
            height={UI_CONFIG.MAIN_CARD_OPTIONS.HEIGHT}
            id="tb-turnaround-time-main-card"
            labType={UI_CONFIG.MAIN_CARD_OPTIONS.LAB_TYPE}
            loading={reportState.loading}
            reportType={UI_CONFIG.MAIN_CARD_OPTIONS.REPORT_TYPE}
            subtitle={dynamicSubtitle || UI_CONFIG.MAIN_CARD_OPTIONS.SUBTITLE}
            title={reportName}
            user={{
                email: user?.emailAddresses[0]?.emailAddress,
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
                            series={chartData.series}
                            yLabel={CHART_CONFIG.Y_LABEL}
                            colors={[...CHART_CONFIG.COLORS]}
                            onClick={handleChartClick}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </MainCard>
    );
}
