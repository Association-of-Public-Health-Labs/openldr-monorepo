# Monitoring Dashboard — Production Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `apps/monitoring` (LIS site connectivity, Sumário + Estado) at `monitoria.openldr.org.mz`, rebuilt on the current shared shell, theme and report kit.

**Architecture:** Port the July data layer (`lib/monitoring/*`, `app/api/*` route handlers aggregating DisaStatus/uptimewatch) unchanged onto fresh `origin/main`. Rebuild the shell (`DashboardShell`), sign-in (`SignInScreen`), theming (`PlatformThemeProvider` + `data-dashboard`) and every card on `ReportCard`/`useReport`/`KpiCard`/`InteractiveSvgMap`/`SortableTable`, following the VL/EID card-folder layout.

**Tech Stack:** pnpm 9 + turbo, Next 15.5.25, React 18, Tailwind v4, Clerk ^6.39.7, Apex charts (via `@repo/design_system`), vitest.

**Spec:** `docs/superpowers/specs/2026-11-16-monitoring-production-design.md`

**Old source:** local branch `feat/monitoring-dashboard` (read with `git show feat/monitoring-dashboard:apps/monitoring/<path>`). **Reference app:** `apps/eid` on this branch.

## Global Constraints

- Work in worktree `.claude/worktrees/monitoring`, branch `feat/monitoring-production`. Never `pnpm install` plainly; use `pnpm install --frozen-lockfile`, except the single lockfile update in Task 2 (`pnpm install --no-frozen-lockfile --filter monitoring...` then confirm the diff touches only the monitoring importer).
- All UI text Portuguese. Standard copy: "Exportar para Excel", "Últimos 12 meses", "Sem dados para o período e filtros seleccionados.", "A carregar…".
- No hex colours in `apps/monitoring` code except the constants in `lib/monitoring/colors.ts` (Task 3). Surfaces use tokens: `bg-card`, `border-border`, `text-muted-foreground`, `text-foreground`, `bg-success`, `bg-destructive`.
- Registry entry: id `"monitoring"`, name `"Monitoria"`, portalTitle `"Monitoria de Conectividade"`, url `https://monitoria.openldr.org.mz`, primary `#5B6CFF`, primaryForeground `#FFFFFF`, `ready: false`, override env `NEXT_PUBLIC_DASHBOARD_URL_MONITORING`.
- Do not add to or modify `packages/design_system_mui`. New shared components go in `packages/design_system/src` (Tailwind, no MUI).
- Dependencies match EID: `next` and `eslint-config-next` `15.5.25`, `@clerk/nextjs` `^6.39.7`.
- Dev port 3005 (`next dev --turbopack -p 3005`).
- Histórico: listed in `UNRELEASED_PAGES`; `/historico` calls `notFound()` when `NODE_ENV === "production"`.
- Upstream base: `process.env.NEXT_PUBLIC_UPTIMEWATCH_API ?? "https://uptimewatch.openldr.org.mz"`. Keep `client.ts` timeout/caching policy as is.
- No push, PR, Coolify or DNS action without the user's go-ahead.

## Review Focus

Observed live on 2026-11-16 (`/teamviewer/sites`, 422 hosts):

1. **Province spelling variants**: hosts use `"Maputo-Cidade"` (2 hosts, district `"Kampfumo"`) besides `"Maputo Cidade"`/`"KaMpfumu"`. Expect them counted under Maputo Cidade on the map, not dropped. → Task 3 `normalizeProvince`/`normalizeDistrict` tests.
2. **Host with empty province/district** (`""`): expect it counted in national totals and the grid, absent from the map, no crash. → Task 3 test.
3. **Trend endpoint slow or failing** (`/teamviewer/connectivity-trend` did not answer within 170 s on a cold cache): expect the KPI tiles to render values without bars, not a card error. → Task 6 test `toTiles works without trend`.
4. **Estado opened with an unknown or missing `?code=`**: expect "Site não encontrado." message with the host picker still usable, not an endless skeleton. → Task 9 test.
5. **Most sites offline at once** (383/422 offline at 06:19 Maputo — sites power down overnight): expect the grid default tab and counts to stay correct and the "offline" colour to read as status, not as error UI. → Task 7 test on `hostsForTab` ordering (offline first) and counts.

---

## File Structure

```
packages/design_system/src/
  dashboards.ts / dashboards.test.ts            (Task 1) + "monitoring"
  styles/theme.css                              (Task 1) [data-dashboard="monitoring"]
  app/molecules/cards/HostStatusChip.tsx        (Task 7) Tailwind, + .test.tsx + .stories.tsx
  app/molecules/charts/ConnectivityHeatmap.tsx  (Task 9) Tailwind, + .test.tsx + .stories.tsx
apps/home/lib/catalog.ts                        (Task 1) COPY entry for monitoring
apps/admin/lib/admin/*.test.ts                  (Task 1) only if types require
apps/monitoring/
  package.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs
  vitest.config.ts Dockerfile .env.example .gitignore components.json   (Task 2)
  app/layout.tsx app/globals.css                                        (Task 2)
  app/(auth)/layout.tsx sign-in/{page,client}.tsx sign-up/{page,client}.tsx (Task 4)
  app/(dashboard)/layout.tsx loading.tsx error.tsx                      (Task 5)
  app/(dashboard)/historico/page.tsx                                    (Task 5)
  app/api/**                                                            (Task 3, copied)
  lib/monitoring/{client,aggregate,duration,heatmap,dates,types}.ts + tests (Task 3, copied)
  lib/monitoring/regions.ts + test        (Task 3) name normalisation for map keys
  lib/monitoring/colors.ts                (Task 3) category + status colours
  lib/monitoring/api.ts + test            (Task 3) same-origin fetch for cards
  lib/monitoring/nav.ts + test            (Task 5)
  app/(dashboard)/(index)/page.tsx                                       (Task 6)
  app/(dashboard)/(index)/reports/category-kpis/      (Task 6)
  app/(dashboard)/(index)/reports/national-connectivity/ (Task 7)
  app/(dashboard)/(index)/reports/hosts-status-grid/  (Task 7)
  app/(dashboard)/(index)/reports/connectivity-map/   (Task 8)
  app/(dashboard)/estado/page.tsx client.tsx          (Task 9)
  app/(dashboard)/estado/reports/{host-info,host-connectivity,host-heatmap,connectivity-history}/ (Task 9)
```

Every card folder: `constants.ts` (`CARD_ID`, `TITLE`, labels), `actions.ts` (pure transforms + `fetchData`), `actions.test.ts`, `docs.tsx`, thin `index.tsx`.

---

### Task 1: Register "monitoring" in the shared registry and theme

**Files:**
- Modify: `packages/design_system/src/dashboards.ts`, `packages/design_system/src/dashboards.test.ts`, `packages/design_system/src/styles/theme.css`, `apps/home/lib/catalog.ts`
- Check: `packages/design_system/src/app/organisms/auth/SignInScreen.tsx` (`PORTAL_META` is `Partial`, no change), `apps/admin/app/(dashboard)/users/reports/user-panel/index.tsx` (lists registry ids)

**Interfaces:**
- Produces: `DashboardId` includes `"monitoring"`; `getDashboard("monitoring")` returns the Global Constraints entry.

- [ ] **Step 1: Extend `dashboards.test.ts`**: the ordered list test becomes VL, TB, EID, monitoring, admin, with `["monitoring", "#5B6CFF", "#FFFFFF"]`; add `expect(getDashboard("monitoring", {}).ready).toBe(false)`, `.portalTitle === "Monitoria de Conectividade"`, `.url === "https://monitoria.openldr.org.mz"`, and `getDashboard("monitoring", { monitoring: "http://localhost:3005/" }).url === "http://localhost:3005"`.
- [ ] **Step 2: Run** `pnpm --filter=@repo/design_system exec vitest run src/dashboards.test.ts` → FAIL.
- [ ] **Step 3: Implement**: add the entry before admin, the union member, and `monitoring: process.env.NEXT_PUBLIC_DASHBOARD_URL_MONITORING` in `ENV_OVERRIDES`. In `theme.css` add `[data-dashboard="monitoring"] { --primary: #5B6CFF; --primary-foreground: #FFFFFF; }` next to the others.
- [ ] **Step 4: `apps/home/lib/catalog.ts`**: `COPY` is `Record<PortalId, …>`, so add `monitoring: { programme: "LIS", description: "Conectividade à internet dos laboratórios, pontos de PoC e DisaLink do SIS-LAB: sites online e offline, tempo fora de linha por província e histórico de cada site.", tests: [] }`. Run `pnpm --filter=home test` and fix any test asserting the catalog length.
- [ ] **Step 5: Run** `pnpm --filter=@repo/design_system exec vitest run`, `pnpm --filter=home test`, `pnpm --filter=admin test`, `pnpm --filter=admin exec tsc --noEmit` → PASS. In `apps/admin`, confirm the user panel renders the new id from the registry (read the code; no change expected).
- [ ] **Step 6: Commit** `feat(design-system): register the monitoring dashboard (not released)`.

---

### Task 2: App scaffold on the shared theme

**Files:**
- Create: everything under `apps/monitoring/` listed for Task 2 in File Structure. Copy from `apps/eid` and rename `eid`→`monitoring`: `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `globals.css`, `Dockerfile`, `.gitignore`, `components.json`, `app/layout.tsx`. Copy `public/login-bg.jpg` from `apps/eid/public`.
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: buildable empty app; `<html lang="pt" data-dashboard="monitoring">`, `PlatformThemeProvider dashboard="monitoring"`, `ClerkProvider` as EID; metadata title `"Monitoria de Conectividade"`, description `"Monitoria da conectividade à internet dos sites do SIS-LAB"`.

- [ ] **Step 1:** `package.json` name `monitoring`; scripts `dev: next dev --turbopack -p 3005`, `build`, `start`, `lint`, `test: vitest run`. Dependencies: only what Tasks 2–9 import: `@clerk/nextjs ^6.39.7`, `@repo/design_system`, `@repo/auth`, `next 15.5.25`, `react`/`react-dom ^18.3.1`, `next-themes ^0.2.1`, `lucide-react`, `react-icons`, `server-only ^0.0.1`, `clsx`, `tailwind-merge`, `apexcharts`/`react-apexcharts` (same versions as EID), `xlsx ^0.18.5`, `html2canvas ^1.4.1`. Add any package that `tsc` later finds missing at EID's version. Dev deps as EID plus `vitest ^3.2.4`.
- [ ] **Step 2:** `next.config.ts` as EID's minus MDX unless EID uses it for docs. `vitest.config.ts`: include `["lib/**/*.test.ts", "app/**/*.test.ts"]`, alias `server-only` → `test/server-only-stub.ts` (copy from old branch), alias `@` → app root.
- [ ] **Step 3:** `.env.example` with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=`, `CLERK_SECRET_KEY=`, `NEXT_PUBLIC_OPENLDR_API=` (usage beacon), `NEXT_PUBLIC_UPTIMEWATCH_API=https://uptimewatch.openldr.org.mz`, `NEXT_PUBLIC_DASHBOARD_URL_{VL,TB,EID,MONITORING,ADMIN}=`. Dockerfile = EID's with `--filter=monitoring` in both lines.
- [ ] **Step 4:** Temporary `app/page.tsx` returning `<p>Monitoria</p>` (deleted in Task 6).
- [ ] **Step 5:** Lockfile: `pnpm install --no-frozen-lockfile`, then `git diff --stat pnpm-lock.yaml` and confirm only the `apps/monitoring` importer (and its new resolutions) changed. Then `pnpm install --frozen-lockfile` → OK.
- [ ] **Step 6: Verify** `pnpm --filter=monitoring exec tsc --noEmit` and `pnpm turbo run build --filter=monitoring` → PASS.
- [ ] **Step 7: Commit** `feat(monitoring): app scaffold on the shared theme`.

---

### Task 3: Data layer (ported) + region names, colours, card fetch

**Files:**
- Copy unchanged from old branch: `lib/monitoring/{client,aggregate,duration,heatmap,dates,types}.ts`, their `*.test.ts`, `lib/monitoring/__tests__/types.smoke.test.ts`, `test/server-only-stub.ts`, `app/api/**/route.ts` (7 handlers), `config/api.ts` reduced to the `UPTIMEWATCH_BASE_URL` export (drop axios).
- Create: `lib/monitoring/regions.ts` + `regions.test.ts`, `lib/monitoring/colors.ts`, `lib/monitoring/api.ts` + `api.test.ts`
- Modify: `app/api/provinces/route.ts`, `app/api/districts/route.ts`, `lib/monitoring/aggregate.ts` (`regionUptime` keys)

**Interfaces:**
- Produces:
  - `normalizeProvince(name: string | null): string | null`: returns the `PROVINCE_NAMES` key from `@repo/design_system/lib/report/districts` (`"Maputo Cidade"`, `"Maputo Provincia"`, `"Zambezia"` …), or `null` for empty/unknown.
  - `normalizeDistrict(province: string, name: string | null): string | null`: returns the district name as it appears in `DISTRICT_CODES[province]` values, or `null`.
  - `regionUptime(...)` returns `RegionConnectivity[]` whose `name` is the normalised key (variants merged, empty names skipped).
  - `CATEGORY_COLORS: Record<HostType | "all", string>` = `{ all: "#00B000", Disalab: "#EF5350", Disapoc: "#F8A200", Disalink: "#6B52DC" }`; `CATEGORY_LABELS` = `{ all: "Todos os sites", Disalab: "Disalab", Disapoc: "DisaPoC", Disalink: "DisaLink" }`; `ONLINE_COLOR = "#00B000"`, `OFFLINE_COLOR = "#EF5350"`, `NO_DATA_COLOR` (reuse the value EID's map constants use).
  - `monitoringGet<T>(path: string, params?: Record<string, string>): Promise<T>`: `fetch` same-origin with `cache: "no-store"`. On non-OK, throws `Error` with the route's `error` field, or `"Não foi possível carregar os dados."`.

- [ ] **Step 1: Copy files and run** `pnpm --filter=monitoring test` → ported tests PASS.
- [ ] **Step 2: Write `regions.test.ts`**:
  - `normalizeProvince("Maputo-Cidade") === "Maputo Cidade"`, `("Maputo Província") === "Maputo Provincia"`, `("Zambézia") === "Zambezia"`, `("") === null`, `(null) === null`, `("Atlantis") === null`.
  - `normalizeDistrict("Maputo Cidade", "Kampfumo")` equals `normalizeDistrict("Maputo Cidade", "KaMpfumu")` and is a value of `DISTRICT_CODES["Maputo Cidade"]`.
  - `normalizeDistrict` matches case- and accent-insensitively, ignoring hyphens and spaces (e.g. `"Xai-Xai"`, `"Chokwe"` vs `"Chókwè"`).
  - Coverage: for every `(province, district)` pair in the fixture `lib/monitoring/__fixtures__/regions.json` (create it from the live `/teamviewer/sites` distinct pairs, as in Review Focus), `normalizeDistrict` is non-null. Unmatched pairs go into an explicit `DISTRICT_ALIASES` map in `regions.ts`, keyed `"<province>|<raw>"`.
  - `regionUptime` with hosts in `"Maputo Cidade"` and `"Maputo-Cidade"` returns a single `"Maputo Cidade"` row with `hostCount` = both. A host with `ProvinceName ""` is not in the output.
- [ ] **Step 3: Run** → FAIL. **Step 4: Implement**: a `fold(s)` helper (NFD, strip diacritics, lowercase, drop `-` and spaces) and lookups against the shared tables, plus `DISTRICT_ALIASES`. Use the normalisers in `regionUptime` (group key). In `provinces`/`districts` routes, map the grouped stats' names through the same normalisers before summing. `districts?province=` takes the normalised key and filters hosts by `normalizeProvince(h.ProvinceName) === province`.
- [ ] **Step 5: Write `api.test.ts`**: with a stubbed global `fetch`, `monitoringGet("/api/x", { a: "1" })` calls `"/api/x?a=1"` with `cache: "no-store"`; a 502 `{error:"DisaStatus 500"}` rejects with `"DisaStatus 500"`; a 502 without a JSON body rejects with `"Não foi possível carregar os dados."`. Implement, run → PASS.
- [ ] **Step 6: Verify** `pnpm --filter=monitoring test`, `tsc --noEmit` → PASS. With `pnpm --filter=monitoring dev` signed in, `curl` the routes manually (or check in the browser) and confirm `/api/provinces` returns 11 rows.
- [ ] **Step 7: Commit** `feat(monitoring): port the DisaStatus data layer; normalise region names to the shared maps`.

---

### Task 4: Shared sign-in and sign-up

**Files:**
- Create: `app/(auth)/layout.tsx`, `app/(auth)/sign-in/{page,client}.tsx`, `app/(auth)/sign-up/{page,client}.tsx`, `middleware.ts`

**Interfaces:**
- Consumes: `SignInScreen`, `sign-in-flow` (`signInWithPassword`, `requestPasswordReset`, `completePasswordReset`, `postSignInUrl`), `getDashboards()`.

- [ ] **Step 1:** Copy EID's four auth files and `middleware.ts`. In sign-in, `CURRENT = "monitoring"` and `PORTALS = getDashboards().filter((d) => d.id === "monitoring")`, so the sign-in page offers only Monitoria until release. Sign-up copied as is.
- [ ] **Step 2: Verify** with `tsc`, then the dev server: `/` redirects to `/sign-in` with the indigo primary; sign-in with a test account from the project's seed/example config (or ask the user to sign in) lands on `/`.
- [ ] **Step 3: Commit** `feat(monitoring): shared sign-in screen`.

---

### Task 5: Dashboard shell, navigation, Histórico gate

**Files:**
- Create: `lib/monitoring/nav.ts` + `nav.test.ts`, `app/(dashboard)/layout.tsx`, `loading.tsx`, `error.tsx` (copy EID's), `app/(dashboard)/historico/page.tsx`

**Interfaces:**
- Produces:
  - `PAGE_LABELS = { "/": "Sumário", "/estado": "Estado", "/historico": "Histórico" }`
  - `UNRELEASED_PAGES = ["/historico"]`
  - `buildNavItems(pathname: string, production = IS_PRODUCTION): NavItem[]`, where `NavItem.icon: "grid" | "location" | "history"`.
- Consumes: `monitoringGet` (Task 3) for `ReportServices.getList`.

- [ ] **Step 1: `nav.test.ts`**: in production, the items are `["/", "/estado"]`; outside production, `["/", "/estado", "/historico"]`; `buildNavItems("/estado", true)` marks only `/estado` active; `PAGE_LABELS["/historico"] === "Histórico"`.
- [ ] **Step 2: Run** → FAIL. **Implement** `nav.ts` on the `lib/eid/nav.ts` pattern, without `isAdmin`. Run → PASS.
- [ ] **Step 3: Layout**: EID's `(dashboard)/layout.tsx` minus the EID admin provider and patients. `DashboardShell dashboard="monitoring"`, `useUsageBeacon("monitoring", …)`, `SplashScreen` while Clerk loads, and `ReportProvider` with `getToken`, `user`, `adminStatus: "user"`, and `getList: (endpoint, params) => monitoringGet(endpoint, stringified params)`. Icons: `IconlyGrid`, `IconlyLocation`, and for history the same set's clock-like icon if one exists, otherwise lucide `History` at size 19.
- [ ] **Step 4: `historico/page.tsx`**: `if (process.env.NODE_ENV === "production" && UNRELEASED_PAGES.includes("/historico")) notFound();`, otherwise a `CardMessage tone="empty" message="Histórico em breve."`.
- [ ] **Step 5: Verify** with `tsc`, `lint`, `test`. In the dev server the shell shows the indigo primary, the switcher lists Monitoria, and the settings drawer's light/dark mode and layouts work.
- [ ] **Step 6: Commit** `feat(monitoring): platform shell and navigation; Histórico hidden in production`.

---

### Task 6: Sumário — category KPI tiles

**Files:**
- Create: `app/(dashboard)/(index)/page.tsx` (replaces Task 2's `app/page.tsx`; delete that file), `reports/category-kpis/{constants,actions,actions.test,docs}.ts(x)`, `index.tsx`

**Interfaces:**
- Consumes: `/api/summary` → `NationalSummary`, `/api/connectivity-trend` → `ConnectivityTrend`, `CATEGORY_COLORS`.
- Produces: `toTiles(summary: NationalSummary, trend: ConnectivityTrend | null): Tile[]`, with `Tile = { id: HostType | "all"; title: string; value: string /* "12%" */; subtitle: string /* "383/422 sites offline · Últimos 12 meses" */; color: string; labels: string[]; data: number[] }`.

- [ ] **Step 1: `actions.test.ts`**: given a summary fixture (categories in the order all, Disalab, Disapoc, Disalink), `toTiles` returns four tiles in that order with `value === "<downtimePct>%"`, the subtitle above, and the colours from `CATEGORY_COLORS`. **`toTiles works without trend`**: with `trend = null`, each tile has `labels: []`, `data: []`. With a trend, `data` equals `trend.series[id]`.
- [ ] **Step 2: Run** → FAIL. Implement; `fetchData()` loads the summary (required) and the trend (`.catch(() => null)`) in parallel. Run → PASS.
- [ ] **Step 3: `index.tsx`**: EID status-cards layout (`grid grid-cols-1 gap-6 @[640px]:grid-cols-2 @[1100px]:grid-cols-4`), `KpiCard` with lucide icons (`Globe`, `FlaskConical`, `Stethoscope`, `Link`). Children: `KpiBars` when `data.length` is non-zero. Use `KpiCardSkeleton` ×4 while loading and `CardMessage` on error. No drawer.
- [ ] **Step 4:** `page.tsx` with `@container` grid: KPI row, then a 2-col row (`national-connectivity` | `connectivity-map`, `@[840px]:grid-cols-2`), then `hosts-status-grid`. Comment out the not-yet-built cards until their tasks.
- [ ] **Step 5: Verify** `test`, `tsc`, then the page in the browser.
- [ ] **Step 6: Commit** `feat(monitoring): Sumário KPI tiles on KpiCard`.

---

### Task 7: Sumário — national donut + hosts grid (+ shared `HostStatusChip`)

**Files:**
- Create: `packages/design_system/src/app/molecules/cards/HostStatusChip.tsx` + `.test.tsx` + `.stories.tsx`
- Create: `reports/national-connectivity/*`, `reports/hosts-status-grid/*`

**Interfaces:**
- Produces: `HostStatusChip({ code, name, category, online, onClick }: { code: string; name: string; category: string; online: boolean; onClick?: () => void })`, a `button` when `onClick` is set, otherwise a `div`. Circle `bg-success`/`bg-destructive`, white text, first 5 chars of the code upper-cased; name `font-semibold text-foreground truncate`; category `text-muted-foreground`; `aria-label="<name>: online|offline"`.
- Produces: `hostsForTab(hosts: Host[], tab: HostType | "all", limit: number | null): Host[]`, `toDonut(summary: NationalSummary): { labels: ["Online", "Offline"]; series: [number, number] }` (uptime/downtime %).

- [ ] **Step 1: `HostStatusChip.test.tsx`** (follow the existing design_system component tests' renderer): offline renders `bg-destructive` and `aria-label` "X: offline"; with `onClick` it renders a button and calls the handler. Implement, add a story, run → PASS.
- [ ] **Step 2: `hosts-status-grid/actions.test.ts`**: `hostsForTab` filters by type, sorts offline first then by name (pt collation), and slices to `limit` (`null` = all). `"all"` keeps all types. Hosts with `code === null` are kept, shown as "—", and are not clickable.
- [ ] **Step 3: `national-connectivity/actions.test.ts`**: `toDonut` with `uptimePct 88` gives `series [88, 12]`.
- [ ] **Step 4: Implement both cards.** Donut: `ReportCard` title `"Conectividade nacional"`, subtitle `"Últimos 12 meses"`, Apex `Donut` with `colors [ONLINE_COLOR, OFFLINE_COLOR]`, Excel = one row per label. Grid: `ReportCard` title `"Estado dos sites"`, `controls` = `SegmentedSwitch` over `Disalab | DisaPoC | DisaLink | Todos` (default `Disalab`), 20 chips, and a "Ver todos (N)" button that removes the limit. Clicking a chip routes to `/estado?code=`. Excel exports all hosts of the tab (Código, Nome, Categoria, Província, Distrito, Estado). Grid layout `@[560px]:grid-cols-2 @[860px]:grid-cols-3 @[1100px]:grid-cols-4`.
- [ ] **Step 5: Verify** `pnpm --filter=@repo/design_system exec vitest run`, the monitoring tests and `tsc`, then the browser in light and dark.
- [ ] **Step 6: Commit** `feat(monitoring): national donut and host grid; shared HostStatusChip`.

---

### Task 8: Sumário — connectivity map with drill-down

**Files:**
- Create: `reports/connectivity-map/{constants,actions,actions.test,docs,index}.ts(x)`, `connectivity-legend.tsx`

**Interfaces:**
- Consumes: `/api/provinces` and `/api/districts?province=<key>` → `RegionConnectivity[]` (normalised names, Task 3); `InteractiveSvgMap`, `PROVINCE_MAPS`, `DISTRICT_CODES`, `PROVINCE_LABELS`, `DrillBreadcrumb`, `MapHint`.
- Produces: `toProvinceColors(rows)` / `toDistrictColors(province, rows)` with the same return shapes as EID's (`{ provinces, fillColors }` / `{ districtRatios, customColors }`). Colour = primary (`#5B6CFF`), ratio = uptime share (higher uptime = darker), `NO_DATA_COLOR` when there is no row.

- [ ] **Step 1: `actions.test.ts`**: a province with a row is `highlighted` with ratio derived from `uptimePct`; a province without a row uses `NO_DATA_COLOR`; `toDistrictColors("Maputo Cidade", rows)` keys `customColors` by the district code from `DISTRICT_CODES`; `toExcel(rows)` has columns `Província|Distrito`, `Sites`, `Conectividade (%)`.
- [ ] **Step 2:** Run → FAIL, implement by mirroring EID's `eid-province-map` `actions.ts`, run → PASS.
- [ ] **Step 3: `index.tsx`**: mirror `eid-province-map/index.tsx` without the lab-type switch and the facility table. There are two levels (national → province); a district click does nothing. The tooltip shows "Conectividade", "Sites". Title `"Conectividade por província"`, hints "Clique numa província para ver os distritos." Legend: uptime 0–100 %.
- [ ] **Step 4: Verify** in the browser: drill into Maputo Cidade (the Kampfumo merge shows as KaMpfumu), the breadcrumb goes back, image export works.
- [ ] **Step 5: Commit** `feat(monitoring): connectivity map with province drill-down on the shared maps`.

---

### Task 9: Estado page (+ shared `ConnectivityHeatmap`)

**Files:**
- Create: `packages/design_system/src/app/molecules/charts/ConnectivityHeatmap.tsx` + `.test.tsx` + `.stories.tsx` (port the old MUI version's week-column algorithm to Tailwind; cells `color-mix(in srgb, var(--success) <a>%, var(--card))`; months `Jan…Dez`; legend "Menos"/"Mais")
- Create: `app/(dashboard)/estado/{page,client}.tsx`, `lib/monitoring/estado.ts` + `estado.test.ts`, `reports/host-info/*`, `reports/host-connectivity/*`, `reports/host-heatmap/*`, `reports/connectivity-history/*`

**Interfaces:**
- Consumes: `/api/sites` → `{ hosts: Host[] }`, `/api/hosts/<code>` → `HostDetail` (404 → not found), `/api/history?code&status&startDate&endDate` → `{ rows: HistoryRow[] }`.
- Produces: `resolveEstado(code: string | null, hosts: Host[]): { kind: "redirect"; code: string } | { kind: "show"; code: string } | { kind: "not-found" } | { kind: "empty" }`; `ConnectivityHeatmap({ data, baseColor?, showLegend? })`.

- [ ] **Step 1: `estado.test.ts`**: `resolveEstado(null, [h1,…])` → redirect to the first host with a code (sorted by name); `resolveEstado("X", hosts)` where X is not in hosts → `not-found`; a known code → `show`; `resolveEstado(null, [])` → `empty`.
- [ ] **Step 2:** Run → FAIL, implement, run → PASS.
- [ ] **Step 3: Heatmap test**: 14 days of data render 14 cells with `title="<dd/mm/yyyy>: <n>%"`, and an empty array renders "Sem dados para o período e filtros seleccionados." Implement, add a story, run → PASS.
- [ ] **Step 4: Cards**:
  - host-info: `ReportCard` titled with the host name. Shows code, category, province/district, status pill (`bg-success`/`bg-destructive`), "Online há N horas" when `onlineSinceHours != null`, and a host picker: a searchable select over `/api/sites` hosts that routes to `?code=`.
  - host-connectivity: Apex `Donut` with uptime/downtime.
  - host-heatmap: `ConnectivityHeatmap` in `ReportCard`, Excel = date, uptime %.
  - connectivity-history: `SortableTable` with the columns from the old `HISTORY_COLUMNS` (ID, Estado, Ficou offline, Ficou online, Tempo Offline, Criado em, Actualizado), dates formatted `dd/MM/yyyy HH:mm` in Africa/Maputo, default sort "Ficou offline" desc. `controls` = `SegmentedSwitch` Todos/Pendentes/Completos; date range via `ReportCard.onSubmit`; Excel through `ReportCard`.
- [ ] **Step 5: `client.tsx`** uses `resolveEstado`: redirect → `router.replace`; not-found → `CardMessage tone="empty" message="Site não encontrado."` above the host-info card (picker still usable); empty → `CardMessage` "Sem sites disponíveis.". Layout: info, then the 2-col row (donut | heatmap), then the history table. `page.tsx` wraps it in `Suspense` with the shell's loading skeleton.
- [ ] **Step 6: Verify** tests (both packages) and `tsc`. In the browser, open Estado from a grid chip, with `?code=DOESNOTEXIST`, and with no code. Check the filter tabs, the date range, and both exports.
- [ ] **Step 7: Commit** `feat(monitoring): Estado page on the report kit; shared ConnectivityHeatmap`.

---

### Task 10: Whole-branch verification and parity record

**Files:**
- Create: `apps/monitoring/README.md` (purpose, env vars, dev port, data source, cache policy, release checklist from spec §6)
- Modify: `openldr-monorepo/CLAUDE.md`: add a short `apps/monitoring` section next to `apps/vl`.

- [ ] **Step 1:** `pnpm install --frozen-lockfile`. Then `pnpm --filter=monitoring test`, `pnpm --filter=monitoring exec tsc --noEmit`, `pnpm --filter=monitoring lint`, `pnpm --filter=@repo/design_system exec vitest run`, and `pnpm turbo run build --filter=monitoring --filter=tb --filter=vl --filter=eid --filter=admin --filter=home` → all PASS. Paste the summary lines into the PR body.
- [ ] **Step 2: Hex audit:** `grep -rnE "#[0-9a-fA-F]{3,6}\b" apps/monitoring/app` returns nothing (colours live in `lib/monitoring/colors.ts`).
- [ ] **Step 3: Visual pass:** at 375, 768 and 1440 px, in light and dark, in the vertical, compact and horizontal layouts, check Sumário and Estado. Take screenshots for the PR.
- [ ] **Step 4: Parity:** with a direct `/teamviewer/sites` count on the day, record total, offline per category and the Sumário figures in the PR body; they must match exactly for counts.
- [ ] **Step 5: Production build smoke:** `NODE_ENV=production` build plus `pnpm --filter=monitoring start -p 3005`; `/historico` returns 404 and the nav has 2 items.
- [ ] **Step 6: Commit** `docs(monitoring): README and monorepo notes`.
- [ ] **Step 7: Stop.** Report to the user. The push, PR, Coolify app, DNS, `ready: true` follow-up and the API `KNOWN_DASHBOARDS` change need their go-ahead (see below).

---

## Follow-ups outside this branch (need the user's go-ahead)

- **API `KNOWN_DASHBOARDS`** (`api_openldr_python`, `utilities/permissions.py` on `feat/admin-api` / PR #19) is `{"vl","eid","tb"}`. Until `"monitoring"` is added, page-view beacons from monitoring get 400 (harmless, best effort) and API permission parsing ignores the id. Monitoring itself does not call the analytics API for data.
- **Warm-up** of the slow DisaStatus aggregates (spec §5.2), if the proxy timeout or the first-load wait is a problem in production.
- **Release PR**: `ready: true` and add `"monitoring"` to the sign-in `PORTALS` lists of VL/TB/EID.
