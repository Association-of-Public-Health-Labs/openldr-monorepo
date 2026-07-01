"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { Alert, Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { adaptSamplesHistory } from "../../adapters/summary";
import { getVlSamplesHistory, getVlViralSuppressionByMonth } from "../../api/summary";
import type { ViralLoadDateInterval } from "../../types/common";
import { getDefaultViralLoadInterval } from "../../types/common";
import type { ViralLoadSamplesHistory } from "../../types/summary";
import { EmptyViralLoadState, ViralLoadCardShell } from "./ViralLoadCardShell";

export function ViralLoadSamplesHistoryCard() {
  const { getToken } = useAuth();
  const [interval, setInterval] = useState<ViralLoadDateInterval>(() => getDefaultViralLoadInterval());
  const [rows, setRows] = useState<ViralLoadSamplesHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        setNotice(null);
        const token = await getToken();
        if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
        const [historyResult, suppressionResult] = await Promise.allSettled([
          getVlSamplesHistory({ interval, token }),
          getVlViralSuppressionByMonth({ interval, token }),
        ]);

        if (historyResult.status === "rejected") {
          throw historyResult.reason;
        }

        if (suppressionResult.status === "rejected" && alive) {
          setNotice("Taxa de supressão indisponível para este período; o histórico mostra apenas volume de amostras.");
        }

        if (alive) {
          setRows(
            adaptSamplesHistory(
              historyResult.value,
              suppressionResult.status === "fulfilled" ? suppressionResult.value : [],
            ),
          );
        }
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : "Não foi possível carregar o histórico.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [getToken, interval]);

  const visibleRows = rows.slice(-12);

  return (
    <ViralLoadCardShell
      cardHeight={440}
      contentHeight={320}
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={setInterval}
      title="Histórico de Amostras"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, minWidth: 0 }}>
          {notice && (
            <Alert severity="info" sx={{ mb: 1.5 }}>
              {notice}
            </Alert>
          )}
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.25 }}>
            Amostras registadas, testadas e pendentes no período selecionado.
          </Typography>
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              overflow: "auto",
              pr: 0.5,
              scrollbarColor: "rgba(120, 120, 120, 0.45) transparent",
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": {
                height: 8,
                width: 7,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(120, 120, 120, 0.38)",
                borderRadius: 999,
              },
            }}
          >
            <Table size="small" stickyHeader sx={{ minWidth: 620 }}>
              <TableHead>
                <TableRow>
                  <HistoryHeadCell>Mês</HistoryHeadCell>
                  <HistoryHeadCell align="right">Registadas</HistoryHeadCell>
                  <HistoryHeadCell align="right">Testadas</HistoryHeadCell>
                  <HistoryHeadCell align="right">Pendentes</HistoryHeadCell>
                  <HistoryHeadCell align="right">Supressão</HistoryHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.monthKey} hover>
                    <HistoryCell>{row.month}</HistoryCell>
                    <HistoryCell align="right">{formatNumber(row.received)}</HistoryCell>
                    <HistoryCell align="right">{formatNumber(row.tested)}</HistoryCell>
                    <HistoryCell align="right">{formatNumber(row.pending)}</HistoryCell>
                    <HistoryCell align="right">{row.suppressionRate ? `${row.suppressionRate}%` : "-"}</HistoryCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      ) : (
        <EmptyViralLoadState />
      )}
    </ViralLoadCardShell>
  );
}

function HistoryHeadCell({ children, align }: { align?: "left" | "right"; children: ReactNode }) {
  return (
    <TableCell
      align={align}
      sx={{
        bgcolor: "background.paper",
        borderColor: "divider",
        color: "success.main",
        fontSize: 12,
        fontWeight: 800,
        py: 1.05,
      }}
    >
      {children}
    </TableCell>
  );
}

function HistoryCell({ children, align }: { align?: "left" | "right"; children: ReactNode }) {
  return (
    <TableCell align={align} sx={{ borderColor: "divider", fontSize: 12.5, fontWeight: 600, py: 0.9 }}>
      {children}
    </TableCell>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ").format(value);
}
