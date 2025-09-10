import * as XLSX from 'xlsx';
import { ChartData } from './constants';

/**
 * Validate export data before processing
 */
export const validateExportData = (data: ChartData[]): boolean => {
  return Array.isArray(data) && data.length > 0;
};

/**
 * Prepare chart data for Excel export
 */
export const prepareChartDataForExcel = (data: ChartData[]): any[][] => {
  if (!validateExportData(data)) {
    return [['Nenhum dado disponível para exportar']];
  }

  // Get all month columns (excluding 'Indicadores' column)
  const monthColumns = Object.keys(data[0]).filter(key => key !== 'Indicadores');
  
  // Create header row
  const headers = ['Indicadores', ...monthColumns];
  
  // Create data rows
  const rows = data.map(item => [
    item.Indicadores,
    ...monthColumns.map(month => item[month] || 0)
  ]);

  return [headers, ...rows];
};

/**
 * Create formatted worksheet with styling
 */
export const createFormattedWorksheet = (
  data: any[][],
  reportName: string,
  subtitle: string
): XLSX.WorkSheet => {
  // Add metadata rows
  const metadataRows = [
    [reportName],
    [subtitle],
    [''], // Empty row for spacing
  ];

  // Combine metadata and data
  const worksheetData = [...metadataRows, ...data];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  return worksheet;
};

/**
 * Apply worksheet formatting (title merging and column widths)
 */
export const applyWorksheetFormatting = (
  worksheet: XLSX.WorkSheet,
  data: any[][]
): void => {
  const numColumns = data[0]?.length || 1;
  
  // Merge cells for title (row 1)
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({
    s: { r: 0, c: 0 }, // Start: row 0, col 0
    e: { r: 0, c: numColumns - 1 } // End: row 0, last column
  });

  // Merge cells for subtitle (row 2)
  worksheet['!merges'].push({
    s: { r: 1, c: 0 }, // Start: row 1, col 0
    e: { r: 1, c: numColumns - 1 } // End: row 1, last column
  });

  // Set column widths
  const columnWidths = Array(numColumns).fill({ wch: 15 });
  columnWidths[0] = { wch: 25 }; // Wider for 'Indicadores' column
  worksheet['!cols'] = columnWidths;
};

/**
 * Create and save workbook
 */
export const createAndSaveWorkbook = (
  worksheet: XLSX.WorkSheet,
  filename: string
): void => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Principais Indicadores');
  XLSX.writeFile(workbook, filename);
};

/**
 * Main export function for key indicators chart
 */
export const exportChartToExcel = (
  data: ChartData[],
  reportName: string,
  subtitle: string
): void => {
  try {
    if (!validateExportData(data)) {
      throw new Error('Dados inválidos para exportação');
    }

    // Prepare data
    const excelData = prepareChartDataForExcel(data);
    
    // Create worksheet
    const worksheet = createFormattedWorksheet(excelData, reportName, subtitle);
    
    // Apply formatting
    applyWorksheetFormatting(worksheet, excelData);
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    
    // Create and save workbook
    createAndSaveWorkbook(worksheet, filename);
    
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error('Falha ao exportar dados para Excel');
  }
};
