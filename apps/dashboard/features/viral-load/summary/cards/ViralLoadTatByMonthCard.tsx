"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import { Bar } from "@repo/design_system/app/atoms/charts/chartjs/Bar";
import { buildTatChartData } from "../../adapters/charts";
import { adaptTatByMonth } from "../../adapters/summary";
import { getVlTatByMonth } from "../../api/summary";
import type { ViralLoadDateInterval } from "../../types/common";
import { getDefaultViralLoadInterval } from "../../types/common";
import type { ViralLoadTatMonthly } from "../../types/summary";
import { EmptyViralLoadState, ViralLoadCardShell, ViralLoadChartFrame } from "./ViralLoadCardShell";

export function ViralLoadTatByMonthCard() {
  const { getToken } = useAuth();
  const [interval, setInterval] = useState<ViralLoadDateInterval>(() => getDefaultViralLoadInterval());
  const [rows, setRows] = useState<ViralLoadTatMonthly[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
        const response = await getVlTatByMonth({ interval, token });
        if (alive) setRows(adaptTatByMonth(response));
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : "Não foi possível carregar o TAT.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [getToken, interval]);

  const chartData = useMemo(() => buildTatChartData(rows), [rows]);
  const averageTat = rows.length
    ? Math.round((rows.reduce((sum, row) => sum + row.averageTat, 0) / rows.length) * 10) / 10
    : 0;

  return (
    <ViralLoadCardShell
      cardHeight={440}
      contentHeight={320}
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={setInterval}
      title="Tempo de Resposta por Mês"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ alignItems: "baseline", display: "flex", gap: 1, mb: 1.5 }}>
            <Typography fontSize={26} fontWeight={900} sx={{ lineHeight: 1 }}>
              {averageTat}
            </Typography>
            <Typography color="text.secondary" fontSize={13} fontWeight={700}>
              dias em média
            </Typography>
          </Box>
          <ViralLoadChartFrame height={280}>
            <Bar
              data={chartData}
              height={280}
              options={{
                plugins: {
                  legend: { position: "bottom" },
                  datalabels: { display: false },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    stacked: false,
                    ticks: {
                      autoSkip: false,
                      maxRotation: 35,
                      minRotation: 0,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: "Dias" },
                  },
                },
              }}
            />
          </ViralLoadChartFrame>
        </Box>
      ) : (
        <EmptyViralLoadState />
      )}
    </ViralLoadCardShell>
  );
}
