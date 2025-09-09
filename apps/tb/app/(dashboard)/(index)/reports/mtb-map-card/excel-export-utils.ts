import * as XLSX from 'xlsx';
import { MapData, formatDateRange, TimeInterval, ActiveTab } from './constants';
import { prepareMapDataForExcel } from './actions';

// =============================================================================
// EXCEL EXPORT FUNCTIONS
// =============================================================================

/**
 * Validate export data before processing
 */
export const validateExportData = (data: MapData[]): boolean => {
  return Array.isArray(data) && data.length > 0;
};

/**
 * Prepare map data for Excel export with proper formatting
 */
export const prepareMapDataForExcelExport = (
  data: MapData[],
  timeInterval: TimeInterval,
  activeTab: ActiveTab
): Array<Record<string, any>> => {
  if (!validateExportData(data)) {
    return [];
  }

  const exportData = prepareMapDataForExcel(data);
  
  // Add metadata rows
  const metadataRows = [
    { Provincia: 'Relatório: Positividade de TB - Mapa', 'Amostras Testadas': '', 'Detectado': '', 'Não Detectado': '', 'Inválido': '', 'Erros': '', 'Taxa de Positividade': '', 'Data Início': '', 'Data Fim': '', 'Tipo de Resultado': '' },
    { Provincia: `Período: ${formatDateRange(timeInterval)}`, 'Amostras Testadas': '', 'Detectado': '', 'Não Detectado': '', 'Inválido': '', 'Erros': '', 'Taxa de Positividade': '', 'Data Início': '', 'Data Fim': '', 'Tipo de Resultado': ''},
    { Provincia: `Tipo: ${activeTab === 'ultra' ? 'Ultra 6 Cores' : 'XDR 10 Cores'}`, 'Amostras Testadas': '', 'Detectado': '', 'Não Detectado': '', 'Inválido': '', 'Erros': '', 'Taxa de Positividade': '', 'Data Início': '', 'Data Fim': '', 'Tipo de Resultado': '' },
    { Provincia: '', 'Amostras Testadas': 'Amostras Testadas', 'Detectado': 'Resultado Positivo', 'Não Detectado': 'Resultado Negativo', 'Inválido': 'Inválido', 'Erros': 'Erros', 'Taxa de Positividade': 'Taxa de Positividade', 'Data Início': 'Data Início', 'Data Fim': 'Data Fim', 'Tipo de Resultado': 'Tipo de Resultado'}, // Empty row
  ];

  return [...metadataRows, ...exportData];
};

/**
 * Create formatted worksheet with proper styling
 */
export const createFormattedWorksheet = (data: Array<Record<string, any>>): XLSX.WorkSheet => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Apply formatting
  applyWorksheetFormatting(worksheet, data.length);
  
  return worksheet;
};

/**
 * Apply formatting to worksheet (title merging, column widths)
 */
export const applyWorksheetFormatting = (worksheet: XLSX.WorkSheet, dataLength: number): void => {
  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Provincia
    { wch: 18 }, // Amostras Testadas
    { wch: 12 }, // Detectado
    { wch: 15 }, // Não Detectado
    { wch: 10 }, // Inválido
    { wch: 10 }, // Erros
    { wch: 20 }, // Taxa de Positividade
    { wch: 15 }, // Data Início
    { wch: 15 }, // Data Fim
    { wch: 20 }, // Tipo de Resultado
    // { wch: 20 }, // Desagregação
    // { wch: 20 }, // Tipo de Unidade
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Merge title cells (first row)
  if (!worksheet['!merges']) {
    worksheet['!merges'] = [];
  }
  
  worksheet['!merges'].push({
    s: { r: 0, c: 0 }, // Start: row 0, column 0
    e: { r: 0, c: 10 }  // End: row 0, column 10
  });
};

/**
 * Create and save workbook with formatted data
 */
export const createAndSaveWorkbook = (
  worksheet: XLSX.WorkSheet,
  filename: string
): void => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Positividade TB');
  XLSX.writeFile(workbook, filename);
};

/**
 * Generate filename for Excel export
 */
export const generateExcelFilename = (activeTab: ActiveTab): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const tabType = activeTab === 'ultra' ? 'Ultra' : 'XDR';
  return `Positividade_Mapa_${tabType}_${timestamp}.xlsx`;
};

/**
 * Main function to export map data to Excel
 */
export const exportMapToExcel = (
  data: MapData[],
  timeInterval: TimeInterval,
  activeTab: ActiveTab
): void => {
  try {
    if (!validateExportData(data)) {
      throw new Error('Nenhum dado disponível para exportar');
    }

    const formattedData = prepareMapDataForExcelExport(data, timeInterval, activeTab);
    const worksheet = createFormattedWorksheet(formattedData);
    const filename = generateExcelFilename(activeTab);
    
    createAndSaveWorkbook(worksheet, filename);
    
    console.log(`Excel exportado com sucesso: ${filename}`);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw error;
  }
};

/**
 * Export district data to Excel (when province is selected)
 */
export const exportDistrictDataToExcel = (
  data: MapData[],
  timeInterval: TimeInterval,
  activeTab: ActiveTab,
  provinceName: string
): void => {
  try {
    if (!validateExportData(data)) {
      throw new Error('Nenhum dado disponível para exportar');
    }

    const exportData = data.map((item) => ({
      Distrito: item.Facility,
      "Amostras Testadas": item.Tested_Samples,
      "Detectado": item.Detected,
      "Não Detectado": item.Not_Detected,
      "Inválido": item.Invalid,
      "Erros": item.Errors,
      "Taxa de Positividade": `${((item.Detected / item.Tested_Samples) * 100).toFixed(1)}%`,
      "Data Início": item.Start_Date,
      "Data Fim": item.End_Date,
      "Tipo de Resultado": item.Type_Of_Result,
    //   "Desagregação": item.Disaggregation,
    //   "Tipo de Unidade": item.Facility_Type,
    }));

    // Add metadata rows
    const metadataRows = [
      { Distrito: `Relatório: Positividade de TB - ${provinceName}`, 'Amostras Testadas': '', 'Detectado': '', 'Não Detectado': '', 'Inválido': '', 'Erros': '', 'Taxa de Positividade': '', 'Data Início': '', 'Data Fim': '', 'Tipo de Resultado': '' },
      { Distrito: `Período: ${formatDateRange(timeInterval)}`, 'Amostras Testadas': '', 'Detectado': '', 'Não Detectado': '', 'Inválido': '', 'Erros': '', 'Taxa de Positividade': '', 'Data Início': '', 'Data Fim': '', 'Tipo de Resultado': '' },
      { Distrito: `Tipo: ${activeTab === 'ultra' ? 'Ultra 6 Cores' : 'XDR 10 Cores'}`, 'Amostras Testadas': '', 'Detectado': '', 'Não Detectado': '', 'Inválido': '', 'Erros': '', 'Taxa de Positividade': '', 'Data Início': '', 'Data Fim': '', 'Tipo de Resultado': '' },
      { Distrito: '', 'Amostras Testadas': 'Amostras Testadas', 'Detectado': 'Resultado Positivo', 'Não Detectado': 'Resultado Negativo', 'Inválido': 'Inválido', 'Erros': 'Erros', 'Taxa de Positividade': 'Taxa de Positividade', 'Data Início': 'Data Início', 'Data Fim': 'Data Fim', 'Tipo de Resultado': 'Tipo de Resultado'}, // Empty row
    ];

    const formattedData = [...metadataRows, ...exportData];
    const worksheet = createFormattedWorksheet(formattedData);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const tabType = activeTab === 'ultra' ? 'Ultra' : 'XDR';
    const filename = `Positividade_${provinceName.replace(/\s+/g, '_')}_${tabType}_${timestamp}.xlsx`;
    
    createAndSaveWorkbook(worksheet, filename);
    
    console.log(`Excel exportado com sucesso: ${filename}`);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw error;
  }
};
