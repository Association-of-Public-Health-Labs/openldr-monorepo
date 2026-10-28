"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, FileSpreadsheet, LinkIcon, Search, X } from "lucide-react";
import { OVERLINE } from "../../../molecules/metrics/SummaryStrip";
import { cn } from "../../../../lib/utils";
import { CardMessage } from "../card-message";
import { formatSize, groupReports, matchesQuery, type WeeklyReport } from "../../../../lib/report/nextcloud";

/** The drawer's text, per dashboard (VL: the CV reports; EID: the DPI reports). */
export type ReportsLabels = {
  BUTTON_OVERLINE: string;
  BUTTON: string;
  TITLE: string;
  SUBTITLE: string;
  SEARCH: string;
  WEEK: string;
  LATEST: string;
  UPDATED: string;
  DOWNLOAD: string;
  NO_LINK: string;
  EMPTY: string;
  NO_MATCH: string;
  ERROR: string;
  FILE: string;
  FILES: string;
};

const TEXT = "text-[#1C252E] dark:text-white";
const MUTED = "text-[#637381] dark:text-[#919EAB]";
const HAIRLINE = "border-[rgba(145,158,171,0.2)]";
const TILE = "flex size-8 shrink-0 items-center justify-center rounded-lg";

type ListState = { reports: WeeklyReport[] | null; updatedAt: string | null; loading: boolean; error: string | null };

async function fetchReports(endpoint: string, fallbackError: string): Promise<{ reports: WeeklyReport[]; updatedAt: string }> {
  const res = await fetch(endpoint, { cache: "no-store" });
  // A lapsed session is redirected to the sign-in page (HTML), not JSON.
  const body = res.headers.get("content-type")?.includes("application/json") ? await res.json() : null;
  if (!res.ok || !body) throw new Error(body?.error ?? fallbackError);
  return body;
}

/** Loads the list the first time the drawer opens, then keeps it for the page's lifetime. */
function useReportList(open: boolean, endpoint: string, fallbackError: string) {
  const [state, setState] = useState<ListState>({ reports: null, updatedAt: null, loading: false, error: null });
  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchReports(endpoint, fallbackError)
      .then(({ reports, updatedAt }) => setState({ reports, updatedAt, loading: false, error: null }))
      .catch((e: unknown) => setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : fallbackError })));
  }, [endpoint, fallbackError]);
  useEffect(() => {
    if (open && !state.reports && !state.loading && !state.error) load();
  }, [open, state.reports, state.loading, state.error, load]);
  return { ...state, retry: load };
}

/** Header button, in the PeriodButton style. */
export function ReportsButton({ onClick, labels: REPORTS }: { onClick: () => void; labels: ReportsLabels }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 items-center gap-3 rounded-xl border bg-white pr-4 pl-2 text-left transition-colors hover:bg-[rgba(145,158,171,0.08)] dark:bg-[#1d232a]",
        HAIRLINE,
      )}
    >
      <span aria-hidden className={cn(TILE, "bg-[rgba(34,197,94,0.12)] text-[#118D57] dark:text-[#77ED8B]")}>
        <FileSpreadsheet className="size-[18px]" />
      </span>
      <span className="flex flex-col">
        <span className={cn(OVERLINE, "text-[10px] leading-3")}>{REPORTS.BUTTON_OVERLINE}</span>
        <span className={cn("text-sm leading-5 font-semibold whitespace-nowrap", TEXT)}>{REPORTS.BUTTON}</span>
      </span>
    </button>
  );
}

function ReportRow({ report, latest, labels: REPORTS }: { report: WeeklyReport; latest: boolean; labels: ReportsLabels }) {
  const meta = `${formatSize(report.size)} · ${REPORTS.UPDATED} ${new Date(report.modified).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
  const body = (
    <>
      <span aria-hidden className={cn(TILE, "size-10 rounded-xl bg-[rgba(34,197,94,0.12)] text-[#118D57] dark:text-[#77ED8B]")}>
        <FileSpreadsheet className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <span className={cn("truncate text-sm font-semibold", TEXT)}>
            {report.weekStart ? `${REPORTS.WEEK} ${report.label}` : report.label}
          </span>
          {latest && (
            <span className="rounded-md bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--primary)]">
              {REPORTS.LATEST}
            </span>
          )}
        </span>
        <span className={cn("truncate text-xs", MUTED)}>{report.url ? meta : REPORTS.NO_LINK}</span>
      </span>
    </>
  );

  if (!report.url) {
    return (
      <li className="flex items-center gap-3 rounded-xl px-3 py-2.5 opacity-60" title={report.name}>
        {body}
        <LinkIcon aria-hidden className="size-4 text-[#919EAB]" />
      </li>
    );
  }
  return (
    <li>
      <a
        href={report.url}
        download={report.name}
        rel="noopener noreferrer"
        title={`${REPORTS.DOWNLOAD} ${report.name}`}
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[rgba(145,158,171,0.08)] focus-visible:bg-[rgba(145,158,171,0.08)] focus-visible:outline-none"
      >
        {body}
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full text-[#637381] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white"
        >
          <Download className="size-4" />
        </span>
      </a>
    </li>
  );
}

function Skeleton() {
  return (
    <ul aria-hidden className="flex flex-col gap-1 px-2">
      {Array.from({ length: 7 }, (_, i) => (
        <li key={i} className="flex items-center gap-3 px-3 py-2.5">
          <span className="size-10 animate-pulse rounded-xl bg-[rgba(145,158,171,0.16)]" />
          <span className="flex flex-1 flex-col gap-2">
            <span className="h-3 w-2/5 animate-pulse rounded bg-[rgba(145,158,171,0.16)]" />
            <span className="h-2.5 w-3/5 animate-pulse rounded bg-[rgba(145,158,171,0.12)]" />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Right-hand drawer listing the weekly Excel reports kept in Nextcloud (read by `endpoint`), newest first. */
export function ReportsDrawer({
  open,
  onOpenChange,
  endpoint,
  labels: REPORTS,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The app's route handler, e.g. "/api/reports/cv". */
  endpoint: string;
  labels: ReportsLabels;
}) {
  const list = useReportList(open, endpoint, REPORTS.ERROR);
  const [query, setQuery] = useState("");
  const latest = list.reports?.find((r) => r.url);
  const groups = useMemo(
    () => groupReports((list.reports ?? []).filter((r) => matchesQuery(r, query))),
    [list.reports, query],
  );
  const available = list.reports?.filter((r) => r.url).length ?? 0;

  let content;
  if (list.error) content = <div className="px-5"><CardMessage tone="error" message={list.error} onRetry={list.retry} /></div>;
  else if (!list.reports) content = <Skeleton />;
  else if (!list.reports.length) content = <div className="px-5"><CardMessage tone="empty" message={REPORTS.EMPTY} /></div>;
  else if (!groups.length) content = <div className="px-5"><CardMessage tone="empty" message={REPORTS.NO_MATCH} /></div>;
  else
    content = (
      <div className="flex flex-col gap-5 px-2">
        {groups.map((g) => (
          <section key={g.group} className="flex flex-col gap-1">
            <h3 className={cn(OVERLINE, "px-3")}>{g.group}</h3>
            <ul className="flex flex-col">
              {g.reports.map((r) => (
                <ReportRow key={r.path} report={r} latest={r === latest} labels={REPORTS} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1200] bg-[rgba(28,37,46,0.24)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement | null)?.focus();
          }}
          className="fixed inset-y-0 right-0 z-[1200] flex h-full w-[420px] max-w-full flex-col bg-white/95 shadow-[-40px_40px_80px_-8px_rgba(145,158,171,0.24)] outline-none backdrop-blur-[20px] data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right dark:bg-[#141A21]/95 dark:shadow-[-40px_40px_80px_-8px_rgba(0,0,0,0.24)]"
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
            <div className="min-w-0">
              <Dialog.Title className={cn("text-lg leading-7 font-semibold", TEXT)}>{REPORTS.TITLE}</Dialog.Title>
              <Dialog.Description className={cn("text-sm", MUTED)}>{REPORTS.SUBTITLE}</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Fechar" className="rounded-full p-2 text-[#637381] hover:bg-[rgba(145,158,171,0.08)]">
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <div className="px-5 pb-4">
            <label className={cn("flex h-10 items-center gap-2 rounded-lg border px-3 focus-within:border-[var(--primary)]", HAIRLINE)}>
              <Search aria-hidden className="size-4 text-[#919EAB]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={REPORTS.SEARCH}
                aria-label={REPORTS.SEARCH}
                className={cn("h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#919EAB]", TEXT)}
              />
            </label>
          </div>

          <div className={cn("flex-1 overflow-y-auto border-t border-dashed pt-4 pb-6", HAIRLINE)}>{content}</div>

          {list.reports && (
            <div className={cn("border-t px-5 py-3 text-xs", HAIRLINE, MUTED)}>
              <span>
                {available} {available === 1 ? REPORTS.FILE : REPORTS.FILES}
              </span>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
