import * as XLSX from 'xlsx';

// ============================================================================
// TYPES
// ============================================================================

interface ExcelData {
    Laboratório: string;
    Total: number;
    "Menos de 7 dias": number;
    "7-15 dias": number;
    "16-21 dias": number;
    "Mais de 21 dias": number;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate export data before processing
 */
export const validateExportData = (data: ExcelData[]): boolean => {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Dados não disponíveis para exportação');
    }
    return true;
};

// ============================================================================
// DATA PREPARATION FUNCTIONS
// ============================================================================

/**
 * Prepare chart data for Excel export
 */
export const prepareChartDataForExcel = (data: ExcelData[]): any[] => {
    validateExportData(data);
    
    return data.map(item => ({
        'Laboratório': item.Laboratório || '',
        'Total de Amostras': item.Total || 0,
        'Menos de 7 dias': item["Menos de 7 dias"] || 0,
        '7-15 dias': item["7-15 dias"] || 0,
        '16-21 dias': item["16-21 dias"] || 0,
        'Mais de 21 dias': item["Mais de 21 dias"] || 0,
    }));
};

// ============================================================================
// WORKSHEET CREATION FUNCTIONS
// ============================================================================

/**
 * Create formatted worksheet with data
 */
export const createFormattedWorksheet = (
    data: any[], 
    reportName: string, 
    intervalType: string,
    subtitle: string
): XLSX.WorkSheet => {
    // Create metadata rows
    const metadataRows = [
        { A: reportName },
        { A: `Tipo de Intervalo: ${intervalType}` },
        { A: `Período: ${subtitle}` },
        { A: `Data de Exportação: ${new Date().toLocaleDateString('pt-PT')}` },
        { A: '' }, // Empty row
    ];

    // Combine metadata and data
    const worksheetData = [...metadataRows, ...data];
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { 
        skipHeader: true,
    });

    return worksheet;
};

/**
 * Apply formatting to worksheet
 */
export const applyWorksheetFormatting = (
    worksheet: XLSX.WorkSheet, 
    reportName: string,
    dataStartRow: number = 6
): void => {
    // Set column widths
    const columnWidths = [
        { wch: 25 }, // Laboratório
        { wch: 15 }, // Total de Amostras
        { wch: 15 }, // Menos de 7 dias
        { wch: 12 }, // 7-15 dias
        { wch: 12 }, // 16-21 dias
        { wch: 15 }, // Mais de 21 dias
    ];
    
    worksheet['!cols'] = columnWidths;

    // Merge title cell
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({
        s: { r: 0, c: 0 }, // Start: A1
        e: { r: 0, c: 5 }  // End: F1
    });

    // Set range for the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    worksheet['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: Math.max(range.e.r, dataStartRow + 10), c: 5 }
    });
};

// ============================================================================
// WORKBOOK CREATION FUNCTIONS
// ============================================================================

/**
 * Create and save workbook
 */
export const createAndSaveWorkbook = (
    worksheet: XLSX.WorkSheet, 
    filename: string
): void => {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tempo de Resposta');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, finalFilename);
};

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export chart data to Excel file
 */
export const exportChartToExcel = (
    data: ExcelData[],
    filename: string,
    reportName: string,
    intervalType: string,
    subtitle: string
): void => {
    try {
        // Prepare data for Excel
        const excelData = prepareChartDataForExcel(data);
        
        // Create formatted worksheet
        const worksheet = createFormattedWorksheet(excelData, reportName, intervalType, subtitle);
        
        // Apply formatting
        applyWorksheetFormatting(worksheet, reportName);
        
        // Create and save workbook
        createAndSaveWorkbook(worksheet, filename);
        
        console.log(`Excel file exported successfully: ${filename}`);
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        throw new Error(`Falha na exportação para Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
};
