import * as XLSX from 'xlsx';
import { ChartData } from './constants';

interface ReportState {
    timeInterval: {
        startDate: string;
        endDate: string;
    };
    facilityType: string;
    activeTab: string;
}

type GetFacilityPropertyFunction = (facilityType: string, label: string) => Record<string, string>;

// ============================================================================
// VALIDATION AND DATA PREPARATION
// ============================================================================

export const validateExportData = (chartData: ChartData): boolean => {
    return chartData && chartData.labels && chartData.series && 
           chartData.labels.length > 0 && chartData.series.length > 0;
};

export const prepareChartDataForExcel = (
    chartData: ChartData,
    getFacilityProperty: GetFacilityPropertyFunction,
    facilityType: string,
    activeTab: string
): any[] => {
    if (!validateExportData(chartData)) {
        return [];
    }

    return chartData.labels.map((label, index) => {
        const facilityProperty = getFacilityProperty(facilityType, label);
        const row: any = { ...facilityProperty };

        // Add data for each series (should only be one for rejected samples)
        chartData.series.forEach(series => {
            row[series.name] = series.data[index] || 0;
        });

        return row;
    });
};

// ============================================================================
// WORKSHEET CREATION AND FORMATTING
// ============================================================================

export const createFormattedWorksheet = (
    data: any[],
    reportName: string,
    timeInterval: { startDate: string; endDate: string }
): XLSX.WorkSheet => {
    // Format dates for the title
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('pt-BR', { month: 'long' });
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
    };

    const formattedStartDate = formatDate(timeInterval.startDate);
    const formattedEndDate = formatDate(timeInterval.endDate);
    const dateRange = `${formattedStartDate} à ${formattedEndDate}`;
    
    // Create title row
    const titleRow = [`${reportName} - ${dateRange}`];
    
    // Create worksheet with title and data
    const worksheetData = [
        titleRow,
        [], // Empty row for spacing
        ...data.length > 0 ? [Object.keys(data[0]), ...data.map(row => Object.values(row))] : []
    ];

    return XLSX.utils.aoa_to_sheet(worksheetData);
};

export const applyWorksheetFormatting = (worksheet: XLSX.WorkSheet): void => {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Merge title cells
    if (range.e.c > 0) {
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } }];
    }
    
    // Set column widths
    const colWidths = [];
    for (let col = 0; col <= range.e.c; col++) {
        colWidths.push({ wch: 20 });
    }
    worksheet['!cols'] = colWidths;
};

// ============================================================================
// WORKBOOK CREATION AND FILE SAVING
// ============================================================================

export const createAndSaveWorkbook = (
    worksheet: XLSX.WorkSheet,
    reportName: string,
    timeInterval: { startDate: string; endDate: string }
): void => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

    // Format dates for filename
    const formatDateForFilename = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('pt-BR', { month: 'long' });
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
    };

    const formattedStartDate = formatDateForFilename(timeInterval.startDate);
    const formattedEndDate = formatDateForFilename(timeInterval.endDate);
    const dateRange = `${formattedStartDate} à ${formattedEndDate}`;
    const fileName = `${reportName}_${dateRange}.xlsx`;

    XLSX.writeFile(workbook, fileName);
};

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export const exportChartToExcel = async (
    chartData: ChartData,
    reportState: ReportState,
    reportName: string,
    getFacilityProperty: GetFacilityPropertyFunction
): Promise<void> => {
    try {
        // Validate data
        if (!validateExportData(chartData)) {
            throw new Error('Dados do gráfico inválidos para exportação');
        }

        // Prepare data
        const excelData = prepareChartDataForExcel(
            chartData,
            getFacilityProperty,
            reportState.facilityType,
            reportState.activeTab
        );

        // Create worksheet
        const worksheet = createFormattedWorksheet(
            excelData,
            reportName,
            reportState.timeInterval
        );

        // Apply formatting
        applyWorksheetFormatting(worksheet);

        // Create and save workbook
        createAndSaveWorkbook(worksheet, reportName, reportState.timeInterval);

    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        throw error;
    }
};
