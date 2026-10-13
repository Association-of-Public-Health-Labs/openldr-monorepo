"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { MainCardSkeleton } from "@repo/design_system/app/molecules/skeletons/MainCardSkeleton";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { VscDebugRestart } from "react-icons/vsc";
import { CardMessage } from "@/components/card-message";
import { PatientsTable } from "@/components/patients-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStatus } from "@/lib/vl/admin";
import { formatRangePt, lastYear, type DateRange } from "@/lib/vl/dates";
import { exportSheet } from "@/lib/vl/export/excel";
import {
  fetchPatients,
  PATIENT_HEADERS,
  patientToRow,
  RESULT_TYPE_LABEL,
  TEST_REASON_LABEL,
  type PatientsPage,
  type ResultType,
  type TestReason,
} from "@/lib/vl/patients";
import { createRequestGate } from "@/lib/vl/request-gate";
import { CARD_ID, PER_PAGE_OPTIONS, TITLE } from "./constants";
import { buildSearch, EMPTY_FILTERS, pageSummary, type SearchFilters, type SearchMode } from "./actions";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof SearchFilters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const run = useCallback(
    async (page: number, size: number = perPage) => {
      const search = buildSearch(mode, filters, range);
      if ("error" in search) {
        setError(search.error);
        setResult(null);
        return;
      }
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
    [mode, filters, range, perPage, getToken],
  );

  const subtitle = formatRangePt(range);

  const options = useMemo(
    () => [
      {
        label: "Exportar para Excel",
        icon: <PiMicrosoftExcelLogoFill size={20} />,
        type: "primary" as const,
        action: () => {
          if (result?.data.length) {
            exportSheet(TITLE, `${subtitle} | ${pageSummary(result)}`, { header: PATIENT_HEADERS, rows: result.data.map(patientToRow) });
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
          setResult(null);
          setError(null);
        },
      },
    ],
    [result, subtitle],
  );

  if (status === "unknown") return <MainCardSkeleton sx={{ width: "100%" }} />;
  if (status === "user") {
    return <CardMessage tone="error" message="Acesso restrito a utilizadores com permissão de Administrador." />;
  }

  return (
    <MainCard
      chartId={CARD_ID}
      title={TITLE}
      subtitle={subtitle}
      reportType="national"
      handleSubmit={(dates: [string, string]) => setRange({ start: dates[0], end: dates[1] })}
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
          run(1);
        }}
      >
        <Tabs
          value={mode}
          onValueChange={(v) => {
            setMode(v as SearchMode);
            setResult(null);
            setError(null);
          }}
        >
          <TabsList>
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
                if (result) run(1, size);
              }}
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <CardMessage tone="error" message={error} />}

        {result &&
          (result.data.length === 0 ? (
            <CardMessage tone="empty" message="Nenhum paciente encontrado." />
          ) : (
            <div className="space-y-2">
              <PatientsTable rows={result.data} />
              <div className="flex items-center justify-between text-sm">
                <span>{pageSummary(result)}</span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" disabled={loading || result.page <= 1} onClick={() => run(result.page - 1)}>
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || result.page >= result.total_pages}
                    onClick={() => run(result.page + 1)}
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
