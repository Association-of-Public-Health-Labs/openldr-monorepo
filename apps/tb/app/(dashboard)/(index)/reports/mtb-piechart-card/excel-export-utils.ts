import * as XLSX from 'xlsx';
import { ChartData, Data, formatNumber } from './actions';
import { CHART_CONFIG } from './constants';

// ============================================================================
// EXCEL EXPORT UTILITIES
// ============================================================================

/**
 * Validate export data before processing
 */
export const validateExportData = (chartData: ChartData[], rawData: Data[]): boolean => {
    return Array.isArray(chartData) && chartData.length > 0 && Array.isArray(rawData);
};

/**
 * Prepare chart data for Excel export
 */
export const prepareChartDataForExcel = (chartData: ChartData[], rawData: Data[]): any[] => {
    if (!validateExportData(chartData, rawData)) {
        return [];
    }

    const labelMap = {
        mtb_not_detected: CHART_CONFIG.LABELS.NOT_DETECTED,
        mtb_detected: CHART_CONFIG.LABELS.DETECTED,
        invalid: CHART_CONFIG.LABELS.INVALID,
        errors: CHART_CONFIG.LABELS.ERRORS,
        not_analysed: CHART_CONFIG.LABELS.NOT_ANALYSED,
    };

    const totalSamples = chartData.reduce((sum, item) => sum + item.data, 0);

    const excelData = chartData.map(item => ({
        'Categoria': labelMap[item.label as keyof typeof labelMap] || item.label,
        'Quantidade': formatNumber(item.data),
        'Percentagem': totalSamples > 0 ? `${((item.data / totalSamples) * 100).toFixed(1)}%` : '0%'
    }));

    // Add total row
    excelData.push({
        'Categoria': 'TOTAL',
        'Quantidade': formatNumber(totalSamples),
        'Percentagem': '100%'
    });

    return excelData;
};

/**
 * Create formatted worksheet with styling
 */
export const createFormattedWorksheet = (data: any[], title: string): XLSX.WorkSheet => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add title row
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
    XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: 'A2' }); // Empty row
    
    // Add headers starting from row 3
    const headers = ['Categoria', 'Quantidade', 'Percentagem'];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A3' });
    
    // Add data starting from row 4
    const dataRows = data.map(row => [row.Categoria, row.Quantidade, row.Percentagem]);
    XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: 'A4' });
    
    return worksheet;
};

/**
 * Apply worksheet formatting (column widths, merged cells)
 */
export const applyWorksheetFormatting = (worksheet: XLSX.WorkSheet, title: string): void => {
    // Set column widths
    worksheet['!cols'] = [
        { wch: 25 }, // Categoria
        { wch: 15 }, // Quantidade
        { wch: 15 }, // Percentagem
    ];
    
    // Merge title cells
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } } // Merge title across 3 columns
    ];
};

/**
 * Create and save workbook
 */
export const createAndSaveWorkbook = (worksheet: XLSX.WorkSheet, filename: string): void => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, filename);
};

/**
 * Main export function for chart data to Excel
 */
export const exportChartToExcel = (
    chartData: ChartData[],
    rawData: Data[],
    reportName: string,
    activeTab: string
): void => {
    try {
        if (!validateExportData(chartData, rawData)) {
            console.error('Invalid data for Excel export');
            return;
        }

        const excelData = prepareChartDataForExcel(chartData, rawData);
        const title = `${reportName} - ${activeTab.toUpperCase()}`;
        const worksheet = createFormattedWorksheet(excelData, title);
        
        applyWorksheetFormatting(worksheet, title);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${reportName.replace(/\s+/g, '_')}_${activeTab}_${timestamp}.xlsx`;
        
        createAndSaveWorkbook(worksheet, filename);
        
        console.log(`Excel file exported: ${filename}`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw error;
    }
};
