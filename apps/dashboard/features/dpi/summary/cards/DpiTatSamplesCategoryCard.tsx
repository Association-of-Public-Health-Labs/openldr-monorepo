"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, MenuItem, Select, Typography } from "@mui/material";
import { REPORT_CARD_HEIGHTS, REPORT_CONTENT_HEIGHTS, ReportCardShell, ReportEmptyState } from "../../../shared/reporting";
import { fetchDpiTatSamples, formatDpiDateInterval, getLastTwelveMonths } from "../../api/summary";
import type { DpiDateInterval, DpiTatSamples } from "../../types/summary";
import { formatNumber } from "./DpiSummaryCardUtils";

const tatCategories = [
  { label: "Colheita na US a Recepção no Hub", value: 1 },
  { label: "Recepção no Hub a Registo no Hub", value: 2 },
  { label: "Registo no Hub a Recepção no Lab", value: 3 },
  { label: "Recepção no Lab a Registo no Lab", value: 4 },
  { label: "Registo no Lab a Análise", value: 5 },
  { label: "Análise a Validação", value: 6 },
];

export function DpiTatSamplesCategoryCard() {
  const { getToken } = useAuth();
  const [category, setCategory] = useState(1);
  const [interval] = useState<DpiDateInterval>(() => getLastTwelveMonths());
  const [data, setData] = useState<DpiTatSamples[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
      const response = await fetchDpiTatSamples({ category, interval, labType: "conventional", token });
      setData(response);
    } catch (cause) {
      if (cause instanceof Error && cause.message === "Sessão expirada. Inicie sessão novamente.") {
        setError(cause.message);
      } else {
        setError("Não foi possível carregar o relatório TRL.");
      }
    } finally {
      setLoading(false);
    }
  }, [category, getToken, interval]);

  useEffect(() => {
    let alive = true;
    load().finally(() => {
      if (!alive) return;
    });
    return () => {
      alive = false;
    };
  }, [load]);

  const record = data[0];

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={formatDpiDateInterval(interval)}
      title="TRL - Colheita na US a Recepção no Hub"
    >
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 1.6, minHeight: 0 }}>
        <Select
          fullWidth
          onChange={(event) => setCategory(Number(event.target.value))}
          size="small"
          value={category}
          sx={{ maxWidth: 420 }}
        >
          {tatCategories.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        {record ? (
          <Box
            sx={{
              display: "grid",
              gap: 1.25,
              gridTemplateColumns: { sm: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
              minWidth: 0,
            }}
          >
            <TatTile label="< 7 dias" tone="success" value={record.less7} />
            <TatTile label="7 a 14 dias" tone="info" value={record.between7And14} />
            <TatTile label="15 a 21 dias" tone="warning" value={record.between15And21} />
            <TatTile label="> 21 dias" tone="error" value={record.greater21} />
          </Box>
        ) : (
          <ReportEmptyState minHeight={REPORT_CONTENT_HEIGHTS.compact} />
        )}
      </Box>
    </ReportCardShell>
  );
}

function TatTile({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "error" | "info" | "success" | "warning";
  value: number;
}) {
  const color = `${tone}.main`;
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        p: 1.5,
      }}
    >
      <Typography color="text.secondary" fontSize={12} fontWeight={800}>
        {label}
      </Typography>
      <Typography color={color} fontSize={24} fontWeight={900} lineHeight={1.15}>
        {formatNumber(value)}
      </Typography>
    </Box>
  );
}
