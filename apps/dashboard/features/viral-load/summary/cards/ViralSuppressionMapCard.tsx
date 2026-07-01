"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import { RankingBarList } from "../../../shared/reporting";
import type { RankingBarItem } from "../../../shared/reporting";
import { adaptSuppressionByProvince } from "../../adapters/summary";
import { getVlSuppressionByProvinceByMonth } from "../../api/summary";
import type { ViralLoadDateInterval } from "../../types/common";
import { getDefaultViralLoadInterval } from "../../types/common";
import type { ViralLoadProvinceSuppression } from "../../types/summary";
import { EmptyViralLoadState, ViralLoadCardShell } from "./ViralLoadCardShell";

export function ViralSuppressionMapCard() {
  const { getToken } = useAuth();
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

  const items = rows.map((row): RankingBarItem => ({
    key: row.province,
    label: row.province,
    level: "province",
    percentage: row.suppressionRate,
    value: row.total,
  }));

  return (
    <ViralLoadCardShell
      cardHeight={430}
      contentHeight={310}
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={setInterval}
      title="Supressão por Província"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
            Ranking por taxa de supressão e total de amostras.
          </Typography>
          <RankingBarList
            colorVariant="warning"
            height={250}
            items={items}
            loading={loading}
            maxVisibleItems={8}
            valueFormatter={(value, item) => `${item.percentage ?? 0}% · ${formatNumber(value)}`}
          />
        </Box>
      ) : (
        <EmptyViralLoadState />
      )}
    </ViralLoadCardShell>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ").format(value);
}
