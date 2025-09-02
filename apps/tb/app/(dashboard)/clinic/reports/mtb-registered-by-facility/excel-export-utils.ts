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
 * Prepares chart data for Excel export
 */
export function prepareChartDataForExcel(
  chartLabels: string[],
  chartSeries: any[],
  reportState: any,
  getFacilityProperty: (facilityType: string, label: string) => any
): any[] {
  if (!chartLabels || chartLabels.length === 0) {
    return [];
  }

  const facilityTypeLabels = {
    province: "Província",
    district: "Distrito",
    clinic: "Unidade Sanitária"
  };

  const facilityTypeLabel = facilityTypeLabels[reportState.facilityType] || "Unidade";

  return reportState.data.map(item => ({
    [facilityTypeLabel]: item.Facility,
    'Amostras Registadas': item.Tested_Samples,
    'Tipo de Resultado': reportState.activeTab.toUpperCase(),
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
    { wch: 25 }, // Facility/Location
    { wch: 18 }, // Registered Samples
    { wch: 15 }, // Report Type
    { wch: 25 }, // Date Range
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
  getFacilityProperty: (facilityType: string, label: string) => any
): Promise<void> {
  // Prepare data
  const exportData = prepareChartDataForExcel(
    chartData.labels,
    chartData.series,
    reportState,
    getFacilityProperty
  );

  // Função para construir o título
const buildReportTitle = (reportName, reportState) => {

  const activeTab = reportState.activeTab.toUpperCase();

  // Se houver facilities, organiza hierarquicamente
  if (reportState.facilities && reportState.facilities.length > 0) {
    // Pega a primeira facility (assumindo que todas pertencem à mesma hierarquia)
    const facility = reportState.facilities[0];

    // Começa com província
    let hierarchy = facility.province;

    // Se tiver distrito, acrescenta
    if (facility.district) {
      hierarchy += ` - ${facility.district}`;
    }

    // Se tiver unidade sanitária (value/label), acrescenta também
    if (facility.label && facility.label !== facility.district && facility.label !== facility.province) {
      hierarchy += ` - ${facility.label}`;
    }

    return `${reportName} - ${activeTab} - ${hierarchy}`;
  }

  // Caso não haja facilities selecionadas
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
