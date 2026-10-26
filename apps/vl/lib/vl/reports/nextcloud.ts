// The weekly CV reports (api-weekly-reports-python) as Nextcloud keeps them:
// <root>/<year>/<Mês>/<"13 Setembro - 19 Setembro">/<"Carga Viral - semana 13 Setembro - 19 Setembro.xlsx">,
// each file with its own public link. Pure functions only; the requests live in ./server.ts.

import { weekLabel } from "@repo/design_system/lib/weeks";

/** Month folder names, as the report generator writes them (MESES_PT). */
export const PT_MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export type DavFile = {
  /** Path below the reports root, e.g. "2026/Setembro/13 Setembro - 19 Setembro/Carga Viral - ….xlsx". */
  path: string;
  size: number;
  modified: string;
};

export type WeeklyReport = {
  name: string;
  path: string;
  /** Sunday of the report week, YYYY-MM-DD; null when the folder name is not a week. */
  weekStart: string | null;
  /** "13–19 Set", or the file name when the week is unknown. */
  label: string;
  /** Group heading in the drawer: "Setembro 2026" (month of the week's Sunday). */
  group: string;
  size: number;
  modified: string;
  /** Public download URL; null when the file has no public link. */
  url: string | null;
};

const decodeEntities = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

// Nextcloud always answers with the "d:" prefix, but accept any prefix (or none).
const tag = (block: string, name: string) =>
  block.match(new RegExp(`<(?:[\\w-]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${name}>`))?.[1];

/**
 * Files (not folders) in a PROPFIND multistatus. `davRoot` is the URL path of the reports folder
 * (e.g. "/remote.php/dav/files/user/reports/CV"); returned paths are relative to it.
 */
export function parsePropfind(xml: string, davRoot: string): DavFile[] {
  const root = davRoot.replace(/\/+$/, "") + "/";
  const blocks = xml.match(/<(?:[\w-]+:)?response(?:\s[^>]*)?>[\s\S]*?<\/(?:[\w-]+:)?response>/g) ?? [];
  const files: DavFile[] = [];
  for (const block of blocks) {
    const href = tag(block, "href");
    if (!href || /<(?:[\w-]+:)?collection\s*\/?>/.test(block)) continue;
    const path = decodeURIComponent(decodeEntities(href.trim()));
    if (!path.startsWith(root)) continue;
    files.push({
      path: path.slice(root.length),
      size: Number(tag(block, "getcontentlength") ?? 0),
      modified: new Date(tag(block, "getlastmodified") ?? 0).toISOString(),
    });
  }
  return files;
}

/** Week folders holding at least one file, to look up their shares (one request per folder). */
export function weekFolders(files: DavFile[]): string[] {
  return [...new Set(files.map((f) => f.path.split("/").slice(0, -1).join("/")).filter(Boolean))];
}

const monthIndex = (name: string) =>
  PT_MONTH_NAMES.findIndex((m) => m.localeCompare(name, "pt", { sensitivity: "base" }) === 0);

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Sunday of the week a report covers, from its folder ("2026/Outubro/27 Setembro - 03 Outubro/…").
 * The year folder is the year of the week's last day, so a week starting in December of the
 * previous year ("28 Dezembro - 03 Janeiro" under 2026) starts a year earlier.
 */
export function weekStartOf(path: string): Date | null {
  const parts = path.split("/");
  if (parts.length < 4) return null;
  const year = Number(parts[0]);
  const m = parts[2].match(/^(\d{1,2})\s+(\S+)\s*-\s*(\d{1,2})\s+(\S+)$/);
  if (!Number.isInteger(year) || !m) return null;
  const startMonth = monthIndex(m[2]);
  const endMonth = monthIndex(m[4]);
  if (startMonth < 0 || endMonth < 0) return null;
  const start = new Date(startMonth > endMonth ? year - 1 : year, startMonth, Number(m[1]));
  return Number.isNaN(start.getTime()) ? null : start;
}

/** Direct download of a public link. `/s/<token>/download` also works but hops through http. */
export const publicDownloadUrl = (baseUrl: string, token: string) =>
  `${baseUrl.replace(/\/+$/, "")}/public.php/dav/files/${encodeURIComponent(token)}/`;

/**
 * The drawer's list: Excel files only, newest week first. `tokens` maps a file path (relative, as in
 * DavFile) to its public link token.
 */
export function buildReports(files: DavFile[], tokens: Map<string, string>, baseUrl: string): WeeklyReport[] {
  return files
    .filter((f) => /\.xlsx$/i.test(f.path))
    .map((f) => {
      const name = f.path.split("/").pop() ?? f.path;
      const start = weekStartOf(f.path);
      const token = tokens.get(f.path);
      const groupDate = start ?? new Date(f.modified);
      return {
        name,
        path: f.path,
        weekStart: start ? iso(start) : null,
        label: start ? weekLabel(start) : name.replace(/\.xlsx$/i, ""),
        group: `${PT_MONTH_NAMES[groupDate.getMonth()]} ${groupDate.getFullYear()}`,
        size: f.size,
        modified: f.modified,
        url: token ? publicDownloadUrl(baseUrl, token) : null,
      };
    })
    .sort((a, b) => (b.weekStart ?? b.modified).localeCompare(a.weekStart ?? a.modified));
}

/** Consecutive reports under their group heading, keeping the newest-first order. */
export function groupReports(reports: WeeklyReport[]): { group: string; reports: WeeklyReport[] }[] {
  const groups: { group: string; reports: WeeklyReport[] }[] = [];
  for (const r of reports) {
    const last = groups[groups.length - 1];
    if (last?.group === r.group) last.reports.push(r);
    else groups.push({ group: r.group, reports: [r] });
  }
  return groups;
}

/** Case- and accent-insensitive match on the week label, group and file name ("set", "setembro 2026"). */
export function matchesQuery(report: WeeklyReport, query: string): boolean {
  const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const q = fold(query.trim());
  if (!q) return true;
  return fold(`${report.label} ${report.group} ${report.name}`).includes(q);
}

/** "316 KB", "1,2 MB". */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} MB`;
}
