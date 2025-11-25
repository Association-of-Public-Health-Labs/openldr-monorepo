// Excel Export Utilities
// Handles Excel export functionality with proper data formatting and styling

import * as XLSX from 'xlsx';

interface ExcelExportOptions {
  data: any[];
  title: string;
  fileName: string;
  sheetName: string;
  headers?: string[];
}

interface ExcelColumnConfig {
  width: number;
  label: string;
}

/**
 * Validates export data before processing
 */
export function validateExportData(data: any[]): { isValid: boolean; message?: string } {
  if (!data || data.length === 0) {
    return { isValid: false, message: 'No data available to export' };
  }
  
  if (!Array.isArray(data)) {
    return { isValid: false, message: 'Invalid data format' };
  }
  
  return { isValid: true };
}

/**
 * Translates month names from English to Portuguese
 */
function translateMonthToPortuguese(monthName: string): string {
  const monthTranslations: Record<string, string> = {
    'January': 'Janeiro',
    'February': 'Fevereiro',
    'March': 'Março',
    'April': 'Abril',
    'May': 'Maio',
    'June': 'Junho',
    'July': 'Julho',
    'August': 'Agosto',
    'September': 'Setembro',
    'October': 'Outubro',
    'November': 'Novembro',
    'December': 'Dezembro',
    // Handle abbreviated forms
    'Jan': 'Jan',
    'Feb': 'Fev',
    'Mar': 'Mar',
    'Apr': 'Abr',
    'Jun': 'Jun',
    'Jul': 'Jul',
    'Aug': 'Ago',
    'Sep': 'Set',
    'Oct': 'Out',
    'Nov': 'Nov',
    'Dec': 'Dez'
  };

  return monthTranslations[monthName] || monthName;
}

/**
 * Prepares chart data for Excel export
 */
export function prepareChartDataForExcel(
  chartLabels: string[],
  chartSeries: any[],
  reportState: any,
  getLabProperty: (labType: string, label: string) => any
): any[] {
  if (!chartLabels || chartLabels.length === 0) {
    return [];
  }

  return reportState.data.map(item => ({
    'Mês': translateMonthToPortuguese(item.Month_Name),
    'Ano': item.Year,
    'Amostras Rejeitadas': item.Rejected_Samples,
    'Amostra Insuficiente': item.Isuficient_Specimen,
    'Amostra Não Recebida': item.Specimen_Not_Received,
    'Amostra Inadequada': item.Specimen_Unsuitable_For_Testing,
    'Falha do Equipamento': item.Equipment_Failure,
    'Repetir Coleta': item.Repeat_Specimen_Collection,
    'Amostra Não Etiquetada': item.Specimen_Not_Labeled,
    'Acidente Laboratorial': item.Laboratory_Acident,
    'Reagente em Falta': item.Missing_Reagent,
    'Registo Duplo': item.Double_Registration,
    'Erro Técnico': item.Technical_Error,
    'Outros': item.Other,
    'Tipo de Resultado': reportState.activeTab.toUpperCase(),
    'Tipo de Laboratório': item.Lab_Type,
    'Data Início': item.Start_Date,
    'Data Fim': item.End_Date,
    'Período': `${reportState.timeInterval.startDate} à ${reportState.timeInterval.endDate}`,
  }));
}

/**
 * Creates Excel worksheet with proper formatting
 */
export function createFormattedWorksheet(options: ExcelExportOptions): XLSX.WorkSheet {
  const { data, title, headers } = options;
  
  // Create data array with title and headers
  const worksheetData: any[][] = [];
  
  // Add title row
  worksheetData.push([title]);
  // Add empty row for spacing
  worksheetData.push([]);
  
  // Add headers (auto-detect from first data row if not provided)
  const finalHeaders = headers || Object.keys(data[0] || {});
  worksheetData.push(finalHeaders);
  
  // Add data rows
  data.forEach(row => {
    worksheetData.push(Object.values(row));
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Apply formatting
  applyWorksheetFormatting(worksheet, finalHeaders.length, title);
  
  return worksheet;
}

/**
 * Applies formatting to the worksheet
 */
function applyWorksheetFormatting(
  worksheet: XLSX.WorkSheet, 
  numColumns: number, 
  title: string
): void {
  // Get worksheet range
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Merge title cells (A1 to last column)
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({
    s: { r: 0, c: 0 }, // Start: A1
    e: { r: 0, c: numColumns - 1 } // End: Last column, row 1
  });
  
  // Set title cell value and type
  worksheet['A1'] = worksheet['A1'] || { v: title, t: 's' };
  
  // Set column widths
  const columnWidths = getColumnWidths(numColumns);
  worksheet['!cols'] = columnWidths;
}

/**
 * Defines column widths based on content type
 */
function getColumnWidths(numColumns: number): XLSX.ColInfo[] {
  const defaultWidths = [
    { wch: 15 }, // Month
    { wch: 8 },  // Year
    { wch: 18 }, // Total Rejected Samples
    { wch: 18 }, // Insufficient Specimen
    { wch: 18 }, // Specimen Not Received
    { wch: 18 }, // Specimen Unsuitable
    { wch: 18 }, // Equipment Failure
    { wch: 18 }, // Repeat Collection
    { wch: 18 }, // Not Labeled
    { wch: 18 }, // Laboratory Accident
    { wch: 18 }, // Missing Reagent
    { wch: 18 }, // Double Registration
    { wch: 18 }, // Technical Error
    { wch: 15 }, // Other
    { wch: 15 }, // Result Type
    { wch: 20 }, // Lab Type
    { wch: 12 }, // Start Date
    { wch: 12 }, // End Date
    { wch: 25 }, // Period
  ];
  
  // Extend with default width if more columns
  while (defaultWidths.length < numColumns) {
    defaultWidths.push({ wch: 15 });
  }
  
  return defaultWidths.slice(0, numColumns);
}

/**
 * Creates and saves Excel workbook
 */
export function createAndSaveWorkbook(worksheet: XLSX.WorkSheet, options: ExcelExportOptions): void {
  const { fileName, sheetName } = options;
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Ensure sheet name is valid (max 31 characters)
  const validSheetName = sheetName.length > 31 
    ? sheetName.substring(0, 31) 
    : sheetName;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, validSheetName);
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFileName = `${fileName}_${timestamp}.xlsx`;
  
  // Save file
  XLSX.writeFile(workbook, finalFileName);
}

/**
 * Main Excel export function
 */
export async function exportToExcel(options: ExcelExportOptions): Promise<void> {
  try {
    // Validate data
    const validation = validateExportData(options.data);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    // Create formatted worksheet
    const worksheet = createFormattedWorksheet(options);
    
    // Create and save workbook
    createAndSaveWorkbook(worksheet, options);
    
    console.log('Excel export completed successfully');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to export to Excel: ${errorMessage}`);
  }
}

/**
 * Convenience function for chart data export
 */
export async function exportChartToExcel(
  chartData: { labels: string[], series: any[] },
  reportState: any,
  reportName: string,
  getLabProperty: (labType: string, label: string) => any
): Promise<void> {
  // Prepare data
  const exportData = prepareChartDataForExcel(
    chartData.labels,
    chartData.series,
    reportState,
    getLabProperty
  );

  // Função para construir o título
  const buildReportTitle = (reportName: string, reportState: any) => {
    const activeTab = reportState.activeTab.toUpperCase();

    // Se houver labs, organiza hierarquicamente
    if (reportState.labs && reportState.labs.length > 0) {
      // Pega a primeira lab (assumindo que todas pertencem à mesma hierarquia)
      const lab = reportState.labs[0];

      // Começa com província
      let hierarchy = lab.province;

      // Se tiver distrito, acrescenta
      if (lab.district) {
        hierarchy += ` - ${lab.district}`;
      }

      // Se tiver laboratório (value/label), acrescenta também
      if (lab.label && lab.label !== lab.district && lab.label !== lab.province) {
        hierarchy += ` - ${lab.label}`;
      }

      return `${reportName} - ${activeTab} - ${hierarchy}`;
    }

    // Caso não haja labs selecionadas
    return `${reportName} - ${activeTab}`;
  };
  
  // Create export options
  const options: ExcelExportOptions = {
    data: exportData,
    title: buildReportTitle(reportName, reportState),
    fileName: `${reportName}_${reportState.activeTab}`,
    sheetName: reportName,
  };
  
  // Export
  await exportToExcel(options);
}
