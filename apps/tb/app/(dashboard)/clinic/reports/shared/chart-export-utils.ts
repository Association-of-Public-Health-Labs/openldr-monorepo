// ../shared/chart-export-utils.ts
import ApexCharts from "apexcharts";

interface ExportChartOptions {
  chartId: string;
  fileName?: string;
  type?: "png" | "svg";
}

export async function exportChart({
  chartId,
  fileName = "chart",
  type = "png"
}: ExportChartOptions) {
  try {
    const chartEl = document.querySelector(`#${chartId}`);
    if (!chartEl) {
      throw new Error(`Chart element with id "${chartId}" not found`);
    }

    // Recupera instância do gráfico Apex
    const chart = (ApexCharts as any).getChartByID(chartId);
    if (!chart) {
      throw new Error(`No chart instance found for id "${chartId}"`);
    }

    // Gera o dataURI
    const { imgURI } = await chart.dataURI({ scale: 3 });
    const link = document.createElement("a");
    link.href = imgURI;
    link.download = `${fileName}.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Export chart error:", err);
    throw err;
  }
}
