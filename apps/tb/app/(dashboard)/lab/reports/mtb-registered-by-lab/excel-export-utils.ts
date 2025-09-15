import * as XLSX from 'xlsx';
import { Data } from './actions';

// ============================================================================
// EXCEL EXPORT UTILITIES
// ============================================================================

/**
 * Validate export data before processing
 */
export const validateExportData = (data: Data[]): boolean => {
  return Array.isArray(data) && data.length > 0;
};

/**
 * Prepare chart data for Excel export
 */
export const prepareChartDataForExcel = (data: Data[]) => {
  if (!validateExportData(data)) {
    return [];
  }

  return data.map(item => ({
    'Laboratório': item.Testing_Facility || '',
    'Amostras Registadas': item.Resgistered_Samples || 0,
    'Tipo de Resultado': item.Type_Of_Result || '',
    'Data Início': item.Start_Date || '',
    'Data Fim': item.End_Date || ''
  }));
};

/**
 * Create formatted worksheet with data and styling
 */
export const createFormattedWorksheet = (
  data: any[], 
  title: string, 
  subtitle: string
): XLSX.WorkSheet => {
  // Create title and subtitle rows with all columns
  const titleRow = {
    'Laboratório': title,
    'Amostras Registadas': '',
    'Tipo de Resultado': '',
    'Data Início': '',
    'Data Fim': ''
  };
  
  const subtitleRow = {
    'Laboratório': subtitle,
    'Amostras Registadas': '',
    'Tipo de Resultado': '',
    'Data Início': '',
    'Data Fim': ''
  };
  
  const emptyRow = {
    'Laboratório': '',
    'Amostras Registadas': '',
    'Tipo de Resultado': '',
    'Data Início': '',
    'Data Fim': ''
  };
  
  // Create explicit header row
  const headerRow = {
    'Laboratório': 'Laboratório',
    'Amostras Registadas': 'Amostras Registadas',
    'Tipo de Resultado': 'Tipo de Resultado',
    'Data Início': 'Data Início',
    'Data Fim': 'Data Fim'
  };
  
  // Combine all data with proper headers
  const worksheetData = [
    titleRow,
    subtitleRow,
    emptyRow,
    headerRow,
    ...data
  ];
  
  // Create worksheet with headers included
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  return worksheet;
};

/**
 * Apply worksheet formatting (title merging and column widths)
 */
export const applyWorksheetFormatting = (
  worksheet: XLSX.WorkSheet, 
  dataLength: number
): void => {
  // Set column widths
  const columnWidths = [
    { wch: 30 }, // Laboratório
    { wch: 20 }, // Amostras Registadas
    { wch: 20 }, // Tipo de Resultado
    { wch: 15 }, // Data Início
    { wch: 15 }  // Data Fim
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Merge title cells (row 1)
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: columnWidths.length - 1 }
  });
  
  // Merge subtitle cells (row 2)
  worksheet['!merges'].push({
    s: { r: 1, c: 0 },
    e: { r: 1, c: columnWidths.length - 1 }
  });
};

/**
 * Create and save workbook
 */
export const createAndSaveWorkbook = (
  worksheet: XLSX.WorkSheet, 
  filename: string
): void => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Amostras Registadas');
  XLSX.writeFile(workbook, filename);
};

/**
 * Main export function for chart data
 */
export const exportChartToExcel = (
  data: Data[], 
  reportName: string, 
  subtitle: string
): void => {
  try {
    if (!validateExportData(data)) {
      throw new Error('Dados inválidos para exportação');
    }

    const excelData = prepareChartDataForExcel(data);
    const worksheet = createFormattedWorksheet(excelData, reportName, subtitle);
    
    applyWorksheetFormatting(worksheet, excelData.length);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    
    createAndSaveWorkbook(worksheet, filename);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error('Falha na exportação para Excel');
  }
};
