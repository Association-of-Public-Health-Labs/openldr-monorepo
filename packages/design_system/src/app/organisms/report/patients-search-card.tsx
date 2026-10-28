"use client";

import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { MainCard } from "../../../app/organisms/cards/MainCard";
import { MainCardSkeleton } from "../../../app/molecules/skeletons/MainCardSkeleton";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { VscDebugRestart } from "react-icons/vsc";
import { CardMessage } from "./card-message";
import { PatientsTable } from "./patients-table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useReportServices } from "../../../hooks/report/report-context";
import { formatPeriodPt, formatRangePt, lastYear, type DateRange } from "../../../lib/report/dates";
import { exportSheet, type Cell } from "../../../lib/report/export/excel";
import { MAX_PER_PAGE, type PatientColumn, type PatientRecord, type PatientsPage } from "../../../lib/report/patients";
import type { Params } from "../../../lib/report/params";
import { createRequestGate } from "../../../lib/report/request-gate";
import {
  createSearchSession,
  DEFAULT_PER_PAGE_OPTIONS,
  initialValues,
  modeLayout,
  pageSummary,
  searchGate,
  type Field,
  type FieldValues,
  type SearchMode,
  type SubmittedSearch,
} from "../../../lib/report/patients-search";

const SELECT_CLASS = "h-9 w-full rounded-md border bg-transparent px-3 text-sm";

export type PatientsSearchCardProps<Row extends PatientRecord = PatientRecord> = {
  cardId: string;
  title: string;
  documentation: React.ReactNode;
  /** One tab per mode, in order; the first is selected. Field keys are shared across modes. */
  modes: SearchMode[];
  columns: PatientColumn[];
  fetchPage: (endpoint: string, params: Params, page: number, perPage: number, token: string | null) => Promise<PatientsPage<Row>>;
  toSheetRow: (row: Row) => Cell[];
  sheetHeaders: string[];
  perPageOptions?: number[];
};

function FieldInput({ field, value, onChange }: { field: Field; value: string; onChange: (value: string) => void }) {
  const id = `p-${field.key}`;
  if (field.kind === "text") return <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />;
  return (
    <select id={id} className={SELECT_CLASS} value={value} onChange={(e) => onChange(e.target.value)}>
      {field.placeholder !== undefined && <option value="">{field.placeholder}</option>}
      {field.options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/** Admin-only patient search: tabs of search modes, a paged table and the page's Excel. */
export function PatientsSearchCard<Row extends PatientRecord = PatientRecord>({
  cardId,
  title,
  documentation,
  modes,
  columns,
  fetchPage: fetchPatientsPage,
  toSheetRow,
  sheetHeaders,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
}: PatientsSearchCardProps<Row>) {
  const { getToken, user, adminStatus } = useReportServices();
  const gate = useRef(createRequestGate());
  const session = useRef(createSearchSession());
  const [range, setRange] = useState<DateRange>(lastYear);
  const [modeId, setModeId] = useState(modes[0]!.id);
  const [values, setValues] = useState<FieldValues>(() => initialValues(modes));
  const [perPage, setPerPage] = useState(perPageOptions[0]!);
  const [result, setResult] = useState<PatientsPage<Row> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

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
        const data = await fetchPatientsPage(search.endpoint, search.params, page, Math.min(size, MAX_PER_PAGE), token);
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
    [getToken, fetchPatientsPage],
  );

  // Pesquisar: always builds a fresh search from the current inputs.
  const submit = () => {
    const mode = modes.find((m) => m.id === modeId) ?? modes[0]!;
    const outcome = session.current.submit(adminStatus, mode, values, range);
    // Unreachable today (the form renders only for admins); kept so a non-admin can never send a search.
    if (outcome.kind === "blocked") return;
    if (outcome.kind === "error") {
      invalidate();
      setError(outcome.error);
      setResult(null);
      return;
    }
    fetchPage(outcome.search, 1, perPage);
  };

  // Paging and per-page changes re-use the last submitted search, not the edited inputs.
  const goTo = (page: number, size: number = perPage) => {
    const last = session.current.last();
    if (last) fetchPage(last, page, size);
  };

  const clearResults = useCallback(() => {
    invalidate();
    session.current.clear();
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
            exportSheet(title, `${subtitle} | ${pageSummary(result)}`, { header: sheetHeaders, rows: result.data.map(toSheetRow) });
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
          setValues(initialValues(modes));
          clearResults();
        },
      },
    ],
    [result, subtitle, clearResults, title, sheetHeaders, toSheetRow, modes],
  );

  const access = searchGate(adminStatus);
  if (access === "loading") return <MainCardSkeleton sx={{ width: "100%" }} />;
  if (access === "denied") {
    return <CardMessage tone="error" message="Acesso restrito a utilizadores com permissão de Administrador." />;
  }

  return (
    <MainCard
      chartId={cardId}
      title={title}
      subtitle={formatPeriodPt(range)}
      reportType="national"
      handleSubmit={(dates: [string, string]) => {
        setRange({ start: dates[0], end: dates[1] });
        clearResults();
      }}
      loading={loading}
      additionalOptions={options}
      documentation={documentation}
      user={user}
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
          value={modeId}
          onValueChange={(v) => {
            setModeId(v);
            clearResults();
          }}
        >
          {/* Scrolls sideways when the tabs do not fit (phones). */}
          <TabsList className="max-w-full justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>button]:flex-none">
            {modes.map((m) => (
              <TabsTrigger key={m.id} value={m.id}>{m.label}</TabsTrigger>
            ))}
          </TabsList>
          {modes.map((m) => {
            const layout = modeLayout(m.fields);
            return (
              <TabsContent key={m.id} value={m.id} className={layout.className}>
                {m.fields.map((f) => {
                  const label = <Label htmlFor={`p-${f.key}`}>{f.label}</Label>;
                  const input = (
                    <FieldInput field={f} value={values[f.key] ?? ""} onChange={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))} />
                  );
                  return layout.wrap ? (
                    <div key={f.key} className="space-y-1">
                      {label}
                      {input}
                    </div>
                  ) : (
                    <Fragment key={f.key}>
                      {label}
                      {input}
                    </Fragment>
                  );
                })}
              </TabsContent>
            );
          })}
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
              {perPageOptions.map((n) => (
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
              <PatientsTable rows={result.data} columns={columns} />
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
