import * as XLSX from 'xlsx';
import { Data } from './constants';
import { prepareExcelData } from './actions';

// ============================================================================
// EXCEL EXPORT UTILITIES
// ============================================================================

/**
 * Validates export data before processing
 */
export const validateExportData = (data: Data[]): boolean => {
  return Array.isArray(data) && data.length > 0;
};

/**
 * Prepares specimen type data for Excel export
 */
export const prepareSpecimenTypeDataForExcel = (data: Data[]): any[] => {
  if (!validateExportData(data)) {
    return [];
  }

  return prepareExcelData(data);
};

/**
 * Creates formatted worksheet with specimen type data
 */
export const createFormattedWorksheet = (
  data: any[],
  reportName: string,
  subtitle: string
): XLSX.WorkSheet => {
  // Create metadata rows
  const metadataRows = [
    [reportName],
    [subtitle],
    [''],
    ['Mês', 'Ano', 'Escarro', 'Fezes', 'Urina', 'Sangue', 'Outro', 'Total']
  ];

  // Combine metadata with data
  const worksheetData = [
    ...metadataRows,
    ...data.map(row => [
      row['Mês'],
      row['Ano'],
      row['Escarro'],
      row['Fezes'],
      row['Urina'],
      row['Sangue'],
      row['Outro'],
      row['Total']
    ])
  ];

  // Add totals row
  if (data.length > 0) {
    const totals = data.reduce((acc, row) => ({
      'Escarro': acc['Escarro'] + (row['Escarro'] || 0),
      'Fezes': acc['Fezes'] + (row['Fezes'] || 0),
      'Urina': acc['Urina'] + (row['Urina'] || 0),
      'Sangue': acc['Sangue'] + (row['Sangue'] || 0),
      'Outro': acc['Outro'] + (row['Outro'] || 0),
      'Total': acc['Total'] + (row['Total'] || 0)
    }), {
      'Escarro': 0,
      'Fezes': 0,
      'Urina': 0,
      'Sangue': 0,
      'Outro': 0,
      'Total': 0
    });

    worksheetData.push([
      'TOTAL',
      '',
      totals['Escarro'],
      totals['Fezes'],
      totals['Urina'],
      totals['Sangue'],
      totals['Outro'],
      totals['Total']
    ]);
  }

  return XLSX.utils.aoa_to_sheet(worksheetData);
};

/**
 * Applies formatting to the worksheet
 */
export const applyWorksheetFormatting = (
  worksheet: XLSX.WorkSheet,
  reportName: string
): void => {
  // Merge title cells
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });
  worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } });

  // Set column widths
  worksheet['!cols'] = [
    { width: 15 }, // Mês
    { width: 10 }, // Ano
    { width: 12 }, // Escarro
    { width: 12 }, // Fezes
    { width: 12 }, // Urina
    { width: 12 }, // Sangue
    { width: 12 }, // Outro
    { width: 12 }  // Total
  ];
};

/**
 * Creates and saves the workbook
 */
export const createAndSaveWorkbook = (
  worksheet: XLSX.WorkSheet,
  filename: string
): void => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados por Tipo de Amostra');
  XLSX.writeFile(workbook, filename);
};

/**
 * Main export function for specimen type chart data
 */
export const exportSpecimenTypeToExcel = (
  data: Data[],
  reportName: string,
  subtitle: string
): void => {
  try {
    // Validate data
    if (!validateExportData(data)) {
      throw new Error('Dados inválidos para exportação');
    }

    // Prepare data
    const excelData = prepareSpecimenTypeDataForExcel(data);
    
    if (excelData.length === 0) {
      throw new Error('Nenhum dado disponível para exportação');
    }

    // Create worksheet
    const worksheet = createFormattedWorksheet(excelData, reportName, subtitle);
    
    // Apply formatting
    applyWorksheetFormatting(worksheet, reportName);
    
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
