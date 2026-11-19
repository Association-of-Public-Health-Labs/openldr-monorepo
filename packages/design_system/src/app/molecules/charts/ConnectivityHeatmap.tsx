export type HeatmapDay = { date: string; uptime: number };

export type ConnectivityHeatmapProps = {
  /** One entry per day (YYYY-MM-DD), uptime in %. */
  data: HeatmapDay[];
  /** CSS colour of a 100% day; defaults to the theme's success colour. */
  baseColor?: string;
  showLegend?: boolean;
};

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const WEEKDAYS = ["Seg", "", "Qua", "", "Sex", "", ""];
const DAY = 86_400_000;

/** Weeks as columns, Monday first; each week keeps the month of its first day. */
export function heatmapWeeks(data: HeatmapDay[]): { month: number; cells: (HeatmapDay | null)[] }[] {
  const sorted = data.slice().sort((a, b) => a.date.localeCompare(b.date));
  if (!sorted.length) return [];
  const t = (d: string) => Date.parse(`${d}T00:00:00Z`);
  const weekday = (ms: number) => (new Date(ms).getUTCDay() + 6) % 7;
  const first = t(sorted[0].date);
  const anchor = first - weekday(first) * DAY;
  const weeks = new Map<number, { month: number; cells: (HeatmapDay | null)[] }>();
  for (const day of sorted) {
    const ms = t(day.date);
    const index = Math.floor((ms - anchor) / (7 * DAY));
    let week = weeks.get(index);
    if (!week) {
      week = { month: new Date(ms).getUTCMonth(), cells: Array(7).fill(null) };
      weeks.set(index, week);
    }
    week.cells[weekday(ms)] = day;
  }
  return [...weeks.entries()].sort((a, b) => a[0] - b[0]).map(([, w]) => w);
}

/**
 * The month name over the first week of each month. When two labels would sit within three
 * columns (a partial first month running into the next: "NovDez"), the earlier one is dropped.
 */
export function monthLabels(weeks: { month: number }[]): string[] {
  const out = weeks.map(() => "");
  let last = -Infinity;
  weeks.forEach((w, i) => {
    if (i > 0 && w.month === weeks[i - 1].month) return;
    if (i - last < 3) out[last] = "";
    out[i] = MONTHS[w.month];
    last = i;
  });
  return out;
}

const shade = (uptime: number, base: string) =>
  `color-mix(in srgb, ${base} ${Math.round(15 + 0.85 * Math.max(0, Math.min(100, uptime)))}%, var(--card))`;

const ddmmyyyy = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}`;

/** Daily connectivity as a calendar: one square per day, darker = more time online. */
export function ConnectivityHeatmap({ data, baseColor = "var(--success)", showLegend = true }: ConnectivityHeatmapProps) {
  const weeks = heatmapWeeks(data);
  if (!weeks.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Sem dados para o período e filtros seleccionados.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto pb-1">
        <div className="inline-grid gap-[3px]" style={{ gridTemplateColumns: `28px repeat(${weeks.length}, 12px)` }}>
          <span />
          {monthLabels(weeks).map((label, i) => (
            <span key={i} className="h-3 overflow-visible whitespace-nowrap text-[9px] leading-3 text-muted-foreground">
              {label}
            </span>
          ))}
          {WEEKDAYS.map((label, row) => (
            <div key={row} className="contents">
              <span className="text-[10px] leading-3 text-muted-foreground">{label}</span>
              {weeks.map((w, i) => {
                const day = w.cells[row];
                return day ? (
                  <span
                    key={i}
                    data-cell="day"
                    title={`${ddmmyyyy(day.date)}: ${day.uptime}%`}
                    className="size-3 rounded-[3px]"
                    style={{ backgroundColor: shade(day.uptime, baseColor) }}
                  />
                ) : (
                  <span key={i} className="size-3" />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {showLegend && (
        <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground" aria-label="Legenda">
          <span>Menos</span>
          {[0, 25, 50, 75, 100].map((u) => (
            <span key={u} aria-hidden className="size-3 rounded-[3px]" style={{ backgroundColor: shade(u, baseColor) }} />
          ))}
          <span>Mais</span>
        </div>
      )}
    </div>
  );
}
