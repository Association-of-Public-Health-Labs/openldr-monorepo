import * as XLSX from 'xlsx';
// Removed file-saver import - using native browser APIs instead
// import { formatDateInPortuguese } from './constants';
import { formatDateInPortuguese, ExcelData } from './constants';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate export data
 */
function validateExportData(data: ExcelData[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Export data is empty or invalid');
    return false;
  }
  
  return data.every(item => 
    item && 
    typeof item.Facility === 'string' &&
    typeof item["< 7 dias"] === 'number' &&
    typeof item["7-15 dias"] === 'number' &&
    typeof item["16-21 dias"] === 'number' &&
    typeof item["> 21 dias"] === 'number' &&
    typeof item.Total === 'number'
  );
}

/**
 * Prepare chart data for Excel export
 */
function prepareChartDataForExcel(
  data: ExcelData[],
  reportName: string,
  intervalType: string,
  subtitle: string
): any[][] {
  if (!validateExportData(data)) {
    throw new Error('Dados inválidos para exportação');
  }

  const headers = [
    'Unidade Sanitária',
    '< 7 dias', 
    '7-15 dias',
    '16-21 dias',
    '> 21 dias',
    'Total'
  ];

  // Create metadata rows
  const metadataRows = [
    [reportName],
    [subtitle],
    [intervalType],
    [''],
    headers
  ];

  // Add data rows
  const dataRows = data.map(item => [
    item.Facility,
    item["< 7 dias"],
    item["7-15 dias"], 
    item["16-21 dias"],
    item["> 21 dias"],
    item.Total
  ]);

  // Calculate totals
  const totals = [
    'TOTAL',
    data.reduce((sum, item) => sum + item["< 7 dias"], 0),
    data.reduce((sum, item) => sum + item["7-15 dias"], 0),
    data.reduce((sum, item) => sum + item["16-21 dias"], 0),
    data.reduce((sum, item) => sum + item["> 21 dias"], 0),
    data.reduce((sum, item) => sum + item.Total, 0)
  ];

  return [
    ...metadataRows,
    ...dataRows,
    [''],
    totals
  ];
}

/**
 * Create formatted worksheet
 */
function createFormattedWorksheet(
  worksheetData: any[][],
  reportName: string
): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const colWidths = [
    { wch: 25 }, // Unidade Sanitária
    { wch: 12 }, // < 7 dias
    { wch: 12 }, // 7-15 dias
    { wch: 12 }, // 16-21 dias
    { wch: 12 }, // > 21 dias
    { wch: 12 }, // Total
  ];
  
  ws['!cols'] = colWidths;
  
  return ws;
}

/**
 * Apply worksheet formatting
 */
function applyWorksheetFormatting(
  ws: XLSX.WorkSheet,
  reportName: string
): void {
  // Merge title cells (A1:F1)
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });
  
  // Merge subtitle cells (A2:F2)
  ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } });
  
  // Merge interval type cells (A3:F3)
  ws['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 5 } });
}

// ============================================================================
// UTILITY FUNCTIONS FOR FILE DOWNLOAD
// ============================================================================

/**
 * Download blob as file using native browser APIs
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create and save workbook
 */
function createAndSaveWorkbook(
  ws: XLSX.WorkSheet,
  filename: string
): void {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tempo de Resposta');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  // Use native browser download instead of file-saver
  downloadBlob(blob, filename);
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export chart data to Excel
 */
export function exportChartToExcel(
  data: ExcelData[],
  filename: string,
  reportName: string,
  intervalType: string,
  subtitle: string,
  facilityType: string
): void {
  try {
    if (!validateExportData(data)) {
      throw new Error('Dados inválidos para exportação Excel');
    }

    // Prepare worksheet data
    const worksheetData = prepareChartDataForExcel(
      data,
      reportName,
      intervalType,
      subtitle
    );

    // Create formatted worksheet
    const ws = createFormattedWorksheet(worksheetData, reportName);
    
    // Apply formatting
    applyWorksheetFormatting(ws, reportName);
    
    // Create and save workbook
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${timestamp}.xlsx`;
    
    createAndSaveWorkbook(ws, finalFilename);
    
    console.log('Excel export completed successfully');
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error(`Erro ao exportar para Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Export convenience function for chart exports
 */
export function exportChart(
  data: ExcelData[],
  reportName: string,
  intervalType: string,
  subtitle: string,
  facilityType: string
): void {
  const filename = `tempo_resposta_${intervalType.toLowerCase().replace(/__/g, '_')}`;
  
  exportChartToExcel(
    data,
    filename,
    reportName,
    intervalType,
    subtitle,
    facilityType
  );
}
