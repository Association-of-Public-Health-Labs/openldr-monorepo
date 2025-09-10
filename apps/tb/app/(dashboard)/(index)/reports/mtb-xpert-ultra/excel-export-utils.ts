import * as XLSX from 'xlsx';
import { Data, ChartData } from './constants';

export function validateExportData(data: Data[]): boolean {
  return Array.isArray(data) && data.length > 0;
}

export function prepareChartDataForExcel(data: Data[]): ChartData[] {
  if (!validateExportData(data)) {
    return [];
  }

  return data.map(item => ({
    month: item.Month_Name,
    detected: item.Detected_Samples || 0,
    notDetected: item.Not_Detected_Samples || 0,
    invalid: item.Invalid_Samples || 0,
    errors: item.Errors || 0,
    total: (item.Detected_Samples || 0) + (item.Not_Detected_Samples || 0) + (item.Invalid_Samples || 0) + (item.Errors || 0)
  }));
}

export function createFormattedWorksheet(chartData: ChartData[], reportName: string): XLSX.WorkSheet {
  // Create header rows
  const headerRows = [
    [reportName],
    [`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`],
    [], // Empty row
    ['Mês', 'MTB Detectado', 'MTB Não Detectado', 'Inválido', 'Erros', 'Total']
  ];

  // Add data rows
  const dataRows = chartData.map(item => [
    item.month,
    item.detected,
    item.notDetected,
    item.invalid,
    item.errors,
    item.total
  ]);

  // Calculate totals
  const totals = chartData.reduce((acc, item) => ({
    detected: acc.detected + item.detected,
    notDetected: acc.notDetected + item.notDetected,
    invalid: acc.invalid + item.invalid,
    errors: acc.errors + item.errors,
    total: acc.total + item.total
  }), { detected: 0, notDetected: 0, invalid: 0, errors: 0, total: 0 });

  // Add totals row
  const totalsRow = [
    'TOTAL',
    totals.detected,
    totals.notDetected,
    totals.invalid,
    totals.errors,
    totals.total
  ];

  // Combine all rows
  const allRows = [...headerRows, ...dataRows, [], totalsRow];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(allRows);

  return worksheet;
}

export function applyWorksheetFormatting(worksheet: XLSX.WorkSheet): void {
  // Merge title cell
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });

  // Set column widths
  worksheet['!cols'] = [
    { width: 15 }, // Mês
    { width: 15 }, // MTB Detectado
    { width: 18 }, // MTB Não Detectado
    { width: 12 }, // Inválido
    { width: 10 }, // Erros
    { width: 12 }  // Total
  ];
}

export function createAndSaveWorkbook(worksheet: XLSX.WorkSheet, filename: string): void {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados MTB Xpert');
  XLSX.writeFile(workbook, filename);
}

export function exportChartToExcel(
  data: Data[],
  reportName: string,
  activeTab: string
): void {
  try {
    if (!validateExportData(data)) {
      throw new Error('Dados inválidos para exportação');
    }

    const chartData = prepareChartDataForExcel(data);
    const worksheet = createFormattedWorksheet(chartData, reportName);
    applyWorksheetFormatting(worksheet);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `mtb-xpert-${activeTab}-mensal-${timestamp}.xlsx`;

    createAndSaveWorkbook(worksheet, filename);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error('Falha na exportação para Excel');
  }
}
