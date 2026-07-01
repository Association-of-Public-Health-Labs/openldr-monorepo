"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Box, Grid, Stack, Typography, useTheme } from "@mui/material";
import { Activity, CheckCircle2, Clock3, FlaskConical, PackageCheck, TestTube2, XCircle } from "lucide-react";
import type { MixedLineBarProps } from "@repo/design_system_mui/atoms/charts/apex/MixedLineBar";
import type { SimpleLineProps } from "@repo/design_system_mui/atoms/charts/apex/SimpleLine";
import type { StackedProps } from "@repo/design_system_mui/atoms/charts/apex/Stacked";
import {
  fetchDpiIndicators,
  fetchDpiIndicatorsByProvince,
  fetchDpiNumberOfSamples,
  fetchDpiPositivity,
  fetchDpiRejectedSamplesByMonth,
  fetchDpiSamplesByEquipmentByMonth,
  fetchDpiSamplesPositivity,
  fetchDpiTat,
  fetchDpiTatSamples,
  getLastTwelveMonths,
} from "../api/summary";
import { EQUIPMENT_KEYS } from "../adapters/summary";
import type {
  DpiDateInterval,
  DpiEquipmentMonthly,
  DpiIndicatorSummary,
  DpiMonthlyPositivity,
  DpiMonthlyValue,
  DpiProvinceIndicator,
  DpiSamplesPositivity,
  DpiTatPoint,
  DpiTatSamples,
} from "../types/summary";
import { DpiCardShell, EmptyDpiState } from "./DpiCardShell";

const SimpleLine = dynamic<SimpleLineProps>(
  () => import("@repo/design_system/app/atoms/charts/apex/SimpleLine").then((module) => module.SimpleLine),
  { ssr: false },
);
const MixedLineBar = dynamic<MixedLineBarProps>(
  () => import("@repo/design_system/app/atoms/charts/apex/MixedLineBar").then((module) => module.MixedLineBar),
  { ssr: false },
);
const Stacked = dynamic<StackedProps>(
  () => import("@repo/design_system/app/atoms/charts/apex/Stacked").then((module) => module.Stacked),
  { ssr: false },
);

type AsyncState<T> = {
  data: T;
  error: string | null;
  loading: boolean;
};

function useDpiCardData<T>(
  initialData: T,
  loader: (interval: DpiDateInterval) => Promise<T>,
) {
  const [interval, setInterval] = useState<DpiDateInterval>(() => getLastTwelveMonths());
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    error: null,
    loading: true,
  });

  const load = useCallback(
    async (nextInterval = interval) => {
      setState((current) => ({ ...current, error: null, loading: true }));

      try {
        const data = await loader(nextInterval);
        setState({ data, error: null, loading: false });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível carregar este relatório.";
        setState((current) => ({ ...current, error: message, loading: false }));
      }
    },
    [interval, loader],
  );

  useEffect(() => {
    load(interval);
  }, [interval, load]);

  const handleIntervalChange = useCallback((nextInterval: DpiDateInterval) => {
    setInterval(nextInterval);
  }, []);

  const handleRestart = useCallback(() => {
    setInterval(getLastTwelveMonths());
  }, []);

  return {
    ...state,
    interval,
    handleIntervalChange,
    handleRestart,
  };
}

function numberFormat(value: number) {
  return new Intl.NumberFormat("pt-PT").format(value || 0);
}

function percent(value: number) {
  return `${Math.round(value || 0)}%`;
}

function labelsFromMonth(data: Array<{ monthName: string }>) {
  return data.map((item) => item.monthName?.slice(0, 3) || "N/D");
}

function StatTile({
  color,
  icon,
  label,
  value,
}: {
  color: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        p: 2,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            alignItems: "center",
            bgcolor: color,
            borderRadius: 1,
            color: "#fff",
            display: "flex",
            height: 36,
            justifyContent: "center",
            width: 36,
          }}
        >
          {icon}
        </Box>
        <Box minWidth={0}>
          <Typography color="text.secondary" fontSize={12} fontWeight={800} noWrap>
            {label}
          </Typography>
          <Typography color="text.primary" fontSize={20} fontWeight={900} lineHeight={1.15}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export function DpiMainIndicatorsCard() {
  const loader = useCallback((interval: DpiDateInterval) => fetchDpiIndicators({ interval, labType: "all" }), []);
  const { data, error, handleIntervalChange, handleRestart, interval, loading } = useDpiCardData<DpiIndicatorSummary>(
    { registered: 0, tested: 0, rejected: 0, pending: 0, positive: 0, negative: 0, totalSamples: 0 },
    loader,
  );

  const rejectionRate = data.registered > 0 ? (data.rejected / data.registered) * 100 : 0;

  return (
    <DpiCardShell
      error={error}
      interval={interval}
      loading={loading}
      minHeight={260}
      onIntervalChange={handleIntervalChange}
      onRestart={handleRestart}
      title="Indicadores principais de DPI"
    >
      <Grid container spacing={1.5} sx={{ pt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile color="#009689" icon={<PackageCheck size={19} />} label="Amostras registadas" value={numberFormat(data.registered)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile color="#2563eb" icon={<FlaskConical size={19} />} label="Amostras testadas" value={numberFormat(data.tested)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile color="#dc2626" icon={<XCircle size={19} />} label="Amostras rejeitadas" value={numberFormat(data.rejected)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile color="#f59e0b" icon={<Clock3 size={19} />} label="Pendentes" value={numberFormat(data.pending)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile color="#16a34a" icon={<CheckCircle2 size={19} />} label="Positivas" value={numberFormat(data.positive)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile color="#475569" icon={<Activity size={19} />} label="Taxa de rejeição" value={percent(rejectionRate)} />
        </Grid>
      </Grid>
    </DpiCardShell>
  );
}

export function DpiSamplesByMonthCard() {
  const loader = useCallback((interval: DpiDateInterval) => fetchDpiNumberOfSamples({ interval, labType: "all" }), []);
  const { data, error, handleIntervalChange, handleRestart, interval, loading } = useDpiCardData<DpiMonthlyValue[]>([], loader);
  const total = useMemo(() => data.reduce((sum, item) => sum + item.total, 0), [data]);

  return (
    <DpiCardShell
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={handleIntervalChange}
      onRestart={handleRestart}
      title="Número de amostras por mês"
    >
      <Box sx={{ pt: 2 }}>
        <Typography color="text.secondary" fontSize={12} fontWeight={800}>
          Total no período
        </Typography>
        <Typography color="text.primary" fontSize={28} fontWeight={900} lineHeight={1.2}>
          {numberFormat(total)}
        </Typography>
        {data.length ? (
          <SimpleLine labels={labelsFromMonth(data)} series={[{ name: "Amostras", data: data.map((item) => item.total) }]} height={210} />
        ) : (
          <EmptyDpiState />
        )}
      </Box>
    </DpiCardShell>
  );
}

export function DpiPositivityCard() {
  const loader = useCallback((interval: DpiDateInterval) => fetchDpiPositivity({ interval, labType: "all" }), []);
  const { data, error, handleIntervalChange, handleRestart, interval, loading } = useDpiCardData<DpiMonthlyPositivity[]>([], loader);
  const total = data.reduce((sum, item) => sum + item.total, 0);
  const positives = data.reduce((sum, item) => sum + item.positive, 0);
  const positivity = total > 0 ? (positives / total) * 100 : 0;

  return (
    <DpiCardShell
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={handleIntervalChange}
      onRestart={handleRestart}
      title="Positividade por mês"
    >
      <Box sx={{ pt: 2 }}>
        <Typography color="text.secondary" fontSize={12} fontWeight={800}>
          Positividade no período
        </Typography>
        <Typography color="text.primary" fontSize={28} fontWeight={900} lineHeight={1.2}>
          {percent(positivity)}
        </Typography>
        {data.length ? (
          <MixedLineBar
            height={230}
            labels={labelsFromMonth(data)}
            series={[
              { name: "Amostras testadas", type: "column", data: data.map((item) => item.total) },
              { name: "Positividade (%)", type: "line", data: data.map((item) => item.positivity) },
            ]}
          />
        ) : (
          <EmptyDpiState />
        )}
      </Box>
    </DpiCardShell>
  );
}

export function DpiTatCard() {
  const loader = useCallback((interval: DpiDateInterval) => fetchDpiTat({ interval, labType: "conventional" }), []);
  const { data, error, handleIntervalChange, handleRestart, interval, loading } = useDpiCardData<DpiTatPoint[]>([], loader);

  return (
    <DpiCardShell
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={handleIntervalChange}
      onRestart={handleRestart}
      title="TAT Convencional por mês"
    >
      <Box sx={{ pt: 2 }}>
        {data.length ? (
          <Stacked
            height={260}
            labels={labelsFromMonth(data)}
            series={[
              { name: "Colheita US a recepção no Hub", data: data.map((item) => item.collectionReceiveHub) },
              { name: "Recepção ao registo no Hub", data: data.map((item) => item.receiveHubRegistrationHub) },
              { name: "Registo Hub a recepção Lab", data: data.map((item) => item.registrationHubReceiveLab) },
              { name: "Recepção Lab ao registo Lab", data: data.map((item) => item.receiveLabRegistrationLab) },
              { name: "Registo à análise", data: data.map((item) => item.registrationLabAnalyseLab) },
              { name: "Análise à validação", data: data.map((item) => item.analyseLabValidationLab) },
            ]}
            yLabel="Dias"
          />
        ) : (
          <EmptyDpiState />
        )}
      </Box>
    </DpiCardShell>
  );
}

export function DpiTatSamplesCard() {
  const loader = useCallback((interval: DpiDateInterval) => fetchDpiTatSamples({ interval, labType: "conventional", category: 1 }), []);
  const { data, error, handleIntervalChange, handleRestart, interval, loading } = useDpiCardData<DpiTatSamples[]>([], loader);
  const record = data[0];

  return (
    <DpiCardShell
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={handleIntervalChange}
      onRestart={handleRestart}
      title="Amostras por faixa de TAT"
    >
      <Box sx={{ pt: 2 }}>
        {record ? (
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <StatTile color="#009689" icon={<Clock3 size={19} />} label="< 7 dias" value={numberFormat(record.less7)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatTile color="#2563eb" icon={<Clock3 size={19} />} label="7 a 14 dias" value={numberFormat(record.between7And14)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatTile color="#f59e0b" icon={<Clock3 size={19} />} label="15 a 21 dias" value={numberFormat(record.between15And21)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatTile color="#dc2626" icon={<Clock3 size={19} />} label="> 21 dias" value={numberFormat(record.greater21)} />
            </Grid>
          </Grid>
        ) : (
          <EmptyDpiState />
        )}
      </Box>
    </DpiCardShell>
  );
}

export function DpiRejectedSamplesCard() {
  const loader = useCallback((interval: DpiDateInterval) => fetchDpiRejectedSamplesByMonth({ interval, labType: "all" }), []);
  const { data, error, handleIntervalChange, handleRestart, interval, loading } = useDpiCardData<DpiMonthlyValue[]>([], loader);

  return (
    <DpiCardShell
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={handleIntervalChange}
      onRestart={handleRestart}
      title="Amostras rejeitadas por mês"
    >
      <Box sx={{ pt: 2 }}>
        {data.length ? (
          <SimpleLine labels={labelsFromMonth(data)} series={[{ name: "Rejeitadas", data: data.map((item) => item.total) }]} height={240} colors={["#dc2626"]} />
        ) : (
          <EmptyDpiState />
        )}
      </Box>
    </DpiCardShell>
  );
}

export function DpiEquipmentMonthlyCard() {
  const loader = useCallback((interval: DpiDateInterval) => fetchDpiSamplesByEquipmentByMonth({ interval, labType: "all" }), []);
  const { data, error, handleIntervalChange, handleRestart, interval, loading } = useDpiCardData<DpiEquipmentMonthly[]>([], loader);

  return (
    <DpiCardShell
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={handleIntervalChange}
      onRestart={handleRestart}
      title="Amostras por equipamento"
    >
      <Box sx={{ pt: 2 }}>
        {data.length ? (
          <Stacked
            height={260}
            labels={labelsFromMonth(data)}
            series={EQUIPMENT_KEYS.map((equipment) => ({
              name: equipment,
              data: data.map((item) => item[equipment]),
            }))}
          />
        ) : (
          <EmptyDpiState />
        )}
      </Box>
    </DpiCardShell>
  );
}

export function DpiProvinceIndicatorsCard() {
  const theme = useTheme();
  const loader = useCallback((interval: DpiDateInterval) => fetchDpiIndicatorsByProvince({ interval, labType: "all" }), []);
  const { data, error, handleIntervalChange, handleRestart, interval, loading } = useDpiCardData<DpiProvinceIndicator[]>([], loader);

  return (
    <DpiCardShell
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={handleIntervalChange}
      onRestart={handleRestart}
      title="Indicadores por província"
    >
      <Box sx={{ pt: 2 }}>
        {data.length ? (
          <Stacked
            colors={[theme.palette.primary.main, theme.palette.success.main]}
            height={260}
            labels={data.map((item) => item.province)}
            series={[
              { name: "Convencional", data: data.map((item) => item.conventional) },
              { name: "POC", data: data.map((item) => item.poc) },
            ]}
          />
        ) : (
          <EmptyDpiState />
        )}
      </Box>
    </DpiCardShell>
  );
}

export function DpiSamplesPositivityCard() {
  const loader = useCallback((interval: DpiDateInterval) => fetchDpiSamplesPositivity({ interval, labType: "all" }), []);
  const { data, error, handleIntervalChange, handleRestart, interval, loading } = useDpiCardData<DpiSamplesPositivity>(
    { total: 0, positive: 0, negative: 0, femalePositive: 0, malePositive: 0, femaleNegative: 0, maleNegative: 0 },
    loader,
  );

  return (
    <DpiCardShell
      error={error}
      interval={interval}
      loading={loading}
      onIntervalChange={handleIntervalChange}
      onRestart={handleRestart}
      title="Positividade por sexo"
    >
      <Grid container spacing={1.5} sx={{ pt: 2 }}>
        <Grid item xs={12} sm={6}>
          <StatTile color="#16a34a" icon={<TestTube2 size={19} />} label="Feminino positivo" value={numberFormat(data.femalePositive)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatTile color="#2563eb" icon={<TestTube2 size={19} />} label="Masculino positivo" value={numberFormat(data.malePositive)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatTile color="#64748b" icon={<TestTube2 size={19} />} label="Feminino negativo" value={numberFormat(data.femaleNegative)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatTile color="#475569" icon={<TestTube2 size={19} />} label="Masculino negativo" value={numberFormat(data.maleNegative)} />
        </Grid>
      </Grid>
    </DpiCardShell>
  );
}
