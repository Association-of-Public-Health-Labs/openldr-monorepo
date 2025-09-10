import * as XLSX from 'xlsx';
import { Data } from './actions';

// Data validation
export const validateExportData = (data: Data[]): boolean => {
  return Array.isArray(data) && data.length > 0;
};

// Prepare chart data for Excel export
export const prepareChartDataForExcel = (data: Data[]) => {
  if (!validateExportData(data)) {
    return [];
  }

  return data.map(item => ({
    'Mês': item.Month_Name,
    'Amostra Insuficiente': item.Isuficient_Specimen || 0,
    'Amostra Não Recebida': item.Specimen_Not_Received || 0,
    'Amostra Inadequada para Teste': item.Specimen_Unsuitable_For_Testing || 0,
    'Falha de Equipamento': item.Equipment_Failure || 0,
    'Amostra Não Etiquetada': item.Specimen_Not_Labeled || 0,
    'Acidente no Laboratório': item.Laboratory_Acident || 0,
    'Reagente Ausente': item.Missing_Reagent || 0,
    'Duplicação de Registo': item.Double_Registration || 0,
    'Erro Técnico': item.Technical_Error || 0,
    'Amostra Repetida': item.Repeat_Specimen_Collection || 0,
    'Outro': item.Other || 0,
    'Total Rejeitadas': item.Rejected_Samples || 0
  }));
};

// Create formatted worksheet
export const createFormattedWorksheet = (
  chartData: any[],
  reportName: string,
  subtitle: string
) => {
  // Create metadata rows
  const metadataRows = [
    [reportName],
    [subtitle],
    [''],
    []
  ];

  // Add headers and data
  const worksheetData = [...metadataRows, ...chartData];
  const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

  return worksheet;
};

// Apply worksheet formatting
export const applyWorksheetFormatting = (
  worksheet: XLSX.WorkSheet,
  reportName: string,
  chartData: any[]
) => {
  // Merge title cells
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({
    s: { c: 0, r: 0 },
    e: { c: 12, r: 0 }
  });

  // Merge subtitle cells
  worksheet['!merges'].push({
    s: { c: 0, r: 1 },
    e: { c: 12, r: 1 }
  });

  // Set column widths
  const colWidths = [
    { wch: 15 }, // Mês
    { wch: 18 }, // Amostra Insuficiente
    { wch: 20 }, // Amostra Não Recebida
    { wch: 25 }, // Amostra Inadequada para Teste
    { wch: 18 }, // Falha de Equipamento
    { wch: 20 }, // Amostra Não Etiquetada
    { wch: 22 }, // Acidente no Laboratório
    { wch: 18 }, // Reagente Ausente
    { wch: 20 }, // Duplicação de Registo
    { wch: 15 }, // Erro Técnico
    { wch: 18 }, // Amostra Repetida
    { wch: 10 }, // Outro
    { wch: 15 }  // Total Rejeitadas
  ];
  worksheet['!cols'] = colWidths;

  return worksheet;
};

// Create and save workbook
export const createAndSaveWorkbook = (
  worksheet: XLSX.WorkSheet,
  filename: string
) => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Amostras Rejeitadas');
  XLSX.writeFile(workbook, filename);
};

// Main export function
export const exportChartToExcel = (
  data: Data[],
  reportName: string,
  subtitle: string
) => {
  try {
    if (!validateExportData(data)) {
      throw new Error('Dados inválidos para exportação');
    }

    const chartData = prepareChartDataForExcel(data);
    const worksheet = createFormattedWorksheet(chartData, reportName, subtitle);
    const formattedWorksheet = applyWorksheetFormatting(worksheet, reportName, chartData);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    
    createAndSaveWorkbook(formattedWorksheet, filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw error;
  }
};
