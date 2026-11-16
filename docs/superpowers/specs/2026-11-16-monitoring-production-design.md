# Monitoring Dashboard — Production Port (`apps/monitoring`) — Design Spec

- **Date:** 2026-11-16
- **Status:** Draft, for review
- **Supersedes the shell/UI parts of:** `2026-07-07-monitoring-dashboard-design.md` (on the local branch
  `feat/monitoring-dashboard`). The data model, source API and aggregation rules in that spec still hold.
- **Branch:** `feat/monitoring-production`, cut from `origin/main` @ `15a9769`.

## 1. Why

`apps/monitoring` (connectivity monitoring of LIS sites, data from DisaStatus / uptimewatch) was built in
July 2026 on a branch that is now 218 commits behind `main` and was never pushed. Since then `main` got
the platform shell, the shared report kit, the shared sign-in, per-dashboard theming and access metadata.
The monitoring app still uses the old pieces (`DashboardLayout` template, per-app themes, a bespoke
sign-in, hard-coded hex colours, `MainCard`). It cannot ship as is.

## 2. Decisions (agreed 2026-11-16)

| Decision | Choice |
|---|---|
| How to update | **Port onto fresh `origin/main`**, no rebase. Carry over the data layer and tests as they are, and rebuild the UI on the shared kit. |
| Data source | **uptimewatch (DisaStatus)** at `uptimewatch.openldr.org.mz/teamviewer/*`, aggregated in Next route handlers (unchanged). |
| First release | **Sumário + Estado.** Histórico stays hidden in production through `UNRELEASED_PAGES`. |
| Domain | **`monitoria.openldr.org.mz`** |

## 3. What carries over unchanged

Copied from `feat/monitoring-dashboard` with path fixes only:

- `lib/monitoring/{client,aggregate,duration,heatmap,dates,types}.ts` and their vitest tests.
- `app/api/{sites,summary,provinces,districts,history,connectivity-trend,hosts/[code]}/route.ts`.
- Routes: `/` = Sumário, `/estado?code=…` = Estado, `/historico` = hidden placeholder.
- Caching and timeout policy in `client.ts` (30-min revalidate, 180 s ceiling, no retry after a timeout).

## 4. What is rebuilt on the shared kit

### 4.1 Registry, theme and access (`packages/design_system`)

- `dashboards.ts`: add `"monitoring"` to `DashboardId` with name **"Monitoria"**, portalTitle
  **"Monitoria de Conectividade"**, url `https://monitoria.openldr.org.mz`, `ready: false` until live,
  and env override `NEXT_PUBLIC_DASHBOARD_URL_MONITORING`. Update `dashboards.test.ts`.
- Primary colour: **indigo `#5B6CFF`** with white foreground (to confirm). It must differ from VL green,
  TB red, EID amber and admin cyan, and must not be confused with the Online/Offline status colours.
  Add `[data-dashboard="monitoring"]` in `styles/theme.css`.
- Access: `parseAccess` already picks up registry ids, so the admin app's access editor lists
  "Monitoria" automatically. **Check:** the admin access UI renders the new id. Users need `"monitoring"`
  in `publicMetadata.dashboards` to see it in the switcher.

### 4.2 App shell (copy `apps/eid`)

| Old (branch) | New |
|---|---|
| `context/theme-provider.tsx`, `themes/*`, `hooks/useLayoutSettings.ts` | `PlatformThemeProvider dashboard="monitoring"` and `<html data-dashboard="monitoring">` |
| `DashboardLayout` + `AppProvider` | `DashboardShell` + `SplashScreen` + `parseAccess` + `useUsageBeacon("monitoring", …)` + `ReportProvider` |
| 260-line `globals.css`, `tailwind.config.ts` | EID's `globals.css`: imports shared `theme.css` and declares `@source` |
| `components/ui/*` (local shadcn copies) | Deleted; use `@repo/design_system/components/ui/*` |
| Bespoke `sign-in/client.tsx` (283 lines) | Shared `SignInScreen` + `sign-in-flow`, as EID |
| `sign-up` | Same as EID |
| Inline nav array | `lib/monitoring/nav.ts` with `buildNavItems`, `PAGE_LABELS`, `UNRELEASED_PAGES` (+ tests), as `lib/eid/nav.ts`. `/historico` calls `notFound()` in production. |

`ReportServices.getList` is required by the type, but monitoring reads its own `/api/*` routes. It gets a
thin same-origin `monitoringGet(path, params)` (`lib/monitoring/api.ts`), and `getToken` comes from Clerk.
Route handlers stay behind the Clerk middleware.

### 4.3 Cards: VL folder layout + `ReportCard`

Each card becomes `constants.ts`, `actions.ts`, `actions.test.ts`, `docs.tsx` and a thin `index.tsx`.
It uses `ReportCard` (Excel and image export, docs, retry), `useReport` (request gate), `CardMessage`
and the standard Portuguese messages ("Sem dados para o período e filtros seleccionados.").

| Card | Today | Target |
|---|---|---|
| **Sumário** — category KPIs (Todos / Disalab / DisaPoC / DisaLink) | Hand-made bordered strip + `KpiTrendCard` (in `design_system_mui`) | Row of `KpiCard`s (EID status-card grid), sparkline from `/connectivity-trend`, `KpiCardSkeleton` while loading. A sparkline child is added to `KpiCard` only if it doesn't already support one. |
| National connectivity donut | Chart.js `Doughnut` in `MainCard` | Apex `Donut` in `ReportCard` |
| Connectivity map (province → district drill-down) | Patched `SvgDistrictMap` + 313-line `districtCodes.ts` in `design_system_mui` | `InteractiveSvgMap` + `PROVINCE_MAPS` + `DrillBreadcrumb` + `MapHint`, as `eid-province-map`. Region keys come from the shared `lib/report/districts`. |
| Hosts status grid | `HostStatusChip` + hand-made tab buttons | `SegmentedSwitch` tabs + "Ver todos", `HostStatusChip` moved into `design_system` with tokens |
| **Estado** — host info | `MainCard` + hex colours | `ReportCard`, tokens |
| Host donut | Chart.js | Apex `Donut` |
| Monthly heatmap | `ConnectivityHeatmap` (`design_system_mui`) | Moved into `design_system` (molecules/charts), tokens, story kept |
| History table | Hand-made table with `@tanstack/react-table` | `SortableTable`, Excel export via `ReportCard` |

**Rules:** no hex colours in app code (`bg-card`, `border-border`, `text-muted-foreground`, `--primary`).
Online/offline use the shared success/error colours. Every card works in light and dark mode, with all
three layouts, from phone width up (`@container` breakpoints, as EID). The three branch components
(`KpiTrendCard`, `HostStatusChip`, `ConnectivityHeatmap`) do not go into `design_system_mui`, and
`design_system_mui` is left untouched.

### 4.4 Dependencies, build and security

- Align with EID: `next 15.5.25`, `eslint-config-next 15.5.25`, `@clerk/nextjs ^6.39.7`. The branch's
  Next 15.3.2 is affected by the React2Shell advisory that the other apps were patched for.
- Drop unused dependencies (`axios`, `@mui/*`, `zustand`, `@next/mdx` …) after porting. Keep `server-only`.
- `Dockerfile`: EID's hardened version (non-root `node` user, `NEXT_TELEMETRY_DISABLED`), with `--filter=monitoring`.
- `.env.example` with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, optional `NEXT_PUBLIC_UPTIMEWATCH_API`
  and `NEXT_PUBLIC_DASHBOARD_URL_*`. Dev port **3005** (check it is unused by the other apps).
- `pnpm-lock.yaml` is regenerated once for the new app. The install uses the pitfalls guide's
  procedure, not a plain `pnpm install`.

## 5. Data-layer risks to check before release

1. `/teamviewer/connectivity-trend` exists only on DisaStatus `dev`. uptimewatch on Coolify deploys `dev`, so
   it should be live. Confirm with a request.
2. The 12-month aggregations can take up to ~2.5 min on a cold cache. Confirm the Coolify/Traefik proxy
   timeout allows that. Otherwise add a warm-up scheduled task (same pattern as the API report cache,
   05:00/13:00 Maputo) so users rarely hit a cold cache.
3. Parity: check the Sumário totals (sites, offline count, downtime %) against a direct count from
   `/teamviewer/sites` on the release day. Record the numbers in the PR.

## 6. Release and deploy (each step needs your go-ahead)

1. PR into `main` (registry `ready: false`, so no switcher entry in production yet).
2. New Coolify app "Monitoring Dashboard": monorepo, `main`, Dockerfile `apps/monitoring/Dockerfile`, domain
   `monitoria.openldr.org.mz`, Clerk variables (same live Clerk instance as the other apps). You set the secrets.
3. DNS record for `monitoria.openldr.org.mz`.
4. Smoke test in production, then a second PR: `ready: true`, and add monitoring to the sign-in portal list.
5. Grant `"monitoring"` access to the target users in admin.

## 7. Verification

- `pnpm --filter=monitoring test`, `exec tsc --noEmit`, `lint`, `pnpm turbo run build --filter=monitoring`.
- `packages/design_system` changes → also build `tb`, `vl`, `eid`, `admin`, and run `design_system` tests.
- Visual: run the app, check Sumário and Estado in light and dark, at phone, tablet and desktop widths, in
  the vertical, compact and horizontal layouts. Test map drill-down, tab switching, Estado via `?code=`, and both exports.

## 8. Out of scope

- The Histórico page itself (no design yet).
- Host-health metrics (disk, RAM, SQL, app version): DisaStatus has no endpoints for them.
- Moving monitoring endpoints into `api_openldr_python`.
- Cleaning up the old `feat/monitoring-dashboard` branch and the untracked `apps/monitoring` copy in the main
  checkout. Both stay as a reference until this ships.
