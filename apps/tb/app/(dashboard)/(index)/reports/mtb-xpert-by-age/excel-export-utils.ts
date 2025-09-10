import * as XLSX from 'xlsx';
import { Data, ActiveTab, TimeInterval, UI_CONFIG, getReportName, formatDateInPortuguese } from './constants';
import { prepareExcelData } from './actions';

// =============================================================================
// EXCEL EXPORT FUNCTIONS
// =============================================================================

export const validateExportData = (data: Data[]): boolean => {
    return Array.isArray(data);
};

export const createFormattedWorksheet = (
    data: Data[],
    activeTab: ActiveTab,
    timeInterval: TimeInterval
) => {
    const excelData = prepareExcelData(data, activeTab);
    const reportName = getReportName(activeTab);
    const startDateFormatted = formatDateInPortuguese(timeInterval.startDate);
    const endDateFormatted = formatDateInPortuguese(timeInterval.endDate);
    
    // Calculate totals
    const totals = excelData.reduce((acc, row) => ({
        'MTB Detetado': acc['MTB Detetado'] + row['MTB Detetado'],
        'MTB Não Detetado': acc['MTB Não Detetado'] + row['MTB Não Detetado'],
        'Erros': acc['Erros'] + row['Erros'],
        'Inválido': acc['Inválido'] + row['Inválido'],
        'Total': acc['Total'] + row['Total']
    }), {
        'MTB Detetado': 0,
        'MTB Não Detetado': 0,
        'Erros': 0,
        'Inválido': 0,
        'Total': 0
    });

    // Create worksheet data with metadata
    const worksheetData = [
        [reportName],
        [`Período: ${startDateFormatted} - ${endDateFormatted}`],
        [`Data de Exportação: ${formatDateInPortuguese(new Date().toISOString().split('T')[0])}`],
        [], // Empty row
        ['Faixa Etária', 'Resultado Positivo', 'Resultado Negativo', 'Erros', 'Inválido', 'Total'],
        ...excelData.map(row => [
            row['Faixa Etária'],
            row['MTB Detetado'],
            row['MTB Não Detetado'],
            row['Erros'],
            row['Inválido'],
            row['Total']
        ]),
        [], // Empty row before totals
        [
            'TOTAL GERAL',
            totals['MTB Detetado'],
            totals['MTB Não Detetado'],
            totals['Erros'],
            totals['Inválido'],
            totals['Total']
        ]
    ];

    return XLSX.utils.aoa_to_sheet(worksheetData);
};

export const applyWorksheetFormatting = (worksheet: XLSX.WorkSheet) => {
    // Set column widths
    const columnWidths = [
        { wch: 15 }, // Faixa Etária
        { wch: 15 }, // MTB Detetado
        { wch:18 }, // MTB Não Detetado
        { wch: 10 }, // Erros
        { wch: 12 }, // Inválido
        { wch: 12 }, // Total
    ];
    
    worksheet['!cols'] = columnWidths;

    // Merge title cells (A1:F1)
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });
    
    // Merge subtitle cells (A2:F2)
    worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } });
    
    // Merge export date cells (A3:F3)
    worksheet['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 5 } });

    return worksheet;
};

export const createAndSaveWorkbook = (
    worksheet: XLSX.WorkSheet,
    filename: string
) => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MTB Xpert por Idade');
    XLSX.writeFile(workbook, filename);
};

export const generateExcelFilename = (activeTab: ActiveTab): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    const tabSuffix = activeTab === 'ultra' ? 'Ultra' : 'XDR';
    return `${UI_CONFIG.EXPORT_OPTIONS.EXCEL.FILENAME_PREFIX}_${tabSuffix}_${timestamp}.xlsx`;
};

export const exportChartToExcel = (
    data: Data[],
    activeTab: ActiveTab,
    timeInterval: TimeInterval
): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            if (!validateExportData(data)) {
                throw new Error('Dados inválidos para exportação');
            }

            const worksheet = createFormattedWorksheet(data, activeTab, timeInterval);
            const formattedWorksheet = applyWorksheetFormatting(worksheet);
            const filename = generateExcelFilename(activeTab);
            
            createAndSaveWorkbook(formattedWorksheet, filename);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};
