"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, LinearProgress, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { adaptSuppressionByProvince } from "../../adapters/summary";
import { getVlSuppressionByProvinceByMonth } from "../../api/summary";
import type { ViralLoadDateInterval } from "../../types/common";
import { getDefaultViralLoadInterval } from "../../types/common";
import type { ViralLoadProvinceSuppression } from "../../types/summary";
import { EmptyViralLoadState, ViralLoadCardShell } from "./ViralLoadCardShell";

export function ViralSuppressionMapCard() {
  const { getToken } = useAuth();
  const theme = useTheme();
  const [interval, setInterval] = useState<ViralLoadDateInterval>(() => getDefaultViralLoadInterval());
  const [rows, setRows] = useState<ViralLoadProvinceSuppression[]>([]);
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
        const response = await getVlSuppressionByProvinceByMonth({ interval, token });
        if (alive) {
          setRows(adaptSuppressionByProvince(response).sort((a, b) => b.suppressionRate - a.suppressionRate));
        }
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : "Não foi possível carregar a supressão por província.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [getToken, interval]);

  return (
    <ViralLoadCardShell
      cardHeight={430}
      contentHeight={310}
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={setInterval}
      scrollable
      title="Supressão por Província"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, pr: 0.5 }}>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
            Ranking por taxa de supressão e total de amostras.
          </Typography>
          <Box sx={{ display: "grid", gap: 1.15, minWidth: 0, pb: 1.5 }}>
            {rows.map((row) => (
              <Box key={row.province} sx={{ minWidth: 0 }}>
                <Box sx={{ alignItems: "center", display: "flex", gap: 1, justifyContent: "space-between", mb: 0.35 }}>
                  <Typography fontSize={13} fontWeight={800} sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.province}
                  </Typography>
                  <Typography color="text.secondary" fontSize={12} fontWeight={800} sx={{ flex: "0 0 auto" }}>
                    {row.suppressionRate}% · {formatNumber(row.total)}
                  </Typography>
                </Box>
                <LinearProgress
                  value={Math.min(row.suppressionRate, 100)}
                  variant="determinate"
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.14 : 0.1),
                    borderRadius: 999,
                    height: 7.5,
                    "& .MuiLinearProgress-bar": { bgcolor: getSuppressionColor(row.suppressionRate, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main) },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <EmptyViralLoadState />
      )}
    </ViralLoadCardShell>
  );
}

function getSuppressionColor(value: number, success: string, warning: string, error: string) {
  if (value >= 95) return success;
  if (value >= 85) return warning;
  return error;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ").format(value);
}
