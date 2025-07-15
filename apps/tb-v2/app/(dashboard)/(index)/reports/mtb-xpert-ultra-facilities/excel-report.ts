import { CsvFileProps } from "@repo/design_system/contexts/CardContext";

export interface ExportData {
  district?: string;
  month?: string;
  year?: string;
  mtb_detected: number;
  mtb_not_detected: number;
  invalid: number;
  no_result: number;
  errors: number;
  total: number;
}

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  format?: 'csv' | 'excel';
}

export function prepareDataForExport(
  data: any[],
  options: ExportOptions = {}
): CsvFileProps {
  const headers = [
    { label: 'Distrito', key: 'district' },
    { label: 'Mês', key: 'month' },
    { label: 'Ano', key: 'year' },
    { label: 'MTB Detectado', key: 'mtb_detected' },
    { label: 'MTB Não Detectado', key: 'mtb_not_detected' },
    { label: 'Inválido', key: 'invalid' },
    { label: 'Sem Resultado', key: 'no_result' },
    { label: 'Erros', key: 'errors' },
    { label: 'Total', key: 'total' }
  ];

  // Transform data to include calculated totals
  const exportData = data.map(item => ({
    district: item.district || '',
    month: item.month || '',
    year: item.year || '',
    mtb_detected: item.mtb_detected || 0,
    mtb_not_detected: item.mtb_not_detected || 0,
    invalid: item.invalid || 0,
    no_result: item.no_result || 0,
    errors: item.errors || 0,
    total: (item.mtb_detected || 0) + (item.mtb_not_detected || 0) + (item.invalid || 0) + (item.no_result || 0) + (item.errors || 0)
  }));

  // Add summary row
  const summaryRow = {
    district: 'TOTAL GERAL',
    month: '',
    year: '',
    mtb_detected: exportData.reduce((sum, item) => sum + item.mtb_detected, 0),
    mtb_not_detected: exportData.reduce((sum, item) => sum + item.mtb_not_detected, 0),
    invalid: exportData.reduce((sum, item) => sum + item.invalid, 0),
    no_result: exportData.reduce((sum, item) => sum + item.no_result, 0),
    errors: exportData.reduce((sum, item) => sum + item.errors, 0),
    total: exportData.reduce((sum, item) => sum + item.total, 0)
  };

  const finalData = [...exportData, summaryRow];

  return {
    filename: options.filename || `relatorio-mtb-xpert-ultra-${new Date().toISOString().split('T')[0]}.csv`,
    data: finalData,
    headers: headers
  };
}

export function downloadCSV(csvFile: CsvFileProps) {
  // Create CSV content
  const headers = csvFile.headers?.map(h => h.label).join(',') || '';
  const rows = csvFile.data?.map(row => 
    csvFile.headers?.map(header => {
      const value = row[header.key];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  ).join('\n') || '';

  const csvContent = `${headers}\n${rows}`;
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', csvFile.filename || 'export.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0];
}