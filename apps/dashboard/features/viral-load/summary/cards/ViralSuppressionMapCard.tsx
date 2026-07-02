"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import {
  GeoDrillDownDialog,
  RankingBarList,
  formatReportIntervalDates,
  type DemographicDimension,
  type GeoDrillDownContext,
  type GeoDrillDownLevel,
  type GeoDrillDownRow,
  type GeoDrillDownTab,
  type PatientDrillDownRow,
  type RankingBarItem,
  type ReportActionDateRange,
} from "../../../shared/reporting";
import { adaptSuppressionByProvince } from "../../adapters/summary";
import {
  getViralLoadDemographicsByContext,
  getViralLoadDistrictsByProvince,
  getViralLoadFacilitiesByDistrict,
  getViralLoadFacilitySummary,
  getViralLoadPatientsByFacility,
} from "../../api/drilldown";
import { getVlSuppressionByProvinceByMonth } from "../../api/summary";
import type { ViralLoadDateInterval } from "../../types/common";
import { formatViralLoadInterval, getDefaultViralLoadInterval } from "../../types/common";
import type { ViralLoadProvinceSuppression } from "../../types/summary";
import { EmptyViralLoadState, ViralLoadCardShell } from "./ViralLoadCardShell";

const demographicTabs: GeoDrillDownTab[] = [
  { label: "Resumo", value: "none" },
  { label: "Sexo", value: "gender" },
  { label: "Faixa etária", value: "age" },
  { label: "Resultado", value: "result" },
  { label: "Motivo de teste", value: "testReason" },
  { label: "Gravidez", value: "pregnancy" },
  { label: "Lactação", value: "breastfeeding" },
  { label: "Pacientes", value: "patients" },
];

export function ViralSuppressionMapCard() {
  const { getToken } = useAuth();
  const [interval, setInterval] = useState<ViralLoadDateInterval>(() => getDefaultViralLoadInterval());
  const [rows, setRows] = useState<ViralLoadProvinceSuppression[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<ViralLoadProvinceSuppression | null>(null);
  const [geoOpen, setGeoOpen] = useState(false);
  const [geoLevel, setGeoLevel] = useState<GeoDrillDownLevel>("province");
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [selectedFacility, setSelectedFacility] = useState<string | undefined>();
  const [selectedDimension, setSelectedDimension] = useState<DemographicDimension | "patients">("none");
  const [geoRows, setGeoRows] = useState<GeoDrillDownRow[]>([]);
  const [patientRows, setPatientRows] = useState<PatientDrillDownRow[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
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

  const dateRange: ReportActionDateRange = useMemo(
    () => ({
      displayLabel: formatViralLoadInterval(interval),
      endDateIso: interval.endDate,
      intervalDates: formatReportIntervalDates(interval),
      startDateIso: interval.startDate,
    }),
    [interval],
  );

  const context: GeoDrillDownContext = {
    cardId: "viral-suppression-by-province",
    currentLevel: geoLevel,
    dateRange,
    demographicDimension: selectedDimension === "patients" ? "none" : selectedDimension,
    district: selectedDistrict,
    facility: selectedFacility,
    metric: "viral-suppression",
    module: "viral-load",
    page: "summary",
    province: selectedProvince?.province,
    selectedLabel: selectedFacility || selectedDistrict || selectedProvince?.province,
    selectedValue: selectedProvince?.suppressionRate,
  };

  const items = rows.map((row): RankingBarItem => ({
    key: row.province,
    label: row.province,
    level: "province",
    percentage: row.suppressionRate,
    value: row.total,
  }));

  const loadGeoRows = useCallback(async () => {
    if (!geoOpen || !selectedProvince) return;

    setGeoLoading(true);
    setGeoError(null);
    setPatientRows([]);

    try {
      const token = await getToken();
      if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");

      const baseOptions = {
        demographicDimension: selectedDimension === "patients" ? "none" : selectedDimension,
        district: selectedDistrict,
        facility: selectedFacility,
        interval,
        level: geoLevel,
        province: selectedProvince.province,
        token,
      };

      if (selectedDimension === "patients" || geoLevel === "patient") {
        const result = await getViralLoadPatientsByFacility(baseOptions);
        setPatientRows(result.patients);
        setGeoError(result.error || null);
        setGeoRows([]);
        return;
      }

      if (isUnsupportedDimension(selectedDimension)) {
        setGeoRows([]);
        return;
      }

      const result =
        selectedDimension !== "none"
          ? await getViralLoadDemographicsByContext(baseOptions)
          : geoLevel === "province"
            ? await getViralLoadDistrictsByProvince(baseOptions)
            : geoLevel === "district"
              ? await getViralLoadFacilitiesByDistrict(baseOptions)
              : await getViralLoadFacilitySummary(baseOptions);

      setGeoRows(result.rows);
    } catch (cause) {
      if (process.env.NODE_ENV === "development") console.error(cause);
      setGeoRows([]);
      setGeoError(cause instanceof Error ? cause.message : "Não foi possível carregar o detalhe selecionado.");
    } finally {
      setGeoLoading(false);
    }
  }, [geoLevel, geoOpen, getToken, interval, selectedDimension, selectedDistrict, selectedFacility, selectedProvince]);

  useEffect(() => {
    loadGeoRows();
  }, [loadGeoRows]);

  const openGeoDrillDown = (province?: ViralLoadProvinceSuppression | null) => {
    const nextProvince = province ?? selectedProvince;
    if (!nextProvince) {
      setGeoOpen(true);
      return;
    }

    setSelectedProvince(nextProvince);
    setSelectedDistrict(undefined);
    setSelectedFacility(undefined);
    setGeoLevel("province");
    setSelectedDimension("none");
    setGeoOpen(true);
  };

  const handleItemClick = (item: RankingBarItem) => {
    const province = rows.find((row) => row.province === item.key) ?? null;
    openGeoDrillDown(province);
  };

  const handleGeoRowClick = (row: GeoDrillDownRow) => {
    if (selectedDimension !== "none") return;

    if (geoLevel === "province") {
      setSelectedDistrict(row.label);
      setSelectedFacility(undefined);
      setGeoLevel("district");
      return;
    }

    if (geoLevel === "district") {
      setSelectedFacility(row.label);
      setGeoLevel("facility");
    }
  };

  const handleBack = () => {
    if (selectedDimension === "patients" || geoLevel === "patient") {
      setSelectedDimension("none");
      setGeoLevel("facility");
      return;
    }
    if (geoLevel === "facility") {
      setSelectedFacility(undefined);
      setGeoLevel("district");
      return;
    }
    if (geoLevel === "district") {
      setSelectedDistrict(undefined);
      setGeoLevel("province");
      return;
    }
    setGeoOpen(false);
  };

  const handleBreadcrumbNavigate = (level: Exclude<GeoDrillDownLevel, "patient">) => {
    setSelectedDimension("none");
    if (level === "province") {
      setSelectedDistrict(undefined);
      setSelectedFacility(undefined);
      setGeoLevel("province");
    } else if (level === "district") {
      setSelectedFacility(undefined);
      setGeoLevel("district");
    } else {
      setGeoLevel("facility");
    }
  };

  const handleDemographicChange = (dimension: DemographicDimension | "patients") => {
    setSelectedDimension(dimension);
    if (dimension === "patients") setGeoLevel("patient");
    else if (geoLevel === "patient") setGeoLevel(selectedFacility ? "facility" : selectedDistrict ? "district" : "province");
  };

  return (
    <>
      <ViralLoadCardShell
        cardHeight={430}
        contentHeight={310}
        error={error}
        interval={interval}
        loading={loading}
        onIntervalChange={setInterval}
        reportActions={{
          cardId: "viral-suppression-by-province",
          cardTitle: "Supressão por Província",
          dateRange,
          documentation: {
            title: "Supressão por Província",
            description: "Apresenta a taxa de supressão viral por província no período selecionado.",
            dataSource: "API OpenLDR.",
            endpoint: "/hiv/vl/summary/suppression_by_province_by_month/ e /hiv/vl/facilities/*",
            interpretation: "Províncias com percentagens mais altas têm maior proporção de resultados suprimidos.",
            limitations: "Pacientes só são carregados após ação explícita e quando o endpoint retorna dados.",
          },
          drillDown: {
            cardId: "viral-suppression-by-province",
            chartType: "ranking",
            dateRange,
            module: "viral-load",
            page: "summary",
            selectedDimension: "province",
            selectedLabel: selectedProvince?.province,
            selectedValue: selectedProvince?.suppressionRate,
          },
          enableDateFilter: true,
          enableFeedback: true,
          module: "viral-load",
          onDrillDownOpen: () => openGeoDrillDown(),
          page: "summary",
        }}
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
              onItemClick={handleItemClick}
              valueFormatter={(value, item) => `${item.percentage ?? 0}% · ${formatNumber(value)}`}
            />
          </Box>
        ) : (
          <EmptyViralLoadState />
        )}
      </ViralLoadCardShell>
      <GeoDrillDownDialog
        context={context}
        demographicTabs={demographicTabs}
        emptyLabel={getEmptyLabel(selectedDimension)}
        error={geoError}
        loading={geoLoading}
        onBack={handleBack}
        onClose={() => setGeoOpen(false)}
        onDemographicChange={handleDemographicChange}
        onNavigateBreadcrumb={handleBreadcrumbNavigate}
        onOpenPatients={() => handleDemographicChange("patients")}
        onRowClick={handleGeoRowClick}
        open={geoOpen}
        patients={patientRows}
        rows={geoRows}
        selectedTab={selectedDimension}
        showPatientsButton={Boolean(selectedFacility && selectedDimension !== "patients")}
        summary={buildSummary(selectedProvince)}
        title="Detalhes — Supressão por Província"
      />
    </>
  );
}

function buildSummary(province: ViralLoadProvinceSuppression | null) {
  if (!province) return [{ label: "Estado", value: "Selecione uma província no ranking para ver o detalhe." }];
  return [
    { label: "Província", value: province.province },
    { label: "Taxa de supressão", value: `${formatNumber(province.suppressionRate)}%` },
    { label: "Total com resultado", value: formatNumber(province.total) },
    { label: "Suprimidos", value: formatNumber(province.suppressed) },
    { label: "Não suprimidos", value: formatNumber(province.notSuppressed) },
  ];
}

function getEmptyLabel(dimension: DemographicDimension | "patients") {
  if (isUnsupportedDimension(dimension)) return "Esta dimensão será ligada quando existir endpoint compatível para o contexto selecionado.";
  if (dimension === "patients") return "Os pacientes aparecem apenas quando o endpoint retorna dados para a unidade sanitária selecionada.";
  return "Sem dados disponíveis para este detalhe.";
}

function isUnsupportedDimension(dimension: DemographicDimension | "patients") {
  return dimension === "result" || dimension === "pregnancy" || dimension === "breastfeeding";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value || 0);
}
