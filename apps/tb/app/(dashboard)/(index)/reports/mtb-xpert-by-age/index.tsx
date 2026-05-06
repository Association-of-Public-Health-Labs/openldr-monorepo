import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { useEffect, useState, useMemo, useCallback } from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { TbMessage2Question } from "react-icons/tb";
import { VscDebugRestart } from "react-icons/vsc";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { useAuth, useUser } from "@clerk/nextjs";

// Local imports
import { 
    ReportState, 
    ActiveTab, 
    DEFAULTS, 
    CHART_CONFIG, 
    UI_CONFIG,
    getLastTwelveMonths,
    getReportName,
    formatDateInPortuguese 
} from "./constants";
import { fetchDataFromApi, prepareChartData } from "./actions";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "./chart-export-utils";
import Docs from "./docs";

// =============================================================================
// TYPES
// =============================================================================

// Types are imported from constants.ts

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MTBXpertByAge() {
    // =============================================================================
    // STATE
    // =============================================================================
    
    const [reportState, setReportState] = useState<ReportState>({
        timeInterval: getLastTwelveMonths(),
        activeTab: DEFAULTS.ACTIVE_TAB,
        loading: false,
        error: null,
        data: [],
    });

    const { user } = useUser();
    const { getToken } = useAuth();

    // =============================================================================
    // MEMOIZED VALUES
    // =============================================================================

    const subtitle = useMemo(() => {
        const startFormatted = formatDateInPortuguese(reportState.timeInterval.startDate);
        const endFormatted = formatDateInPortuguese(reportState.timeInterval.endDate);
        return `${startFormatted} à ${endFormatted}`;
    }, [reportState]);

    const reportName = useMemo(() => {
        return getReportName(reportState.activeTab);
    }, [reportState.activeTab]);

    const chartData = useMemo(() => {
        return prepareChartData(reportState.data);
    }, [reportState.data]);

    // =============================================================================
    // API FUNCTIONS
    // =============================================================================

    const fetchDataFromApiCallback = useCallback(async () => {
        try {
            setReportState(prev => ({ ...prev, loading: true, error: null }));
            
            const data = await fetchDataFromApi(
                reportState.timeInterval,
                reportState.activeTab,
                getToken
            );
            
            setReportState(prev => ({ ...prev, data, loading: false }));
        } catch (error: any) {
            console.error("Error fetching data:", error);
            
            let errorMessage = "Erro ao carregar dados";
            
            if (error.code === 'ECONNABORTED') {
                errorMessage = "Tempo limite excedido. Tente novamente.";
            } else if (error.response?.status === 404) {
                errorMessage = "Dados não encontrados para o período selecionado.";
            } else if (error.response?.status >= 500) {
                errorMessage = "Erro no servidor. Tente novamente mais tarde.";
            } else if (error.message?.includes('Network Error')) {
                errorMessage = "Erro de conexão. Verifique sua internet.";
            }
            
            setReportState(prev => ({ 
                ...prev, 
                error: errorMessage, 
                loading: false 
            }));
        }
    }, [reportState.timeInterval, reportState.activeTab, getToken]);

    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    const handleExportToExcel = useCallback(async () => {
        try {
            await exportChartToExcel(
                reportState.data,
                reportState.activeTab,
                reportState.timeInterval
            );
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            setReportState(prev => ({ 
                ...prev, 
                error: "Erro ao exportar para Excel. Tente novamente." 
            }));
        }
    }, [reportState.data, reportState.activeTab, reportState.timeInterval]);

    const handleExportToImage = useCallback(async () => {
        try {
            await exportChart(reportState.activeTab);
        } catch (error) {
            console.error("Error exporting chart image:", error);
            setReportState(prev => ({ 
                ...prev, 
                error: "Erro ao exportar imagem. Tente novamente." 
            }));
        }
    }, [reportState.activeTab]);

    const handleRestart = useCallback(() => {
        setReportState(prev => ({
            ...prev,
            timeInterval: getLastTwelveMonths(),
            activeTab: DEFAULTS.ACTIVE_TAB,
            error: null,
        }));
    }, []);

    const handleTabChange = useCallback((value: string) => {
        const newActiveTab = value as ActiveTab;
        setReportState(prev => ({
            ...prev,
            activeTab: newActiveTab,
            error: null,
        }));
    }, []);

    const handleSubmit = useCallback((values: string[]) => {
        setReportState(prev => ({
            ...prev,
            timeInterval: {
                startDate: values[0],
                endDate: values[1]
            },
            error: null,
        }));
    }, []);

    const mainCardOptions = useMemo(() => [
        {
            action: handleExportToExcel,
            icon: <PiMicrosoftExcelLogoFill size={20} />,
            label: UI_CONFIG.EXPORT_OPTIONS.EXCEL.LABEL,
            type: 'primary' as const
        },
        {
            action: handleExportToImage,
            icon: <IoImageOutline size={20} />,
            label: UI_CONFIG.EXPORT_OPTIONS.IMAGE.LABEL,
            type: 'primary' as const
        },
        {
            action: handleRestart,
            icon: <VscDebugRestart size={20} />,
            label: UI_CONFIG.RESTART_LABEL,
            type: 'primary' as const
        },
    ], [handleExportToExcel, handleExportToImage, handleRestart]);

    // =============================================================================
    // EFFECTS
    // =============================================================================

    useEffect(() => {
        fetchDataFromApiCallback();
    }, [fetchDataFromApiCallback]);

    // =============================================================================
    // RENDER
    // =============================================================================

    return (
        <div>
            <MainCard
                additionalOptions={mainCardOptions}
                chartId={CHART_CONFIG.CHART_ID}
                documentation={<Docs />}
                headerProps={{
                    sx: {
                        padding: 2
                    }
                }}
                height="auto"
                id="mtb-xpert-age-main-card"
                loading={reportState.loading}
                reportType="national"
                subtitle={subtitle}
                title={reportName}
                user={{
                    email: user?.emailAddresses[0]?.emailAddress,
                    name: user?.fullName
                }}
                width="100%"
                handleSubmit={handleSubmit}
                // error={reportState.error}
            >
                <Tabs
                    defaultValue={DEFAULTS.ACTIVE_TAB}
                    className="w-full"
                    onValueChange={handleTabChange}
                    value={reportState.activeTab}
                >
                    <TabsList className="mx-4 ml-auto">
                        {UI_CONFIG.TABS.map((tab) => (
                            <TabsTrigger 
                                key={tab.value}
                                value={tab.value} 
                                className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {UI_CONFIG.TABS.map((tab) => (
                        <TabsContent 
                            key={tab.value}
                            value={tab.value} 
                            className="px-4 pb-4"
                        >
                            <Stacked
                                id={CHART_CONFIG.CHART_ID}
                                height={CHART_CONFIG.HEIGHT}
                                labels={chartData.labels}
                                onClick={() => {}}
                                series={chartData.series}
                                yLabel={CHART_CONFIG.Y_LABEL}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </MainCard>
        </div>
    );
}