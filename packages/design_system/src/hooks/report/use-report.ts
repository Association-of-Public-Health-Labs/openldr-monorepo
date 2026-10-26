"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRequestGate, type RequestGate } from "../../lib/report/request-gate";
import { formatPeriodPt, formatRangePt, lastYear, type DateRange } from "../../lib/report/dates";
import { useReportServices } from "./report-context";

export type ReportState<T> = { data: T | null; loading: boolean; error: string | null; retry: () => void };

/** Applies a result only if no newer request started since (pure). */
export function runLatest<T>(gate: RequestGate, id: number, result: T, apply: (r: T) => void): void {
  if (gate.isCurrent(id)) apply(result);
}

/** Loads data whenever deps change. Only the latest request may update state (Review Focus 1). */
export function useReport<T>(load: (token: string | null) => Promise<T>, deps: unknown[]): ReportState<T> {
  const { getToken } = useReportServices();
  const gate = useRef(createRequestGate());
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const id = gate.current.next();
    setState((prev) => ({ ...prev, loading: true, error: null }));
    (async () => {
      try {
        const token = await getToken();
        const data = await load(token);
        runLatest(gate.current, id, data, (d) => setState({ data: d, loading: false, error: null }));
      } catch (error) {
        runLatest(gate.current, id, error, (e) =>
          setState({ data: null, loading: false, error: e instanceof Error ? e.message : "Ocorreu um erro." }),
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}

/** Date-range card (reportType "national"). */
export function useRangeReport<T>(
  load: (range: DateRange, token: string | null) => Promise<T>,
  initial: () => DateRange = lastYear,
) {
  const [range, setRange] = useState<DateRange>(initial);
  const report = useReport((token) => load(range, token), [range]);
  return {
    ...report,
    range,
    subtitle: formatPeriodPt(range),
    exportSubtitle: formatRangePt(range),
    onSubmit: (dates: [string, string]) => setRange({ start: dates[0], end: dates[1] }),
    onRestart: () => setRange(initial()),
  };
}

/** Lab card: date range + the 16 legacy lab groups (Ruling P2). */
export function useLabReport<T>(
  load: (range: DateRange, codes: string[], token: string | null) => Promise<T>,
  toCodes: (labs: string[]) => string[],
  initial: () => DateRange = lastYear,
) {
  const [range, setRange] = useState<DateRange>(initial);
  const [labs, setLabs] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const report = useReport((token) => load(range, toCodes(labs), token), [range, labs]);
  return {
    ...report,
    range,
    labs,
    subtitle: labs.length ? `${formatPeriodPt(range)} | ${labs.join(", ")}` : formatPeriodPt(range),
    exportSubtitle: labs.length ? `${formatRangePt(range)} | ${labs.join(", ")}` : formatRangePt(range),
    onSubmit: (dates: [string, string]) => setRange({ start: dates[0], end: dates[1] }),
    onRestart: () => {
      setRange(initial());
      setLabs([]);
    },
    openLabs: () => setOpen(true),
    labsDialog: {
      open,
      onOpenChange: setOpen,
      selected: labs,
      onApply: (names: string[]) => {
        setLabs(names);
        setOpen(false);
      },
    },
  };
}
