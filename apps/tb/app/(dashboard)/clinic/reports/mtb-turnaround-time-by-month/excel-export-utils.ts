import * as XLSX from 'xlsx';
import { Data } from './actions';

export const validateExportData = (data: Data[]): boolean => {
  return Array.isArray(data) && data.length > 0;
};

export const prepareChartDataForExcel = (data: Data[]) => {
  if (!validateExportData(data)) {
    return [];
  }

  return data.map(item => ({
    'Mês': item.Month_Name,
    'Ano': item.Year,
    'Colheita US → Recepção Lab': item.colheita_us__recepcao_lab || 0,
    'Recepção Lab → Registo no Lab': item.recepcao_lab__registo_no_lab || 0,
    'Registo no Lab → Análise no Lab': item.registo_no_lab__analise_no_lab || 0,
    'Análise no Lab → Validação no Lab': item.analise_no_lab__validacao_no_lab || 0,
  }));
};

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

    const metadataRows = [
      [reportName],
      [subtitle],
      [''],
    ];

    const worksheetData = [...metadataRows, ...chartData];
    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push(
      { s: { c: 0, r: 0 }, e: { c: 5, r: 0 } },
      { s: { c: 0, r: 1 }, e: { c: 5, r: 1 } }
    );

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 8 },
      { wch: 28 },
      { wch: 28 },
      { wch: 28 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tempo de Resposta');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw error;
  }
};
