"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { MainCardSkeleton } from "@repo/design_system/app/molecules/skeletons/MainCardSkeleton";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { VscDebugRestart } from "react-icons/vsc";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { PatientsTable } from "@repo/design_system/app/organisms/report/patients-table";
import { Button } from "@repo/design_system/components/ui/button";
import { Input } from "@repo/design_system/components/ui/input";
import { Label } from "@repo/design_system/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/design_system/components/ui/tabs";
import { useAdminStatus } from "@/lib/vl/admin";
import { formatPeriodPt, formatRangePt, lastYear, type DateRange } from "@repo/design_system/lib/report/dates";
import { exportSheet } from "@repo/design_system/lib/report/export/excel";
import {
  fetchPatients,
  PATIENT_COLUMNS,
  PATIENT_HEADERS,
  patientToRow,
  RESULT_TYPE_LABEL,
  TEST_REASON_LABEL,
  type PatientsPage,
  type ResultType,
  type TestReason,
} from "@/lib/vl/patients";
import { createRequestGate } from "@repo/design_system/lib/report/request-gate";
import { CARD_ID, PER_PAGE_OPTIONS, TITLE } from "./constants";
import { buildSearch, EMPTY_FILTERS, pageSummary, type SearchFilters, type SearchMode, type SubmittedSearch } from "./actions";
import Docs from "./docs";

const SELECT_CLASS = "h-9 w-full rounded-md border bg-transparent px-3 text-sm";

export default function VlPatientsSearch() {
  const status = useAdminStatus();
  const { user } = useUser();
  const { getToken } = useAuth();
  const gate = useRef(createRequestGate());
  const [range, setRange] = useState<DateRange>(lastYear);
  const [mode, setMode] = useState<SearchMode>("name");
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[0]);
  const [result, setResult] = useState<PatientsPage | null>(null);
  const submitted = useRef<SubmittedSearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const set = (key: keyof SearchFilters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const invalidate = useCallback(() => {
    gate.current.next();
    setLoading(false);
  }, []);

  const fetchPage = useCallback(
    async (search: SubmittedSearch, page: number, size: number) => {
      const id = gate.current.next();
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const data = await fetchPatients(search.endpoint, search.params, page, size, token);
        if (gate.current.isCurrent(id)) setResult(data);
      } catch (e) {
        if (gate.current.isCurrent(id)) {
          setError(e instanceof Error ? e.message : "Ocorreu um erro.");
          setResult(null);
        }
      } finally {
        if (gate.current.isCurrent(id)) setLoading(false);
      }
    },
    [getToken],
  );

  // Pesquisar: always builds a fresh search from the current inputs.
  const submit = () => {
    const search = buildSearch(mode, filters, range);
    if ("error" in search) {
      invalidate();
      submitted.current = null;
      setError(search.error);
      setResult(null);
      return;
    }
    submitted.current = search;
    fetchPage(search, 1, perPage);
  };

  // Paging and per-page changes re-use the last submitted search, not the edited inputs.
  const goTo = (page: number, size: number = perPage) => {
    if (submitted.current) fetchPage(submitted.current, page, size);
  };

  const clearResults = useCallback(() => {
    invalidate();
    submitted.current = null;
    setResult(null);
    setError(null);
  }, [invalidate]);

  const subtitle = formatRangePt(range);

  const options = useMemo(
    () => [
      {
        label: "Exportar página para Excel",
        icon: <PiMicrosoftExcelLogoFill size={20} />,
        type: "primary" as const,
        action: () => {
          if (!result?.data.length) return;
          try {
            setExportError(null);
            exportSheet(TITLE, `${subtitle} | ${pageSummary(result)}`, { header: PATIENT_HEADERS, rows: result.data.map(patientToRow) });
          } catch {
            setExportError("Não foi possível exportar para Excel.");
          }
        },
      },
      {
        label: "Reiniciar o relatório",
        icon: <VscDebugRestart size={20} />,
        type: "primary" as const,
        action: () => {
          setRange(lastYear());
          setFilters(EMPTY_FILTERS);
          clearResults();
        },
      },
    ],
    [result, subtitle, clearResults],
  );

  if (status === "unknown") return <MainCardSkeleton sx={{ width: "100%" }} />;
  if (status === "user") {
    return <CardMessage tone="error" message="Acesso restrito a utilizadores com permissão de Administrador." />;
  }

  return (
    <MainCard
      chartId={CARD_ID}
      title={TITLE}
      subtitle={formatPeriodPt(range)}
      reportType="national"
      handleSubmit={(dates: [string, string]) => {
        setRange({ start: dates[0], end: dates[1] });
        clearResults();
      }}
      loading={loading}
      additionalOptions={options}
      documentation={<Docs />}
      user={{ name: user?.fullName ?? "", email: user?.primaryEmailAddress?.emailAddress ?? "" }}
      width="100%"
      height="auto"
    >
      <form
        className="space-y-4 px-4 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Tabs
          value={mode}
          onValueChange={(v) => {
            setMode(v as SearchMode);
            clearResults();
          }}
        >
          {/* Scrolls sideways when the four tabs do not fit (phones). */}
          <TabsList className="max-w-full justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>button]:flex-none">
            <TabsTrigger value="name">Por Nome</TabsTrigger>
            <TabsTrigger value="facility">Por US</TabsTrigger>
            <TabsTrigger value="result">Por Resultado</TabsTrigger>
            <TabsTrigger value="reason">Por Motivo</TabsTrigger>
          </TabsList>
          <TabsContent value="name" className="grid gap-3 pt-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="p-first">Nome</Label>
              <Input id="p-first" value={filters.firstName} onChange={set("firstName")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-surname">Apelido</Label>
              <Input id="p-surname" value={filters.surname} onChange={set("surname")} />
            </div>
          </TabsContent>
          <TabsContent value="facility" className="grid gap-3 pt-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="p-facility">Unidade Sanitária (nome exacto)</Label>
              <Input id="p-facility" value={filters.facility} onChange={set("facility")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-province">Província (opcional)</Label>
              <Input id="p-province" value={filters.province} onChange={set("province")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-district">Distrito (opcional)</Label>
              <Input id="p-district" value={filters.district} onChange={set("district")} />
            </div>
          </TabsContent>
          <TabsContent value="result" className="pt-3 sm:max-w-xs">
            <Label htmlFor="p-result">Resultado</Label>
            <select id="p-result" className={SELECT_CLASS} value={filters.resultType} onChange={set("resultType")}>
              <option value="">Escolha…</option>
              {(Object.keys(RESULT_TYPE_LABEL) as ResultType[]).map((k) => (
                <option key={k} value={k}>{RESULT_TYPE_LABEL[k]}</option>
              ))}
            </select>
          </TabsContent>
          <TabsContent value="reason" className="pt-3 sm:max-w-xs">
            <Label htmlFor="p-reason">Motivo de teste</Label>
            <select id="p-reason" className={SELECT_CLASS} value={filters.testReason} onChange={set("testReason")}>
              <option value="">Escolha…</option>
              {(Object.keys(TEST_REASON_LABEL) as TestReason[]).map((k) => (
                <option key={k} value={k}>{TEST_REASON_LABEL[k]}</option>
              ))}
            </select>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-end gap-3">
          <Button type="submit" disabled={loading}>Pesquisar</Button>
          <div className="space-y-1">
            <Label htmlFor="p-per-page">Por página</Label>
            <select
              id="p-per-page"
              className={SELECT_CLASS}
              value={perPage}
              onChange={(e) => {
                const size = Number(e.target.value);
                setPerPage(size);
                if (result) goTo(1, size);
              }}
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <CardMessage tone="error" message={error} />}
        {exportError && <p className="text-sm text-red-500">{exportError}</p>}

        {result &&
          (result.data.length === 0 ? (
            <CardMessage tone="empty" message="Nenhum paciente encontrado." />
          ) : (
            <div className="space-y-2">
              <PatientsTable rows={result.data} columns={PATIENT_COLUMNS} />
              <div className="flex items-center justify-between text-sm">
                <span>{pageSummary(result)}</span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" disabled={loading || result.page <= 1} onClick={() => goTo(result.page - 1)}>
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || result.page >= result.total_pages}
                    onClick={() => goTo(result.page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </form>
    </MainCard>
  );
}
