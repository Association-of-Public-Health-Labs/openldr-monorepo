import type {
  ViralLoadSamplesHistory,
  ViralLoadTatMonthly,
  ViralSuppressionMonthly,
} from "../types/summary";

export function buildSuppressionChartData(rows: ViralSuppressionMonthly[]) {
  return {
    datasets: [
      {
        backgroundColor: "#00b000",
        data: rows.map((row) => row.suppressed),
        label: "Suprimidos",
        maxBarThickness: 34,
      },
      {
        backgroundColor: "#fb8c00",
        data: rows.map((row) => row.notSuppressed),
        label: "Não suprimidos",
        maxBarThickness: 34,
      },
      {
        backgroundColor: "#1f77b4",
        data: rows.map((row) => row.suppressionRate),
        label: "Taxa de supressão (%)",
      },
    ],
    labels: rows.map((row) => row.month),
  };
}

export function buildTatChartData(rows: ViralLoadTatMonthly[]) {
  return {
    datasets: [
      {
        backgroundColor: "#00b000",
        data: rows.map((row) => row.averageTat),
        label: "TAT médio",
        maxBarThickness: 30,
      },
      {
        backgroundColor: "#1f77b4",
        data: rows.map((row) => row.expectedTat),
        label: "Meta",
        maxBarThickness: 30,
      },
    ],
    labels: rows.map((row) => row.month),
  };
}

export function buildSamplesHistoryChartData(rows: ViralLoadSamplesHistory[]) {
  return {
    datasets: [
      {
        backgroundColor: "#00b000",
        data: rows.map((row) => row.received),
        label: "Recebidas",
        maxBarThickness: 26,
      },
      {
        backgroundColor: "#1f77b4",
        data: rows.map((row) => row.tested),
        label: "Testadas",
        maxBarThickness: 26,
      },
      {
        backgroundColor: "#fb8c00",
        data: rows.map((row) => row.pending),
        label: "Pendentes",
        maxBarThickness: 26,
      },
    ],
    labels: rows.map((row) => row.month),
  };
}
