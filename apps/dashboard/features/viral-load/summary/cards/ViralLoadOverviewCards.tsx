"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Activity,
  AlertTriangle,
  Clock3,
  FlaskConical,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ReportErrorState, ReportGrid, SummaryMetricCard } from "../../../shared/reporting";
import { getVlHeaderIndicators, getVlTatByMonth } from "../../api/summary";
import { adaptViralLoadOverview } from "../../adapters/summary";
import type { ViralLoadDateInterval } from "../../types/common";
import { getDefaultViralLoadInterval } from "../../types/common";
import type { ViralLoadOverview } from "../../types/summary";

type MetricCardConfig = {
  color: "error" | "info" | "primary" | "secondary" | "success" | "warning";
  icon: ReactNode;
  key: Exclude<keyof ViralLoadOverview, "periodLabel">;
  label: string;
  suffix?: string;
};

const metricCards: MetricCardConfig[] = [
  {
    color: "success",
    icon: <FlaskConical size={18} />,
    key: "samplesReceived",
    label: "Amostras registadas",
  },
  {
    color: "info",
    icon: <Activity size={18} />,
    key: "samplesTested",
    label: "Amostras testadas",
  },
  {
    color: "success",
    icon: <TrendingUp size={18} />,
    key: "suppressionRate",
    label: "Supressão viral",
    suffix: "%",
  },
  {
    color: "warning",
    icon: <TrendingDown size={18} />,
    key: "notSuppressed",
    label: "Não suprimidos",
  },
  {
    color: "secondary",
    icon: <Clock3 size={18} />,
    key: "tatAvg",
    label: "TAT médio",
    suffix: " dias",
  },
  {
    color: "error",
    icon: <AlertTriangle size={18} />,
    key: "rejected",
    label: "Rejeições",
  },
];

export function ViralLoadOverviewCards() {
  const { getToken } = useAuth();
  const [interval] = useState<ViralLoadDateInterval>(() => getDefaultViralLoadInterval());
  const [data, setData] = useState<ViralLoadOverview | null>(null);
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

        const [headerResponse, tatRows] = await Promise.all([
          getVlHeaderIndicators({ interval, token }),
          getVlTatByMonth({ interval, token }),
        ]);
        const header = Array.isArray(headerResponse) ? headerResponse[0] : headerResponse;

        if (alive) setData(adaptViralLoadOverview(header, tatRows, interval));
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : "Não foi possível carregar os indicadores.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [getToken, interval]);

  if (error) {
    return <ReportErrorState>{error}</ReportErrorState>;
  }

  return (
    <ReportGrid
      columns={{
        lg: "repeat(3, minmax(0, 1fr))",
        sm: "repeat(2, minmax(0, 1fr))",
        xl: "repeat(3, minmax(0, 1fr))",
        xs: "1fr",
      }}
    >
      {metricCards.map((card) => {
        const value = data ? data[card.key] : 0;

        return (
          <SummaryMetricCard
            color={card.color}
            icon={card.icon}
            key={card.key}
            label={card.label}
            loading={loading}
            periodLabel={data?.periodLabel}
            suffix={card.suffix}
            value={formatNumber(value)}
          />
        );
      })}
    </ReportGrid>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value);
}
