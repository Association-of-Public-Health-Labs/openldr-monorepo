# Monitoria de Conectividade (`apps/monitoring`)

Internet connectivity of the SIS-LAB sites (Disalab, DisaPoC, DisaLink), from the DisaStatus
monitoring API (`uptimewatch.openldr.org.mz`). Production: `https://monitoria.openldr.org.mz`
(registry id `monitoring`, primary `#5B6CFF`, `ready: false` until released).

- **Sumário** (`/`): category KPI tiles (12-month downtime: Disalab around the clock, DisaPoC/DisaLink
  in working hours, as DisaStatus counts outages; monthly connectivity bars),
  national donut, province → district map, site grid.
- **Estado** (`/estado?code=<site code>`): site header and picker, donut, daily heatmap, offline history.
- **Histórico** (`/historico`): placeholder, 404 in production (`UNRELEASED_PAGES`).

## Data flow

DisaStatus has no summary endpoints, so the app aggregates server-side: `app/api/*` route handlers
(behind Clerk) call `lib/monitoring/client.ts` (the only place that knows DisaStatus URLs) and the pure
`aggregate.ts` / `duration.ts` / `heatmap.ts` / `regions.ts`. Cards read those routes with
`monitoringGet` (`lib/monitoring/api.ts`) through the shared `useReport`.

- **Cache:** upstream `fetch` revalidates every 30 min; timeout 180 s; no retry after a timeout.
- **Slow upstream:** 12-month aggregates take 15–45 s per name on a cold cache. Province/district stats
  go one name per request, concurrently (a joint 12-province query took 187 s and hit the timeout).
  `/teamviewer/connectivity-trend` can exceed the timeout; the KPI tiles then show without bars.
- **Region names:** `regions.ts` maps DisaStatus spellings to the shared map keys ("Maputo-Cidade" →
  "Maputo Cidade", "Kampfumo" → "KaMpfumu", district "Nampula" → "Cidade de Nampula"). A test checks every
  district in `lib/monitoring/__fixtures__/regions.json` (live sample) against the map sources;
  refresh the fixture when DisaStatus adds sites.

## Run

```bash
pnpm --filter=monitoring dev        # http://localhost:3005
pnpm --filter=monitoring test
pnpm --filter=monitoring exec tsc --noEmit
pnpm --filter=monitoring lint
pnpm turbo run build --filter=monitoring
```

Environment: see `.env.example`. `NEXT_PUBLIC_*` are build-time (Coolify build variables);
`CLERK_SECRET_KEY` is runtime only. Same Clerk instance as the other dashboards.

## Release checklist

1. Coolify app from the monorepo `main`, Dockerfile `apps/monitoring/Dockerfile`, domain
   `monitoria.openldr.org.mz`, Clerk variables; DNS A record for the subdomain.
2. Smoke test in production; compare the Sumário counts with `/teamviewer/sites`.
3. Release PR: `ready: true` in `packages/design_system/src/dashboards.ts`, add `monitoring` to the
   sign-in `PORTALS` of VL/TB/EID (and theirs to this app's).
4. API (`api_openldr_python`): add `monitoring` to `KNOWN_DASHBOARDS` (usage beacon, permissions) and a
   `/monitoring` suggestions module (the cards post suggestions to `/monitoring/send-suggestion`).
5. Grant "Monitoria" to users in admin.
